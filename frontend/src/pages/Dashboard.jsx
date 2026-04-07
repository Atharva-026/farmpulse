import { useNavigate } from 'react-router-dom';

const stages = [
  {
    step: '01',
    title: 'Crop Recommendation',
    description: 'Tell us your soil, location, season and budget. Our AI recommends the best crop to grow.',
    path: '/crop',
    color: '#2E7D32',
    bg: '#E8F5E9',
    tags: ['AI Powered', 'Weather Data', 'Soil Analysis']
  },
  {
    step: '02',
    title: 'Disease Detection',
    description: 'Upload a photo of your crop. Our model detects any disease within seconds with 97% accuracy.',
    path: '/disease',
    color: '#00695C',
    bg: '#E0F2F1',
    tags: ['Computer Vision', '97% Accuracy', 'Instant Results']
  },
  {
    step: '03',
    title: 'Loan Gateway',
    description: 'Get matched to the best government loan scheme. Pre-filled application, zero paperwork.',
    path: '/loan',
    color: '#E65100',
    bg: '#FFF3E0',
    tags: ['PM-KISAN', 'KCC', 'PMFBY']
  },
  {
    step: '04',
    title: 'Smart Selling',
    description: 'See live mandi prices across India. Know exactly when and where to sell for maximum profit.',
    path: '/sell',
    color: '#1565C0',
    bg: '#E3F2FD',
    tags: ['Live Prices', 'Agmarknet API', 'AI Prediction']
  }
];

const stats = [
  { value: '99%', label: 'Crop model accuracy' },
  { value: '97%', label: 'Disease detection accuracy' },
  { value: '4', label: 'Real govt loan schemes' },
  { value: 'Live', label: 'Mandi price data' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '720px', margin: '0 auto', padding: '32px 16px' }}>

      <div style={{
        background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
        borderRadius: '16px', padding: '40px 32px',
        color: 'white', marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: '700' }}>
          Welcome to FarmPulse
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: '16px', opacity: 0.85, lineHeight: 1.6 }}>
          Your AI-powered companion from planting to profit.
          Follow the 4 stages below to get started.
        </p>
        <button
          onClick={() => navigate('/crop')}
          style={{
            background: 'white', color: '#1B5E20',
            border: 'none', borderRadius: '8px',
            padding: '14px 32px', fontSize: '16px',
            fontWeight: '600', cursor: 'pointer'
          }}
        >
          Start with Crop Recommendation
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '32px'
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: 'white', border: '1px solid #e0e0e0',
            borderRadius: '10px', padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700', color: '#1B5E20' }}>
              {stat.value}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: '16px', color: '#333' }}>Your Farming Journey</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {stages.map((stage, i) => (
          <div
            key={i}
            onClick={() => navigate(stage.path)}
            style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              background: stage.bg,
              color: stage.color,
              borderRadius: '12px',
              width: '52px', height: '52px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px', fontWeight: '700',
              flexShrink: 0
            }}>
              {stage.step}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 6px', color: '#222', fontSize: '16px' }}>
                  {stage.title}
                </h3>
                <span style={{ color: '#aaa', fontSize: '20px' }}>→</span>
              </div>
              <p style={{ margin: '0 0 12px', color: '#666', fontSize: '14px', lineHeight: 1.5 }}>
                {stage.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {stage.tags.map((tag, j) => (
                  <span key={j} style={{
                    background: stage.bg,
                    color: stage.color,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '32px',
        background: '#F9FBE7',
        border: '1px solid #C5E1A5',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 8px', color: '#33691E' }}>
          Built for Indian Farmers
        </h3>
        <p style={{ margin: '0', color: '#558B2F', fontSize: '14px' }}>
          Powered by real government APIs — Agmarknet, OpenWeatherMap, PlantVillage dataset and PM-KISAN schemes.
          No fake data. No guesswork.
        </p>
      </div>

    </div>
  );
}