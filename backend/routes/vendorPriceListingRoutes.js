const express = require('express');
const router  = express.Router();
const VendorPriceListing = require('../models/Vendorpricelisting');

// POST /api/vendor-listings  — vendor posts a buy offer
router.post('/', async (req, res) => {
  try {
    const { vendorId, cropName, offeredPrice, quantityNeeded, state, district, validUntil, notes } = req.body;
    if (!vendorId || !cropName || !offeredPrice || !quantityNeeded)
      return res.status(400).json({ success: false, message: 'vendorId, cropName, offeredPrice and quantityNeeded are required' });

    const listing = await VendorPriceListing.create({
      vendorId, cropName: cropName.toLowerCase().trim(),
      offeredPrice, quantityNeeded, state, district,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes
    });
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/vendor-listings  — farmers browse vendor buy offers
// Query: crop, state, sort (price_desc | price_asc | newest)
router.get('/', async (req, res) => {
  try {
    const { crop, state, sort = 'price_desc' } = req.query;
    const filter = { status: 'active' };

    // Auto-expire listings past validUntil
    filter.$or = [{ validUntil: null }, { validUntil: { $gte: new Date() } }];

    if (crop)  filter.cropName = { $regex: crop.toLowerCase().trim(), $options: 'i' };
    if (state) filter.state    = { $regex: state, $options: 'i' };

    const sortMap = {
      price_desc: { offeredPrice: -1 },
      price_asc:  { offeredPrice:  1 },
      newest:     { createdAt:    -1 },
    };

    const listings = await VendorPriceListing.find(filter)
      .populate('vendorId', 'name businessName phone location')
      .sort(sortMap[sort] || { offeredPrice: -1 })
      .limit(40);

    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/vendor-listings/vendor/:vendorId  — vendor's own listings
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const listings = await VendorPriceListing.find({ vendorId: req.params.vendorId })
      .sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/vendor-listings/:id/interest  — farmer expresses interest
router.post('/:id/interest', async (req, res) => {
  try {
    const { farmerPhone, farmerId, message } = req.body;
    if (!farmerPhone) return res.status(400).json({ success: false, message: 'farmerPhone required' });

    const listing = await VendorPriceListing.findById(req.params.id);
    if (!listing || listing.status !== 'active')
      return res.status(404).json({ success: false, message: 'Listing not found or closed' });

    // Prevent duplicate interest from same phone
    const already = listing.interestedFarmers.find(f => f.farmerPhone === farmerPhone);
    if (already)
      return res.status(409).json({ success: false, message: 'You have already expressed interest in this listing.' });

    listing.interestedFarmers.push({ farmerPhone, farmerId, message });
    await listing.save();

    // Broadcast SSE to vendor watching their listing
    const clients = global.sseVendorClients?.[req.params.id] || [];
    clients.forEach(send => send({ type: 'NEW_INTEREST', listingId: req.params.id, farmerPhone }));

    res.json({ success: true, message: 'Interest recorded. The vendor will contact you.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/vendor-listings/:id/close  — vendor closes their listing
router.put('/:id/close', async (req, res) => {
  try {
    await VendorPriceListing.findByIdAndUpdate(req.params.id, { status: 'closed' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/vendor-listings/stream/:vendorId  — SSE for vendor's own buy offer notifications
router.get('/stream/:vendorId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

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