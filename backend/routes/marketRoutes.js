const express = require('express');
const router = express.Router();
const axios = require('axios');
const MarketListing = require('../models/MarketListing');

// Agmarknet API key from environment
const AGMARKNET_API_KEY = process.env.AGMARKNET_API_KEY || '';

// Fallback data for when API is down
const FALLBACK_DATA = {
  'rice': [
    { mandi: 'Mumbai APMC', state: 'Maharashtra', price: 2800, trend: 'stable', isFallback: true },
    { mandi: 'Delhi Azadpur', state: 'Delhi', price: 2900, trend: 'rising', isFallback: true },
    { mandi: 'Kolkata Rice Market', state: 'West Bengal', price: 2700, trend: 'falling', isFallback: true }
  ],
  'wheat': [
    { mandi: 'Indore Grain Market', state: 'Madhya Pradesh', price: 2200, trend: 'stable', isFallback: true },
    { mandi: 'Ludhiana Mandi', state: 'Punjab', price: 2300, trend: 'rising', isFallback: true },
    { mandi: 'Jaipur Grain Market', state: 'Rajasthan', price: 2100, trend: 'falling', isFallback: true }
  ],
  'maize': [
    { mandi: 'Nagpur APMC', state: 'Maharashtra', price: 1800, trend: 'stable', isFallback: true },
    { mandi: 'Pune Market', state: 'Maharashtra', price: 1850, trend: 'rising', isFallback: true },
    { mandi: 'Ahmedabad Market', state: 'Gujarat', price: 1750, trend: 'falling', isFallback: true }
  ]
};

// Calculate trend based on modal vs min/max prices
function calculateTrend(modal, min, max) {
  if (!modal || !min || !max) return 'stable';
  const range = max - min;
  if (range === 0) return 'stable';
  const position = (modal - min) / range;
  if (position >= 0.9) return 'rising';  // modal near max
  if (position <= 0.1) return 'falling'; // modal near min
  return 'stable';
}

// Fetch live prices from Agmarknet API
async function fetchLivePrices(cropName, stateFilter = null) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&format=json&limit=100&filters%5Bcommodity%5D=${encodeURIComponent(cropName)}&filters%5Bstate.keyword%5D=${encodeURIComponent(stateFilter || '')}`;

    const response = await axios.get(url, { timeout: 10000 });
    const records = response.data.records || [];

    // Deduplicate by mandi-state combination
    const seen = new Set();
    const uniqueRecords = records.filter(record => {
      const key = `${record.market}-${record.state}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Transform to our format
    const mandis = uniqueRecords.map(record => ({
      mandi: record.market,
      state: record.state,
      price: parseFloat(record.modal_price) || 0,
      trend: calculateTrend(
        parseFloat(record.modal_price),
        parseFloat(record.min_price),
        parseFloat(record.max_price)
      ),
      isFallback: false
    })).filter(m => m.price > 0);

    // If no live data for the state, supplement with fallback for that state
    if (stateFilter && mandis.length === 0) {
      const fallbackForCrop = FALLBACK_DATA[cropName.toLowerCase()] || [];
      const stateFallbacks = fallbackForCrop.filter(m => m.state === stateFilter);
      mandis.push(...stateFallbacks);
    }

    return mandis;
  } catch (error) {
    console.log('Agmarknet API error:', error.message);
    // Return fallback data
    return FALLBACK_DATA[cropName.toLowerCase()] || [];
  }
}

/**
 * GET /api/market/prices/:cropName?state=StateName
 * Returns: { mandis: [{ mandi, state, price, trend, isFallback }], success: true }
 */
router.get('/prices/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const { state } = req.query;

    const mandis = await fetchLivePrices(cropName, state);

    // Sort: local state first (priority 0), then others (priority 1), then by price descending
    mandis.sort((a, b) => {
      const aLocal = state && a.state?.toLowerCase().includes(state.toLowerCase()) ? 0 : 1;
      const bLocal = state && b.state?.toLowerCase().includes(state.toLowerCase()) ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      return b.price - a.price;
    });

    res.json({
      success: true,
      mandis,
      source: mandis.some(m => !m.isFallback) ? 'live' : 'fallback'
    });
  } catch (error) {
    console.error('Market prices error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market prices' });
  }
});

/**
 * POST /api/market/list
 * Body: { cropName, quantity, askingPrice, quality, location, state, district, farmerPhone, description, farmerId }
 * Creates a new market listing for vendors to bid on
 */
router.post('/list', async (req, res) => {
  try {
    const { cropName, quantity, askingPrice, quality, location, state, district, farmerPhone, description, farmerId } = req.body;

    // Validate required fields
    if (!cropName || !quantity || !askingPrice || !farmerPhone) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Create listing in database
    const listing = new MarketListing({
      farmerId,
      cropName,
      quantity: Number(quantity),
      askingPrice: Number(askingPrice),
      quality,
      location,
      state,
      district,
      farmerPhone,
      description
    });

    await listing.save();

    res.json({
      success: true,
      message: 'Listing created successfully',
      listingId: listing._id
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ success: false, error: 'Failed to create listing' });
  }
});

module.exports = router;