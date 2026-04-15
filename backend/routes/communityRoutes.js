const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const CommunityPost = require('../models/CommunityPost');

const PAGE_SIZE = 12;

// ─── Translation helper (MyMemory free API — 1000 req/day, no key needed) ────
async function translateText(text, fromLang, toLang) {
  if (fromLang === toLang) return text;
  // MyMemory language codes
  const langMap = { en:'en', hi:'hi', mr:'mr', kn:'kn' };
  const pair = `${langMap[fromLang]}|${langMap[toLang]}`;
  try {
    const res = await axios.get('https://api.mymemory.translated.net/get', {
      params: { q: text, langpair: pair },
      timeout: 8000
    });
    const t = res.data?.responseData?.translatedText;
    return t && t !== text ? t : null;
  } catch {
    return null;
  }
}

// ─── GET /api/community?page=1&tag=tomato&lang=hi&category=disease ────────────
router.get('/', async (req, res) => {
  try {
    const { page = 1, tag, lang, category, sort = 'recent' } = req.query;
    const skip = (Number(page) - 1) * PAGE_SIZE;
    const query = {};
    if (tag)      query.tags     = tag;
    if (lang)     query.language = lang;
    if (category) query.category = category;

    let sortObj = { createdAt: -1 };
    if (sort === 'trending') sortObj = { likeCount: -1, commentCount: -1 };
    if (sort === 'popular')  sortObj = { viewCount: -1 };

    const [posts, total] = await Promise.all([
      CommunityPost.find(query)
        .select('-comments') // don't load all comments in feed
        .sort(sortObj)
        .skip(skip)
        .limit(PAGE_SIZE),
      CommunityPost.countDocuments(query)
    ]);

    res.json({ success: true, posts, total, page: Number(page), pages: Math.ceil(total / PAGE_SIZE) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/community/trending — top 10 posts last 7 days ──────────────────
router.get('/trending', async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await CommunityPost.find({ createdAt: { $gte: since } })
      .select('-comments')
      .sort({ likeCount: -1, commentCount: -1 })
      .limit(10);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/community/tags — trending tags for filter bar ──────────────────
router.get('/tags', async (req, res) => {
  try {
    const result = await CommunityPost.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json({ success: true, tags: result.map(r => ({ tag: r._id, count: r.count })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/community/:id — single post with comments ──────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/community — create a post ─────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { authorId, authorName, authorState, caption, language, images, tags, location, category } = req.body;
    if (!authorId || !authorName || !caption)
      return res.status(400).json({ success: false, message: 'authorId, authorName and caption are required' });

    const post = await CommunityPost.create({
      authorId, authorName, authorState,
      caption, language: language || 'en',
      images: images || [],
      tags:   (tags || []).map(t => t.toLowerCase().trim()).filter(Boolean),
      location, category: category || 'general'
    });

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/community/:id/like — toggle like ───────────────────────────────
router.put('/:id/like', async (req, res) => {
  try {
    const { farmerId } = req.body;
    if (!farmerId) return res.status(400).json({ success: false, message: 'farmerId required' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const idx = post.likes.findIndex(id => id.toString() === farmerId);
    if (idx === -1) {
      post.likes.push(farmerId);
      post.likeCount = post.likes.length;
    } else {
      post.likes.splice(idx, 1);
      post.likeCount = post.likes.length;
    }
    await post.save();

    res.json({ success: true, liked: idx === -1, likeCount: post.likeCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/community/:id/comment — add a comment ────────────────────────
router.post('/:id/comment', async (req, res) => {
  try {
    const { authorId, authorName, text, language, parentId } = req.body;
    if (!authorId || !authorName || !text)
      return res.status(400).json({ success: false, message: 'authorId, authorName and text are required' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = {
      authorId, authorName, text,
      language: language || 'en',
      parentId: parentId || null,
      likes: [],
      createdAt: new Date()
    };
    post.comments.push(comment);
    post.commentCount = post.comments.length;
    await post.save();

    const saved = post.comments[post.comments.length - 1];
    res.json({ success: true, comment: saved, commentCount: post.commentCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/community/:id/comment/:commentId/like ──────────────────────────
router.put('/:id/comment/:commentId/like', async (req, res) => {
  try {
    const { farmerId } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const idx = comment.likes.findIndex(id => id.toString() === farmerId);
    if (idx === -1) comment.likes.push(farmerId);
    else comment.likes.splice(idx, 1);

    await post.save();
    res.json({ success: true, liked: idx === -1, likeCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/community/:id/translate — translate caption ───────────────────
router.post('/:id/translate', async (req, res) => {
  try {
    const { toLang } = req.body;
    if (!toLang) return res.status(400).json({ success: false, message: 'toLang required' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Return cached translation if available
    const cached = post.translations.find(t => t.language === toLang);
    if (cached) return res.json({ success: true, text: cached.text, cached: true });

    // Translate via MyMemory
    const translated = await translateText(post.caption, post.language, toLang);
    if (!translated)
      return res.status(502).json({ success: false, message: 'Translation service unavailable' });

    // Cache it
    post.translations.push({ language: toLang, text: translated });
    await post.save();

    res.json({ success: true, text: translated, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/community/:id — delete own post ─────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { farmerId } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.authorId.toString() !== farmerId)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;