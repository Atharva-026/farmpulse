const express = require('express');
const router = express.Router();
const VendorBid = require('../models/VendorBid');
const MarketListing = require('../models/MarketListing');

// POST /api/bids  — vendor places a bid on a listing
router.post('/', async (req, res) => {
  try {
    const { vendorId, listingId, offeredPrice, quantityNeeded, message } = req.body;

    if (!vendorId || !listingId || !offeredPrice || !quantityNeeded) {
      return res.status(400).json({ success: false, message: 'vendorId, listingId, offeredPrice and quantityNeeded required' });
    }

    // Check listing exists and is active
    const listing = await MarketListing.findById(listingId);
    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Listing not found or no longer active' });
    }

    // Prevent duplicate bid from same vendor on same listing
    const existingBid = await VendorBid.findOne({ vendorId, listingId, status: 'pending' });
    if (existingBid) {
      return res.status(409).json({ success: false, message: 'You already have an active bid on this listing. Withdraw it first to rebid.' });
    }

    const bid = await VendorBid.create({ vendorId, listingId, offeredPrice, quantityNeeded, message });

    // Update denormalised bid count on listing
    await MarketListing.findByIdAndUpdate(listingId, { $inc: { bidCount: 1 } });

    // Broadcast to SSE clients watching this listing
    const clients = global.sseClients?.[listingId] || [];
    clients.forEach(send => send({ type: 'NEW_BID', listingId, offeredPrice, quantityNeeded }));

    res.json({ success: true, bid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bids/listing/:listingId  — farmer sees all bids on their listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const bids = await VendorBid.find({ listingId: req.params.listingId })
      .populate('vendorId', 'name businessName phone location')
      .sort({ offeredPrice: -1 }); // highest offer first
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bids/vendor/:vendorId  — vendor sees all their bids
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const bids = await VendorBid.find({ vendorId: req.params.vendorId })
      .populate('listingId')
      .sort({ createdAt: -1 });
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bids/:bidId/status  — farmer accepts or rejects a bid
router.put('/:bidId/status', async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be accepted or rejected' });
    }

    const bid = await VendorBid.findByIdAndUpdate(
      req.params.bidId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('vendorId', 'name businessName phone');

    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    // If accepted, mark listing as sold and reject all other bids
    if (status === 'accepted') {
      await MarketListing.findByIdAndUpdate(bid.listingId, { status: 'sold' });
      await VendorBid.updateMany(
        { listingId: bid.listingId, _id: { $ne: bid._id }, status: 'pending' },
        { status: 'rejected', updatedAt: new Date() }
      );
    }

    // Broadcast to listing SSE clients (farmer's bids view)
    const lid = bid.listingId.toString();
    const listingClients = global.sseClients?.[lid] || [];
    listingClients.forEach(send => send({ type: 'BID_STATUS', listingId: lid, bidId: bid._id, status }));

    // Broadcast to vendor's personal SSE channel (My Bids tab notification)
    const vid = bid.vendorId.toString();
    const vendorClients = global.sseVendorBidClients?.[vid] || [];
    vendorClients.forEach(send => send({
      type: 'BID_STATUS',
      bidId: bid._id,
      status,
      cropName: bid.listingId?.cropName,
      offeredPrice: bid.offeredPrice
    }));

    res.json({ success: true, bid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/bids/:bidId/withdraw  — vendor withdraws their bid
router.put('/:bidId/withdraw', async (req, res) => {
  try {
    const bid = await VendorBid.findByIdAndUpdate(
      req.params.bidId,
      { status: 'withdrawn', updatedAt: new Date() },
      { new: true }
    );
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    await MarketListing.findByIdAndUpdate(bid.listingId, { $inc: { bidCount: -1 } });

    res.json({ success: true, bid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bids/stream/:listingId — SSE stream for real-time bid updates
router.get('/stream/:listingId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial heartbeat
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Register this client
  if (!global.sseClients) global.sseClients = {};
  const lid = req.params.listingId;
  if (!global.sseClients[lid]) global.sseClients[lid] = [];
  const send = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
  };
  global.sseClients[lid].push(send);

  // Heartbeat every 25s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch {}
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (global.sseClients[lid]) {
      global.sseClients[lid] = global.sseClients[lid].filter(fn => fn !== send);
    }
  });
});

// GET /api/bids/summary/:listingId — quick pending bid count for notification dot
router.get('/summary/:listingId', async (req, res) => {
  try {
    const pending = await VendorBid.countDocuments({ listingId: req.params.listingId, status: 'pending' });
    const total   = await VendorBid.countDocuments({ listingId: req.params.listingId });
    res.json({ success: true, pending, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;