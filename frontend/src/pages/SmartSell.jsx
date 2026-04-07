import { useState } from 'react';
import axios from 'axios';

const trendColor = (trend) => {
  if (trend === 'rising') return '#2E7D32';
  if (trend === 'falling') return '#D32F2F';
  return '#FFA000';
};

const trendIcon = (trend) => {
  if (trend === 'rising') return '▲';
  if (trend === 'falling') return '▼';
  return '●';
};

const mandiCard = {
  border: '1px solid #ddd',
  borderRadius: '10px',
  padding: '16px',
  marginBottom: '16px',
  background: '#fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const btnStyle = {
  padding: '12px 18px',
  background: '#2E7D32',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '15px'
};

export default function SmartSell() {
  const [cropName, setCropName] = useState('tomato');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.get(`http://localhost:5000/api/market/prices/${encodeURIComponent(cropName)}`);
      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.message || 'No price data found for this crop.');
      }
    } catch (err) {
      setError('Failed to fetch market prices.');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h2>Smart Sell</h2>
      <p style={{ color: '#666', marginTop: '4px' }}>
        Compare mandi prices and discover the best selling opportunity for your crop.
      </p>

      <form onSubmit={handleSearch} style={{ marginTop: '24px' }}>
        <label style={{ fontWeight: '600' }}>Crop Name</label>
        <input
          style={inputStyle}
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
          placeholder="e.g. tomato, wheat, potato"
        />

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? 'Loading prices...' : 'Get live mandi prices'}
        </button>
      </form>

      {error && <p style={{ color: '#D32F2F', marginTop: '16px' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '24px' }}>
          {result.isLive ? (
            <div
              style={{
                display: 'inline-block',
                background: '#E8F5E9',
                color: '#2E7D32',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '16px'
              }}
            >
              Live Agmarknet Data
            </div>
          ) : (
            <div
              style={{
                display: 'inline-block',
                background: '#FFF8E1',
                color: '#E65100',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '16px'
              }}
            >
              Reference Data — Add Agmarknet API key for live prices
            </div>
          )}

          <div style={{ marginTop: '16px', padding: '18px', background: '#F9FBE7', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 8px', fontWeight: '600' }}>
              Market summary for {result.cropName}
            </p>
            <p style={{ margin: '0', color: '#555' }}>
              Average price: ₹{result.avgPrice} · Price variation: ₹{result.priceVariation}
            </p>
            <p style={{ margin: '8px 0 0', color: '#555' }}>
              Rising mandis: {result.risingCount} · Falling mandis: {result.fallingCount}
            </p>
          </div>

          <div style={{ marginTop: '20px' }}>
            {result.mandis.map((mandi, i) => (
              <div key={i} style={{
                ...mandiCard,
                borderLeft: `4px solid ${trendColor(mandi.trend)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '500', fontSize: '15px' }}>{mandi.mandi}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#666' }}>{mandi.state}</p>
                    {mandi.minPrice != null && mandi.maxPrice != null && (
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#999' }}>
                        Range: ₹{mandi.minPrice} – ₹{mandi.maxPrice}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
                      ₹{mandi.price}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: trendColor(mandi.trend) }}>
                      {trendIcon(mandi.trend)} {mandi.trend}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
