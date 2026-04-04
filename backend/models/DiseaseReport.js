const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  cropName: { type: String },
  imageUrl: { type: String },
  diseaseName: { type: String },
  confidence: { type: Number },
  treatment: { type: String },
  estimatedCost: { type: Number },
  loanApplied: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DiseaseReport', diseaseSchema);