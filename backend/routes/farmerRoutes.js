const express = require('express');
const router  = express.Router();
const Farmer  = require('../models/Farmer');

// POST /api/farmer/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, location, landSize, soilType } = req.body;
    if (!name || !phone)
      return res.status(400).json({ success:false, message:'Name and phone are required' });

    const existing = await Farmer.findOne({ phone });
    if (existing)
      return res.json({ success:true, farmer:existing, message:'Farmer already exists' });

    const farmer = await Farmer.create({ name, phone, location, landSize, soilType });
    res.json({ success:true, farmer });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// POST /api/farmer/login — look up farmer by phone
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success:false, message:'Phone number is required' });

    const farmer = await Farmer.findOne({ phone });
    if (!farmer)
      return res.status(404).json({ success:false, message:'No farmer found with this phone number. Please register first.' });

    res.json({ success:true, farmer });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/farmer/:id
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ success:false, message:'Farmer not found' });
    res.json({ success:true, farmer });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;