const mongoose = require('mongoose');

const vendorBidSchema = new mongoose.Schema({
  vendorId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  listingId:      { type: mongoose.Schema.Types.ObjectId, ref: 'MarketListing', required: true },
  offeredPrice:   { type: Number, required: true },
  quantityNeeded: { type: Number, required: true },
  message:        { type: String },
  status: {
    type: String,
    enum: ['pending','accepted','rejected','withdrawn'],
    default: 'pending'
  },
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('VendorBid', vendorBidSchema);