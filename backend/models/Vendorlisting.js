// Vendor's "Buy Offer" — vendor posts what crop they want to buy
const mongoose = require('mongoose');

const vendorListingSchema = new mongoose.Schema({
  vendorId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  cropName:       { type: String, required: true },
  offeredPrice:   { type: Number, required: true },
  quantityNeeded: { type: Number, required: true },
  state:          { type: String },
  district:       { type: String },
  notes:          { type: String },
  validUntil:     { type: Date },
  status:         { type: String, enum: ['active','closed'], default: 'active' },
  interestedFarmers: [{
    farmerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
    farmerPhone: { type: String },
    message:     { type: String },
    expressedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VendorListing', vendorListingSchema);