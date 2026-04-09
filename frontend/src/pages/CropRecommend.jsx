import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSpeechInput, useSpeechOutput } from '../hooks/useVoice';
import VoiceButton from '../components/VoiceButton';
import useLangCode from '../hooks/useLangCode';

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

const SOIL_KEYS  = ['sandy', 'clay', 'loamy', 'silt', 'peaty'];
const WATER_KEYS = ['high', 'medium', 'low'];

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'kharif';
  if (month >= 4 && month <= 5)  return 'zaid';
  return 'rabi';
}

export default function CropRecommend() {
  const { t } = useTranslation();
  const langCode = useLangCode();
  const { listening, transcript, supported, startListening } = useSpeechInput(langCode);
  const { speaking, speak, stopSpeaking } = useSpeechOutput();

  const [form, setForm] = useState({
    soilType: 'loamy',
    season: getCurrentSeason(),
    waterAvailability: 'medium',
    budget: 10000,
    location: ''
  });
  const [locationData, setLocationData]     = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError]   = useState('');
  const [manualCity, setManualCity]         = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!transcript) return;
    const text = transcript.toLowerCase();

    if (text.includes('loamy') || text.includes('loam'))         setForm(f => ({ ...f, soilType: 'loamy' }));
    else if (text.includes('sandy') || text.includes('sand'))    setForm(f => ({ ...f, soilType: 'sandy' }));
    else if (text.includes('clay'))                               setForm(f => ({ ...f, soilType: 'clay' }));
    else if (text.includes('silt'))                               setForm(f => ({ ...f, soilType: 'silt' }));
    else if (text.includes('peaty') || text.includes('peat'))    setForm(f => ({ ...f, soilType: 'peaty' }));

    if (text.includes('kharif'))       setForm(f => ({ ...f, season: 'kharif' }));
    else if (text.includes('rabi'))    setForm(f => ({ ...f, season: 'rabi' }));
    else if (text.includes('zaid'))    setForm(f => ({ ...f, season: 'zaid' }));

    if (text.includes('high water') || text.includes('lots of water'))     setForm(f => ({ ...f, waterAvailability: 'high' }));
    else if (text.includes('low water') || text.includes('less water'))    setForm(f => ({ ...f, waterAvailability: 'low' }));
    else if (text.includes('medium water') || text.includes('some water')) setForm(f => ({ ...f, waterAvailability: 'medium' }));

    const cityMatch = text.match(/(?:in|from|at|location is|city is)\s+([a-z]+)/i);
    if (cityMatch) setForm(f => ({ ...f, location: cityMatch[1] }));

    const budgetMatch = text.match(/(\d+)/);
    if (budgetMatch && Number(budgetMatch[1]) > 500) setForm(f => ({ ...f, budget: Number(budgetMatch[1]) }));

  }, [transcript]);

  useEffect(() => {
    if (!result || !result.success) return;
    const message = `Recommended crop is ${result.recommendedCrop}. Expected profit is ${result.expectedProfit}. Best time to plant is this ${form.season} season.`;
    speak(message, langCode);
  }, [result]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return; }
    setLocationStatus('detecting'); setLocationError(''); setLocationData(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let locationName = 'Your Location', stateName = '';
        try {
          const geoRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: { lat: latitude, lon: longitude, format: 'json', zoom: 10 }
          });
          const addr = geoRes.data.address;
          locationName = addr.city || addr.town || addr.village || addr.county || 'Your Location';
          stateName    = addr.state || '';
        } catch (e) { console.log('Geocode failed'); }

        try {
          const res = await axios.post('http://localhost:5000/api/location/auto-fill', { lat: latitude, lon: longitude });
          if (res.data.success) {
            const d = { ...res.data, locationName, state: stateName };
            setLocationData(d);
            if (d.state) localStorage.setItem('farmerState', d.state);
            setForm(prev => ({ ...prev, soilType: d.soilType, waterAvailability: d.waterAvailability, location: locationName }));
            setLocationStatus('success');
          } else throw new Error('Auto-fill failed');
        } catch (err) {
          setLocationStatus('error');
          setLocationError('Could not auto-fill location. Please enter manually.');
        }
      },
      (err) => {
        setLocationStatus('error');
        setLocationError(err.code === 1 ? 'Location permission denied.' : 'Could not detect location.');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleManualOverride = async () => {
    if (!manualCity.trim()) return;
    setLocationStatus('detecting');
    try {
      const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: manualCity, count: 1, language: 'en', format: 'json' }
      });
      const place = geoRes.data.results?.[0];
      if (!place) { setLocationStatus('error'); setLocationError(`City "${manualCity}" not found.`); return; }
      const { latitude, longitude, name, admin1 } = place;
      const res = await axios.post('http://localhost:5000/api/location/auto-fill', { lat: latitude, lon: longitude });
      if (res.data.success) {
        const d = { ...res.data, locationName: name, state: admin1 || '' };
        setLocationData(d);
        if (d.state) localStorage.setItem('farmerState', d.state);
        setForm(prev => ({ ...prev, soilType: d.soilType, waterAvailability: d.waterAvailability, location: name }));
        setManualCity(''); setLocationStatus('success');
      }
    } catch (err) { setLocationStatus('error'); setLocationError('Could not find city.'); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setResult(null);
    try {
      const payload = { ...form, farmerId: '6650f1c2e1b2c3d4e5f67890' };
      if (locationData) {
        payload.lat         = locationData.lat;
        payload.lon         = locationData.lon;
        payload.temperature = locationData.temperature;
        payload.humidity    = locationData.humidity;
        payload.rainfall    = locationData.rainfall;
      }
      const res = await axios.post('http://localhost:5000/api/crop/recommend', payload);
      setResult(res.data);
    } catch (err) { setError('Something went wrong. Please try again.'); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', fontFamily: "'Segoe UI', sans-serif", padding: '0 16px' }}>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '24px', color: '#1B5E20', fontWeight: '700' }}>
          🌾 {t('crop.title')}
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{t('crop.subtitle')}</p>
      </div>

      {supported && (
        <div style={{
          background: listening ? '#FFEBEE' : '#E8F5E9',
          border: `2px solid ${listening ? '#C62828' : '#4CAF50'}`,
          borderRadius: '12px', padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <VoiceButton listening={listening} onClick={startListening} supported={supported} />
          <div>
            <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '14px', color: listening ? '#C62828' : '#1B5E20' }}>
              {listening ? '🎤 Listening...' : '🎤 Fill form by voice'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
              {listening
                ? 'Say: "loamy soil, kharif season, low water, Mumbai, budget 15000"'
                : 'Tap mic and speak your farm details in one sentence'
              }
            </p>
          </div>
          {transcript && (
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#555', fontStyle: 'italic', maxWidth: '160px', textAlign: 'right' }}>
              "{transcript}"
            </div>
          )}
        </div>
      )}

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
              📍 {t('crop.detectTitle')}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{t('crop.detectSubtitle')}</p>
          </div>
          <button onClick={handleDetectLocation} disabled={locationStatus === 'detecting'} style={{
            padding: '10px 20px', color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap',
            background: locationStatus === 'detecting' ? '#A5D6A7' : '#2E7D32',
            cursor: locationStatus === 'detecting' ? 'not-allowed' : 'pointer'
          }}>
            {locationStatus === 'detecting' ? `⏳ ${t('crop.detectingBtn')}` :
             locationStatus === 'success'   ? `✅ ${t('crop.redetectBtn')}` :
             `📡 ${t('crop.detectBtn')}`}
          </button>
        </div>

        {locationStatus === 'detecting' && (
          <div style={{ marginTop: '14px', padding: '12px', background: '#E8F5E9', borderRadius: '8px', fontSize: '13px', color: '#2E7D32' }}>
            🛰️ {t('crop.detectingMsg')}
          </div>
        )}

        {locationStatus === 'success' && locationData && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: `📍 ${t('crop.locationLabel')}`, value: `${locationData.locationName}${locationData.state ? ', ' + locationData.state : ''}` },
                { label: `🌡️ ${t('crop.tempLabel')}`,     value: `${locationData.temperature}°C` },
                { label: `💧 ${t('crop.humidityLabel')}`, value: `${locationData.humidity}%` },
                { label: `🌧️ ${t('crop.rainfallLabel')}`, value: `${locationData.rainfall} mm` },
                { label: `🌱 ${t('crop.soilLabel')}`,     value: t(`crop.soil.${locationData.soilType}`), highlight: true },
                { label: `💦 ${t('crop.waterLabel')}`,    value: t(`crop.water.${locationData.waterAvailability}`), highlight: true },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '8px 12px', borderRadius: '8px',
                  background: item.highlight ? '#E8F5E9' : '#F5F5F5',
                  border: `1px solid ${item.highlight ? '#A5D6A7' : '#E0E0E0'}`
                }}>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#888' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: item.highlight ? '#2E7D32' : '#333' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#558B2F' }}>
              ✅ {t('crop.autofillSuccess')}
            </p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <input
                placeholder={t('crop.wrongLocation')}
                value={manualCity}
                onChange={e => setManualCity(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
              />
              <button onClick={handleManualOverride} style={{
                padding: '8px 14px', background: '#1565C0', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
              }}>
                {t('crop.correctBtn')}
              </button>
            </div>
          </div>
        )}

        {locationStatus === 'error' && (
          <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#BF360C' }}>⚠️ {locationError}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>{t('crop.soilField')}</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {SOIL_KEYS.map(val => {
            const c = SOIL_COLORS[val];
            const active = form.soilType === val;
            return (
              <button key={val} type="button" onClick={() => setForm({ ...form, soilType: val })} style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${active ? c.border : '#e0e0e0'}`,
                background: active ? c.bg : 'white',
                color: active ? c.text : '#666',
                fontWeight: active ? '600' : '400'
              }}>
                {c.icon} {t(`crop.soil.${val}`)}
              </button>
            );
          })}
        </div>

        <label style={labelStyle}>{t('crop.seasonField')}</label>
        <select name="season" value={form.season} onChange={handleChange} style={inputStyle}>
          <option value="kharif">🌧️ {t('crop.seasons.kharif')}</option>
          <option value="rabi">❄️ {t('crop.seasons.rabi')}</option>
          <option value="zaid">☀️ {t('crop.seasons.zaid')}</option>
        </select>

        <label style={labelStyle}>{t('crop.waterField')}</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {WATER_KEYS.map(val => {
            const c = WATER_COLORS[val];
            const active = form.waterAvailability === val;
            return (
              <button key={val} type="button" onClick={() => setForm({ ...form, waterAvailability: val })} style={{
                flex: 1, padding: '9px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${active ? c.border : '#e0e0e0'}`,
                background: active ? c.bg : 'white',
                color: active ? c.text : '#666',
                fontWeight: active ? '600' : '400'
              }}>
                {c.icon} {t(`crop.water.${val}`)}
              </button>
            );
          })}
        </div>

        <label style={labelStyle}>{t('crop.budgetField')}</label>
        <input
          type="number" name="budget" value={form.budget}
          onChange={handleChange} style={inputStyle} placeholder="e.g. 10000"
        />

        <label style={labelStyle}>{t('crop.locationField')}</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text" name="location" value={form.location}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0, paddingRight: '36px' }}
              placeholder={t('crop.locationPlaceholder')}
            />
            {locationStatus === 'success' && (
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>
                📍
              </span>
            )}
          </div>
          <VoiceButton listening={listening} onClick={startListening} supported={supported} />
        </div>
        <p style={{ margin: '4px 0 16px', fontSize: '12px', color: '#888' }}>
          {listening
            ? '🎤 Listening... say soil, season, water level and city'
            : supported ? '🎤 Tap mic above to fill this form by voice' : ''
          }
        </p>

        {locationData && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#E8F5E9', borderRadius: '8px', fontSize: '12px', color: '#2E7D32', border: '1px solid #C8E6C9' }}>
            ✅ Weather auto-detected: {locationData.temperature}°C, {locationData.humidity}% humidity
          </div>
        )}

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? `🔄 ${t('crop.submittingBtn')}` : `🌿 ${t('crop.submitBtn')}`}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {t('crop.result.heading')}
                </p>
                <h1 style={{ margin: '0 0 6px', fontSize: '36px', fontWeight: '700', textTransform: 'capitalize' }}>
                  {result.recommendedCrop}
                </h1>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '13px' }}>
                  {t('crop.result.confidence', { value: result.confidence })}
                </div>
              </div>
              <button
                onClick={() => speaking
                  ? stopSpeaking()
                  : speak(`Recommended crop is ${result.recommendedCrop}. Expected profit is ${result.expectedProfit}. Season is ${form.season}.`, langCode)
                }
                style={{
                  background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '8px', color: 'white', padding: '8px 12px',
                  cursor: 'pointer', fontSize: '18px'
                }}
              >
                {speaking ? '⏹' : '🔊'}
              </button>
            </div>
          </div>

          <div style={{ padding: '20px 24px', background: '#F9FBE7' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: `🌾 ${t('crop.result.yield')}`,  value: result.expectedYield },
                { label: `💰 ${t('crop.result.profit')}`, value: result.expectedProfit },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#222' }}>{s.value || '—'}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #C8E6C9', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: `🌡️ ${t('crop.result.temp')}`,     value: `${result.temperature}°C` },
                { label: `💧 ${t('crop.result.humidity')}`, value: `${result.humidity}%` },
                { label: `🌧️ ${t('crop.result.rainfall')}`, value: `${result.rainfall}mm` },
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
const inputStyle  = { display: 'block', width: '100%', padding: '10px 12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' };
const btnStyle    = { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(46,125,50,0.3)' };