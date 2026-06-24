const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const Farmer  = require('../models/Farmer');

// POST /api/farmer/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, location, landSize, soilType } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ success:false, message:'Name, phone and password are required' });
    if (password.length < 4)
      return res.status(400).json({ success:false, message:'Password must be at least 4 characters' });

    const existing = await Farmer.findOne({ phone });
    if (existing)
      return res.status(409).json({ success:false, message:'A farmer with this phone already exists. Please log in.' });

    const hashed = await bcrypt.hash(password, 10);
    const farmer = await Farmer.create({ name, phone, password: hashed, location, landSize, soilType });

    const out = farmer.toObject(); delete out.password;
    res.json({ success:true, farmer: out });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// POST /api/farmer/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ success:false, message:'Phone and password are required' });

    const farmer = await Farmer.findOne({ phone });
    if (!farmer)
      return res.status(404).json({ success:false, message:'No farmer found with this phone number. Please register first.' });
    if (!farmer.password)
      return res.status(401).json({ success:false, message:'This account was created before passwords. Please register again.' });

    const ok = await bcrypt.compare(password, farmer.password);
    if (!ok)
      return res.status(401).json({ success:false, message:'Incorrect password.' });

    const out = farmer.toObject(); delete out.password;
    res.json({ success:true, farmer: out });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/farmer/:id
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).select('-password');
    if (!farmer) return res.status(404).json({ success:false, message:'Farmer not found' });
    res.json({ success:true, farmer });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;