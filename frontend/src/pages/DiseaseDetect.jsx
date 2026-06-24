import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSpeechOutput } from '../hooks/useVoice';
import useLangCode from '../hooks/useLangCode';

const SUPPORTED_CROPS = [
  'Apple', 'Banana', 'Bell Pepper', 'Cabbage', 'Chili', 'Corn',
  'Cotton', 'Grape', 'Guava', 'Mango', 'Onion', 'Orange',
  'Papaya', 'Peach', 'Pomegranate', 'Potato', 'Rice', 'Soybean',
  'Strawberry', 'Sugarcane', 'Tomato', 'Wheat'
];

const SEVERITY_COLORS = {
  none:     { bg: '#E8F5E9', border: '#4CAF50', text: '#1B5E20', badge: '#4CAF50' },
  low:      { bg: '#F9FBE7', border: '#8BC34A', text: '#33691E', badge: '#8BC34A' },
  moderate: { bg: '#FFF8E1', border: '#FFA000', text: '#E65100', badge: '#FFA000' },
  high:     { bg: '#FFF3E0', border: '#F4511E', text: '#BF360C', badge: '#F4511E' },
  severe:   { bg: '#FFEBEE', border: '#C62828', text: '#B71C1C', badge: '#C62828' },
};

export default function DiseaseDetect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const langCode = useLangCode();
  const { speaking, speak, stopSpeaking } = useSpeechOutput();

  const [cropName, setCropName]               = useState('Tomato');
  const [image, setImage]                     = useState(null);
  const [preview, setPreview]                 = useState(null);
  const [result, setResult]                   = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [showUnsupported, setShowUnsupported] = useState(false);

  useEffect(() => {
    if (!result) return;
    if (result.isHealthy) {
      speak(`Good news! Your ${cropName} crop looks healthy. Keep maintaining regular care.`, langCode);
    } else {
      speak(
        `Disease detected: ${result.diseaseName.replace(/___/g, ' ').replace(/_/g, ' ')}.
         Severity is ${result.severity}.
         Treatment: ${result.treatment}.
         Estimated cost is rupees ${result.estimatedCost}.`,
        langCode
      );
    }
  }, [result]);

  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImage(file); setPreview(URL.createObjectURL(file));
    setResult(null); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError(t('disease.errors.noImage'));
    setLoading(true); setError('');
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
      const data = res.data;

      // Gemini returns diseaseName, treatment and a real cost estimate — use them directly
      data.severity = data.isHealthy ? 'none' : (data.severity || 'moderate');
      if (data.estimatedCost == null) data.estimatedCost = 0;

      // Trust Gemini's own image-vs-crop check for mismatch
      if (data.isWarning && !data.isHealthy) {
        data.isMismatch   = true;
        data.selectedCrop = cropName;
      }

      setResult(data);
    } catch (err) {
      setError(t('disease.errors.detectFail'));
    }
    setLoading(false);
  };

  const handleApplyLoan = () => {
    if (!result) return;
    sessionStorage.setItem('loanContext', JSON.stringify({
      estimatedCost: result.estimatedCost,
      diseaseName:   result.diseaseName,
      cropName:      result.cropName || cropName,
      fromDisease:   true
    }));
    navigate('/loan');
  };

  const severityColors = result
    ? (SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.moderate)
    : SEVERITY_COLORS.none;

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', fontFamily: "'Segoe UI', sans-serif", padding: '0 16px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '24px', color: '#1B5E20', fontWeight: '700' }}>
          🔬 {t('disease.title')}
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{t('disease.subtitle')}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: '10px', fontSize: '13px', color: '#1565C0' }}>
        <strong>🤖 {t('disease.modelCoverage')}:</strong> {t('disease.modelCoverageDesc', { count: SUPPORTED_CROPS.length })}
        {' '}
        <button
          onClick={() => setShowUnsupported(!showUnsupported)}
          style={{ background: 'none', border: 'none', color: '#1565C0', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}
        >
          {showUnsupported ? t('disease.hideSupported') : t('disease.seeSupported')}
        </button>
        {showUnsupported && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ margin: '0 0 6px', fontWeight: '600' }}>✅ {t('disease.supportedTitle')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {SUPPORTED_CROPS.map(c => (
                <span key={c} style={{ background: '#BBDEFB', color: '#0D47A1', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>{t('disease.selectCrop')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {SUPPORTED_CROPS.map(crop => (
            <button key={crop} type="button" onClick={() => setCropName(crop)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              border: `2px solid ${cropName === crop ? '#2E7D32' : '#e0e0e0'}`,
              background: cropName === crop ? '#E8F5E9' : 'white',
              color: cropName === crop ? '#1B5E20' : '#666',
              cursor: 'pointer', fontWeight: cropName === crop ? '600' : '400'
            }}>
              {crop}
            </button>
          ))}
        </div>

        <label style={labelStyle}>{t('disease.uploadLabel')}</label>
        <label style={{
          display: 'block', border: '2px dashed #C8E6C9', borderRadius: '12px',
          padding: '24px', textAlign: 'center', cursor: 'pointer',
          background: preview ? '#F1F8E9' : '#FAFFFE', marginBottom: '16px'
        }}>
          <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          {preview
            ? <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '8px' }} />
            : (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '32px' }}>📸</p>
                <p style={{ margin: 0, color: '#2E7D32', fontWeight: '600', fontSize: '14px' }}>{t('disease.uploadHint')}</p>
                <p style={{ margin: '4px 0 0', color: '#999', fontSize: '12px' }}>{t('disease.uploadSubhint')}</p>
              </div>
            )
          }
        </label>

        {preview && (
          <p style={{ margin: '-8px 0 16px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
            📌 {t('disease.showing', { crop: cropName })} —{' '}
            <button
              onClick={() => { setImage(null); setPreview(null); setResult(null); }}
              style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: '12px', padding: 0 }}
            >
              {t('disease.remove')}
            </button>
          </p>
        )}

        <button type="submit" style={btnStyle} disabled={loading || !image}>
          {loading ? `🔄 ${t('disease.detectingBtn')}` : `🔬 ${t('disease.detectBtn')}`}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: '8px', color: '#C62828', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '28px', border: `2px solid ${severityColors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ background: severityColors.bg, padding: '20px 24px', borderBottom: `1px solid ${severityColors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {result.isHealthy ? `✅ ${t('disease.healthyStatus')}` : `🦠 ${t('disease.diseaseStatus')}`}
                </p>
                <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: severityColors.text }}>
                  {result.diseaseName.replace(/___/g, ' — ').replace(/_/g, ' ')}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                  {t('disease.cropLabel')}: <strong>{cropName}</strong> · {t('disease.confidenceLabel')}: <strong>{result.confidence}%</strong>
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                {result.severity && result.severity !== 'none' && (
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                    fontWeight: '700', background: severityColors.badge,
                    color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {result.severity}
                  </span>
                )}
                <button
                  onClick={() => speaking
                    ? stopSpeaking()
                    : speak(
                        result.isHealthy
                          ? `Good news! Your ${cropName} is healthy. Keep maintaining regular care.`
                          : `Disease: ${result.diseaseName.replace(/___/g, ' ').replace(/_/g, ' ')}. Treatment: ${result.treatment}. Cost: rupees ${result.estimatedCost}.`,
                        langCode
                      )
                  }
                  style={{
                    background: severityColors.bg, border: `1px solid ${severityColors.border}`,
                    borderRadius: '8px', color: severityColors.text,
                    padding: '8px 12px', cursor: 'pointer', fontSize: '18px'
                  }}
                >
                  {speaking ? '⏹' : '🔊'}
                </button>
              </div>
            </div>
          </div>

          {result.isMismatch && (
            <div style={{ padding: '14px 24px', background: '#FFF8E1', border: '1px solid #FFE082', fontSize: '13px', color: '#E65100' }}>
              ⚠️ <strong>
                This leaf doesn't look like {result.selectedCrop}. Please re-check the crop you
                selected, or upload a clearer single-leaf photo.
              </strong>
            </div>
          )}

          <div style={{ padding: '20px 24px', background: 'white' }}>
            <p style={{ margin: '0 0 8px', fontWeight: '600', fontSize: '14px', color: '#333' }}>
              💊 {t('disease.treatmentTitle')}
            </p>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
              {result.treatment}
            </p>

            {!result.isHealthy && result.estimatedCost > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '10px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>{t('disease.costLabel')}</p>
                    <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#E65100' }}>
                      ₹{result.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <span style={{ fontSize: '28px' }}>💰</span>
                </div>
                <button
                  onClick={handleApplyLoan}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #E65100, #F4511E)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(230,81,0,0.3)' }}
                >
                  💳 {t('disease.loanBtn', { cost: result.estimatedCost.toLocaleString() })}
                </button>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#888', textAlign: 'center' }}>
                  {t('disease.loanHint')}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' };
const btnStyle   = { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(46,125,50,0.3)' };