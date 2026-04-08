const express = require('express');
const router = express.Router();
const axios = require('axios');

// Convert sand/silt/clay percentages to soil type category
function classifySoilType(sand, silt, clay) {
  if (clay >= 40) return 'clay';
  if (sand >= 70) return 'sandy';
  if (silt >= 50) return 'silt';
  if (sand >= 40 && clay < 30 && silt < 40) return 'loamy';
  if (clay >= 25 && clay < 40) return 'clay';
  return 'loamy'; // default
}

// Convert soil moisture (0-1 scale from Open-Meteo) to water availability category
function classifyWaterAvailability(soilMoisture, annualRainfall) {
  if (annualRainfall > 1200 || soilMoisture > 0.35) return 'high';
  if (annualRainfall > 500  || soilMoisture > 0.12) return 'medium';
  return 'low';
}

// India soil zone fallback — based on broad lat/lon regions
// Used when SoilGrids API is down
function getStateFromCoords(lat, lon) {
  if (lat > 28 && lon > 76 && lon < 78) return 'Delhi';
  if (lat > 28 && lon > 74 && lon < 76) return 'Punjab';
  if (lat > 23 && lat < 28 && lon > 68 && lon < 74) return 'Rajasthan';
  if (lat > 12 && lat < 18 && lon > 74 && lon < 78) return 'Karnataka';
  if (lat > 18 && lat < 23 && lon > 72 && lon < 80) return 'Maharashtra';
  if (lat > 17 && lat < 20 && lon > 78 && lon < 82) return 'Telangana';
  if (lat > 20 && lat < 26 && lon > 80 && lon < 84) return 'Madhya Pradesh';
  if (lat > 22 && lat < 27 && lon > 85 && lon < 89) return 'West Bengal';
  if (lat > 8  && lat < 12 && lon > 76 && lon < 78) return 'Tamil Nadu';
  if (lat > 8  && lat < 12 && lon > 74 && lon < 76) return 'Kerala';
  return '';
}
/**
 * POST /api/location/auto-fill
 * Body: { lat, lon }
 * Returns: { soilType, waterAvailability, temperature, humidity, rainfall, locationName, state, district, soilMoisture }
 */
router.post('/auto-fill', async (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, error: 'lat and lon are required' });
  }

  const results = {
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    soilType: 'loamy',
    waterAvailability: 'medium',
    temperature: 25,
    humidity: 60,
    rainfall: 50,
    soilMoisture: 0.25,
    locationName: 'Your Location',
    state: '',
    district: ''
  };

  // ─── 1. Open-Meteo: weather + soil moisture (no API key needed) ───
  try {
    console.log('Location Step 1 - Calling Open-Meteo...');
    const meteoRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,soil_moisture_0_to_1cm',
        daily: 'precipitation_sum',
        forecast_days: 7,
        timezone: 'Asia/Kolkata'
      },
      timeout: 8000
    });

    const current = meteoRes.data.current;
    const daily = meteoRes.data.daily;

    results.temperature = Math.round(current.temperature_2m);
    results.humidity = Math.round(current.relative_humidity_2m);
    results.soilMoisture = current.soil_moisture_0_to_1cm || 0.25;

    // Fetch 30-day historical rainfall for better annual estimate
    const today = new Date();
    const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);
    const fmt = d => d.toISOString().split('T')[0];

    let annualEstimate = 800; // fallback default

    try {
      const archiveRes = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: fmt(thirtyDaysAgo),
          end_date: fmt(today),
          daily: 'precipitation_sum',
          timezone: 'Asia/Kolkata'
        },
        timeout: 8000
      });

      if (archiveRes.data.daily && archiveRes.data.daily.precipitation_sum) {
        const monthly30 = archiveRes.data.daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0);
        annualEstimate = monthly30 * 12; // extrapolate 30-day to annual
        console.log(`Location Step 1 - 30-day rainfall: ${monthly30}mm, estimated annual: ${annualEstimate}mm`);
      }
    } catch (err) {
      console.log('Location Step 1 - Archive API failed, using fallback:', err.message);
    }

    // Store weekly rainfall if available for reference
    if (daily && daily.precipitation_sum) {
      const weeklyRain = daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0);
      results.rainfall = Math.round(weeklyRain); // weekly mm for display
    }

    results.waterAvailability = classifyWaterAvailability(results.soilMoisture, annualEstimate);

    console.log('Location Step 1 - Open-Meteo OK:', {
      temp: results.temperature,
      humidity: results.humidity,
      soilMoisture: results.soilMoisture
    });
  } catch (err) {
    console.log('Location Step 1 - Open-Meteo failed:', err.message);
  }

  // ─── 2. SoilGrids ISRIC: sand/silt/clay percentages (no API key needed) ───
  try {
    console.log('Location Step 2 - Calling SoilGrids...');
    const soilRes = await axios.get('https://rest.isric.org/soilgrids/v2.0/properties/query', {
      params: {
        lon: lon,
        lat: lat,
        property: ['sand', 'silt', 'clay'],
        depth: '0-5cm',
        value: 'mean'
      },
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });

    const props = soilRes.data.properties?.layers;
    if (props) {
      let sand = null, silt = null, clay = null;

      props.forEach(layer => {
        const val = layer.depths?.[0]?.values?.mean;
        if (val == null) return;
        // SoilGrids returns values * 10 (e.g. 350 = 35%)
        if (layer.name === 'sand') sand = val / 10;
        if (layer.name === 'silt') silt = val / 10;
        if (layer.name === 'clay') clay = val / 10;
      });

      if (sand !== null && silt !== null && clay !== null) {
        results.soilType = classifySoilType(sand, silt, clay);
        console.log(`Location Step 2 - SoilGrids OK: sand=${sand}% silt=${silt}% clay=${clay}% → ${results.soilType}`);
      }
    }
  } catch (err) {
    console.log('Location Step 2 - SoilGrids failed, using India zone fallback:', err.message);
    results.soilType = getIndianSoilFallback(parseFloat(lat), parseFloat(lon));
  }

  // Frontend will handle reverse geocoding via Nominatim (browser → allowed)
  res.json({ success: true, ...results });
});

module.exports = router;
