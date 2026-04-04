const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  cropName: { type: String, required: true },
  quantity: { type: Number, required: true },
  askingPrice: { type: Number },
  location: { type: String },
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketListing', marketSchema);