const express = require('express');
const router = express.Router();
const axios = require('axios');
const CropRecommendation = require('../models/CropRecommendation');

router.post('/recommend', async (req, res) => {
  try {
    const { farmerId, soilType, season, waterAvailability, budget, location } = req.body;

    console.log('Step 1 - Received request:', req.body);

    // If GPS auto-fill already sent weather, use it directly (no OpenWeatherMap key needed)
    let temperature = req.body.temperature ? parseFloat(req.body.temperature) : 25;
    let humidity    = req.body.humidity    ? parseFloat(req.body.humidity)    : 60;
    let rainfall    = req.body.rainfall    ? parseFloat(req.body.rainfall)    : 50;
    const hasGPSWeather = !!(req.body.temperature && req.body.humidity);

    if (!hasGPSWeather) {
      try {
        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );
        temperature = weatherRes.data.main.temp;
        humidity = weatherRes.data.main.humidity;
        rainfall = weatherRes.data.rain ? weatherRes.data.rain['1h'] || 50 : 50;
        console.log('Step 2 - Weather from OpenWeatherMap:', { temperature, humidity, rainfall });
      } catch (weatherErr) {
        console.log('Step 2 - Weather API failed, using defaults:', weatherErr.message);
      }
    } else {
      console.log('Step 2 - Using GPS weather from frontend:', { temperature, humidity, rainfall });
    }

    console.log('Step 3 - Calling Flask...');
    const mlRes = await axios.post('http://localhost:5001/predict-crop', {
      soilType, temperature, humidity, rainfall
    });

    console.log('Step 4 - Flask response:', mlRes.data);

    const { recommendedCrop, confidence, expectedYield, expectedProfit } = mlRes.data;

    await CropRecommendation.create({
      farmerId,
      inputs: { soilType, season, waterAvailability, budget, location, temperature, humidity, rainfall },
      recommendedCrop,
      expectedYield,
      expectedProfit
    });

    console.log('Step 5 - Saved to MongoDB');

    res.json({
      success: true,
      recommendedCrop,
      confidence,
      expectedYield,
      expectedProfit,
      temperature,
      humidity,
      rainfall
    });

  } catch (err) {
    console.error('FULL ERROR:', err.message);
    console.error('ERROR STACK:', err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/history/:farmerId', async (req, res) => {
  try {
    const history = await CropRecommendation.find({ farmerId: req.params.farmerId });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;