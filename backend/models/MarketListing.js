const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  farmerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  cropName:    { type: String, required: true },
  quantity:    { type: Number, required: true },
  askingPrice: { type: Number },
  quality:     { type: String, enum: ['A','B','C'], default: 'A' },
  location:    { type: String },
  state:       { type: String },
  district:    { type: String },
  farmerPhone: { type: String },
  description: { type: String },
  status:      { type: String, enum: ['active','sold','expired'], default: 'active' },
  bidCount:    { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketListing', marketSchema);