import archDiagram from '../assets/FTW_20260409_083933_0000.png';

const featureCards = [
  { title: 'Crop Advisory', detail: 'AI recommends the best crop for your soil, weather, and budget.' },
  { title: 'Disease Detection', detail: 'Instant photo-based disease diagnosis with treatment guidance.' },
  { title: 'Smart Loans', detail: 'Zero-paperwork access to farmer-friendly loan schemes.' },
  { title: 'Price Insights', detail: 'Mandi price prediction and best selling time guidance.' },
  { title: 'Marketplace', detail: 'List crops and connect with verified buyers in one place.' },
  { title: 'Regional Support', detail: 'Local-language interface for easy use in rural areas.' },
];

const challengeCards = [
  {
    challenge: 'Network limitations in rural areas',
    solution: 'Lightweight APIs, reduced bandwidth usage, and offline-friendly interfaces.'
  },
  {
    challenge: 'Language barrier',
    solution: 'Multi-language support with simple regional phrasing.'
  },
  {
    challenge: 'Low digital literacy',
    solution: 'A clean intuitive layout with clear actions and voice guidance.'
  },
  {
    challenge: 'Lack of actionable insights',
    solution: 'We deliver decisions, not just data: when and where to sell.'
  }
];

const compareRows = [
  { label: 'Crop Recommendation', existing: 'Basic suggestions', ours: 'AI-driven crop plan by season, budget, location', highlight: 'Actionable advice' },
  { label: 'Disease Detection', existing: 'Limited tools', ours: 'Photo-based instant diagnosis', highlight: 'Fast treatment guidance' },
  { label: 'Loan Support', existing: 'Manual applications', ours: 'Zero paperwork loan connection', highlight: 'Farmer-first finance' },
  { label: 'Price Insights', existing: 'Raw mandi prices', ours: 'Best time and mandi to sell', highlight: 'Profit optimization' },
  { label: 'Marketplace', existing: 'Partial listings', ours: 'Verified buyer network', highlight: 'End-to-end selling support' }
];

export default function About() {
  return (
    <div style={{ background: '#FAFFF8', minHeight: '100vh', fontFamily: 'inherit', color: '#1e2d24' }}>
      <div style={{ background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 48%, #388E3C 100%)', padding: '60px 20px 40px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', color: '#fff' }}>
          <span style={{ display: 'inline-block', marginBottom: '14px', fontSize: '13px', letterSpacing: '1px', fontWeight: '700', color: '#C8E6C9' }}>ABOUT FARM PULSE</span>
          <h1 style={{ margin: 0, fontSize: '40px', lineHeight: '1.05', fontWeight: '800' }}>An AI-powered farm companion built for real Indian farmers.</h1>
          <p style={{ margin: '18px 0 0', maxWidth: '760px', color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.8' }}>
            FarmPulse bridges the gap between the field and the market by helping farmers choose the best crop, detect disease early, secure loans, and sell at the right time. We turn farming uncertainty into a clear action plan, starting with Ramu’s story and ending with profit in his pocket.
          </p>
        </div>
      </div>

      <div style={{ padding: '40px 20px 60px', maxWidth: '1180px', margin: '0 auto' }}>
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '26px', boxShadow: '0 16px 40px rgba(24,85,28,0.08)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '26px', color: '#174e1f' }}>Project Overview</h2>
              <p style={{ margin: 0, color: '#445644', fontSize: '16px', lineHeight: '1.8' }}>
                An end-to-end AI-powered platform that guides Indian farmers from planting to profit. FarmPulse provides crop advice, disease detection, smart loan support, mandi price prediction, and verified selling options in one farmer-first app.
              </p>
            </div>
            <div style={{ background: '#F3FBF4', border: '1px solid #D9EBD4', borderRadius: '20px', padding: '26px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '14px', fontSize: '22px', color: '#2E7D32' }}>Ramu’s Story</h3>
              <p style={{ margin: 0, color: '#4d664f', fontSize: '15px', lineHeight: '1.8' }}>
                Meet Ramu. He plants a crop by guesswork, misses disease early, struggles with loan paperwork, and sells at a low mandi price. FarmPulse changes that by giving him the right crop plan, instant disease detection, easy loan access, and smarter selling decisions.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '18px', fontSize: '26px', color: '#174e1f' }}>Key Features</h2>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {featureCards.map((card) => (
            <div key={card.title} style={{ background: '#ffffff', borderRadius: '20px', padding: '22px', border: '1px solid #e0eddc', minHeight: '160px', boxShadow: '0 10px 28px rgba(26, 86, 28, 0.06)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px', color: '#1E4621' }}>{card.title}</h3>
              <p style={{ margin: 0, color: '#4a5d4a', fontSize: '15px', lineHeight: '1.75' }}>{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '18px', fontSize: '26px', color: '#174e1f' }}>Architecture Diagram</h2>
        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #d4e5d3', background: '#f7faf6' }}>
          <img src={archDiagram} alt="Architecture diagram" style={{ width: '100%', display: 'block', objectFit: 'cover', minHeight: '260px' }} />
          <div style={{ padding: '18px', color: '#4b5b4a', fontSize: '14px' }}>
            <strong>Architecture diagram</strong> — this uses the project image asset so you can replace it with your finalized diagram image when ready.
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '18px', fontSize: '26px', color: '#174e1f' }}>Challenges & Solutions</h2>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {challengeCards.map((item) => (
            <div key={item.challenge} style={{ background: '#f5f9f0', borderRadius: '18px', padding: '18px', border: '1px solid #e2ecd8' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#2f5d2f', fontWeight: '700' }}>{item.challenge}</p>
              <p style={{ marginTop: '10px', color: '#4b5b4a', fontSize: '14px', lineHeight: '1.75' }}>{item.solution}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '18px', fontSize: '26px', color: '#174e1f' }}>Existing Solutions vs FarmPulse</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          {compareRows.map((row) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #e6f0e3' }}>
              <div style={{ fontWeight: '700', color: '#224a1f' }}>{row.label}</div>
              <div style={{ color: '#5c6d5b' }}>{row.existing}</div>
              <div style={{ color: '#2f5d2f', fontWeight: '700' }}>{row.ours}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '18px', fontSize: '26px', color: '#174e1f' }}>Business Model</h2>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '18px', border: '1px solid #e4efe0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px', color: '#2f5d2f' }}>Vendor Commission</h3>
            <p style={{ margin: 0, color: '#4b5b4a', fontSize: '14px', lineHeight: '1.75' }}>A small fee on marketplace transactions for each verified sale.</p>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '18px', border: '1px solid #e4efe0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px', color: '#2f5d2f' }}>Bank Partnerships</h3>
            <p style={{ margin: 0, color: '#4b5b4a', fontSize: '14px', lineHeight: '1.75' }}>Referral income from loan approvals through partner financial institutions.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ background: '#f2faf1', borderRadius: '18px', padding: '22px', border: '1px solid #d7ecda' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '26px', color: '#174e1f' }}>Paradigm Shift</h2>
            <p style={{ margin: 0, color: '#4b5b4a', fontSize: '15px', lineHeight: '1.8' }}>
              Most agri-tech tools give farmers raw information. FarmPulse gives farmers a decision: what to grow, when to treat, and where to sell. It moves the focus from data to action.
            </p>
          </div>

          <div style={{ background: '#f2faf1', borderRadius: '18px', padding: '22px', border: '1px solid #d7ecda' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '26px', color: '#174e1f' }}>Philosophical Shift</h2>
            <p style={{ margin: 0, color: '#4b5b4a', fontSize: '15px', lineHeight: '1.8' }}>
              Farming tools have traditionally been built for buyers and traders. FarmPulse flips that by making the farmer the owner of the product experience, not just the customer.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '26px', color: '#174e1f', textAlign: 'center' }}>Why Farmers Trust FarmPulse</h2>
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Kuldeep Testimonial */}
          <div style={{
            background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
            borderRadius: '20px',
            padding: '28px',
            border: '2px solid #A5D6A7',
            boxShadow: '0 8px 24px rgba(27, 94, 32, 0.1)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '48px' }}>💬</div>
            <div style={{ marginTop: '8px' }}>
              <p style={{ margin: 0, color: '#2d5134', fontSize: '15px', lineHeight: '1.9', fontStyle: 'italic', marginBottom: '18px' }}>
                "As a software engineer and farmer, I know farming needs to be smarter. FarmPulse will transform how I work my fields — with crop recommendations during my breaks, instant disease alerts, and real-time mandi prices. It will free me from guesswork. Instead of spending hours researching, FarmPulse will give me decisions I can trust. Every farmer deserves this power."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#fff'
                }}>K</div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: '#1B5E20' }}>Kuldeep</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#556c55' }}>Software Engineer & Farmer 💻🌾</p>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Card 1 */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #d4e5d3',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>⏱️</p>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#1B5E20', marginBottom: '8px' }}>Save Time</h3>
            <p style={{ margin: 0, color: '#4b5b4a', fontSize: '14px', lineHeight: '1.7' }}>
              Get farming insights in seconds. Decisions that used to take hours now take minutes.
            </p>
          </div>

          {/* Impact Card 2 */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #d4e5d3',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📈</p>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#1B5E20', marginBottom: '8px' }}>Increase Profits</h3>
            <p style={{ margin: 0, color: '#4b5b4a', fontSize: '14px', lineHeight: '1.7' }}>
              Sell at better prices, avoid crop losses. Data-driven decisions lead to better harvests.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
