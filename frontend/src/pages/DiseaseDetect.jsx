import { useState } from 'react';
import axios from 'axios';

export default function DiseaseDetect() {
  const [cropName, setCropName] = useState('Tomato');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please select an image');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('cropName', cropName);
      formData.append('farmerId', '6650f1c2e1b2c3d4e5f67890');

      const res = await axios.post(
        'http://localhost:5000/api/disease/detect',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(res.data);
    } catch (err) {
      setError('Detection failed. Make sure Flask is running.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h2>Disease Detection</h2>

      <form onSubmit={handleSubmit}>
        <label>Crop Name</label>
        <select value={cropName} onChange={e => setCropName(e.target.value)} style={inputStyle}>
          <option>Tomato</option>
          <option>Potato</option>
          <option>Rice</option>
          <option>Corn</option>
          <option>Apple</option>
        </select>

        <label>Upload Crop Photo</label>
        <input
          type="file" accept="image/*"
          onChange={handleImage}
          style={{ display: 'block', margin: '8px 0 16px' }}
        />

        {preview && (
          <img src={preview} alt="preview"
            style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
          />
        )}

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? 'Analysing...' : 'Detect Disease'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}

      {result && (
        <div style={{
          ...resultStyle,
          borderColor: result.isHealthy ? '#2E7D32' : '#C62828'
        }}>
          <h3>{result.isHealthy ? 'Crop is Healthy!' : 'Disease Detected'}</h3>
          <h2 style={{ color: result.isHealthy ? '#2E7D32' : '#C62828' }}>
            {result.diseaseName.replace(/_/g, ' ')}
          </h2>
          <p>Confidence: <strong>{result.confidence}%</strong></p>
          <hr />
          <p><strong>Treatment:</strong></p>
          <p>{result.treatment}</p>
          {!result.isHealthy && (
            <>
              <hr />
              <p>Estimated Cost: <strong>₹{result.estimatedCost}</strong></p>
              <button
                style={{ ...btnStyle, background: '#E65100', marginTop: '12px' }}
                onClick={() => alert('Loan feature coming next!')}
              >
                Apply for Loan to Cover Treatment
              </button>
            </>
          )}
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
  border: '2px solid', borderRadius: '8px',
  background: '#FAFAFA'
};