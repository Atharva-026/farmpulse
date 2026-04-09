const mongoose = require('mongoose');

const vendorBidSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketListing', required: true },
  offeredPrice: { type: Number, required: true },    // ₹ per quintal
  quantityNeeded: { type: Number, required: true },  // quintals
  message: { type: String },                          // optional note to farmer
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

vendorBidSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('VendorBid', vendorBidSchema);