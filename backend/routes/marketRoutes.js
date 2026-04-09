const express = require('express');
const router = express.Router();
const axios = require('axios');
const MarketListing = require('../models/MarketListing');

const AGMARKNET_API_KEY = process.env.AGMARKNET_API_KEY || '';

const FALLBACK_DATA = {
  rice:   [{ mandi:'Mumbai APMC',state:'Maharashtra',price:2800,trend:'stable',isFallback:true },{ mandi:'Delhi Azadpur',state:'Delhi',price:2900,trend:'rising',isFallback:true },{ mandi:'Kolkata Rice Market',state:'West Bengal',price:2700,trend:'falling',isFallback:true }],
  wheat:  [{ mandi:'Indore Grain Market',state:'Madhya Pradesh',price:2200,trend:'stable',isFallback:true },{ mandi:'Ludhiana Mandi',state:'Punjab',price:2300,trend:'rising',isFallback:true },{ mandi:'Jaipur Grain Market',state:'Rajasthan',price:2100,trend:'falling',isFallback:true }],
  maize:  [{ mandi:'Nagpur APMC',state:'Maharashtra',price:1800,trend:'stable',isFallback:true },{ mandi:'Pune Market',state:'Maharashtra',price:1850,trend:'rising',isFallback:true },{ mandi:'Ahmedabad Market',state:'Gujarat',price:1750,trend:'falling',isFallback:true }],
  tomato: [{ mandi:'Bengaluru K.R. Market',state:'Karnataka',price:2200,trend:'rising',isFallback:true },{ mandi:'Pune APMC',state:'Maharashtra',price:2100,trend:'stable',isFallback:true },{ mandi:'Hyderabad Market',state:'Telangana',price:2050,trend:'falling',isFallback:true }],
  onion:  [{ mandi:'Lasalgaon Market',state:'Maharashtra',price:2900,trend:'rising',isFallback:true },{ mandi:'Bengaluru K.R. Market',state:'Karnataka',price:2750,trend:'stable',isFallback:true },{ mandi:'Pune APMC',state:'Maharashtra',price:2600,trend:'falling',isFallback:true }],
  potato: [{ mandi:'Agra Market',state:'Uttar Pradesh',price:1500,trend:'stable',isFallback:true },{ mandi:'Kanpur APMC',state:'Uttar Pradesh',price:1600,trend:'rising',isFallback:true },{ mandi:'Delhi Azadpur',state:'Delhi',price:1700,trend:'rising',isFallback:true }],
  cotton: [{ mandi:'Warangal APMC',state:'Telangana',price:6800,trend:'rising',isFallback:true },{ mandi:'Akola Market',state:'Maharashtra',price:6600,trend:'stable',isFallback:true },{ mandi:'Guntur APMC',state:'Andhra Pradesh',price:6700,trend:'rising',isFallback:true }],
};

function calculateTrend(modal, min, max) {
  if (!modal || !min || !max) return 'stable';
  const range = max - min;
  if (range === 0) return 'stable';
  const position = (modal - min) / range;
  if (position >= 0.9) return 'rising';
  if (position <= 0.1) return 'falling';
  return 'stable';
}

async function fetchLivePrices(cropName, stateFilter = null) {
  try {
    if (!AGMARKNET_API_KEY) throw new Error('No API key');
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&format=json&limit=100&filters%5Bcommodity%5D=${encodeURIComponent(cropName)}`;
    const response = await axios.get(url, { timeout: 10000 });
    const records = response.data.records || [];
    const seen = new Set();
    const mandis = records.filter(r => {
      const key = `${r.market}-${r.state}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).map(r => ({
      mandi: r.market, state: r.state,
      price: parseFloat(r.modal_price) || 0,
      minPrice: parseFloat(r.min_price) || null,
      maxPrice: parseFloat(r.max_price) || null,
      trend: calculateTrend(parseFloat(r.modal_price), parseFloat(r.min_price), parseFloat(r.max_price)),
      isFallback: false
    })).filter(m => m.price > 0);

    if (mandis.length === 0) throw new Error('No live data');
    return mandis;
  } catch {
    return FALLBACK_DATA[cropName.toLowerCase()] || [];
  }
}

// ─── GET /api/market/prices/:cropName ────────────────────────────────────────
router.get('/prices/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const { state } = req.query;
    let mandis = await fetchLivePrices(cropName, state);

    mandis.sort((a, b) => {
      const aLocal = state && a.state?.toLowerCase().includes(state.toLowerCase()) ? 0 : 1;
      const bLocal = state && b.state?.toLowerCase().includes(state.toLowerCase()) ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      return b.price - a.price;
    });

    const avgPrice       = mandis.length ? Math.round(mandis.reduce((s, m) => s + m.price, 0) / mandis.length) : 0;
    const prices         = mandis.map(m => m.price);
    const priceVariation = prices.length ? Math.round(Math.max(...prices) - Math.min(...prices)) : 0;
    const risingCount    = mandis.filter(m => m.trend === 'rising').length;
    const fallingCount   = mandis.filter(m => m.trend === 'falling').length;
    const bestMandi      = mandis.reduce((best, m) => (m.price > (best?.price || 0) ? m : best), null);
    const advice         = bestMandi ? `Highest price at ${bestMandi.mandi}, ${bestMandi.state}.` : '';

    res.json({ success:true, mandis, isLive: mandis.some(m => !m.isFallback), avgPrice, priceVariation, risingCount, fallingCount, advice });
  } catch (err) {
    res.status(500).json({ success:false, error:'Failed to fetch market prices' });
  }
});

// ─── POST /api/market/list — farmer posts a crop listing ─────────────────────
router.post('/list', async (req, res) => {
  try {
    const { cropName, quantity, askingPrice, quality, location, state, district, farmerPhone, description, farmerId } = req.body;

    if (!cropName || !quantity) {
      return res.status(400).json({ success:false, message:'cropName and quantity are required' });
    }

    const listing = await MarketListing.create({
      farmerId: farmerId || null,
      cropName, quantity: Number(quantity),
      askingPrice: askingPrice ? Number(askingPrice) : undefined,
      quality, location, state, district, farmerPhone, description
    });

    // ✅ FIX: return full listing object so frontend can use it directly
    res.json({ success:true, listing });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ success:false, message:'Failed to create listing', error: err.message });
  }
});

// ─── GET /api/market/listings — all active listings (vendor browse) ───────────
router.get('/listings', async (req, res) => {
  try {
    const { crop, state, minQty, maxPrice, sort } = req.query;
    const query = { status: 'active' };
    if (crop)     query.cropName = { $regex: crop, $options: 'i' };
    if (state)    query.state    = { $regex: state, $options: 'i' };
    if (minQty)   query.quantity  = { $gte: Number(minQty) };
    if (maxPrice) query.askingPrice = { $lte: Number(maxPrice) };

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc')  sortObj = { askingPrice: 1 };
    if (sort === 'price_desc') sortObj = { askingPrice: -1 };
    if (sort === 'quantity')   sortObj = { quantity: -1 };

    const listings = await MarketListing.find(query)
      .populate('farmerId', 'name phone')
      .sort(sortObj)
      .limit(50);

    res.json({ success:true, listings });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// ─── GET /api/market/listings/farmer/:farmerId — farmer's own listings ────────
router.get('/listings/farmer/:farmerId', async (req, res) => {
  try {
    const listings = await MarketListing.find({ farmerId: req.params.farmerId })
      .sort({ createdAt: -1 });
    res.json({ success:true, listings });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

// ─── GET /api/market/browse — vendor browse (alias for /listings with filters) ─
router.get('/browse', async (req, res) => {
  req.url = '/listings' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  // Just re-use the listings logic
  try {
    const { crop, state, minQty, maxPrice, sort } = req.query;
    const query = { status: 'active' };
    if (crop)     query.cropName    = { $regex: crop, $options: 'i' };
    if (state)    query.state       = { $regex: state, $options: 'i' };
    if (minQty)   query.quantity    = { $gte: Number(minQty) };
    if (maxPrice) query.askingPrice = { $lte: Number(maxPrice) };

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc')  sortObj = { askingPrice: 1 };
    if (sort === 'price_desc') sortObj = { askingPrice: -1 };
    if (sort === 'quantity')   sortObj = { quantity: -1 };

    const listings = await MarketListing.find(query)
      .populate('farmerId', 'name phone')
      .sort(sortObj)
      .limit(50);

    res.json({ success:true, listings });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;