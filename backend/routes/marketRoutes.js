const express = require('express');
const router = express.Router();
const axios = require('axios');
const MarketListing = require('../models/MarketListing');

async function fetchLivePrices(cropName) {
  try {
    const response = await axios.get('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070', {
      params: {
        'api-key': process.env.AGMARKNET_API_KEY,
        format: 'json',
        limit: 20,
        filters: `commodity=${cropName}`
      },
      timeout: 8000
    });

    const records = response.data.records;

    if (!records || records.length === 0) {
      return null;
    }

    const mandis = records.map(record => {
      const priceRange = Number(record.max_price) - Number(record.min_price);
      const midPrice = Number(record.modal_price);
      const maxPrice = Number(record.max_price);

      let trend = 'stable';
      if (midPrice >= maxPrice * 0.9) trend = 'rising';
      else if (midPrice <= Number(record.min_price) * 1.1) trend = 'falling';

      return {
        mandi: record.market,
        state: record.state,
        district: record.district,
        price: Number(record.modal_price),
        minPrice: Number(record.min_price),
        maxPrice: Number(record.max_price),
        date: record.arrival_date,
        trend
      };
    });

    const sorted = mandis
      .filter(m => m.price > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, 8);

    const seen = new Set();
    const unique = sorted.filter(m => {
      const key = `${m.mandi}-${m.state}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique;

  } catch (err) {
    console.log('Agmarknet API failed:', err.message);
    return null;
  }
}

const FALLBACK_DATA = {
  tomato: [
    { mandi: 'Nashik', state: 'Maharashtra', price: 3100, minPrice: 2800, maxPrice: 3400, trend: 'rising' },
    { mandi: 'Mumbai', state: 'Maharashtra', price: 3400, minPrice: 3000, maxPrice: 3800, trend: 'stable' },
    { mandi: 'Bangalore', state: 'Karnataka', price: 3200, minPrice: 2900, maxPrice: 3500, trend: 'rising' },
    { mandi: 'Pune', state: 'Maharashtra', price: 2800, minPrice: 2500, maxPrice: 3100, trend: 'stable' },
    { mandi: 'Hubli', state: 'Karnataka', price: 2600, minPrice: 2300, maxPrice: 2900, trend: 'falling' },
  ],
  potato: [
    { mandi: 'Delhi', state: 'Delhi', price: 1600, minPrice: 1400, maxPrice: 1800, trend: 'rising' },
    { mandi: 'Kanpur', state: 'Uttar Pradesh', price: 1400, minPrice: 1200, maxPrice: 1600, trend: 'rising' },
    { mandi: 'Agra', state: 'Uttar Pradesh', price: 1200, minPrice: 1000, maxPrice: 1400, trend: 'stable' },
    { mandi: 'Kolkata', state: 'West Bengal', price: 1300, minPrice: 1100, maxPrice: 1500, trend: 'stable' },
    { mandi: 'Patna', state: 'Bihar', price: 1100, minPrice: 900, maxPrice: 1300, trend: 'falling' },
  ],
  rice: [
    { mandi: 'Chennai', state: 'Tamil Nadu', price: 2400, minPrice: 2200, maxPrice: 2600, trend: 'rising' },
    { mandi: 'Hyderabad', state: 'Telangana', price: 2200, minPrice: 2000, maxPrice: 2400, trend: 'stable' },
    { mandi: 'Vijayawada', state: 'Andhra Pradesh', price: 2100, minPrice: 1900, maxPrice: 2300, trend: 'stable' },
    { mandi: 'Bhubaneswar', state: 'Odisha', price: 1900, minPrice: 1700, maxPrice: 2100, trend: 'falling' },
    { mandi: 'Cuttack', state: 'Odisha', price: 2000, minPrice: 1800, maxPrice: 2200, trend: 'stable' },
  ],
  wheat: [
    { mandi: 'Ludhiana', state: 'Punjab', price: 2300, minPrice: 2100, maxPrice: 2500, trend: 'rising' },
    { mandi: 'Amritsar', state: 'Punjab', price: 2200, minPrice: 2000, maxPrice: 2400, trend: 'stable' },
    { mandi: 'Indore', state: 'Madhya Pradesh', price: 2100, minPrice: 1900, maxPrice: 2300, trend: 'rising' },
    { mandi: 'Bhopal', state: 'Madhya Pradesh', price: 2000, minPrice: 1800, maxPrice: 2200, trend: 'stable' },
    { mandi: 'Jaipur', state: 'Rajasthan', price: 1900, minPrice: 1700, maxPrice: 2100, trend: 'falling' },
  ],
  maize: [
    { mandi: 'Nizamabad', state: 'Telangana', price: 1900, minPrice: 1700, maxPrice: 2100, trend: 'rising' },
    { mandi: 'Davangere', state: 'Karnataka', price: 1800, minPrice: 1600, maxPrice: 2000, trend: 'rising' },
    { mandi: 'Shimoga', state: 'Karnataka', price: 1700, minPrice: 1500, maxPrice: 1900, trend: 'stable' },
    { mandi: 'Akola', state: 'Maharashtra', price: 1750, minPrice: 1550, maxPrice: 1950, trend: 'stable' },
    { mandi: 'Gulbarga', state: 'Karnataka', price: 1600, minPrice: 1400, maxPrice: 1800, trend: 'falling' },
  ],
  onion: [
    { mandi: 'Lasalgaon', state: 'Maharashtra', price: 1500, minPrice: 1300, maxPrice: 1700, trend: 'rising' },
    { mandi: 'Nashik', state: 'Maharashtra', price: 1400, minPrice: 1200, maxPrice: 1600, trend: 'rising' },
    { mandi: 'Pune', state: 'Maharashtra', price: 1600, minPrice: 1400, maxPrice: 1800, trend: 'stable' },
    { mandi: 'Bangalore', state: 'Karnataka', price: 1700, minPrice: 1500, maxPrice: 1900, trend: 'rising' },
    { mandi: 'Indore', state: 'Madhya Pradesh', price: 1300, minPrice: 1100, maxPrice: 1500, trend: 'falling' },
  ],
  cotton: [
    { mandi: 'Warangal', state: 'Telangana', price: 6700, minPrice: 6500, maxPrice: 6900, trend: 'rising' },
    { mandi: 'Akola', state: 'Maharashtra', price: 6500, minPrice: 6300, maxPrice: 6700, trend: 'rising' },
    { mandi: 'Guntur', state: 'Andhra Pradesh', price: 6600, minPrice: 6400, maxPrice: 6800, trend: 'rising' },
    { mandi: 'Amravati', state: 'Maharashtra', price: 6300, minPrice: 6100, maxPrice: 6500, trend: 'stable' },
    { mandi: 'Adilabad', state: 'Telangana', price: 6400, minPrice: 6200, maxPrice: 6600, trend: 'stable' },
  ],
  banana: [
    { mandi: 'Jalgaon', state: 'Maharashtra', price: 1200, minPrice: 1000, maxPrice: 1400, trend: 'rising' },
    { mandi: 'Anantapur', state: 'Andhra Pradesh', price: 1300, minPrice: 1100, maxPrice: 1500, trend: 'rising' },
    { mandi: 'Trichy', state: 'Tamil Nadu', price: 1400, minPrice: 1200, maxPrice: 1600, trend: 'stable' },
    { mandi: 'Coimbatore', state: 'Tamil Nadu', price: 1350, minPrice: 1150, maxPrice: 1550, trend: 'rising' },
    { mandi: 'Solapur', state: 'Maharashtra', price: 1100, minPrice: 900, maxPrice: 1300, trend: 'stable' },
  ]
};

function getSellRecommendation(mandiList) {
  const sorted = [...mandiList].sort((a, b) => b.price - a.price);
  const best = sorted[0];
  const rising = mandiList.filter(m => m.trend === 'rising');
  const falling = mandiList.filter(m => m.trend === 'falling');

  let advice = '';
  let bestTime = '';

  if (best.trend === 'rising') {
    advice = `Prices are rising at ${best.mandi}. Sell within the next 3-5 days for maximum profit.`;
    bestTime = 'Next 3-5 days';
  } else if (best.trend === 'stable') {
    advice = `Prices are stable at ${best.mandi}. This is a good time to sell now.`;
    bestTime = 'Now';
  } else {
    const risingMandi = rising.length > 0 ? rising[0] : sorted[1];
    advice = `Prices are falling at top mandis. Consider selling at ${risingMandi.mandi} where prices are still rising.`;
    bestTime = 'As soon as possible';
  }

  return { best, advice, bestTime, rising, falling };
}

router.get('/prices/:cropName', async (req, res) => {
  try {
    const cropName = req.params.cropName.toLowerCase();
    console.log('Market Step 1 - Fetching prices for:', cropName);

    let mandiList = null;
    let isLive = false;

    if (process.env.AGMARKNET_API_KEY) {
      console.log('Market Step 2 - Trying live Agmarknet API...');
      mandiList = await fetchLivePrices(cropName);
      if (mandiList && mandiList.length > 0) {
        isLive = true;
        console.log('Market Step 3 - Live data fetched:', mandiList.length, 'mandis');
      }
    }

    if (!mandiList || mandiList.length === 0) {
      console.log('Market Step 2 - Using fallback data');
      mandiList = FALLBACK_DATA[cropName];
      if (!mandiList) {
        return res.json({
          success: false,
          message: `No data for ${cropName}. Available: ${Object.keys(FALLBACK_DATA).join(', ')}`
        });
      }
    }

    const recommendation = getSellRecommendation(mandiList);
    const avgPrice = Math.round(mandiList.reduce((sum, m) => sum + m.price, 0) / mandiList.length);
    const priceVariation = Math.max(...mandiList.map(m => m.price)) - Math.min(...mandiList.map(m => m.price));

    res.json({
      success: true,
      cropName,
      isLive,
      mandis: mandiList.sort((a, b) => b.price - a.price),
      bestMandi: recommendation.best,
      advice: recommendation.advice,
      bestTime: recommendation.bestTime,
      avgPrice,
      priceVariation,
      risingCount: recommendation.rising.length,
      fallingCount: recommendation.falling.length
    });

  } catch (err) {
    console.error('Market ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/list', async (req, res) => {
  try {
    const { farmerId, cropName, quantity, askingPrice, location } = req.body;
    const listing = await MarketListing.create({
      farmerId, cropName, quantity, askingPrice, location
    });
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/listings', async (req, res) => {
  try {
    const listings = await MarketListing.find({ status: 'active' })
      .populate('farmerId', 'name location')
      .sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;