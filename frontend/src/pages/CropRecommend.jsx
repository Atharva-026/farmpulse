import { useState } from 'react';
import axios from 'axios';

const SOIL_LABELS = {
  sandy: 'Sandy',
  clay: 'Clay',
  loamy: 'Loamy',
  silt: 'Silt',
  peaty: 'Peaty'
};

const WATER_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const SOIL_COLORS = {
  sandy: { bg: '#FFF8E1', border: '#F9A825', text: '#F57F17', icon: '🏖️' },
  clay:  { bg: '#FCE4EC', border: '#C62828', text: '#B71C1C', icon: '🧱' },
  loamy: { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20', icon: '🌱' },
  silt:  { bg: '#E3F2FD', border: '#1565C0', text: '#0D47A1', icon: '💧' },
  peaty: { bg: '#F3E5F5', border: '#6A1B9A', text: '#4A148C', icon: '🌿' }
};

const WATER_COLORS = {
  high:   { bg: '#E3F2FD', border: '#1565C0', text: '#0D47A1', icon: '💦' },
  medium: { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20', icon: '🌤️' },
  low:    { bg: '#FFF3E0', border: '#E65100', text: '#BF360C', icon: '🌵' }
};

export default function CropRecommend() {
  function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return 'kharif';  // June-Oct
  if (month >= 11 || month <= 4) return 'rabi';    // Nov-Apr
  return 'zaid';                                    // Apr-Jun
}

const [form, setForm] = useState({
  soilType: 'loamy',
  season: getCurrentSeason(),  // ✅ auto-detected
    waterAvailability: 'medium',
    budget: 10000,
    location: ''
  });

  const [locationData, setLocationData] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('detecting');
    setLocationError('');
    setLocationData(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GPS coordinates:', latitude, longitude);
        
        // Call Nominatim from browser (allowed, blocked server-side)
        let locationName = 'Your Location';
        let stateName = '';
        try {
          const geoRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: { lat: latitude, lon: longitude, format: 'json', zoom: 10 }
          });
          const addr = geoRes.data.address;
          locationName = addr.city || addr.town || addr.village || addr.county || 'Your Location';
          stateName = addr.state || '';
        } catch (e) {
          console.log('Geocode failed, continuing without location name');
        }

        // Now call your backend for soil + weather
        try {
          const res = await axios.post('http://localhost:5000/api/location/auto-fill', {
            lat: latitude, lon: longitude
          });

          if (res.data.success) {
            const d = res.data;
            d.locationName = locationName;  // override with browser-fetched name
            d.state = stateName;
            setLocationData(d);
            setForm(prev => ({
              ...prev,
              soilType: d.soilType,
              waterAvailability: d.waterAvailability,
              location: locationName
            }));
            setLocationStatus('success');
          } else {
            throw new Error('Auto-fill failed');
          }
        } catch (err) {
          setLocationStatus('error');
          setLocationError('Could not fetch soil and weather data. You can still fill manually.');
        }
      },
      (err) => {
        setLocationStatus('error');
        if (err.code === 1) {
          setLocationError('Location access denied. Please allow location access and try again, or fill in manually.');
        } else {
          setLocationError('Could not get your location. Please fill in manually.');
        }
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleManualOverride = async () => {
    if (!manualCity.trim()) return;
    setLocationStatus('detecting');
    try {
      // Open-Meteo geocoding: free, no key, works great for Indian cities
      const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: manualCity, count: 1, language: 'en', format: 'json' }
      });
      const place = geoRes.data.results?.[0];
      if (!place) {
        setLocationStatus('error');
        setLocationError(`City "${manualCity}" not found. Try a different spelling.`);
        return;
      }
      const { latitude, longitude, name, admin1 } = place;
      
      // Re-run auto-fill with corrected coordinates
      const res = await axios.post('http://localhost:5000/api/location/auto-fill', {
        lat: latitude, lon: longitude
      });
      if (res.data.success) {
        const d = { ...res.data, locationName: name, state: admin1 || '' };
        setLocationData(d);
        setForm(prev => ({
          ...prev,
          soilType: d.soilType,
          waterAvailability: d.waterAvailability,
          location: name
        }));
        if (d.state) localStorage.setItem('farmerState', d.state);
        setManualCity('');
        setLocationStatus('success');
      }
    } catch (err) {
      setLocationStatus('error');
      setLocationError('Could not correct location. Try again.');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = { ...form, farmerId: '6650f1c2e1b2c3d4e5f67890' };
      if (locationData) {
        payload.lat = locationData.lat;
        payload.lon = locationData.lon;
        payload.temperature = locationData.temperature;
        payload.humidity = locationData.humidity;
        payload.rainfall = locationData.rainfall;
      }
      const res = await axios.post('http://localhost:5000/api/crop/recommend', payload);
      setResult(res.data);
    } catch (err) {
      setError('Something went wrong. Check your API keys and Flask service.');
    }
    setLoading(false);
  };

  const soilColors = SOIL_COLORS[form.soilType] || SOIL_COLORS.loamy;
  const waterColors = WATER_COLORS[form.waterAvailability] || WATER_COLORS.medium;

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', fontFamily: "'Segoe UI', sans-serif", padding: '0 16px' }}>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '24px', color: '#1B5E20', fontWeight: '700' }}>
          🌾 Crop Recommendation
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Use your GPS to auto-detect soil, water &amp; weather — or fill in manually.
        </p>
      </div>

      {/* Location Auto-Fill Card */}
      <div style={{
        border: '2px solid',
        borderColor: locationStatus === 'success' ? '#4CAF50' : locationStatus === 'error' ? '#FF7043' : '#C8E6C9',
        borderRadius: '14px', padding: '20px', marginBottom: '24px',
        background: locationStatus === 'success' ? '#F1F8E9' : locationStatus === 'error' ? '#FFF3E0' : '#FAFFFE',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontWeight: '600', fontSize: '15px', color: '#222' }}>
              📍 Auto-detect my location
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              Detects soil type, water availability, temperature &amp; humidity
            </p>
          </div>
          <button
            onClick={handleDetectLocation}
            disabled={locationStatus === 'detecting'}
            style={{
              padding: '10px 20px',
              background: locationStatus === 'detecting' ? '#A5D6A7' : '#2E7D32',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600',
              cursor: locationStatus === 'detecting' ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {locationStatus === 'detecting' ? '⏳ Detecting...' : locationStatus === 'success' ? '✅ Re-detect' : '📡 Detect Location'}
          </button>
        </div>

        {locationStatus === 'detecting' && (
          <div style={{ marginTop: '14px', padding: '12px', background: '#E8F5E9', borderRadius: '8px', fontSize: '13px', color: '#2E7D32' }}>
            🛰️ Getting GPS → fetching soil data from SoilGrids → fetching weather from Open-Meteo...
          </div>
        )}

        {locationStatus === 'success' && locationData && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: '📍 Location', value: `${locationData.locationName}${locationData.state ? ', ' + locationData.state : ''}` },
                { label: '🌡️ Temperature', value: `${locationData.temperature}°C` },
                { label: '💧 Humidity', value: `${locationData.humidity}%` },
                { label: '🌧️ Rainfall (7d)', value: `${locationData.rainfall} mm` },
                { label: '🌱 Soil Type', value: SOIL_LABELS[locationData.soilType] || locationData.soilType, highlight: true },
                { label: '💦 Water Avail.', value: WATER_LABELS[locationData.waterAvailability] || locationData.waterAvailability, highlight: true },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '8px 12px',
                  background: item.highlight ? '#E8F5E9' : '#F5F5F5',
                  borderRadius: '8px',
                  border: item.highlight ? '1px solid #A5D6A7' : '1px solid #E0E0E0'
                }}>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#888' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: item.highlight ? '#2E7D32' : '#333' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#558B2F' }}>
              ✅ All fields below have been auto-filled. You can still change them if needed.
            </p>
            {locationStatus === 'success' && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <input
                  placeholder="Wrong location? Type your city..."
                  value={manualCity}
                  onChange={e => setManualCity(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                />
                <button onClick={handleManualOverride} style={{ padding: '8px 14px', background: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  Correct
                </button>
              </div>
            )}
          </div>
        )}

        {locationStatus === 'error' && (
          <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#BF360C' }}>⚠️ {locationError}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>

        <label style={labelStyle}>Soil Type</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {Object.entries(SOIL_LABELS).map(([val, label]) => {
            const colors = SOIL_COLORS[val];
            const active = form.soilType === val;
            return (
              <button key={val} type="button" onClick={() => setForm({ ...form, soilType: val })} style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '13px',
                border: `2px solid ${active ? colors.border : '#e0e0e0'}`,
                background: active ? colors.bg : 'white',
                color: active ? colors.text : '#666',
                cursor: 'pointer', fontWeight: active ? '600' : '400'
              }}>
                {colors.icon} {label}
              </button>
            );
          })}
        </div>

        <label style={labelStyle}>Season</label>
        <select name="season" value={form.season} onChange={handleChange} style={inputStyle}>
          <option value="kharif">🌧️ Kharif (June–Oct)</option>
          <option value="rabi">❄️ Rabi (Nov–Apr)</option>
          <option value="zaid">☀️ Zaid (Apr–Jun)</option>
        </select>

        <label style={labelStyle}>Water Availability</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {Object.entries(WATER_LABELS).map(([val, label]) => {
            const colors = WATER_COLORS[val];
            const active = form.waterAvailability === val;
            return (
              <button key={val} type="button" onClick={() => setForm({ ...form, waterAvailability: val })} style={{
                flex: 1, padding: '9px', borderRadius: '10px', fontSize: '13px',
                border: `2px solid ${active ? colors.border : '#e0e0e0'}`,
                background: active ? colors.bg : 'white',
                color: active ? colors.text : '#666',
                cursor: 'pointer', fontWeight: active ? '600' : '400'
              }}>
                {colors.icon} {label}
              </button>
            );
          })}
        </div>

        <label style={labelStyle}>Budget (₹)</label>
        <input type="number" name="budget" value={form.budget} onChange={handleChange} style={inputStyle} placeholder="e.g. 10000" />

        <label style={labelStyle}>Location (City or Village)</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text" name="location" value={form.location} onChange={handleChange}
            style={{ ...inputStyle, paddingRight: '36px' }}
            placeholder="e.g. Pune  (auto-filled by GPS above)"
          />
          {locationStatus === 'success' && (
            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-60%)', fontSize: '16px' }}>📍</span>
          )}
        </div>

        {locationData && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px',
            background: '#E8F5E9', borderRadius: '8px',
            fontSize: '12px', color: '#2E7D32', border: '1px solid #C8E6C9'
          }}>
            ✅ Temperature ({locationData.temperature}°C), humidity ({locationData.humidity}%) and rainfall will be sent automatically — no OpenWeatherMap key needed.
          </div>
        )}

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? '🔄 Analysing...' : '🌿 Get Crop Recommendation'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: '8px', color: '#C62828', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {result && result.success && (
        <div style={{ marginTop: '28px', border: '2px solid #4CAF50', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', padding: '20px 24px', color: 'white' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Crop</p>
            <h1 style={{ margin: '0 0 6px', fontSize: '36px', fontWeight: '700', textTransform: 'capitalize' }}>{result.recommendedCrop}</h1>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '13px' }}>
              {result.confidence}% confidence
            </div>
          </div>
          <div style={{ padding: '20px 24px', background: '#F9FBE7' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: '🌾 Expected Yield', value: result.expectedYield },
                { label: '💰 Expected Profit', value: result.expectedProfit },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}>{s.value || '—'}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #C8E6C9', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: '🌡️ Temperature', value: `${result.temperature}°C` },
                { label: '💧 Humidity', value: `${result.humidity}%` },
                { label: '🌧️ Rainfall', value: `${result.rainfall}mm` },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#888' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#222' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' };
const inputStyle = { display: 'block', width: '100%', padding: '10px 12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(46,125,50,0.3)' };