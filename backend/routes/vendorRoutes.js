const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const Vendor  = require('../models/Vendor');

// POST /api/vendor/register
router.post('/register', async (req, res) => {
  try {
    const { name, businessName, phone, password, email, location, preferredCrops } = req.body;
    if (!name || !businessName || !phone || !password)
      return res.status(400).json({ success:false, message:'name, businessName, phone and password are required' });
    if (password.length < 4)
      return res.status(400).json({ success:false, message:'Password must be at least 4 characters' });

    const existing = await Vendor.findOne({ phone });
    if (existing)
      return res.status(409).json({ success:false, message:'A vendor with this phone number already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const vendor = await Vendor.create({ name, businessName, phone, password: hashed, email, location, preferredCrops });

    const out = vendor.toObject(); delete out.password;
    res.json({ success:true, vendor: out });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// POST /api/vendor/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ success:false, message:'Phone and password are required' });

    const vendor = await Vendor.findOne({ phone });
    if (!vendor)
      return res.status(404).json({ success:false, message:'No vendor found with this phone number. Please register first.' });
    if (!vendor.password)
      return res.status(401).json({ success:false, message:'This account was created before passwords. Please register again.' });

    const ok = await bcrypt.compare(password, vendor.password);
    if (!ok)
      return res.status(401).json({ success:false, message:'Incorrect password.' });

    const out = vendor.toObject(); delete out.password;
    res.json({ success:true, vendor: out });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/vendor/:id
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('-password');
    if (!vendor) return res.status(404).json({ success:false, message:'Vendor not found' });
    res.json({ success:true, vendor });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;