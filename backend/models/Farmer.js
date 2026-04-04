const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  location: {
    state: { type: String },
    district: { type: String },
    pincode: { type: String }
  },
  landSize: { type: Number },
  soilType: { type: String, enum: ['sandy', 'clay', 'loamy', 'silt', 'peaty'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farmer', farmerSchema);