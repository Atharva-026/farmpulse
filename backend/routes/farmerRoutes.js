const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');

router.post('/register', async (req, res) => {
  try {
    const { name, phone, location, landSize, soilType } = req.body;

    const existing = await Farmer.findOne({ phone });
    if (existing) {
      return res.json({ success: true, farmer: existing, message: 'Farmer already exists' });
    }

    const farmer = await Farmer.create({ name, phone, location, landSize, soilType });
    res.json({ success: true, farmer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;