import { useState } from 'react';
import axios from 'axios';

export default function LoanGateway() {
  const [form, setForm] = useState({
    estimatedCost: 2500,
    landSize: 2,
    diseaseReportId: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState({
    name: '',
    phone: '',
    aadhaar: '',
    address: '',
    state: '',
    district: '',
    landSize: 2,
    cropName: '',
    bankAccount: '',
    bankName: '',
    ifsc: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/loan/match', {
        ...form,
        farmerId: '6650f1c2e1b2c3d4e5f67890'
      });
      setResult(res.data);
    } catch (err) {
      setError('Failed to fetch loan schemes.');
    }
    setLoading(false);
  };

  const handleApply = (scheme) => {
    setSelectedScheme(scheme);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h2>Loan Gateway</h2>
      <p style={{ color: '#666' }}>Find the best government loan scheme for your situation</p>

      <form onSubmit={handleSubmit}>
        <label>Estimated Treatment Cost (₹)</label>
        <input
          type="number"
          value={form.estimatedCost}
          onChange={e => setForm({ ...form, estimatedCost: Number(e.target.value) })}
          style={inputStyle}
        />

        <label>Your Land Size (acres)</label>
        <input
          type="number"
          value={form.landSize}
          onChange={e => setForm({ ...form, landSize: Number(e.target.value) })}
          style={inputStyle}
          step="0.1"
        />

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? 'Finding schemes...' : 'Find Matching Loan Schemes'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '24px' }}>

          <div style={recommendedBox}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#1B5E20' }}>
              Best Match for you
            </p>
            <h3 style={{ margin: '0 0 8px', color: '#1B5E20' }}>
              {result.recommendation.name}
            </h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#2E7D32' }}>
              {result.recommendation.provider}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
              <span style={badgeStyle}>
                Up to ₹{result.recommendation.maxAmount.toLocaleString()}
              </span>
              <span style={badgeStyle}>
                {result.recommendation.interestRate}% interest
              </span>
              <span style={badgeStyle}>
                {result.recommendation.processingTime}
              </span>
            </div>
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#555' }}>
              {result.recommendation.eligibility.description}
            </p>
            <p style={{ fontSize: '13px', color: '#555' }}>
              Documents needed: {result.recommendation.documents.join(', ')}
            </p>
            <button
              onClick={() => handleApply(result.recommendation)}
              style={{ ...applyBtnStyle, border: 'none', cursor: 'pointer' }}
            >
              Fill Pre-filled Application
            </button>
          </div>

          <h3 style={{ marginTop: '24px' }}>All Matching Schemes ({result.matchedSchemes.length})</h3>

          {result.matchedSchemes.map((scheme, i) => (
            <div key={scheme.id} style={schemeCard}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div>
                  <p style={{ margin: '0', fontWeight: '500' }}>{scheme.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                    {scheme.interestRate}% interest · Up to ₹{scheme.maxAmount.toLocaleString()}
                  </p>
                </div>
                <span style={{ fontSize: '20px' }}>{expanded === i ? '▲' : '▼'}</span>
              </div>

              {expanded === i && (
                <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>
                    Provider: <strong>{scheme.provider}</strong>
                  </p>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>
                    Repayment: <strong>{scheme.repaymentPeriod}</strong>
                  </p>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>
                    Processing: <strong>{scheme.processingTime}</strong>
                  </p>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>
                    Documents: <strong>{scheme.documents.join(', ')}</strong>
                  </p>
                  <button
                    onClick={() => handleApply(scheme)}
                    style={{ ...applyBtnStyle, background: '#555', border: 'none', cursor: 'pointer', marginTop: '8px' }}
                  >
                    Fill Pre-filled Application
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && selectedScheme && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          overflowY: 'auto', padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px', margin: '40px auto',
            background: 'white', borderRadius: '12px',
            padding: '32px', fontFamily: 'sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#1B5E20' }}>Application Form</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                x
              </button>
            </div>

            <div style={{
              background: '#F1F8E9', border: '1px solid #4CAF50',
              borderRadius: '8px', padding: '12px', margin: '16px 0'
            }}>
              <p style={{ margin: 0, fontWeight: '500', color: '#2E7D32' }}>
                {selectedScheme.name}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
                {selectedScheme.provider}
              </p>
            </div>

            <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
              Fill in your details below. You can print this form and submit it at your nearest bank or CSC center.
            </p>

            <h4 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              Personal Details
            </h4>

            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              placeholder="As per Aadhaar card"
              value={farmerDetails.name}
              onChange={e => setFarmerDetails({ ...farmerDetails, name: e.target.value })}
            />

            <label style={labelStyle}>Aadhaar Number</label>
            <input
              style={inputStyle}
              placeholder="12-digit Aadhaar number"
              value={farmerDetails.aadhaar}
              onChange={e => setFarmerDetails({ ...farmerDetails, aadhaar: e.target.value })}
              maxLength={12}
            />

            <label style={labelStyle}>Phone Number</label>
            <input
              style={inputStyle}
              placeholder="10-digit mobile number"
              value={farmerDetails.phone}
              onChange={e => setFarmerDetails({ ...farmerDetails, phone: e.target.value })}
            />

            <label style={labelStyle}>Full Address</label>
            <input
              style={inputStyle}
              placeholder="Village, Taluka"
              value={farmerDetails.address}
              onChange={e => setFarmerDetails({ ...farmerDetails, address: e.target.value })}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>State</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Maharashtra"
                  value={farmerDetails.state}
                  onChange={e => setFarmerDetails({ ...farmerDetails, state: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>District</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Pune"
                  value={farmerDetails.district}
                  onChange={e => setFarmerDetails({ ...farmerDetails, district: e.target.value })}
                />
              </div>
            </div>

            <h4 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '8px', marginTop: '20px' }}>
              Land & Crop Details
            </h4>

            <label style={labelStyle}>Land Size (acres)</label>
            <input
              style={inputStyle}
              value={farmerDetails.landSize}
              onChange={e => setFarmerDetails({ ...farmerDetails, landSize: e.target.value })}
            />

            <label style={labelStyle}>Crop Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Tomato"
              value={farmerDetails.cropName}
              onChange={e => setFarmerDetails({ ...farmerDetails, cropName: e.target.value })}
            />

            <label style={labelStyle}>Estimated Treatment Cost (₹)</label>
            <input
              style={{ ...inputStyle, background: '#f5f5f5' }}
              value={form.estimatedCost}
              disabled
            />

            <h4 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '8px', marginTop: '20px' }}>
              Bank Details
            </h4>

            <label style={labelStyle}>Bank Account Number</label>
            <input
              style={inputStyle}
              placeholder="Account number"
              value={farmerDetails.bankAccount}
              onChange={e => setFarmerDetails({ ...farmerDetails, bankAccount: e.target.value })}
            />

            <label style={labelStyle}>Bank Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. State Bank of India"
              value={farmerDetails.bankName}
              onChange={e => setFarmerDetails({ ...farmerDetails, bankName: e.target.value })}
            />

            <label style={labelStyle}>IFSC Code</label>
            <input
              style={inputStyle}
              placeholder="e.g. SBIN0001234"
              value={farmerDetails.ifsc}
              onChange={e => setFarmerDetails({ ...farmerDetails, ifsc: e.target.value })}
            />

            <div style={{
              marginTop: '8px', padding: '12px',
              background: '#FFF8E1', borderRadius: '8px',
              fontSize: '13px', color: '#666'
            }}>
              Required documents to attach: {selectedScheme.documents.join(', ')}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={handlePrint}
                style={{ ...btnStyle, flex: 1 }}
              >
                Print / Save as PDF
              </button>
              <a
                href={selectedScheme.applyUrl}
                target="_blank"
                rel="noreferrer"
                style={{ ...applyBtnStyle, flex: 1, textAlign: 'center' }}
              >
                Apply on Official Portal
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: 'block', width: '100%', padding: '10px',
  marginBottom: '16px', marginTop: '4px',
  borderRadius: '6px', border: '1px solid #ccc',
  fontSize: '14px', boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block', fontSize: '13px',
  color: '#555', marginBottom: '4px', marginTop: '12px'
};

const btnStyle = {
  width: '100%', padding: '12px',
  background: '#2E7D32', color: 'white',
  border: 'none', borderRadius: '6px',
  fontSize: '16px', cursor: 'pointer'
};

const recommendedBox = {
  background: '#F1F8E9', border: '2px solid #4CAF50',
  borderRadius: '10px', padding: '20px', marginTop: '16px'
};

const schemeCard = {
  border: '1px solid #ddd', borderRadius: '8px',
  padding: '16px', marginTop: '12px', background: '#fff'
};

const badgeStyle = {
  background: '#E8F5E9', color: '#2E7D32',
  padding: '4px 10px', borderRadius: '20px',
  fontSize: '13px', fontWeight: '500'
};

const applyBtnStyle = {
  display: 'inline-block', marginTop: '12px',
  padding: '10px 20px', background: '#2E7D32',
  color: 'white', borderRadius: '6px',
  textDecoration: 'none', fontSize: '14px'
};