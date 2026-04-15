import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API = 'http://localhost:5000/api';
const CLOUDINARY_CLOUD = 'dgkgg96de';
const CLOUDINARY_PRESET = 'farmpulse_community'; // unsigned upload preset you create in Cloudinary dashboard

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all',      label: 'All Posts',     icon: '🌾' },
  { key: 'growing',  label: 'Growing',        icon: '🌱' },
  { key: 'disease',  label: 'Disease & Cure', icon: '🔬' },
  { key: 'harvest',  label: 'Harvest',        icon: '🌻' },
  { key: 'tip',      label: 'Farming Tips',   icon: '💡' },
  { key: 'market',   label: 'Market',         icon: '📊' },
  { key: 'general',  label: 'General',        icon: '💬' },
];

const LANG_LABELS = { en: '🇬🇧 EN', hi: '🇮🇳 हि', mr: '🟠 म', kn: '🟡 ಕ' };
const LANG_NAMES  = { en: 'English', hi: 'हिंदी', mr: 'मराठी', kn: 'ಕನ್ನಡ' };

const C = {
  green: '#1B5E20', mid: '#2E7D32', light: '#E8F5E9', pale: '#F1F8E9',
  border: '#E2EDE2', text: '#1A2B1A', sub: '#4A5E4A', muted: '#7A917A',
  red: '#C62828', redBg: '#FFEBEE', amber: '#F57F17', amberBg: '#FFF8E1',
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function Avatar({ name, size = 36 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const hue = [...(name||'')].reduce((acc,c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},45%,42%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

// ─── Image uploader to Cloudinary ────────────────────────────────────────────
async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);
  form.append('folder', 'farmpulse/community');
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    form
  );
  return res.data.secure_url;
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreatePostModal({ farmer, onClose, onCreated }) {
  const { i18n } = useTranslation();
  const [caption,   setCaption]   = useState('');
  const [language,  setLanguage]  = useState(i18n.language || 'en');
  const [category,  setCategory]  = useState('general');
  const [tags,      setTags]      = useState('');
  const [location,  setLocation]  = useState(farmer?.location?.state || '');
  const [images,    setImages]    = useState([]);   // preview URLs
  const [files,     setFiles]     = useState([]);   // File objects
  const [uploading, setUploading] = useState(false);
  const [err,       setErr]       = useState('');
  const fileRef = useRef();

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files).slice(0, 3);
    setFiles(prev => [...prev, ...picked].slice(0,3));
    setImages(prev => [...prev, ...picked.map(f => URL.createObjectURL(f))].slice(0,3));
  };

  const removeImage = (i) => {
    setFiles(f => f.filter((_,idx) => idx !== i));
    setImages(im => im.filter((_,idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim()) { setErr('Please write a caption.'); return; }
    setErr(''); setUploading(true);
    try {
      // Upload images to Cloudinary
      const urls = await Promise.all(files.map(uploadToCloudinary));

      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await axios.post(`${API}/community`, {
        authorId:    farmer._id,
        authorName:  farmer.name,
        authorState: farmer.location?.state || '',
        caption, language, category,
        images: urls,
        tags:   tagList,
        location
      });
      onCreated();
      onClose();
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Failed to post. Try again.');
    }
    setUploading(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', maxWidth:'520px', width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding:'20px 24px 0', borderBottom:`1px solid ${C.border}`, paddingBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Avatar name={farmer?.name} size={38}/>
            <div>
              <p style={{ margin:0, fontWeight:700, fontSize:'15px', color:C.text }}>{farmer?.name}</p>
              <p style={{ margin:0, fontSize:'12px', color:C.muted }}>{farmer?.location?.state || 'India'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:C.muted }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:'20px 24px' }}>
          {/* Caption */}
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Share your farming experience, disease cure, growing tips…"
            required
            style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:'12px', padding:'14px', fontSize:'15px', fontFamily:'inherit', resize:'vertical', minHeight:'110px', outline:'none', boxSizing:'border-box', color:C.text, lineHeight:1.6 }}
            onFocus={e => e.target.style.borderColor = C.mid}
            onBlur={e  => e.target.style.borderColor = C.border}
          />

          {/* Language + Category row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', margin:'12px 0' }}>
            <div>
              <label style={{ fontSize:'12px', fontWeight:600, color:C.sub, display:'block', marginBottom:'4px' }}>Caption language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width:'100%', padding:'9px 10px', border:`1.5px solid ${C.border}`, borderRadius:'8px', fontSize:'13px', fontFamily:'inherit', color:C.text, background:'#fff', outline:'none' }}>
                {Object.entries(LANG_NAMES).map(([k,v]) => <option key={k} value={k}>{LANG_LABELS[k]} {v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'12px', fontWeight:600, color:C.sub, display:'block', marginBottom:'4px' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ width:'100%', padding:'9px 10px', border:`1.5px solid ${C.border}`, borderRadius:'8px', fontSize:'13px', fontFamily:'inherit', color:C.text, background:'#fff', outline:'none' }}>
                {CATEGORIES.filter(c => c.key !== 'all').map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tags + Location row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div>
              <label style={{ fontSize:'12px', fontWeight:600, color:C.sub, display:'block', marginBottom:'4px' }}>Crop tags (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tomato, disease, kharif" style={{ width:'100%', padding:'9px 10px', border:`1.5px solid ${C.border}`, borderRadius:'8px', fontSize:'13px', fontFamily:'inherit', color:C.text, outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize:'12px', fontWeight:600, color:C.sub, display:'block', marginBottom:'4px' }}>Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Belgaum, Karnataka" style={{ width:'100%', padding:'9px 10px', border:`1.5px solid ${C.border}`, borderRadius:'8px', fontSize:'13px', fontFamily:'inherit', color:C.text, outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>

          {/* Image picker */}
          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'12px', fontWeight:600, color:C.sub, display:'block', marginBottom:'6px' }}>Photos (up to 3)</label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {images.map((src, i) => (
                <div key={i} style={{ position:'relative', width:'80px', height:'80px' }}>
                  <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'10px', border:`1.5px solid ${C.border}` }}/>
                  <button type="button" onClick={() => removeImage(i)} style={{ position:'absolute', top:'-6px', right:'-6px', background:C.red, color:'#fff', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer', fontSize:'12px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
              {images.length < 3 && (
                <button type="button" onClick={() => fileRef.current.click()} style={{ width:'80px', height:'80px', border:`2px dashed ${C.border}`, borderRadius:'10px', background:C.pale, cursor:'pointer', color:C.mid, fontSize:'24px', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display:'none' }} />
          </div>

          {err && <p style={{ color:C.red, background:C.redBg, padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }}>{err}</p>}

          <div style={{ display:'flex', gap:'10px' }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'12px', border:`1.5px solid ${C.border}`, borderRadius:'10px', background:'#fff', color:C.sub, fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            <button type="submit" disabled={uploading} style={{ flex:2, padding:'12px', border:'none', borderRadius:'10px', background:`linear-gradient(135deg, ${C.green}, ${C.mid})`, color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity: uploading ? 0.7 : 1 }}>
              {uploading ? '⏳ Uploading…' : '🌱 Share with Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Comment Sheet ────────────────────────────────────────────────────────────
function CommentSheet({ post, farmer, onClose, onUpdate }) {
  const [comments, setComments] = useState(post.comments || []);
  const [text,     setText]     = useState('');
  const [replyTo,  setReplyTo]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [transMap, setTransMap] = useState({});
  const { i18n } = useTranslation();
  const bottomRef = useRef();

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/community/${post._id}/comment`, {
        authorId:   farmer._id,
        authorName: farmer.name,
        text, language: i18n.language,
        parentId: replyTo?._id || null
      });
      setComments(prev => [...prev, res.data.comment]);
      setText(''); setReplyTo(null);
      onUpdate(res.data.commentCount);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    } catch {}
    setLoading(false);
  };

  const translateComment = async (commentId, fromLang, text) => {
    if (fromLang === i18n.language) return;
    try {
      const res = await axios.get('https://api.mymemory.translated.net/get', {
        params: { q: text, langpair: `${fromLang}|${i18n.language}` }
      });
      const t = res.data?.responseData?.translatedText;
      if (t) setTransMap(m => ({ ...m, [commentId]: t }));
    } catch {}
  };

  const topLevel  = comments.filter(c => !c.parentId);
  const replies   = comments.filter(c =>  c.parentId);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:900, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:'600px', maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 -8px 40px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <p style={{ margin:0, fontWeight:700, fontSize:'15px', color:C.text }}>💬 Comments ({comments.length})</p>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:C.muted }}>✕</button>
        </div>

        {/* Comments list */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 20px' }}>
          {topLevel.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px', color:C.muted }}>
              <p style={{ fontSize:'28px', margin:'0 0 8px' }}>💬</p>
              <p style={{ fontSize:'14px' }}>No comments yet. Be the first to share!</p>
            </div>
          )}
          {topLevel.map(c => (
            <div key={c._id} style={{ marginBottom:'14px' }}>
              <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                <Avatar name={c.authorName} size={32}/>
                <div style={{ flex:1, background:C.pale, borderRadius:'12px', padding:'10px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:'13px', color:C.text }}>{c.authorName}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontSize:'10px', color:C.muted }}>{LANG_LABELS[c.language]}</span>
                      <span style={{ fontSize:'11px', color:C.muted }}>{timeAgo(c.createdAt)}</span>
                    </div>
                  </div>
                  <p style={{ margin:0, fontSize:'14px', color:C.text, lineHeight:1.5 }}>
                    {transMap[c._id] || c.text}
                  </p>
                  {c.language !== i18n.language && !transMap[c._id] && (
                    <button onClick={() => translateComment(c._id, c.language, c.text)}
                      style={{ background:'none', border:'none', color:C.mid, cursor:'pointer', fontSize:'12px', padding:'4px 0 0', fontFamily:'inherit' }}>
                      Translate →
                    </button>
                  )}
                  <div style={{ marginTop:'6px', display:'flex', gap:'12px' }}>
                    <button onClick={() => setReplyTo(c)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:'12px', fontFamily:'inherit' }}>
                      Reply
                    </button>
                    <span style={{ fontSize:'12px', color:C.muted }}>❤️ {c.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
              {/* Replies */}
              {replies.filter(r => r.parentId?.toString() === c._id?.toString()).map(r => (
                <div key={r._id} style={{ marginLeft:'42px', marginTop:'8px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                  <Avatar name={r.authorName} size={26}/>
                  <div style={{ flex:1, background:'#f9f9f9', borderRadius:'10px', padding:'8px 12px', border:`1px solid ${C.border}` }}>
                    <p style={{ margin:'0 0 2px', fontWeight:700, fontSize:'12px', color:C.text }}>{r.authorName}</p>
                    <p style={{ margin:0, fontSize:'13px', color:C.text }}>{transMap[r._id] || r.text}</p>
                    {r.language !== i18n.language && !transMap[r._id] && (
                      <button onClick={() => translateComment(r._id, r.language, r.text)} style={{ background:'none', border:'none', color:C.mid, cursor:'pointer', fontSize:'11px', padding:'2px 0 0', fontFamily:'inherit' }}>Translate →</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
          {replyTo && (
            <div style={{ display:'flex', justifyContent:'space-between', background:C.pale, borderRadius:'8px', padding:'6px 12px', marginBottom:'8px', alignItems:'center' }}>
              <p style={{ margin:0, fontSize:'12px', color:C.sub }}>↩ Replying to <strong>{replyTo.authorName}</strong></p>
              <button onClick={() => setReplyTo(null)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:'14px' }}>✕</button>
            </div>
          )}
          <form onSubmit={submit} style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
            <Avatar name={farmer?.name} size={32}/>
            <input
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Write a comment…"
              style={{ flex:1, padding:'10px 14px', border:`1.5px solid ${C.border}`, borderRadius:'20px', fontSize:'14px', fontFamily:'inherit', outline:'none', color:C.text }}
              onFocus={e => e.target.style.borderColor = C.mid}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
            <button type="submit" disabled={loading || !text.trim()} style={{ padding:'10px 16px', background:C.mid, color:'#fff', border:'none', borderRadius:'20px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity: loading || !text.trim() ? 0.5 : 1 }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post: initialPost, farmer, onOpenComments }) {
  const [post,        setPost]        = useState(initialPost);
  const [imgIdx,      setImgIdx]      = useState(0);
  const [translated,  setTranslated]  = useState(null);
  const [translating, setTranslating] = useState(false);
  const { i18n } = useTranslation();

  const isLiked = farmer && post.likes?.includes(farmer._id);
  const catInfo = CATEGORIES.find(c => c.key === post.category) || CATEGORIES[0];

  const toggleLike = async () => {
    if (!farmer) return;
    try {
      const res = await axios.put(`${API}/community/${post._id}/like`, { farmerId: farmer._id });
      setPost(p => ({ ...p, likes: res.data.liked ? [...(p.likes||[]), farmer._id] : (p.likes||[]).filter(id => id !== farmer._id), likeCount: res.data.likeCount }));
    } catch {}
  };

  const translate = async () => {
    if (translated) { setTranslated(null); return; }
    setTranslating(true);
    try {
      const res = await axios.post(`${API}/community/${post._id}/translate`, { toLang: i18n.language });
      setTranslated(res.data.text);
    } catch {}
    setTranslating(false);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: `FarmPulse: ${post.authorName}'s post`, text: post.caption, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  return (
    <div style={{ background:'#fff', borderRadius:'16px', border:`1px solid ${C.border}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(27,94,32,0.06)', marginBottom:'16px' }}>
      {/* Author row */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', gap:'10px' }}>
        <Avatar name={post.authorName} size={40}/>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:0, fontWeight:700, fontSize:'14px', color:C.text }}>{post.authorName}</p>
          <p style={{ margin:0, fontSize:'12px', color:C.muted }}>
            {post.authorState && `📍 ${post.authorState} · `}{timeAgo(post.createdAt)}
          </p>
        </div>
        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
          <span style={{ background:C.pale, color:C.mid, padding:'3px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:600 }}>{catInfo.icon} {catInfo.label}</span>
          <span style={{ background:'#E3F2FD', color:'#1565C0', padding:'3px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:600 }}>{LANG_LABELS[post.language]}</span>
        </div>
      </div>

      {/* Images */}
      {post.images?.length > 0 && (
        <div style={{ position:'relative', background:'#000' }}>
          <img
            src={post.images[imgIdx]}
            alt=""
            style={{ width:'100%', maxHeight:'320px', objectFit:'cover', display:'block' }}
          />
          {post.images.length > 1 && (
            <>
              <div style={{ position:'absolute', bottom:'10px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'5px' }}>
                {post.images.map((_, i) => (
                  <div key={i} onClick={() => setImgIdx(i)} style={{ width:i === imgIdx ? 18 : 6, height:6, borderRadius:'3px', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', cursor:'pointer', transition:'width 0.2s' }}/>
                ))}
              </div>
              {imgIdx > 0 && (
                <button onClick={() => setImgIdx(i => i-1)} style={{ position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.45)', border:'none', color:'#fff', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
              )}
              {imgIdx < post.images.length - 1 && (
                <button onClick={() => setImgIdx(i => i+1)} style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.45)', border:'none', color:'#fff', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
              )}
            </>
          )}
        </div>
      )}

      {/* Caption */}
      <div style={{ padding:'12px 16px 8px' }}>
        <p style={{ margin:'0 0 6px', fontSize:'14px', color:C.text, lineHeight:1.6 }}>
          {translated || post.caption}
        </p>
        {post.language !== i18n.language && (
          <button onClick={translate} disabled={translating} style={{ background:'none', border:'none', color:C.mid, cursor:'pointer', fontSize:'12px', fontFamily:'inherit', padding:0, fontWeight:600 }}>
            {translating ? '⏳ Translating…' : translated ? '✕ Show original' : `🌐 Translate to ${LANG_NAMES[i18n.language] || 'your language'}`}
          </button>
        )}
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ padding:'0 16px 10px', display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {post.tags.map(tag => (
            <span key={tag} style={{ background:C.light, color:C.mid, padding:'2px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:500 }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding:'10px 16px 14px', borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:'4px' }}>
        <button onClick={toggleLike} style={{ display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:'8px', color: isLiked ? C.red : C.sub, fontFamily:'inherit', fontSize:'13px', fontWeight:600, transition:'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = C.pale}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          {isLiked ? '❤️' : '🤍'} {post.likeCount || 0}
        </button>
        <button onClick={() => onOpenComments(post)} style={{ display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:'8px', color:C.sub, fontFamily:'inherit', fontSize:'13px', fontWeight:600, transition:'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = C.pale}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          💬 {post.commentCount || 0}
        </button>
        <button onClick={share} style={{ display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:'8px', color:C.sub, fontFamily:'inherit', fontSize:'13px', fontWeight:600, transition:'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = C.pale}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          📤 Share
        </button>
        <div style={{ flex:1 }}/>
        <span style={{ fontSize:'11px', color:C.muted }}>👁 {post.viewCount || 0}</span>
      </div>
    </div>
  );
}

// ─── Main Community Page ──────────────────────────────────────────────────────
export default function Community({ farmer }) {
  const [posts,        setPosts]        = useState([]);
  const [trending,     setTrending]     = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('feed');   // 'feed' | 'trending'
  const [category,     setCategory]     = useState('all');
  const [showCreate,   setShowCreate]   = useState(false);
  const [commentPost,  setCommentPost]  = useState(null);
  const loaderRef = useRef();

  const load = useCallback(async (reset = false) => {
    if (reset) { setLoading(true); setPage(1); setPosts([]); }
    else setLoadingMore(true);
    try {
      const p = reset ? 1 : page;
      const cat = category === 'all' ? '' : category;
      const res = await axios.get(`${API}/community`, { params: { page: p, category: cat, sort: activeTab === 'trending' ? 'trending' : 'recent' } });
      const newPosts = res.data.posts || [];
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      setHasMore(p < res.data.pages);
      if (!reset) setPage(p + 1);
    } catch {}
    setLoading(false); setLoadingMore(false);
  }, [category, activeTab, page]);

  useEffect(() => { load(true); }, [category, activeTab]);

  useEffect(() => {
    axios.get(`${API}/community/trending`).then(r => setTrending(r.data.posts || [])).catch(() => {});
    axios.get(`${API}/community/tags`).then(r => setTrendingTags(r.data.tags || [])).catch(() => {});
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        setPage(p => p + 1);
        load(false);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, load]);

  const handleCommentUpdate = (postId, newCount) => {
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentCount: newCount } : p));
  };

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto', padding:'28px 16px 80px', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <div>
          <h2 style={{ margin:'0 0 4px', fontSize:'22px', fontWeight:800, color:C.green }}>🌿 Farmer Community</h2>
          <p style={{ margin:0, fontSize:'13px', color:C.muted }}>Learn from fellow farmers across India</p>
        </div>
        {farmer && (
          <button onClick={() => setShowCreate(true)} style={{ padding:'10px 20px', background:`linear-gradient(135deg, ${C.green}, ${C.mid})`, color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(27,94,32,0.3)' }}>
            + Share
          </button>
        )}
      </div>

      {/* Trending tags */}
      {trendingTags.length > 0 && (
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', marginBottom:'16px', paddingBottom:'4px', scrollbarWidth:'none' }}>
          <button onClick={() => setCategory('all')} style={{ padding:'5px 14px', border:`1.5px solid ${category==='all'?C.mid:C.border}`, borderRadius:'20px', background:category==='all'?C.light:'#fff', color:category==='all'?C.mid:C.sub, fontSize:'12px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>
            🌾 All
          </button>
          {trendingTags.slice(0,8).map(({ tag, count }) => (
            <button key={tag} onClick={() => setCategory(tag)} style={{ padding:'5px 14px', border:`1.5px solid ${category===tag?C.mid:C.border}`, borderRadius:'20px', background:category===tag?C.light:'#fff', color:category===tag?C.mid:C.sub, fontSize:'12px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>
              #{tag} <span style={{ color:C.muted, fontWeight:400 }}>({count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', background:'#F5F5F5', padding:'5px', borderRadius:'12px', marginBottom:'20px', width:'fit-content' }}>
        {[
          { key:'feed',     label:'📰 Latest' },
          { key:'trending', label:'🔥 Trending' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding:'8px 20px', border:'none', borderRadius:'8px', cursor:'pointer',
            fontSize:'13px', fontWeight: activeTab===tab.key ? 700 : 500,
            background: activeTab===tab.key ? '#fff' : 'transparent',
            color: activeTab===tab.key ? C.green : C.muted,
            boxShadow: activeTab===tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            fontFamily:'inherit', transition:'all 0.15s'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display:'flex', gap:'6px', overflowX:'auto', marginBottom:'20px', paddingBottom:'4px', scrollbarWidth:'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
            padding:'6px 14px', border:`1.5px solid ${category===cat.key?C.mid:C.border}`, borderRadius:'20px',
            background: category===cat.key ? C.light : '#fff',
            color: category===cat.key ? C.mid : C.sub,
            fontSize:'12px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', transition:'all 0.15s'
          }}>{cat.icon} {cat.label}</button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:C.muted }}>
          <p style={{ fontSize:'28px', margin:'0 0 8px' }}>🌱</p>
          <p style={{ fontSize:'14px' }}>Loading posts…</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', background:C.pale, borderRadius:'16px', border:`1px dashed ${C.border}` }}>
          <p style={{ fontSize:'36px', margin:'0 0 12px' }}>🌾</p>
          <p style={{ margin:'0 0 6px', fontSize:'16px', fontWeight:700, color:C.text }}>No posts yet</p>
          <p style={{ margin:'0 0 20px', fontSize:'14px', color:C.muted }}>Be the first to share your farming experience!</p>
          {farmer && <button onClick={() => setShowCreate(true)} style={{ padding:'10px 24px', background:C.mid, color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Share your story</button>}
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post._id} post={post} farmer={farmer}
              onOpenComments={(p) => setCommentPost(p)}
            />
          ))}
          <div ref={loaderRef} style={{ height:'20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {loadingMore && <p style={{ color:C.muted, fontSize:'13px' }}>Loading more…</p>}
          </div>
        </>
      )}

      {/* Modals */}
      {showCreate && farmer && (
        <CreatePostModal farmer={farmer} onClose={() => setShowCreate(false)} onCreated={() => load(true)} />
      )}

      {commentPost && farmer && (
        <CommentSheet
          post={commentPost}
          farmer={farmer}
          onClose={() => setCommentPost(null)}
          onUpdate={(count) => handleCommentUpdate(commentPost._id, count)}
        />
      )}
    </div>
  );
}