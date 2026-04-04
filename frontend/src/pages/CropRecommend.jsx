import { useState } from 'react';
import axios from 'axios';

export default function CropRecommend() {
  const [form, setForm] = useState({
    soilType: 'loamy',
    season: 'kharif',
    waterAvailability: 'high',
    budget: 10000,
    location: 'Mumbai'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/crop/recommend', {
        ...form,
        farmerId: '6650f1c2e1b2c3d4e5f67890'
      });
      setResult(res.data);
    } catch (err) {
      setError('Something went wrong. Check your API keys and Flask service.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h2>Crop Recommendation</h2>
      <form onSubmit={handleSubmit}>

        <label>Soil Type</label>
        <select name="soilType" value={form.soilType} onChange={handleChange} style={inputStyle}>
          <option value="sandy">Sandy</option>
          <option value="clay">Clay</option>
          <option value="loamy">Loamy</option>
          <option value="silt">Silt</option>
          <option value="peaty">Peaty</option>
        </select>

        <label>Season</label>
        <select name="season" value={form.season} onChange={handleChange} style={inputStyle}>
          <option value="kharif">Kharif (June-Oct)</option>
          <option value="rabi">Rabi (Nov-Apr)</option>
          <option value="zaid">Zaid (Apr-Jun)</option>
        </select>

        <label>Water Availability</label>
        <select name="waterAvailability" value={form.waterAvailability} onChange={handleChange} style={inputStyle}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label>Budget (₹)</label>
        <input
          type="number" name="budget"
          value={form.budget} onChange={handleChange}
          style={inputStyle}
        />

        <label>Your Location (City name)</label>
        <input
          type="text" name="location"
          value={form.location} onChange={handleChange}
          style={inputStyle}
          placeholder="e.g. Pune"
        />

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? 'Analysing...' : 'Get Recommendation'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}

      {result && (
        <div style={resultStyle}>
          <h3>Recommended Crop</h3>
          <h1 style={{ color: '#2E7D32', textTransform: 'capitalize' }}>
            {result.recommendedCrop}
          </h1>
          <p>Confidence: <strong>{result.confidence}%</strong></p>
          <hr />
          <p>Expected Yield: <strong>{result.expectedYield}</strong></p>
          <p>Expected Profit: <strong>{result.expectedProfit}</strong></p>
          <hr />
          <p>Temperature: <strong>{result.temperature}°C</strong></p>
          <p>Humidity: <strong>{result.humidity}%</strong></p>
          <p>Rainfall: <strong>{result.rainfall}mm</strong></p>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: 'block', width: '100%', padding: '10px',
  marginBottom: '16px', marginTop: '4px',
  borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px'
};

const btnStyle = {
  width: '100%', padding: '12px',
  background: '#2E7D32', color: 'white',
  border: 'none', borderRadius: '6px',
  fontSize: '16px', cursor: 'pointer'
};

const resultStyle = {
  marginTop: '24px', padding: '20px',
  border: '1px solid #ccc', borderRadius: '8px',
  background: '#F1F8E9'
};