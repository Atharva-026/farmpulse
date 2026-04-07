import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/',        label: 'Dashboard' },
  { path: '/crop',    label: 'Crop Advisor' },
  { path: '/disease', label: 'Disease Detection' },
  { path: '/loan',    label: 'Loan Gateway' },
  { path: '/sell',    label: 'Smart Sell' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#1B5E20', padding: '0 24px',
      display: 'flex', alignItems: 'center',
      height: '64px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <span style={{
        color: 'white', fontWeight: '700',
        fontSize: '20px', marginRight: '32px',
        fontFamily: 'sans-serif', letterSpacing: '0.5px'
      }}>
        FarmPulse
      </span>

      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              color: location.pathname === link.path ? '#A5D6A7' : 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'sans-serif',
              fontWeight: location.pathname === link.path ? '600' : '400',
              background: location.pathname === link.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}