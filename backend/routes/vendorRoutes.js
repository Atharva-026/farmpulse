const express = require('express');
const router  = express.Router();
const Vendor  = require('../models/Vendor');

// POST /api/vendor/register
router.post('/register', async (req, res) => {
  try {
    const { name, businessName, phone, email, location, preferredCrops } = req.body;
    if (!name || !businessName || !phone)
      return res.status(400).json({ success:false, message:'name, businessName and phone are required' });

    const existing = await Vendor.findOne({ phone });
    if (existing)
      return res.status(409).json({ success:false, message:'A vendor with this phone number already exists.' });

    const vendor = await Vendor.create({ name, businessName, phone, email, location, preferredCrops });
    res.json({ success:true, vendor });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// POST /api/vendor/login
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success:false, message:'Phone number is required' });

    const vendor = await Vendor.findOne({ phone });
    if (!vendor)
      return res.status(404).json({ success:false, message:'No vendor found with this phone number. Please register first.' });

    res.json({ success:true, vendor });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

// GET /api/vendor/:id
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success:false, message:'Vendor not found' });
    res.json({ success:true, vendor });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;