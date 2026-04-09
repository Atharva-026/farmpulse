import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function LoanGateway() {
  const { t } = useTranslation();

  const loanContext = (() => {
    try { return JSON.parse(sessionStorage.getItem('loanContext') || 'null'); }
    catch { return null; }
  })();

  const [diseaseContext] = useState(loanContext);
  const [form, setForm]  = useState({
    estimatedCost: loanContext?.estimatedCost || 2500,
    landSize: 2,
    diseaseReportId: ''
  });

  useEffect(() => { if (loanContext) sessionStorage.removeItem('loanContext'); }, []);

  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [expanded, setExpanded]         = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState({
    name:'', phone:'', aadhaar:'', address:'', state:'', district:'',
    landSize:2, cropName:'', bankAccount:'', bankName:'', ifsc:''
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/loan/match', { ...form, farmerId:'6650f1c2e1b2c3d4e5f67890' });
      setResult(res.data);
    } catch (err) { setError(t('loan.errors.fetchFail')); }
    setLoading(false);
  };

  const handleApply = (scheme) => { setSelectedScheme(scheme); setShowForm(true); window.scrollTo(0,0); };
  const handlePrint = () => window.print();
  const fd = (key) => (e) => setFarmerDetails({ ...farmerDetails, [key]: e.target.value });

  return (
    <div style={{ maxWidth:'600px', margin:'40px auto', fontFamily:'sans-serif', padding:'0 16px' }}>
      <h2 style={{ margin:'0 0 6px', fontSize:'24px', color:'#1B5E20', fontWeight:'700' }}>💰 {t('loan.title')}</h2>
      <p style={{ color:'#666', margin:'0 0 16px' }}>{t('loan.subtitle')}</p>

      {/* Disease context banner */}
      {diseaseContext?.fromDisease && (
        <div style={{ margin:'0 0 20px', padding:'14px 16px', background:'#FFF3E0', border:'2px solid #FFB74D', borderRadius:'12px' }}>
          <p style={{ margin:'0 0 4px', fontWeight:'700', color:'#E65100', fontSize:'14px' }}>🔬 {t('loan.fromDisease')}</p>
          <p style={{ margin:'0 0 8px', fontSize:'13px', color:'#555' }}>
            {t('loan.fromDiseaseDesc', { crop:diseaseContext.cropName, disease:diseaseContext.diseaseName?.replace(/___/g,' — ').replace(/_/g,' ') })}
          </p>
          <p style={{ margin:0, fontSize:'13px', color:'#555' }}>
            {t('loan.fromDiseaseCost', { cost:diseaseContext.estimatedCost?.toLocaleString() })}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>{t('loan.costLabel')}</label>
        <input type="number" value={form.estimatedCost} onChange={e=>setForm({...form, estimatedCost:Number(e.target.value)})} style={inputStyle} />
        <label style={labelStyle}>{t('loan.landLabel')}</label>
        <input type="number" value={form.landSize} step="0.1" onChange={e=>setForm({...form, landSize:Number(e.target.value)})} style={inputStyle} />
        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? t('loan.findingBtn') : t('loan.findBtn')}
        </button>
      </form>

      {error && <p style={{ color:'red', marginTop:'12px' }}>{error}</p>}

      {result && (
        <div style={{ marginTop:'24px' }}>
          <div style={recommendedBox}>
            <p style={{ margin:'0 0 4px', fontSize:'12px', color:'#1B5E20' }}>{t('loan.bestMatch')}</p>
            <h3 style={{ margin:'0 0 8px', color:'#1B5E20' }}>{result.recommendation.name}</h3>
            <p style={{ margin:'0', fontSize:'14px', color:'#2E7D32' }}>{result.recommendation.provider}</p>
            <div style={{ display:'flex', gap:'16px', marginTop:'12px', flexWrap:'wrap' }}>
              <span style={badgeStyle}>{t('loan.upTo', { amount:result.recommendation.maxAmount.toLocaleString() })}</span>
              <span style={badgeStyle}>{t('loan.interest', { rate:result.recommendation.interestRate })}</span>
              <span style={badgeStyle}>{result.recommendation.processingTime}</span>
            </div>
            <p style={{ marginTop:'12px', fontSize:'14px', color:'#555' }}>{result.recommendation.eligibility.description}</p>
            <p style={{ fontSize:'13px', color:'#555' }}>{t('loan.documents')}: {result.recommendation.documents.join(', ')}</p>
            <button onClick={()=>handleApply(result.recommendation)} style={{ ...applyBtnStyle, border:'none', cursor:'pointer' }}>
              {t('loan.fillForm')}
            </button>
          </div>

          <h3 style={{ marginTop:'24px' }}>{t('loan.allSchemes', { count:result.matchedSchemes.length })}</h3>
          {result.matchedSchemes.map((scheme,i) => (
            <div key={scheme.id} style={schemeCard}>
              <div style={{ display:'flex', justifyContent:'space-between', cursor:'pointer' }} onClick={()=>setExpanded(expanded===i?null:i)}>
                <div>
                  <p style={{ margin:'0', fontWeight:'500' }}>{scheme.name}</p>
                  <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#666' }}>
                    {t('loan.interest', { rate:scheme.interestRate })} · {t('loan.upTo', { amount:scheme.maxAmount.toLocaleString() })}
                  </p>
                </div>
                <span style={{ fontSize:'20px' }}>{expanded===i?'▲':'▼'}</span>
              </div>
              {expanded===i && (
                <div style={{ marginTop:'12px', borderTop:'1px solid #eee', paddingTop:'12px' }}>
                  <p style={{ fontSize:'13px', margin:'4px 0' }}>Provider: <strong>{scheme.provider}</strong></p>
                  <p style={{ fontSize:'13px', margin:'4px 0' }}>Repayment: <strong>{scheme.repaymentPeriod}</strong></p>
                  <p style={{ fontSize:'13px', margin:'4px 0' }}>Processing: <strong>{scheme.processingTime}</strong></p>
                  <p style={{ fontSize:'13px', margin:'4px 0' }}>Documents: <strong>{scheme.documents.join(', ')}</strong></p>
                  <button onClick={()=>handleApply(scheme)} style={{ ...applyBtnStyle, background:'#555', border:'none', cursor:'pointer', marginTop:'8px' }}>
                    {t('loan.fillForm')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Application modal */}
      {showForm && selectedScheme && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:1000, overflowY:'auto', padding:'20px' }}>
          <div style={{ maxWidth:'600px', margin:'40px auto', background:'white', borderRadius:'12px', padding:'32px', fontFamily:'sans-serif' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ margin:0, color:'#1B5E20' }}>{t('loan.applicationTitle')}</h2>
              <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', fontSize:'24px', cursor:'pointer' }}>x</button>
            </div>

            <div style={{ background:'#F1F8E9', border:'1px solid #4CAF50', borderRadius:'8px', padding:'12px', margin:'16px 0' }}>
              <p style={{ margin:0, fontWeight:'500', color:'#2E7D32' }}>{selectedScheme.name}</p>
              <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#555' }}>{selectedScheme.provider}</p>
            </div>
            <p style={{ fontSize:'13px', color:'#888', marginBottom:'20px' }}>Fill in your details below. You can print this form and submit it at your nearest bank or CSC center.</p>

            <h4 style={{ color:'#333', borderBottom:'1px solid #eee', paddingBottom:'8px' }}>{t('loan.personalDetails')}</h4>
            <label style={labelStyle}>{t('loan.fullName')}</label>
            <input style={inputStyle} placeholder={t('loan.fullNamePlaceholder')} value={farmerDetails.name} onChange={fd('name')} />
            <label style={labelStyle}>{t('loan.aadhaar')}</label>
            <input style={inputStyle} placeholder={t('loan.aadhaarPlaceholder')} value={farmerDetails.aadhaar} onChange={fd('aadhaar')} maxLength={12} />
            <label style={labelStyle}>{t('loan.phone')}</label>
            <input style={inputStyle} placeholder={t('loan.phonePlaceholder')} value={farmerDetails.phone} onChange={fd('phone')} />
            <label style={labelStyle}>{t('loan.address')}</label>
            <input style={inputStyle} placeholder={t('loan.addressPlaceholder')} value={farmerDetails.address} onChange={fd('address')} />
            <div style={{ display:'flex', gap:'12px' }}>
              <div style={{ flex:1 }}>
                <label style={labelStyle}>{t('loan.state')}</label>
                <input style={inputStyle} placeholder={t('loan.statePlaceholder')} value={farmerDetails.state} onChange={fd('state')} />
              </div>
              <div style={{ flex:1 }}>
                <label style={labelStyle}>{t('loan.district')}</label>
                <input style={inputStyle} placeholder={t('loan.districtPlaceholder')} value={farmerDetails.district} onChange={fd('district')} />
              </div>
            </div>

            <h4 style={{ color:'#333', borderBottom:'1px solid #eee', paddingBottom:'8px', marginTop:'20px' }}>{t('loan.landCropDetails')}</h4>
            <label style={labelStyle}>{t('loan.landSize')}</label>
            <input style={inputStyle} value={farmerDetails.landSize} onChange={fd('landSize')} />
            <label style={labelStyle}>{t('loan.cropName')}</label>
            <input style={inputStyle} placeholder={t('loan.cropPlaceholder')} value={farmerDetails.cropName} onChange={fd('cropName')} />
            <label style={labelStyle}>{t('loan.treatmentCost')}</label>
            <input style={{ ...inputStyle, background:'#f5f5f5' }} value={form.estimatedCost} disabled />

            <h4 style={{ color:'#333', borderBottom:'1px solid #eee', paddingBottom:'8px', marginTop:'20px' }}>{t('loan.bankDetails')}</h4>
            <label style={labelStyle}>{t('loan.bankAccount')}</label>
            <input style={inputStyle} placeholder={t('loan.bankAccountPlaceholder')} value={farmerDetails.bankAccount} onChange={fd('bankAccount')} />
            <label style={labelStyle}>{t('loan.bankName')}</label>
            <input style={inputStyle} placeholder={t('loan.bankNamePlaceholder')} value={farmerDetails.bankName} onChange={fd('bankName')} />
            <label style={labelStyle}>{t('loan.ifsc')}</label>
            <input style={inputStyle} placeholder={t('loan.ifscPlaceholder')} value={farmerDetails.ifsc} onChange={fd('ifsc')} />

            <div style={{ marginTop:'8px', padding:'12px', background:'#FFF8E1', borderRadius:'8px', fontSize:'13px', color:'#666' }}>
              {t('loan.requiredDocs')}: {selectedScheme.documents.join(', ')}
            </div>

            <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
              <button onClick={handlePrint} style={{ ...btnStyle, flex:1 }}>{t('loan.printBtn')}</button>
              <a href={selectedScheme.applyUrl} target="_blank" rel="noreferrer" style={{ ...applyBtnStyle, flex:1, textAlign:'center' }}>
                {t('loan.applyBtn')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle      = { display:'block', width:'100%', padding:'10px', marginBottom:'16px', marginTop:'4px', borderRadius:'6px', border:'1px solid #ccc', fontSize:'14px', boxSizing:'border-box' };
const labelStyle      = { display:'block', fontSize:'13px', color:'#555', marginBottom:'4px', marginTop:'12px' };
const btnStyle        = { width:'100%', padding:'12px', background:'#2E7D32', color:'white', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer' };
const recommendedBox  = { background:'#F1F8E9', border:'2px solid #4CAF50', borderRadius:'10px', padding:'20px', marginTop:'16px' };
const schemeCard      = { border:'1px solid #ddd', borderRadius:'8px', padding:'16px', marginTop:'12px', background:'#fff' };
const badgeStyle      = { background:'#E8F5E9', color:'#2E7D32', padding:'4px 10px', borderRadius:'20px', fontSize:'13px', fontWeight:'500' };
const applyBtnStyle   = { display:'inline-block', marginTop:'12px', padding:'10px 20px', background:'#2E7D32', color:'white', borderRadius:'6px', textDecoration:'none', fontSize:'14px' };