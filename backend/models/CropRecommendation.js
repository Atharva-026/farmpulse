const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  inputs: {
    soilType: String,
    season: String,
    waterAvailability: String,
    budget: Number,
    location: String,
    temperature: Number,
    humidity: Number,
    rainfall: Number
  },
  recommendedCrop: { type: String },
  expectedYield: { type: String },
  expectedProfit: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CropRecommendation', cropSchema);