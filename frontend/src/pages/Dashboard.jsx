import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stages = [
    { step: '01', key: 'crop',    path: '/crop',    color: 'var(--green-800)',  bg: 'var(--green-100)',  accent: 'var(--green-800)' },
    { step: '02', key: 'disease', path: '/disease', color: '#00695C',           bg: '#E0F2F1',           accent: '#00695C' },
    { step: '03', key: 'loan',    path: '/loan',    color: 'var(--amber)',      bg: 'var(--amber-bg)',   accent: 'var(--amber)' },
    { step: '04', key: 'sell',    path: '/sell',    color: 'var(--blue)',       bg: 'var(--blue-bg)',    accent: 'var(--blue)' },
  ];

  const stats = [
    { value: '99%', key: 'cropAccuracy' },
    { value: '97%', key: 'diseaseAccuracy' },
    { value: '4',   key: 'loanSchemes' },
    { value: t('common.live'), key: 'liveData' },
  ];

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* Hero */}
      <div className="fp-hero fp-animate-up" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
          {t('dashboard.welcome')}
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, margin: '0 0 22px' }}>
          {t('dashboard.tagline')}
        </p>
        <button
          onClick={() => navigate('/crop')}
          style={{
            background: '#fff', color: 'var(--green-900)',
            border: 'none', borderRadius: 'var(--radius-md)',
            padding: '12px 28px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'; }}
        >
          {t('dashboard.startBtn')} →
        </button>
      </div>

      {/* Stats */}
      <div className="fp-stat-grid">
        {stats.map((stat, i) => (
          <div key={i} className="fp-stat-box fp-animate-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="fp-stat-value">{stat.value}</div>
            <div className="fp-stat-label">{t(`dashboard.stats.${stat.key}`)}</div>
          </div>
        ))}
      </div>

      {/* Journey */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
        {t('dashboard.journey')}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stages.map((stage, i) => (
          <div
            key={stage.key}
            onClick={() => navigate(stage.path)}
            className="fp-card fp-card-clickable fp-animate-up"
            style={{ animationDelay: `${0.1 + i * 0.07}s`, display: 'flex', alignItems: 'flex-start', gap: '18px' }}
          >
            <div style={{
              background: stage.bg, color: stage.color,
              borderRadius: 'var(--radius-md)',
              width: '48px', height: '48px', minWidth: '48px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 800,
            }}>
              {stage.step}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '15px', color: 'var(--text)', margin: 0 }}>
                  {t(`dashboard.stages.${stage.key}.title`)}
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
              </div>
              <p style={{ margin: '0 0 10px', color: 'var(--text-sub)', fontSize: '13px', lineHeight: 1.5 }}>
                {t(`dashboard.stages.${stage.key}.desc`)}
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {t(`dashboard.stages.${stage.key}.tags`, { returnObjects: true }).map((tag, j) => (
                  <span key={j} style={{
                    background: stage.bg, color: stage.color,
                    padding: '2px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 600,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="fp-banner fp-banner-green fp-animate-up" style={{ marginTop: '28px', textAlign: 'center', animationDelay: '0.4s' }}>
        <strong style={{ color: 'var(--green-900)' }}>{t('dashboard.builtFor')}</strong>
        <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-sub)' }}>{t('dashboard.builtForDesc')}</p>
      </div>
    </div>
  );
}