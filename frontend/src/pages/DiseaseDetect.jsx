import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSpeechOutput } from '../hooks/useVoice';
import useLangCode from '../hooks/useLangCode';

const SUPPORTED_CROPS = [
  'Apple', 'Blueberry', 'Cherry', 'Corn', 'Grape',
  'Orange', 'Peach', 'Bell Pepper', 'Potato', 'Raspberry',
  'Soybean', 'Squash', 'Strawberry', 'Tomato'
];

const UNSUPPORTED_CROPS = ['Mango', 'Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Banana', 'Coconut', 'Onion', 'Groundnut', 'Sorghum'];

const DISEASE_TREATMENTS = {
  'Apple___Apple_scab':                                   { treatment: 'Apply captan or mancozeb fungicide. Remove and destroy infected leaves. Ensure good air circulation.', cost: 1800, severity: 'moderate' },
  'Apple___Black_rot':                                    { treatment: 'Prune infected branches. Apply copper-based fungicide. Remove mummified fruit.', cost: 2200, severity: 'high' },
  'Apple___Cedar_apple_rust':                             { treatment: 'Apply myclobutanil fungicide at pink bud stage. Remove nearby cedar trees if possible.', cost: 2000, severity: 'moderate' },
  'Apple___healthy':                                      { treatment: 'Crop looks healthy! Maintain regular watering and fertilization schedule.', cost: 0, severity: 'none' },
  'Blueberry___healthy':                                  { treatment: 'Crop looks healthy! Maintain soil pH between 4.5–5.5 for best growth.', cost: 0, severity: 'none' },
  'Cherry_(including_sour)___Powdery_mildew':             { treatment: 'Apply sulfur-based fungicide. Improve air circulation. Avoid overhead irrigation.', cost: 1600, severity: 'moderate' },
  'Cherry_(including_sour)___healthy':                    { treatment: 'Crop looks healthy! Prune for airflow and monitor regularly.', cost: 0, severity: 'none' },
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot':   { treatment: 'Apply strobilurin fungicide. Rotate crops annually. Use resistant varieties.', cost: 2000, severity: 'moderate' },
  'Corn_(maize)___Common_rust_':                          { treatment: 'Apply triazole fungicide at early stages. Plant rust-resistant hybrids next season.', cost: 1700, severity: 'moderate' },
  'Corn_(maize)___Northern_Leaf_Blight':                  { treatment: 'Apply propiconazole fungicide. Rotate with non-host crops. Bury crop residue after harvest.', cost: 2100, severity: 'high' },
  'Corn_(maize)___healthy':                               { treatment: 'Crop looks healthy! Ensure adequate nitrogen fertilization.', cost: 0, severity: 'none' },
  'Grape___Black_rot':                                    { treatment: 'Apply mancozeb or captan fungicide. Remove infected berries immediately. Prune for airflow.', cost: 2500, severity: 'high' },
  'Grape___Esca_(Black_Measles)':                         { treatment: 'No chemical cure available. Remove infected wood surgically. Apply wound sealant after pruning.', cost: 4000, severity: 'severe' },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)':           { treatment: 'Apply copper-based fungicide. Remove fallen leaves. Avoid wetting foliage.', cost: 1900, severity: 'moderate' },
  'Grape___healthy':                                      { treatment: 'Crop looks healthy! Monitor for pests and maintain trellising.', cost: 0, severity: 'none' },
  'Orange___Haunglongbing_(Citrus_greening)':             { treatment: 'No cure exists. Remove and destroy infected trees immediately. Control psyllid insects with imidacloprid.', cost: 8000, severity: 'severe' },
  'Peach___Bacterial_spot':                               { treatment: 'Apply copper hydroxide spray. Avoid overhead watering. Use disease-free nursery stock.', cost: 2000, severity: 'moderate' },
  'Peach___healthy':                                      { treatment: 'Crop looks healthy! Apply dormant spray in winter to prevent bacterial infections.', cost: 0, severity: 'none' },
  'Pepper,_bell___Bacterial_spot':                        { treatment: 'Apply copper-based bactericide. Remove infected plant debris. Avoid working in wet fields.', cost: 1500, severity: 'moderate' },
  'Pepper,_bell___healthy':                               { treatment: 'Crop looks healthy! Maintain consistent irrigation and watch for aphids.', cost: 0, severity: 'none' },
  'Potato___Early_blight':                                { treatment: 'Apply chlorothalonil or mancozeb fungicide. Remove lower infected leaves. Ensure proper spacing.', cost: 1800, severity: 'moderate' },
  'Potato___Late_blight':                                 { treatment: 'Apply metalaxyl or cymoxanil immediately — late blight spreads rapidly. Destroy infected plants.', cost: 3000, severity: 'severe' },
  'Potato___healthy':                                     { treatment: 'Crop looks healthy! Hill up soil around plants and monitor for Colorado beetle.', cost: 0, severity: 'none' },
  'Raspberry___healthy':                                  { treatment: 'Crop looks healthy! Prune old canes after harvest for next season growth.', cost: 0, severity: 'none' },
  'Soybean___healthy':                                    { treatment: 'Crop looks healthy! Check for soybean cyst nematode if yields are low.', cost: 0, severity: 'none' },
  'Squash___Powdery_mildew':                              { treatment: 'Apply potassium bicarbonate or neem oil spray. Improve air circulation. Water at base only.', cost: 1200, severity: 'low' },
  'Strawberry___Leaf_scorch':                             { treatment: 'Remove infected leaves. Apply myclobutanil fungicide. Avoid overhead irrigation.', cost: 1400, severity: 'moderate' },
  'Strawberry___healthy':                                 { treatment: 'Crop looks healthy! Renew bed every 3–4 years for best yields.', cost: 0, severity: 'none' },
  'Tomato___Bacterial_spot':                              { treatment: 'Apply copper bactericide spray. Remove infected debris. Avoid working in wet conditions.', cost: 1600, severity: 'moderate' },
  'Tomato___Early_blight':                                { treatment: 'Apply mancozeb or chlorothalonil fungicide. Remove lower infected leaves. Stake plants for airflow.', cost: 1500, severity: 'moderate' },
  'Tomato___Late_blight':                                 { treatment: 'Apply metalaxyl immediately. Late blight can wipe out crop in days. Destroy heavily infected plants.', cost: 2500, severity: 'severe' },
  'Tomato___Leaf_Mold':                                   { treatment: 'Apply chlorothalonil fungicide. Reduce humidity in greenhouse. Improve ventilation.', cost: 1400, severity: 'moderate' },
  'Tomato___Septoria_leaf_spot':                          { treatment: 'Apply mancozeb or copper fungicide. Remove infected lower leaves. Mulch around base.', cost: 1600, severity: 'moderate' },
  'Tomato___Spider_mites Two-spotted_spider_mite':        { treatment: 'Apply miticide. Spray underside of leaves. Use neem oil for organic option.', cost: 1800, severity: 'moderate' },
  'Tomato___Target_Spot':                                 { treatment: 'Apply azoxystrobin or chlorothalonil. Maintain dry foliage. Rotate crops next season.', cost: 1700, severity: 'moderate' },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus':               { treatment: 'No cure — remove and destroy infected plants. Control whitefly vectors with imidacloprid.', cost: 3500, severity: 'severe' },
  'Tomato___Tomato_mosaic_virus':                         { treatment: 'No cure — remove infected plants. Disinfect tools. Control aphid vectors.', cost: 3000, severity: 'severe' },
  'Tomato___healthy':                                     { treatment: 'Crop looks healthy! Maintain consistent watering and monitor for whitefly.', cost: 0, severity: 'none' },
};

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

      if (data.diseaseName && DISEASE_TREATMENTS[data.diseaseName]) {
        const local = DISEASE_TREATMENTS[data.diseaseName];
        data.treatment     = local.treatment;
        data.estimatedCost = local.cost;
        data.severity      = local.severity;
      } else {
        data.severity      = data.isHealthy ? 'none' : 'moderate';
        data.estimatedCost = data.estimatedCost || 1000;
      }

      const cropMatch = data.diseaseName?.toLowerCase().includes(cropName.toLowerCase().split(' ')[0]);
      if (!cropMatch && !data.isHealthy) {
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
            <p style={{ margin: '0 0 6px', fontWeight: '600' }}>❌ {t('disease.unsupportedTitle')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {UNSUPPORTED_CROPS.map(c => (
                <span key={c} style={{ background: '#FFCDD2', color: '#B71C1C', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>{c}</span>
              ))}
            </div>
            <p style={{ margin: '8px 0 0', color: '#555', fontSize: '12px' }}>⚠️ {t('disease.unsupportedWarning')}</p>
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
                You selected {result.selectedCrop} but model detected {result.diseaseName.split('___')[0].replace(/_/g, ' ')}.
                Please re-check the crop selection.
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