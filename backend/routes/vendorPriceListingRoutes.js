const express       = require('express');
const router        = express.Router();
const VendorListing = require('../models/VendorListing');

// POST /api/vendor-listings — vendor posts a buy offer
router.post('/', async (req, res) => {
  try {
    const { vendorId, cropName, offeredPrice, quantityNeeded, state, district, notes, validUntil } = req.body;
    if (!vendorId || !cropName || !offeredPrice || !quantityNeeded)
      return res.status(400).json({ success:false, message:'vendorId, cropName, offeredPrice and quantityNeeded are required' });

    const listing = await VendorListing.create({
      vendorId, cropName, offeredPrice, quantityNeeded,
      state, district, notes,
      validUntil: validUntil || undefined
    });

    res.json({ success:true, listing });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/vendor-listings?crop=tomato — farmer sees vendor buy offers for a crop
router.get('/', async (req, res) => {
  try {
    const { crop } = req.query;
    const query = { status:'active' };
    if (crop) query.cropName = { $regex: crop, $options: 'i' };

    // Filter out expired listings
    query.$or = [
      { validUntil: { $exists: false } },
      { validUntil: null },
      { validUntil: { $gte: new Date() } }
    ];

    const listings = await VendorListing.find(query)
      .populate('vendorId', 'name businessName phone location')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success:true, listings });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// GET /api/vendor-listings/vendor/:vendorId — vendor's own buy offers
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const listings = await VendorListing.find({ vendorId: req.params.vendorId })
      .sort({ createdAt: -1 });
    res.json({ success:true, listings });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// POST /api/vendor-listings/:id/interest — farmer expresses interest in a buy offer
router.post('/:id/interest', async (req, res) => {
  try {
    const { farmerPhone, message, farmerId } = req.body;
    if (!farmerPhone)
      return res.status(400).json({ success:false, message:'farmerPhone is required' });

    const listing = await VendorListing.findById(req.params.id);
    if (!listing || listing.status !== 'active')
      return res.status(404).json({ success:false, message:'Buy offer not found or closed' });

    // Prevent duplicate interest from same phone
    const alreadyInterested = listing.interestedFarmers.some(f => f.farmerPhone === farmerPhone);
    if (alreadyInterested)
      return res.status(409).json({ success:false, message:'You have already expressed interest in this offer.' });

    listing.interestedFarmers.push({ farmerId, farmerPhone, message, expressedAt: new Date() });
    await listing.save();

    // SSE notification to vendor
    const vid = listing.vendorId.toString();
    const vendorClients = global.sseVendorBidClients?.[vid] || [];
    vendorClients.forEach(send => send({ type:'NEW_INTEREST', listingId: listing._id, farmerPhone }));

    res.json({ success:true, message:'Interest sent successfully' });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// PUT /api/vendor-listings/:id/close — vendor closes a buy offer
router.put('/:id/close', async (req, res) => {
  try {
    const listing = await VendorListing.findByIdAndUpdate(
      req.params.id,
      { status:'closed' },
      { new: true }
    );
    if (!listing) return res.status(404).json({ success:false, message:'Listing not found' });
    res.json({ success:true, listing });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/vendor-listings/stream/:vendorId — SSE for vendor real-time notifications
router.get('/stream/:vendorId', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type:'connected' })}\n\n`);

  if (!global.sseVendorBidClients) global.sseVendorBidClients = {};
  const vid = req.params.vendorId;
  if (!global.sseVendorBidClients[vid]) global.sseVendorBidClients[vid] = [];

  const send = (data) => { try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {} };
  global.sseVendorBidClients[vid].push(send);

  const heartbeat = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (global.sseVendorBidClients[vid])
      global.sseVendorBidClients[vid] = global.sseVendorBidClients[vid].filter(fn => fn !== send);
  });
});

module.exports = router;