const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  authorName: { type: String, required: true },
  text:       { type: String, required: true },
  language:   { type: String, default: 'en' },
  parentId:   { type: mongoose.Schema.Types.ObjectId, default: null }, // for replies
  likes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' }],
  createdAt:  { type: Date, default: Date.now }
});

const translationSchema = new mongoose.Schema({
  language: String,
  text:     String
}, { _id: false });

const communityPostSchema = new mongoose.Schema({
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  authorName: { type: String, required: true },
  authorState:{ type: String },

  // Content
  caption:    { type: String, required: true },
  language:   { type: String, enum: ['en','hi','mr','kn'], default: 'en' },
  images:     [{ type: String }], // Cloudinary URLs
  tags:       [{ type: String }], // crop tags e.g. ['tomato','disease']
  location:   { type: String },

  // Category
  category: {
    type: String,
    enum: ['growing','disease','harvest','tip','market','general'],
    default: 'general'
  },

  // Engagement
  likes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' }],
  likeCount:  { type: Number, default: 0 },
  viewCount:  { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },

  // Cached translations — keyed by language code
  translations: [translationSchema],

  comments: [commentSchema],

  createdAt: { type: Date, default: Date.now }
});

// Index for trending queries
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ likeCount: -1, commentCount: -1 });
communityPostSchema.index({ tags: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);