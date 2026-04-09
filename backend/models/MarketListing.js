const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  cropName: { type: String, required: true },
  quantity: { type: Number, required: true },
  askingPrice: { type: Number },
  quality: { type: String },
  location: { type: String },
  state: { type: String },
  district: { type: String },
  farmerPhone: { type: String },
  description: { type: String },
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketListing', marketSchema);

const createListing = async (farmerId, cropName, quantity, askingPrice, quality, location, state, district, farmerPhone, description) => {
  const listing = new MarketListing({
    farmerId,
    cropName,
    quantity: Number(quantity),
    askingPrice: Number(askingPrice),
    quality,
    location,
    state,
    district,
    farmerPhone,
    description
  });

  await listing.save();

  return listing._id; // Real MongoDB ObjectId
};