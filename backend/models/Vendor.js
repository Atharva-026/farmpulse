const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  businessName:  { type: String, required: true },
  phone:         { type: String, required: true, unique: true },
  email:         { type: String },
  location: {
    state: { type: String },
    city:  { type: String }
  },
  preferredCrops: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', vendorSchema);