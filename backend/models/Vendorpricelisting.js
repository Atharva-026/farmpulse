const mongoose = require('mongoose');

const vendorPriceListingSchema = new mongoose.Schema({
  vendorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  cropName:        { type: String, required: true },
  offeredPrice:    { type: Number, required: true },   // ₹ per quintal
  quantityNeeded:  { type: Number, required: true },   // quintals
  state:           { type: String },
  district:        { type: String },
  validUntil:      { type: Date },
  notes:           { type: String },
  interestedFarmers: [{
    farmerPhone: { type: String },
    farmerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
    message:     { type: String },
    expressedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VendorPriceListing', vendorPriceListingSchema);