import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/2.png';

const links = [
  { path: '/',          label: 'Dashboard'  },
  { path: '/crop',      label: 'Crop'       },
  { path: '/disease',   label: 'Disease'    },
  { path: '/loan',      label: 'Loans'      },
  { path: '/sell',      label: 'Sell'       },
  { path: '/community', label: '🌿 Community' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी',   flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी',   flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ',  flag: '🇮🇳' },
];

export default function Navbar({ farmer, onLogout }) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [showLang, setShowLang] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowLang(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:200,
      background:'#1B5E20', padding:'0 16px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      height:'64px', boxShadow:'0 2px 12px rgba(0,0,0,0.18)', gap:'8px'
    }}>
      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
        <img src={logo} alt="FarmPulse" style={{ height:'28px', width:'auto', objectFit:'contain', filter:'brightness(0) invert(1)' }}
          onError={e => e.target.style.display='none'} />
        <span style={{ color:'#fff', fontWeight:800, fontSize:'18px', letterSpacing:'-0.3px', fontFamily:"'Playfair Display',Georgia,serif" }}>FarmPulse</span>
      </div>

      {/* Nav links */}
      <div style={{ display:'flex', gap:'2px', overflowX:'auto', flex:1, scrollbarWidth:'none' }}>
        {links.map(link => (
          <Link key={link.path} to={link.path} style={{
            color: location.pathname === link.path ? '#A5D6A7' : 'rgba(255,255,255,0.78)',
            textDecoration:'none', padding:'7px 11px', borderRadius:'6px',
            fontSize:'13px', fontFamily:'inherit',
            fontWeight: location.pathname === link.path ? 700 : 400,
            background: location.pathname === link.path ? 'rgba(255,255,255,0.12)' : 'transparent',
            whiteSpace:'nowrap', transition:'all 0.15s',
            ...(link.path === '/community' ? { color: location.pathname === '/community' ? '#A5D6A7' : '#A5D6A7', opacity: location.pathname === '/community' ? 1 : 0.85 } : {})
          }}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
        {/* Language switcher */}
        <div style={{ position:'relative' }} ref={dropRef}>
          <button onClick={() => setShowLang(!showLang)} style={{
            background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.25)',
            borderRadius:'6px', color:'rgba(255,255,255,0.85)', padding:'5px 8px',
            fontSize:'12px', cursor:'pointer', fontFamily:'inherit', fontWeight:500,
            display:'flex', alignItems:'center', gap:'4px'
          }}>
            {currentLang.flag} <span>{currentLang.name}</span> <span style={{ fontSize:'10px' }}>▼</span>
          </button>

          {showLang && (
            <div style={{ position:'absolute', top:'calc(100% + 4px)', right:0, background:'#fff', border:'1px solid #ddd', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', zIndex:300, minWidth:'130px', overflow:'hidden' }}>
              {languages.map(lang => (
                <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setShowLang(false); }} style={{
                  width:'100%', padding:'9px 12px', border:'none',
                  background: i18n.language === lang.code ? '#F1F8E9' : 'transparent',
                  color: i18n.language === lang.code ? '#1B5E20' : '#333',
                  textAlign:'left', cursor:'pointer', fontSize:'13px', fontFamily:'inherit',
                  display:'flex', alignItems:'center', gap:'7px',
                  fontWeight: i18n.language === lang.code ? 700 : 400
                }}>
                  <span>{lang.flag}</span><span>{lang.name}</span>
                  {i18n.language === lang.code && <span style={{ marginLeft:'auto', color:'#2E7D32', fontSize:'12px' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Farmer info + logout */}
        {farmer && (
          <>
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:'20px', padding:'5px 12px', display:'flex', alignItems:'center', gap:'7px' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#A5D6A7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#1B5E20', flexShrink:0 }}>
                {farmer.name?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ color:'#fff', fontSize:'13px', fontWeight:600, maxWidth:'90px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {farmer.name}
              </span>
            </div>
            <button onClick={onLogout} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'6px', color:'rgba(255,255,255,0.8)', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}