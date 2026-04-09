import axios from 'axios';
import { useState, useEffect, useRef, useCallback } from 'react';

const API = 'http://localhost:5000/api';

const C = {
  green:'#1B5E20', mid:'#2E7D32', light:'#E8F5E9', pale:'#F1F8E9',
  vendor:'#4527A0', vendorLight:'#EDE7F6',
  amber:'#F57F17', amberLight:'#FFF8E1',
  red:'#C62828', redLight:'#FFEBEE',
  text:'#1a1a1a', sub:'#555', muted:'#888', border:'#E0E0E0',
};

const trendColor = t=>({rising:C.mid,falling:C.red,stable:C.amber}[t]||C.amber);
const trendIcon  = t=>({rising:'▲',falling:'▼',stable:'●'}[t]||'●');

const baseInp = {
  display:'block',width:'100%',padding:'10px 13px',marginTop:'5px',marginBottom:'13px',
  borderRadius:'8px',border:`1px solid ${C.border}`,fontSize:'14px',
  boxSizing:'border-box',background:'#fff',color:C.text,fontFamily:'inherit',outline:'none',
  transition:'border-color 0.2s',
};

const card = {
  border:`1px solid ${C.border}`,borderRadius:'12px',padding:'16px',
  marginBottom:'12px',background:'#fff',boxShadow:'0 1px 6px rgba(0,0,0,0.06)',
};

const lbl = {fontWeight:'600',fontSize:'13px',color:'#333'};

function Btn({variant='green',full,small,style,children,...props}){
  const bg=variant==='green'?C.mid:variant==='vendor'?C.vendor:variant==='danger'?C.red:'#fff';
  const color=variant.startsWith('outline')?(variant==='outline-red'?C.red:C.mid):'#fff';
  const border=variant.startsWith('outline')?`1.5px solid ${variant==='outline-red'?C.red:C.mid}`:'none';
  return <button style={{padding:small?'6px 14px':'10px 20px',border,borderRadius:'8px',cursor:'pointer',
    fontSize:small?'12px':'14px',fontWeight:'600',background:bg,color,
    width:full?'100%':'auto',opacity:props.disabled?0.6:1,
    transition:'opacity 0.15s',fontFamily:'inherit',...style}} {...props}>{children}</button>;
}

function Badge({status}){
  const m={
    pending:{bg:C.amberLight,c:C.amber,t:'⏳ Pending'},
    accepted:{bg:C.light,c:C.mid,t:'✅ Accepted'},
    rejected:{bg:C.redLight,c:C.red,t:'❌ Rejected'},
    withdrawn:{bg:'#F5F5F5',c:'#757575',t:'Withdrawn'},
  };
  const s=m[status]||m.pending;
  return <span style={{background:s.bg,color:s.c,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{s.t}</span>;
}

/* ── Mandi Tab ── */
function MandiTab(){
  const [cropName,setCropName]=useState('tomato');
  const [searchedCrop, setSearchedCrop]=useState('');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const farmerState=localStorage.getItem('farmerState')||'';

  const handleSearch=async(e)=>{
    e.preventDefault();setError('');setResult(null);setLoading(true);
    try{
      const url=farmerState
        ?`${API}/market/prices/${encodeURIComponent(cropName)}?state=${encodeURIComponent(farmerState)}`
        :`${API}/market/prices/${encodeURIComponent(cropName)}`;
      const res=await axios.get(url);
      if(res.data.success){ setResult(res.data); setSearchedCrop(cropName); }
      else setError(res.data.message||'No data found for this crop.');
    }catch{setError('Failed to fetch market prices.');}
    setLoading(false);
  };

  return(
    <div>
      <p style={{color:C.sub,fontSize:'14px',marginBottom:'20px'}}>Compare live mandi rates across India to find the best market for your harvest.</p>
      <form onSubmit={handleSearch} style={{display:'flex',gap:'10px',alignItems:'flex-end',marginBottom:'8px'}}>
        <div style={{flex:1}}>
          <label style={lbl}>Crop Name</label>
          <input style={{...baseInp,marginBottom:0}} value={cropName} onChange={e=>setCropName(e.target.value)}
            placeholder="e.g. tomato, wheat, onion"
            onFocus={e=>e.target.style.borderColor=C.mid} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>
        <Btn type="submit" disabled={loading} style={{whiteSpace:'nowrap'}}>{loading?'Fetching…':'🔍 Get Prices'}</Btn>
      </form>

      {error&&<p style={{color:C.red,background:C.redLight,padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginTop:'12px'}}>{error}</p>}

      {result&&(
        <div style={{marginTop:'24px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'20px',
            fontSize:'12px',fontWeight:'600',marginBottom:'16px',
            background:result.isLive?C.light:C.amberLight,color:result.isLive?C.mid:C.amber}}>
            <span style={{width:'7px',height:'7px',borderRadius:'50%',background:result.isLive?C.mid:C.amber,display:'inline-block'}}/>
            {result.isLive?'Live Agmarknet Data':'Reference Data — add API key for live prices'}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'20px'}}>
            {[
              {label:'Avg Price',value:`₹${result.avgPrice}`},
              {label:'Price Spread',value:`₹${result.priceVariation}`},
              {label:'Rising',value:result.risingCount,color:C.mid},
              {label:'Falling',value:result.fallingCount,color:C.red},
            ].map((s,i)=>(
              <div key={i} style={{background:C.pale,borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                <p style={{margin:0,fontSize:'18px',fontWeight:'700',color:s.color||C.text}}>{s.value}</p>
                <p style={{margin:'2px 0 0',fontSize:'11px',color:C.muted}}>{s.label}</p>
              </div>
            ))}
          </div>

          {result.advice&&(
            <div style={{background:C.light,border:`1px solid #A5D6A7`,borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',fontSize:'13px',color:C.green}}>
              💡 <strong>Recommendation:</strong> {result.advice}
            </div>
          )}

          {result.mandis.length === 0 ? (
            <div style={{background:'#FFF8E1',border:`1px solid ${C.amberLight}`,borderRadius:'12px',padding:'18px',marginTop:'12px',color:C.sub}}>
              No mandi prices found for <strong>{searchedCrop}</strong> yet. Try a different crop name or check back later.
            </div>
          ) : result.mandis.map((m,i)=>{
            const isLocal=farmerState&&m.state?.toLowerCase().includes(farmerState.toLowerCase());
            const prevIsLocal=i>0&&farmerState&&result.mandis[i-1].state?.toLowerCase().includes(farmerState.toLowerCase());
            return(
              <div key={i}>
                {i===0&&isLocal&&<p style={{fontSize:'12px',color:C.mid,fontWeight:'700',margin:'0 0 8px'}}>📍 Nearby Mandis ({farmerState})</p>}
                {!isLocal&&(prevIsLocal||i===0)&&farmerState&&<p style={{fontSize:'12px',color:C.muted,fontWeight:'600',margin:'16px 0 8px'}}>🗺️ Other Mandis</p>}
                <div style={{...card,borderLeft:`4px solid ${trendColor(m.trend)}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <p style={{margin:0,fontWeight:'600',fontSize:'15px'}}>{m.mandi}</p>
                      <p style={{margin:'2px 0 0',fontSize:'12px',color:C.sub}}>{m.state}</p>
                      {m.minPrice!=null&&<p style={{margin:'2px 0 0',fontSize:'11px',color:C.muted}}>₹{m.minPrice}–₹{m.maxPrice}</p>}
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{margin:0,fontSize:'21px',fontWeight:'700',color:C.text}}>₹{m.price}</p>
                      <p style={{margin:0,fontSize:'12px',color:trendColor(m.trend)}}>{trendIcon(m.trend)} {m.trend}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor buy offers for this crop */}
      <VendorBuyOffers cropName={searchedCrop} />
    </div>
  );
}

/* ── Vendor Buy Offers panel (shown inside Mandi tab) ── */
function VendorBuyOffers({ cropName }) {
  const [offers, setOffers]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [interestModal, setInterestModal] = useState(null);
  const [phone, setPhone]       = useState(localStorage.getItem('farmerPhone') || '');
  const [iMsg, setIMsg]         = useState('');
  const [iErr, setIErr]         = useState('');
  const [iSuccess, setISuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (crop) => {
    if (!crop) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API}/vendor-listings`, { params: { crop } });
      setOffers(r.data.listings || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (cropName) load(cropName); }, [cropName, load]);

  const expressInterest = async (e) => {
    e.preventDefault(); setIErr(''); setISuccess(''); setSubmitting(true);
    try {
      const r = await axios.post(`${API}/vendor-listings/${interestModal._id}/interest`, {
        farmerPhone: phone, message: iMsg,
        farmerId: localStorage.getItem('farmerId') || undefined
      });
      if (r.data.success) {
        localStorage.setItem('farmerPhone', phone);
        setISuccess('✅ Interest sent! The vendor will call you.');
        setTimeout(() => { setInterestModal(null); setISuccess(''); }, 2500);
      } else setIErr(r.data.message);
    } catch (ex) { setIErr(ex.response?.data?.message || 'Failed to send.'); }
    setSubmitting(false);
  };

  if (!cropName) return null;

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: '16px', color: C.vendor }}>🤝 Vendors Buying {cropName.charAt(0).toUpperCase() + cropName.slice(1)}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: C.muted }}>Vendors actively looking to buy — express interest and they'll contact you directly</p>
        </div>
        <Btn small variant="outline" onClick={() => load(cropName)}>🔄</Btn>
      </div>

      {loading ? (
        <p style={{ color: C.muted, fontSize: '13px' }}>Looking for vendor buy offers…</p>
      ) : offers.length === 0 ? (
        <div style={{ background: '#F8F5FF', borderRadius: '10px', padding: '20px', textAlign: 'center', color: C.muted, fontSize: '13px' }}>
          No vendor buy offers for <strong>{cropName}</strong> right now. Check back later or post a listing in the Sell to Vendor tab.
        </div>
      ) : (
        offers.map(offer => {
          const isExpiringSoon = offer.validUntil && (new Date(offer.validUntil) - new Date()) < 86400000 * 2;
          return (
            <div key={offer._id} style={{ ...card, borderLeft: `4px solid ${C.vendor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>
                      {offer.vendorId?.businessName || offer.vendorId?.name}
                    </p>
                    {isExpiringSoon && (
                      <span style={{ background: C.amberLight, color: C.amber, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>
                        Expires soon
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 3px', fontSize: '12px', color: C.sub }}>
                    Needs <strong>{offer.quantityNeeded} qtl</strong>
                    {offer.district && ` · 📍 ${offer.district}`}
                    {offer.state && `, ${offer.state}`}
                  </p>
                  {offer.notes && <p style={{ margin: '6px 0 0', fontSize: '12px', color: C.muted, fontStyle: 'italic' }}>{offer.notes}</p>}
                  {offer.validUntil && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.muted }}>
                      Valid till {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#bbb' }}>
                    {offer.interestedFarmers?.length || 0} farmer{offer.interestedFarmers?.length !== 1 ? 's' : ''} interested
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: '0 0 1px', fontSize: '24px', fontWeight: '800', color: C.vendor }}>₹{offer.offeredPrice}</p>
                  <p style={{ margin: '0 0 10px', fontSize: '11px', color: C.muted }}>per quintal</p>
                  <Btn small variant="vendor" onClick={() => { setInterestModal(offer); setIErr(''); setISuccess(''); }}>
                    ✋ I'm interested
                  </Btn>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Interest modal */}
      {interestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: C.vendor, fontSize: '17px' }}>Express Interest</h3>
              <button onClick={() => setInterestModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: C.muted }}>✕</button>
            </div>
            <div style={{ background: '#F8F5FF', borderRadius: '10px', padding: '12px', marginBottom: '18px' }}>
              <p style={{ margin: '0 0 2px', fontWeight: '700' }}>{interestModal.vendorId?.businessName}</p>
              <p style={{ margin: 0, fontSize: '13px', color: C.sub }}>
                Buying {interestModal.cropName} at <strong style={{ color: C.vendor }}>₹{interestModal.offeredPrice}/qtl</strong>
                {' · '}{interestModal.quantityNeeded} qtl needed
              </p>
            </div>
            {iSuccess ? (
              <p style={{ color: C.mid, background: C.light, padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>{iSuccess}</p>
            ) : (
              <form onSubmit={expressInterest}>
                {iErr && <p style={{ color: C.red, background: C.redLight, padding: '8px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' }}>{iErr}</p>}
                <label style={lbl}>Your Phone Number *</label>
                <input style={{ ...baseInp, borderColor: '#D1C4E9' }} value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Vendor will call you on this number" required
                  onFocus={e => e.target.style.borderColor = C.vendor} onBlur={e => e.target.style.borderColor = '#D1C4E9'} />
                <label style={lbl}>Message (optional)</label>
                <textarea style={{ ...baseInp, height: '60px', resize: 'vertical', borderColor: '#D1C4E9' }}
                  value={iMsg} onChange={e => setIMsg(e.target.value)}
                  placeholder="Quantity available, location, when you can deliver…"
                  onFocus={e => e.target.style.borderColor = C.vendor} onBlur={e => e.target.style.borderColor = '#D1C4E9'} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <Btn type="button" variant="outline" onClick={() => setInterestModal(null)}>Cancel</Btn>
                  <Btn type="submit" full variant="vendor" disabled={submitting}>{submitting ? 'Sending…' : '✋ Send Interest'}</Btn>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Bids View ── */
function BidsView({listing,onBack}){
  const [bids,setBids]=useState([]);
  const [mandiAvg,setMandiAvg]=useState(null);
  const [lastUpdated,setLastUpdated]=useState(new Date());
  const [secsAgo,setSecsAgo]=useState(0);
  const [newBidFlash,setNewBidFlash]=useState(false);
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');
  const [toast,setToast]=useState('');
  const esRef=useRef(null);
  const pollRef=useRef(null);

  const showToast=useCallback((text)=>{setToast(text);setTimeout(()=>setToast(''),4000);},[]);

  const fetchBids=useCallback(async()=>{
    try{
      const r=await axios.get(`${API}/bids/listing/${listing._id}`);
      if(r.data.success){
        setBids(prev=>{
          if(r.data.bids.length>prev.length){setNewBidFlash(true);setTimeout(()=>setNewBidFlash(false),2000);}
          return r.data.bids;
        });
        setLastUpdated(new Date());
      }
    }catch{}
  },[listing._id]);

  useEffect(()=>{
    // fetch mandi avg for comparison
    axios.get(`${API}/market/prices/${encodeURIComponent(listing.cropName)}`)
      .then(r=>{if(r.data.success)setMandiAvg(r.data.avgPrice);}).catch(()=>{});
    fetchBids();
  },[listing._id,listing.cropName,fetchBids]);

  // SSE real-time updates
  useEffect(()=>{
    const es=new EventSource(`${API}/bids/stream/${listing._id}`);
    esRef.current=es;
    es.onmessage=(e)=>{
      const data=JSON.parse(e.data);
      if(data.type==='NEW_BID'){fetchBids();showToast(`🔔 New bid: ₹${data.offeredPrice}/qtl`);}
      else if(data.type==='BID_STATUS'){fetchBids();}
    };
    es.onerror=()=>{
      es.close();
      pollRef.current=setInterval(fetchBids,15000); // fallback polling
    };
    return()=>{es.close();if(pollRef.current)clearInterval(pollRef.current);};
  },[listing._id,fetchBids,showToast]);

  // seconds-ago ticker
  useEffect(()=>{
    const t=setInterval(()=>setSecsAgo(Math.floor((new Date()-lastUpdated)/1000)),1000);
    return()=>clearInterval(t);
  },[lastUpdated]);

  const bidAction=async(bidId,status)=>{
    setErr('');
    try{
      await axios.put(`${API}/bids/${bidId}/status`,{status});
      fetchBids();
      if(status==='accepted'){setMsg('🎉 Bid accepted! The vendor will contact you shortly.');showToast('🎉 Deal confirmed!');}
    }catch{setErr('Action failed. Please try again.');}
  };

  const pendingBids=bids.filter(b=>b.status==='pending').sort((a,b)=>b.offeredPrice-a.offeredPrice);
  const otherBids=bids.filter(b=>b.status!=='pending');
  const sortedBids=[...pendingBids,...otherBids];
  const bestBid=pendingBids[0];

  return(
    <div>
      {toast&&(
        <div style={{position:'fixed',top:'80px',right:'20px',zIndex:999,
          background:C.green,color:'#fff',padding:'12px 20px',borderRadius:'10px',
          fontSize:'14px',fontWeight:'600',boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
          animation:'slideIn 0.3s ease'}}>
          {toast}
        </div>
      )}
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

      <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',color:C.sub,fontSize:'14px',padding:'0 0 16px',fontFamily:'inherit'}}>
        ← Back to my listings
      </button>

      {/* Listing summary */}
      <div style={{...card,borderLeft:`4px solid ${C.mid}`,background:C.pale,marginBottom:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <p style={{margin:'0 0 2px',fontWeight:'700',fontSize:'17px',color:C.green}}>
              {listing.cropName.charAt(0).toUpperCase()+listing.cropName.slice(1)} — {listing.quantity} qtl
            </p>
            <p style={{margin:'0 0 4px',color:C.sub,fontSize:'13px'}}>
              {listing.district&&`${listing.district}, `}{listing.state}{listing.quality&&` · Grade ${listing.quality}`}
            </p>
            {listing.askingPrice&&(
              <p style={{margin:0,fontSize:'13px',color:C.muted}}>
                Your asking price: <strong style={{color:C.text}}>₹{listing.askingPrice}/qtl</strong>
              </p>
            )}
          </div>
          <div style={{textAlign:'right',fontSize:'12px',color:C.muted}}>
            <p style={{margin:0}}>Updated {secsAgo}s ago</p>
            <p style={{margin:'2px 0 0',color:C.mid,fontWeight:'600'}}>● Live</p>
          </div>
        </div>
      </div>

      {/* Mandi comparison */}
      {mandiAvg&&(
        <div style={{background:'#E3F2FD',border:'1px solid #90CAF9',borderRadius:'10px',padding:'12px 16px',marginBottom:'16px'}}>
          <p style={{margin:0,fontSize:'13px',color:'#0D47A1'}}>
            📊 <strong>Mandi avg for {listing.cropName}:</strong> ₹{mandiAvg}/qtl
            {bestBid&&(
              <strong style={{color:bestBid.offeredPrice>=mandiAvg?C.mid:C.red}}>
                {' · '}Best bid is ₹{Math.abs(bestBid.offeredPrice-mandiAvg)} {bestBid.offeredPrice>=mandiAvg?'above ↑ mandi':'below ↓ mandi'}
              </strong>
            )}
          </p>
        </div>
      )}

      {msg&&<div style={{background:C.light,border:`1px solid #A5D6A7`,borderRadius:'10px',padding:'12px 16px',marginBottom:'16px',fontSize:'13px',color:C.green}}>{msg}</div>}
      {err&&<p style={{color:C.red,fontSize:'13px',marginBottom:'12px'}}>{err}</p>}

      {/* Bids header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
        <h3 style={{margin:0,fontSize:'15px',color:C.text}}>
          Vendor Bids{' '}
          <span style={{marginLeft:'8px',background:newBidFlash?C.mid:C.border,color:newBidFlash?'#fff':C.sub,
            padding:'2px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'700',transition:'background 0.4s'}}>
            {bids.length} total · {pendingBids.length} pending
          </span>
        </h3>
        <Btn small variant="outline" onClick={fetchBids}>🔄 Refresh</Btn>
      </div>

      {sortedBids.length===0?(
        <div style={{textAlign:'center',padding:'48px 20px',background:'#FAFAFA',borderRadius:'12px',color:C.muted}}>
          <p style={{fontSize:'32px',margin:'0 0 10px'}}>⏳</p>
          <p style={{margin:0,fontSize:'14px'}}>No bids yet. Vendors browsing the marketplace will place offers here.</p>
          <p style={{margin:'8px 0 0',fontSize:'12px',color:'#bbb'}}>This page auto-refreshes in real time.</p>
        </div>
      ):sortedBids.map((bid,i)=>{
        const diff=mandiAvg?bid.offeredPrice-mandiAvg:null;
        const isTopBid=bid.status==='pending'&&i===0;
        return(
          <div key={bid._id} style={{...card,
            borderLeft:`4px solid ${bid.status==='accepted'?C.mid:bid.status==='rejected'?C.red:isTopBid?C.amber:C.border}`,
            background:isTopBid?'#FFFDE7':'#fff'}}>
            {isTopBid&&<p style={{margin:'0 0 10px',fontSize:'11px',fontWeight:'700',color:C.amber,letterSpacing:'0.5px'}}>⭐ HIGHEST OFFER</p>}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px'}}>
              <div style={{flex:1}}>
                <p style={{margin:'0 0 2px',fontWeight:'700',fontSize:'15px'}}>{bid.vendorId?.businessName||bid.vendorId?.name||'Vendor'}</p>
                <p style={{margin:'0 0 4px',fontSize:'12px',color:C.sub}}>
                  {bid.vendorId?.location?.city||bid.vendorId?.location?.state||''}
                  {bid.vendorId?.phone&&<span style={{color:C.vendor}}> · 📞 {bid.vendorId.phone}</span>}
                </p>
                <p style={{margin:'0 0 4px',fontSize:'12px',color:C.muted}}>
                  Wants: <strong style={{color:C.text}}>{bid.quantityNeeded} qtl</strong> of your {listing.quantity} qtl
                </p>
                {bid.message&&<p style={{margin:'6px 0 0',fontSize:'13px',color:C.sub,fontStyle:'italic',background:'#F9F9F9',padding:'8px 10px',borderRadius:'6px'}}>"{bid.message}"</p>}
                <p style={{margin:'8px 0 0',fontSize:'11px',color:'#bbb'}}>
                  {new Date(bid.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                </p>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <p style={{margin:'0 0 1px',fontSize:'24px',fontWeight:'800',color:bid.status==='accepted'?C.mid:C.text}}>₹{bid.offeredPrice}</p>
                <p style={{margin:'0 0 6px',fontSize:'11px',color:C.muted}}>per quintal</p>
                {diff!==null&&bid.status==='pending'&&(
                  <p style={{margin:'0 0 8px',fontSize:'11px',fontWeight:'700',color:diff>=0?C.mid:C.red}}>
                    {diff>=0?'▲':'▼'} ₹{Math.abs(diff)} vs mandi
                  </p>
                )}
                <Badge status={bid.status}/>
              </div>
            </div>
            {bid.status==='pending'&&(
              <div style={{display:'flex',gap:'8px',marginTop:'12px',paddingTop:'12px',borderTop:`1px solid ${C.border}`}}>
                <Btn full onClick={()=>bidAction(bid._id,'accepted')} style={{flex:2}}>✓ Accept this bid</Btn>
                <Btn full variant="outline-red" onClick={()=>bidAction(bid._id,'rejected')} style={{flex:1}}>✕ Reject</Btn>
              </div>
            )}
            {bid.status==='accepted'&&bid.vendorId?.phone&&(
              <div style={{marginTop:'12px',background:C.light,borderRadius:'8px',padding:'10px 12px'}}>
                <p style={{margin:0,fontSize:'13px',color:C.green,fontWeight:'600'}}>Deal confirmed! Contact vendor: 📞 {bid.vendorId.phone}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Vendor Sell Tab ── */
function VendorSellTab(){
  const [step,setStep]=useState('listings');
  const [form,setForm]=useState({cropName:'',quantity:'',askingPrice:'',quality:'A',location:'',state:'',district:'',farmerPhone:'',description:''});
  const [activeListing,setActiveListing]=useState(null);
  const [myListings,setMyListings]=useState([]);
  const [listingsLoading,setListingsLoading]=useState(true);
  const [pendingCounts,setPendingCounts]=useState({});
  const [postLoading,setPostLoading]=useState(false);
  const [err,setErr]=useState('');
  const farmerId=localStorage.getItem('farmerId')||null;
  const hc=k=>e=>setForm({...form,[k]:e.target.value});

  const fetchMyListings=useCallback(async()=>{
    setListingsLoading(true);
    try{
      const endpoint=farmerId?`${API}/market/listings/farmer/${farmerId}`:`${API}/market/listings`;
      const r=await axios.get(endpoint);
      const list=r.data.listings||[];
      setMyListings(list);
      const counts={};
      await Promise.all(list.filter(l=>l.status==='active').map(async l=>{
        try{const br=await axios.get(`${API}/bids/summary/${l._id}`);if(br.data.success)counts[l._id]=br.data.pending;}catch{}
      }));
      setPendingCounts(counts);
    }catch{setErr('Could not load your listings.');}
    setListingsLoading(false);
  },[farmerId]);

  useEffect(()=>{fetchMyListings();},[fetchMyListings]);

  const submitListing=async(e)=>{
    e.preventDefault();setErr('');setPostLoading(true);
    try{
      const res=await axios.post(`${API}/market/list`,{...form,farmerId,quantity:Number(form.quantity),askingPrice:form.askingPrice?Number(form.askingPrice):undefined});
      if(res.data.success){await fetchMyListings();setActiveListing(res.data.listing);setStep('bids');}
      else setErr(res.data.message||'Failed to post listing.');
    }catch{setErr('Failed to post listing. Please try again.');}
    setPostLoading(false);
  };

  const statusColor=s=>({active:C.mid,sold:'#1565C0',expired:C.muted}[s]||C.muted);
  const statusLabel=s=>({active:'● Active',sold:'● Sold',expired:'○ Expired'}[s]||s);

  if(step==='listings') return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <p style={{margin:0,color:C.sub,fontSize:'14px'}}>Post your harvest — vendors will bid directly. No commission, no middleman.</p>
        <Btn onClick={()=>{setErr('');setStep('form');}}>+ New Listing</Btn>
      </div>
      {err&&<p style={{color:C.red,fontSize:'13px',marginBottom:'12px'}}>{err}</p>}
      {listingsLoading?(
        <div style={{textAlign:'center',padding:'48px',color:C.muted}}>Loading your listings…</div>
      ):myListings.length===0?(
        <div style={{textAlign:'center',padding:'56px 20px',background:'#FAFAFA',borderRadius:'16px',color:C.muted}}>
          <p style={{fontSize:'36px',margin:'0 0 12px'}}>🌾</p>
          <p style={{margin:'0 0 6px',fontSize:'16px',fontWeight:'600',color:C.text}}>No listings yet</p>
          <p style={{margin:'0 0 20px',fontSize:'14px'}}>Post your first crop listing to start receiving vendor bids.</p>
          <Btn onClick={()=>setStep('form')}>+ Post your first listing</Btn>
        </div>
      ):myListings.map(l=>{
        const pending=pendingCounts[l._id]||0;
        return(
          <div key={l._id} style={{...card,cursor:l.status==='active'?'pointer':'default',opacity:l.status!=='active'?0.7:1}}
            onClick={()=>{if(l.status==='active'){setActiveListing(l);setStep('bids');}}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                  <p style={{margin:0,fontWeight:'700',fontSize:'16px'}}>{l.cropName.charAt(0).toUpperCase()+l.cropName.slice(1)}</p>
                  {l.quality&&<span style={{background:C.pale,color:C.mid,padding:'2px 8px',borderRadius:'10px',fontSize:'11px',fontWeight:'700'}}>Grade {l.quality}</span>}
                  <span style={{fontSize:'12px',fontWeight:'600',color:statusColor(l.status)}}>{statusLabel(l.status)}</span>
                </div>
                <p style={{margin:'0 0 4px',fontSize:'13px',color:C.sub}}>
                  {l.quantity} qtl{l.district&&` · ${l.district}`}{l.state&&`, ${l.state}`}
                </p>
                <p style={{margin:0,fontSize:'12px',color:C.muted}}>
                  Posted {new Date(l.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </p>
              </div>
              <div style={{textAlign:'right'}}>
                {l.askingPrice&&<><p style={{margin:'0 0 2px',fontSize:'20px',fontWeight:'800',color:C.text}}>₹{l.askingPrice}</p><p style={{margin:'0 0 8px',fontSize:'11px',color:C.muted}}>asking/qtl</p></>}
                <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:'6px'}}>
                  {pending>0&&<span style={{background:C.amber,color:'#fff',borderRadius:'50%',width:'20px',height:'20px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'700'}}>{pending}</span>}
                  <span style={{fontSize:'13px',color:C.sub}}>{l.bidCount||0} bid{l.bidCount!==1?'s':''}</span>
                  {l.status==='active'&&<span style={{color:C.muted,fontSize:'16px'}}>→</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if(step==='form') return(
    <div>
      <button onClick={()=>setStep('listings')} style={{background:'none',border:'none',cursor:'pointer',color:C.sub,fontSize:'14px',padding:'0 0 16px',fontFamily:'inherit'}}>← Back to my listings</button>
      <h3 style={{margin:'0 0 4px',fontSize:'17px',color:C.green}}>Post a New Crop Listing</h3>
      <p style={{margin:'0 0 20px',fontSize:'13px',color:C.sub}}>Fill in the details — vendors will see this and place competitive bids.</p>
      {err&&<p style={{color:C.red,fontSize:'13px',background:C.redLight,padding:'10px 14px',borderRadius:'8px',marginBottom:'12px'}}>{err}</p>}
      <form onSubmit={submitListing}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
          {[
            {k:'cropName',l:'Crop Name *',p:'e.g. Tomato, Wheat',req:true},
            {k:'quantity',l:'Quantity (quintals) *',p:'e.g. 50',t:'number',req:true},
            {k:'askingPrice',l:'Asking Price (₹/qtl)',p:'Leave blank to accept any offer',t:'number'},
            {k:'farmerPhone',l:'Your Phone (for vendor contact)',p:'10-digit mobile'},
            {k:'state',l:'State',p:'e.g. Karnataka'},
            {k:'district',l:'District',p:'e.g. Bengaluru Rural'},
            {k:'location',l:'Village / Area',p:'e.g. Devanahalli'},
          ].map(f=>(
            <div key={f.k}>
              <label style={lbl}>{f.l}</label>
              <input style={baseInp} type={f.t||'text'} value={form[f.k]} onChange={hc(f.k)}
                placeholder={f.p} required={!!f.req}
                onFocus={e=>e.target.style.borderColor=C.mid} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
          ))}
          <div>
            <label style={lbl}>Quality Grade</label>
            <select style={baseInp} value={form.quality} onChange={hc('quality')}>
              <option value="A">Grade A — Premium</option>
              <option value="B">Grade B — Standard</option>
              <option value="C">Grade C — Economy</option>
            </select>
          </div>
        </div>
        <label style={lbl}>Additional Notes</label>
        <textarea style={{...baseInp,height:'72px',resize:'vertical'}} value={form.description} onChange={hc('description')}
          placeholder="Variety, harvest date, storage info, transport available…"
          onFocus={e=>e.target.style.borderColor=C.mid} onBlur={e=>e.target.style.borderColor=C.border}/>
        <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
          <Btn type="button" variant="outline" onClick={()=>setStep('listings')}>Cancel</Btn>
          <Btn type="submit" full disabled={postLoading}>{postLoading?'Posting…':'📢 Post to vendor marketplace'}</Btn>
        </div>
      </form>
    </div>
  );

  if(step==='bids'&&activeListing) return(
    <BidsView listing={activeListing} onBack={()=>{fetchMyListings();setStep('listings');}}/>
  );

  return null;
}

/* ── Main SmartSell ── */
export default function SmartSell(){
  const [tab,setTab]=useState('mandi');
  const tabStyle=active=>({
    padding:'9px 22px',border:'none',cursor:'pointer',fontSize:'14px',
    fontWeight:active?'700':'500',background:active?'#fff':'transparent',
    color:active?C.green:C.muted,borderRadius:'8px',
    boxShadow:active?'0 1px 4px rgba(0,0,0,0.1)':'none',
    transition:'all 0.2s',fontFamily:'inherit',
  });
  return(
    <div style={{maxWidth:'780px',margin:'0 auto',padding:'32px 16px 80px',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{marginBottom:'28px'}}>
        <h2 style={{margin:'0 0 4px',fontSize:'24px',color:C.green,fontWeight:'700'}}>Smart Sell</h2>
        <p style={{margin:0,color:C.muted,fontSize:'14px'}}>Two ways to sell — choose what works best for your harvest</p>
      </div>
      <div style={{display:'flex',gap:'4px',marginBottom:'24px',background:'#F5F5F5',padding:'5px',borderRadius:'12px',width:'fit-content'}}>
        <button style={tabStyle(tab==='mandi')} onClick={()=>setTab('mandi')}>🏪 Mandi Prices</button>
        <button style={tabStyle(tab==='vendor')} onClick={()=>setTab('vendor')}>🤝 Sell to Vendor</button>
      </div>
      {tab==='mandi'
        ?<div style={{background:C.light,borderRadius:'10px',padding:'11px 16px',marginBottom:'22px',fontSize:'13px',color:C.green,display:'flex',alignItems:'center',gap:'8px'}}>
          <span>📊</span><span><strong>Mandi mode</strong> — Check live rates. Sell at the highest-priced market.</span></div>
        :<div style={{background:C.vendorLight,borderRadius:'10px',padding:'11px 16px',marginBottom:'22px',fontSize:'13px',color:C.vendor,display:'flex',alignItems:'center',gap:'8px'}}>
          <span>🤝</span><span><strong>Vendor mode</strong> — Post your crop. Buyers compete with bids. You pick the best offer.</span></div>
      }
      {tab==='mandi'?<MandiTab/>:<VendorSellTab/>}
    </div>
  );
}