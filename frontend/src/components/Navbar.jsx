import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/2.png';

const links = [
  { path: '/',        label: 'Dashboard' },
  { path: '/crop',    label: 'Crop Advisor' },
  { path: '/disease', label: 'Disease Detection' },
  { path: '/loan',    label: 'Loan Gateway' },
  { path: '/sell',    label: 'Smart Sell' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

export default function Navbar({ farmer, onLogout }) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageDropdown(false);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#1B5E20', padding: '0 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '64px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <img 
          src={logo} 
          alt="FarmPulse Logo" 
          style={{ 
            height: '28px', 
            width: 'auto', 
            objectFit: 'contain'
          }} 
        />
        <span style={{
          color: 'white',
          fontWeight: '800',
          fontSize: '18px',
          letterSpacing: '-0.3px'
        }}>FarmPulse</span>
      </div>

      <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', flex: 1 }}>
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              color: location.pathname === link.path ? '#A5D6A7' : 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              padding: '7px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
              fontWeight: location.pathname === link.path ? '700' : '400',
              background: location.pathname === link.path ? 'rgba(255,255,255,0.12)' : 'transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Language Selector */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.8)',
              padding: '5px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {languages.find(lang => lang.code === i18n.language)?.flag}
            <span>{languages.find(lang => lang.code === i18n.language)?.name}</span>
            <span style={{ fontSize: '10px' }}>▼</span>
          </button>

          {showLanguageDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '120px',
              marginTop: '4px'
            }}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: i18n.language === lang.code ? '#f0f8f0' : 'transparent',
                    color: '#333',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: lang.code === languages[languages.length - 1].code ? '0 0 6px 6px' : '0'
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Farmer authentication */}
        {farmer && (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#A5D6A7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#1B5E20'
              }}>
                {farmer.name?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                maxWidth: '110px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {farmer.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.8)',
                padding: '5px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: '500'
              }}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}