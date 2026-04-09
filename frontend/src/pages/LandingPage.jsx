import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/2.png';

const API = 'http://localhost:5000/api';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
];

/* ─── shared styles ────────────────────────────────────────────────────────── */
const inp = (focus) => ({
  display: 'block', width: '100%', padding: '11px 14px',
  marginTop: '5px', marginBottom: '14px', borderRadius: '10px',
  border: `1.5px solid ${focus ? '#2E7D32' : '#D7E8D7'}`,
  fontSize: '14px', boxSizing: 'border-box',
  background: '#fff', color: '#1a1a1a', fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 0.2s',
});

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontWeight: '600', fontSize: '13px', color: '#444' }}>{label}</label>
      {children}
    </div>
  );
}

function FocusInput({ label, style, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <Field label={label}>
      <input
        style={{ ...inp(focus), ...style }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...props}
      />
    </Field>
  );
}

function FocusSelect({ label, children, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <Field label={label}>
      <select
        style={inp(focus)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

/* ─── Farmer Auth Form ─────────────────────────────────────────────────────── */
function FarmerAuth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '', phone: '', state: '', district: '', pincode: '',
    landSize: '', soilType: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const hc = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await axios.post(`${API}/farmer/login`, { phone: form.phone });
        if (res.data.success) onLogin(res.data.farmer);
        else setErr(res.data.message);
      } else {
        if (!form.name || !form.phone)
          return setErr('Name and phone are required.');
        const res = await axios.post(`${API}/farmer/register`, {
          name: form.name, phone: form.phone,
          location: { state: form.state, district: form.district, pincode: form.pincode },
          landSize: form.landSize ? Number(form.landSize) : undefined,
          soilType: form.soilType || undefined,
        });
        if (res.data.success) onLogin(res.data.farmer);
        else setErr(res.data.message);
      }
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: 'flex', background: '#E8F5E9', borderRadius: '10px', padding: '4px', marginBottom: '22px' }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => { setMode(m); setErr(''); }} style={{
            flex: 1, border: 'none', cursor: 'pointer', padding: '9px',
            borderRadius: '8px', fontSize: '13px', fontWeight: mode === m ? '700' : '500',
            background: mode === m ? '#2E7D32' : 'transparent',
            color: mode === m ? '#fff' : '#555', transition: 'all 0.15s', fontFamily: 'inherit'
          }}>{m === 'login' ? 'Log In' : 'Register'}</button>
        ))}
      </div>

      {err && (
        <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
          {err}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <FocusInput label="Full Name *" value={form.name} onChange={hc('name')} placeholder="Your full name" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              <FocusSelect label="State" value={form.state} onChange={hc('state')}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </FocusSelect>
              <FocusInput label="District" value={form.district} onChange={hc('district')} placeholder="e.g. Bengaluru" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              <FocusInput label="Land Size (acres)" type="number" value={form.landSize} onChange={hc('landSize')} placeholder="e.g. 5" />
              <FocusSelect label="Soil Type" value={form.soilType} onChange={hc('soilType')}>
                <option value="">Select soil type</option>
                {['sandy','clay','loamy','silt','peaty'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                ))}
              </FocusSelect>
            </div>
          </>
        )}

        <FocusInput
          label="Phone Number *"
          value={form.phone}
          onChange={hc('phone')}
          placeholder="10-digit mobile number"
          required
        />

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', border: 'none', borderRadius: '10px',
          background: '#2E7D32', color: '#fff', fontSize: '15px', fontWeight: '700',
          cursor: 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
          marginTop: '2px', transition: 'opacity 0.15s'
        }}>
          {loading ? 'Please wait…' : mode === 'login' ? '→ Enter Farm Dashboard' : '→ Create Farmer Account'}
        </button>
      </form>
    </div>
  );
}

/* ─── Vendor Auth Form ─────────────────────────────────────────────────────── */
function VendorAuth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    phone: '', name: '', businessName: '', email: '',
    state: '', city: '', preferredCrops: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const hc = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await axios.post(`${API}/vendor/login`, { phone: form.phone });
        if (res.data.success) onLogin(res.data.vendor);
        else setErr(res.data.message);
      } else {
        const crops = form.preferredCrops.split(',').map(s => s.trim()).filter(Boolean);
        const res = await axios.post(`${API}/vendor/register`, {
          name: form.name, businessName: form.businessName,
          phone: form.phone, email: form.email,
          location: { state: form.state, city: form.city },
          preferredCrops: crops
        });
        if (res.data.success) onLogin(res.data.vendor);
        else setErr(res.data.message);
      }
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  const vendorInp = (focus) => ({ ...inp(focus), border: `1.5px solid ${focus ? '#4527A0' : '#D1C4E9'}` });

  function VInp({ label, style, ...props }) {
    const [focus, setFocus] = useState(false);
    return (
      <Field label={label}>
        <input style={{ ...vendorInp(focus), ...style }} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...props} />
      </Field>
    );
  }
  function VSel({ label, children, ...props }) {
    const [focus, setFocus] = useState(false);
    return (
      <Field label={label}>
        <select style={vendorInp(focus)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...props}>{children}</select>
      </Field>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', background: '#EDE7F6', borderRadius: '10px', padding: '4px', marginBottom: '22px' }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => { setMode(m); setErr(''); }} style={{
            flex: 1, border: 'none', cursor: 'pointer', padding: '9px',
            borderRadius: '8px', fontSize: '13px', fontWeight: mode === m ? '700' : '500',
            background: mode === m ? '#4527A0' : 'transparent',
            color: mode === m ? '#fff' : '#555', transition: 'all 0.15s', fontFamily: 'inherit'
          }}>{m === 'login' ? 'Log In' : 'Register'}</button>
        ))}
      </div>

      {err && (
        <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
          {err}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <VInp label="Your Name *" value={form.name} onChange={hc('name')} placeholder="Full name" required />
            <VInp label="Business Name *" value={form.businessName} onChange={hc('businessName')} placeholder="Company / shop name" required />
            <VInp label="Email" type="email" value={form.email} onChange={hc('email')} placeholder="Optional" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              <VSel label="State" value={form.state} onChange={hc('state')}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </VSel>
              <VInp label="City" value={form.city} onChange={hc('city')} placeholder="e.g. Bengaluru" />
            </div>
            <VInp label="Preferred Crops (comma-separated)" value={form.preferredCrops} onChange={hc('preferredCrops')} placeholder="tomato, onion, potato" />
          </>
        )}
        <VInp label="Phone Number *" value={form.phone} onChange={hc('phone')} placeholder="10-digit mobile number" required />
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', border: 'none', borderRadius: '10px',
          background: '#4527A0', color: '#fff', fontSize: '15px', fontWeight: '700',
          cursor: 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
          marginTop: '2px', transition: 'opacity 0.15s'
        }}>
          {loading ? 'Please wait…' : mode === 'login' ? '→ Enter Vendor Dashboard' : '→ Create Vendor Account'}
        </button>
      </form>
    </div>
  );
}

/* ─── Main Landing Page ────────────────────────────────────────────────────── */
export default function LandingPage({ onFarmerLogin, onVendorLogin }) {
  const [portal, setPortal] = useState(null); // null | 'farmer' | 'vendor'

  const features = [
    { icon: '🌱', label: 'AI Crop Advisor', desc: 'Get personalized crop suggestions based on your soil and climate' },
    { icon: '🔬', label: 'Disease Detection', desc: 'Upload a photo — get instant diagnosis and treatment' },
    { icon: '🏪', label: 'Live Mandi Prices', desc: 'Compare real-time prices across markets before you sell' },
    { icon: '🤝', label: 'Vendor Connect', desc: 'Get direct bids from verified buyers — no middleman' },
    { icon: '🏦', label: 'Loan Gateway', desc: 'Match to government schemes with pre-filled applications' },
    { icon: '📢', label: 'Buy Offers', desc: 'See what vendors are willing to pay for your crop right now' },
  ];

  return (
    <div style={{
      minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: '#FAFFF8', color: '#1a1a1a',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        * { box-sizing: border-box; }
      `}</style>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
        padding: '0 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto', padding: '20px 0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={logo} 
              alt="FarmPulse Logo" 
              style={{ 
                height: '40px', 
                width: 'auto', 
                objectFit: 'contain'
              }} 
            />
            <span style={{ color: '#fff', fontWeight: '800', fontSize: '26px', letterSpacing: '-0.3px' }}>FarmPulse</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setPortal('farmer')} style={{
              padding: '8px 18px', borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.5)',
              background: 'transparent', color: '#fff', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit'
            }}>👨‍🌾 Farmer Login</button>
            <button onClick={() => setPortal('vendor')} style={{
              padding: '8px 18px', borderRadius: '20px', border: 'none',
              background: '#fff', color: '#4527A0', fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit'
            }}>🏢 Vendor Login</button>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeUp 0.6s ease' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '5px 16px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: '20px', letterSpacing: '0.5px' }}>
            INDIA'S AGRICULTURAL INTELLIGENCE PLATFORM
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: '48px', fontWeight: '800', color: '#fff', lineHeight: 1.15, letterSpacing: '-1px' }}>
            From Soil to Sale,<br />
            <span style={{ color: '#A5D6A7' }}>Every Decision Smarter</span>
          </h1>
          <p style={{ margin: '0 0 40px', fontSize: '17px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
            AI-powered crop advice, live market prices, disease detection,<br />
            and direct vendor connections — built for Indian farmers.
          </p>

          {/* Portal choice buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setPortal('farmer')} style={{
              padding: '16px 36px', borderRadius: '12px', border: 'none',
              background: '#fff', color: '#1B5E20', fontSize: '16px', fontWeight: '800',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '22px' }}>👨‍🌾</span>
              <div style={{ textAlign: 'left' }}>
                <div>I'm a Farmer</div>
                <div style={{ fontSize: '12px', fontWeight: '400', color: '#555' }}>Sell crops, get AI advice</div>
              </div>
            </button>
            <button onClick={() => setPortal('vendor')} style={{
              padding: '16px 36px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '16px', fontWeight: '800',
              cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(8px)',
              transition: 'transform 0.15s', display: 'flex', alignItems: 'center', gap: '10px'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '22px' }}>🏢</span>
              <div style={{ textAlign: 'left' }}>
                <div>I'm a Vendor</div>
                <div style={{ fontSize: '12px', fontWeight: '400', color: 'rgba(255,255,255,0.7)' }}>Buy directly from farms</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '30px', fontWeight: '800', color: '#1B5E20' }}>
            Everything a farmer needs
          </h2>
          <p style={{ margin: 0, fontSize: '15px', color: '#666' }}>
            Six powerful tools, one platform — free for Indian farmers
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {features.map((f, i) => (
            <div key={i} className="card-hover" style={{
              background: '#fff', border: '1px solid #E8F5E9', borderRadius: '14px',
              padding: '24px', animation: `fadeUp 0.5s ease ${i * 0.07}s both`
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
              <p style={{ margin: '0 0 6px', fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>{f.label}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ background: '#1B5E20', padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
          {[
            { value: '99%', label: 'Crop model accuracy' },
            { value: '97%', label: 'Disease detection rate' },
            { value: 'Live', label: 'Agmarknet data' },
            { value: 'Free', label: 'Forever for farmers' },
          ].map((s, i) => (
            <div key={i}>
              <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800', color: '#A5D6A7' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '28px', fontSize: '13px', color: '#999' }}>
        FarmPulse · Built for Indian farmers · Powered by Agmarknet, PlantVillage & PM-KISAN
      </div>

      {/* Auth Modal */}
      {portal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px', animation: 'fadeIn 0.2s ease'
        }}
          onClick={e => { if (e.target === e.currentTarget) setPortal(null); }}
        >
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            animation: 'fadeUp 0.25s ease'
          }}>
            {/* Modal header */}
            <div style={{
              padding: '24px 28px 0',
              borderBottom: `3px solid ${portal === 'farmer' ? '#2E7D32' : '#4527A0'}`,
              marginBottom: '24px', paddingBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>
                    {portal === 'farmer' ? '👨‍🌾' : '🏢'}
                  </div>
                  <h2 style={{
                    margin: '0 0 4px', fontSize: '20px', fontWeight: '800',
                    color: portal === 'farmer' ? '#1B5E20' : '#4527A0'
                  }}>
                    {portal === 'farmer' ? 'Farmer Portal' : 'Vendor Portal'}
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                    {portal === 'farmer'
                      ? 'Access your farm dashboard, crop tools and market'
                      : 'Browse crop listings and manage your buy offers'}
                  </p>
                </div>
                <button onClick={() => setPortal(null)} style={{
                  background: '#F5F5F5', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✕</button>
              </div>
            </div>

            <div style={{ padding: '0 28px 28px' }}>
              {portal === 'farmer'
                ? <FarmerAuth onLogin={farmer => { onFarmerLogin(farmer); setPortal(null); }} />
                : <VendorAuth  onLogin={vendor => { onVendorLogin(vendor);  setPortal(null); }} />
              }

              {/* Switch portal hint */}
              <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '12px', color: '#aaa' }}>
                {portal === 'farmer' ? (
                  <>Are you a buyer?{' '}
                    <button onClick={() => setPortal('vendor')} style={{ background: 'none', border: 'none', color: '#4527A0', cursor: 'pointer', fontWeight: '700', fontSize: '12px', padding: 0 }}>
                      Switch to Vendor portal →
                    </button>
                  </>
                ) : (
                  <>Are you a farmer?{' '}
                    <button onClick={() => setPortal('farmer')} style={{ background: 'none', border: 'none', color: '#2E7D32', cursor: 'pointer', fontWeight: '700', fontSize: '12px', padding: 0 }}>
                      Switch to Farmer portal →
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}