import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const C = {
  vendor:'#4527A0', vendorMid:'#5E35B1', vendorLight:'#EDE7F6', vendorPale:'#F8F5FF',
  green:'#2E7D32', greenLight:'#E8F5E9',
  amber:'#F57F17', amberLight:'#FFF8E1',
  red:'#C62828', redLight:'#FFEBEE',
  text:'#1a1a1a', sub:'#555', muted:'#888', border:'#E8E0F7',
};

const inp = {
  display:'block', width:'100%', padding:'11px 14px', marginTop:'6px', marginBottom:'14px',
  borderRadius:'8px', border:`1px solid ${C.border}`, fontSize:'14px',
  boxSizing:'border-box', background:'#fff', color:C.text, fontFamily:'inherit', outline:'none',
  transition:'border-color 0.2s',
};
const card = {
  border:`1px solid ${C.border}`, borderRadius:'12px', padding:'18px',
  marginBottom:'12px', background:'#fff', boxShadow:'0 2px 8px rgba(69,39,160,0.06)',
};
const lbl = { fontWeight:'600', fontSize:'13px', color:'#333' };

function Btn({variant='vendor',full,small,style,children,...props}){
  const bg = variant==='vendor'?C.vendor : variant==='green'?C.green : variant==='danger'?C.red : '#fff';
  const color = variant.startsWith('outline') ? (variant==='outline-red'?C.red:C.vendor) : '#fff';
  const border = variant.startsWith('outline') ? `1.5px solid ${variant==='outline-red'?C.red:C.vendor}` : 'none';
  return <button style={{
    padding:small?'6px 14px':'10px 20px', border, borderRadius:'8px', cursor:'pointer',
    fontSize:small?'12px':'14px', fontWeight:'600', background:bg, color,
    width:full?'100%':'auto', opacity:props.disabled?0.6:1,
    transition:'opacity 0.15s', fontFamily:'inherit', ...style
  }} {...props}>{children}</button>;
}

function Badge({status}){
  const m={
    pending:{bg:C.amberLight,c:C.amber,t:'⏳ Pending'},
    accepted:{bg:C.greenLight,c:C.green,t:'✅ Accepted'},
    rejected:{bg:C.redLight,c:C.red,t:'❌ Rejected'},
    withdrawn:{bg:'#F5F5F5',c:'#757575',t:'Withdrawn'},
  };
  const s=m[status]||m.pending;
  return <span style={{background:s.bg,color:s.c,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{s.t}</span>;
}

function Toast({message,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,4000);return()=>clearTimeout(t);},[onDone]);
  const isGood = message.includes('✅')||message.includes('🎉');
  return(
    <div style={{
      position:'fixed',top:'80px',right:'20px',zIndex:9999,
      background:isGood?C.green:C.red, color:'#fff',
      padding:'13px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:'600',
      boxShadow:'0 6px 24px rgba(0,0,0,0.25)', maxWidth:'300px',
      animation:'toastIn 0.3s ease',
    }}>
      {message}
    </div>
  );
}

/* ── Auth Screen ── */
function AuthScreen({onLogin}){
  const [mode,setMode]=useState('login');
  const [form,setForm]=useState({phone:'',name:'',businessName:'',email:'',state:'',city:'',preferredCrops:''});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState('');
  const hc=k=>e=>setForm({...form,[k]:e.target.value});

  const handleSubmit=async(e)=>{
    e.preventDefault();setErr('');setLoading(true);
    try{
      if(mode==='login'){
        const res=await axios.post(`${API}/vendor/login`,{phone:form.phone});
        if(res.data.success)onLogin(res.data.vendor);
        else setErr(res.data.message||'Login failed.');
      }else{
        const crops=form.preferredCrops.split(',').map(s=>s.trim()).filter(Boolean);
        const res=await axios.post(`${API}/vendor/register`,{
          name:form.name,businessName:form.businessName,
          phone:form.phone,email:form.email,
          location:{state:form.state,city:form.city},
          preferredCrops:crops
        });
        if(res.data.success)onLogin(res.data.vendor);
        else setErr(res.data.message||'Registration failed.');
      }
    }catch(ex){setErr(ex.response?.data?.message||'Something went wrong.');}
    setLoading(false);
  };

  return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg, #EDE7F6 0%, #F3E5F5 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'#fff',borderRadius:'20px',padding:'40px',maxWidth:'440px',width:'100%',boxShadow:'0 8px 40px rgba(69,39,160,0.12)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontSize:'36px',marginBottom:'8px'}}>🏢</div>
          <h1 style={{margin:0,fontSize:'22px',color:C.vendor,fontWeight:'800'}}>FarmPulse Vendor</h1>
          <p style={{margin:'6px 0 0',color:C.muted,fontSize:'13px'}}>Buy directly from farmers. Better price, fresh produce.</p>
        </div>
        <div style={{display:'flex',background:C.vendorLight,borderRadius:'10px',padding:'4px',marginBottom:'24px'}}>
          {['login','register'].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{
              flex:1,border:'none',cursor:'pointer',padding:'9px',borderRadius:'8px',
              fontSize:'13px',fontWeight:mode===m?'700':'400',
              background:mode===m?C.vendor:'transparent',
              color:mode===m?'#fff':C.sub,transition:'all 0.15s',fontFamily:'inherit'
            }}>{m==='login'?'Log In':'Register'}</button>
          ))}
        </div>
        {err&&<p style={{color:C.red,background:C.redLight,padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'14px'}}>{err}</p>}
        <form onSubmit={handleSubmit}>
          {mode==='register'&&(
            <>
              <label style={lbl}>Your Name *</label>
              <input style={inp} value={form.name} onChange={hc('name')} placeholder="Full name" required
                onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
              <label style={lbl}>Business Name *</label>
              <input style={inp} value={form.businessName} onChange={hc('businessName')} placeholder="Company / shop name" required
                onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" value={form.email} onChange={hc('email')} placeholder="Optional"
                onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
                <div><label style={lbl}>State</label><input style={inp} value={form.state} onChange={hc('state')} placeholder="Karnataka"
                  onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/></div>
                <div><label style={lbl}>City</label><input style={inp} value={form.city} onChange={hc('city')} placeholder="Bengaluru"
                  onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/></div>
              </div>
              <label style={lbl}>Preferred Crops (comma-separated)</label>
              <input style={inp} value={form.preferredCrops} onChange={hc('preferredCrops')} placeholder="tomato, onion, potato"
                onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
            </>
          )}
          <label style={lbl}>Phone Number *</label>
          <input style={inp} value={form.phone} onChange={hc('phone')} placeholder="10-digit mobile" required
            onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          <Btn type="submit" full disabled={loading} style={{marginTop:'4px'}}>
            {loading?'Please wait…':mode==='login'?'🔑 Log In':'✅ Create Account'}
          </Btn>
        </form>
      </div>
    </div>
  );
}

/* ── Browse Listings ── */
function BrowseListings({vendor}){
  const [listings,setListings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filters,setFilters]=useState({crop:'',state:'',minQty:'',maxPrice:'',sort:'newest'});
  const [bidModal,setBidModal]=useState(null);
  const [bidForm,setBidForm]=useState({offeredPrice:'',quantityNeeded:'',message:''});
  const [bidLoading,setBidLoading]=useState(false);
  const [bidMsg,setBidMsg]=useState('');
  const [bidErr,setBidErr]=useState('');

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const params={};
      if(filters.crop)params.crop=filters.crop;
      if(filters.state)params.state=filters.state;
      if(filters.minQty)params.minQty=filters.minQty;
      if(filters.maxPrice)params.maxPrice=filters.maxPrice;
      params.sort=filters.sort;
      const res=await axios.get(`${API}/market/browse`,{params});
      setListings(res.data.listings||[]);
    }catch{}
    setLoading(false);
  },[filters]);

  useEffect(()=>{load();},[]);

  const hf=k=>e=>setFilters({...filters,[k]:e.target.value});

  const openBid=listing=>{
    setBidModal(listing);
    setBidForm({offeredPrice:listing.askingPrice||'',quantityNeeded:'',message:''});
    setBidErr('');setBidMsg('');
  };

  const submitBid=async(e)=>{
    e.preventDefault();setBidErr('');setBidMsg('');setBidLoading(true);
    try{
      const res=await axios.post(`${API}/bids`,{
        vendorId:vendor._id, listingId:bidModal._id,
        offeredPrice:Number(bidForm.offeredPrice),
        quantityNeeded:Number(bidForm.quantityNeeded),
        message:bidForm.message
      });
      if(res.data.success){setBidMsg('✅ Bid placed! The farmer will review it.');setTimeout(()=>{setBidModal(null);setBidMsg('');load();},2200);}
      else setBidErr(res.data.message);
    }catch(ex){setBidErr(ex.response?.data?.message||'Failed to place bid.');}
    setBidLoading(false);
  };

  const qualityColor={A:C.green,B:C.amber,C:C.red};

  return(
    <div>
      <div style={{background:C.vendorPale,borderRadius:'12px',padding:'16px',marginBottom:'20px'}}>
        <p style={{margin:'0 0 10px',fontWeight:'700',fontSize:'13px',color:C.vendor}}>🔍 Filter Listings</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'8px'}}>
          {[
            {k:'crop',p:'Crop name'},
            {k:'state',p:'State'},
          ].map(f=>(
            <input key={f.k} style={{...inp,margin:0,padding:'8px 12px'}} value={filters[f.k]}
              onChange={hf(f.k)} placeholder={f.p}
              onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          ))}
          <input style={{...inp,margin:0,padding:'8px 12px'}} type="number" value={filters.minQty}
            onChange={hf('minQty')} placeholder="Min qty (qtl)"
            onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          <input style={{...inp,margin:0,padding:'8px 12px'}} type="number" value={filters.maxPrice}
            onChange={hf('maxPrice')} placeholder="Max price (₹)"
            onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          <select style={{...inp,margin:0,padding:'8px 12px'}} value={filters.sort} onChange={hf('sort')}>
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low→High</option>
            <option value="price_desc">Price: High→Low</option>
            <option value="quantity">Most quantity</option>
          </select>
          <Btn onClick={load} small style={{padding:'8px 12px'}}>Search</Btn>
        </div>
      </div>

      {loading?(
        <div style={{textAlign:'center',padding:'60px',color:C.muted}}>Loading listings…</div>
      ):listings.length===0?(
        <div style={{textAlign:'center',padding:'60px',color:C.muted}}>
          <p style={{fontSize:'32px'}}>🌾</p>
          <p>No active listings. Try different filters.</p>
        </div>
      ):(
        <div>
          <p style={{color:C.sub,fontSize:'13px',marginBottom:'16px'}}>{listings.length} listing{listings.length!==1?'s':''} available</p>
          {listings.map(l=>(
            <div key={l._id} style={card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'10px'}}>
                <div style={{flex:1,minWidth:'180px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                    <h3 style={{margin:0,fontSize:'17px',color:C.text}}>{l.cropName.charAt(0).toUpperCase()+l.cropName.slice(1)}</h3>
                    {l.quality&&<span style={{background:(qualityColor[l.quality]||C.vendor)+'20',color:qualityColor[l.quality]||C.vendor,padding:'2px 8px',borderRadius:'10px',fontSize:'11px',fontWeight:'700'}}>Grade {l.quality}</span>}
                  </div>
                  <p style={{margin:'0 0 3px',fontSize:'13px',color:C.sub}}>
                    📦 {l.quantity} qtl{l.district&&` · 📍 ${l.district}`}{l.state&&`, ${l.state}`}
                  </p>
                  {l.farmerId?.name&&<p style={{margin:'0 0 3px',fontSize:'12px',color:C.muted}}>👨‍🌾 {l.farmerId.name}</p>}
                  {l.farmerPhone&&<p style={{margin:'0 0 3px',fontSize:'12px',color:C.vendor}}>📞 {l.farmerPhone}</p>}
                  {l.description&&<p style={{margin:'6px 0 0',fontSize:'12px',color:C.muted,fontStyle:'italic'}}>{l.description}</p>}
                  <p style={{margin:'6px 0 0',fontSize:'11px',color:'#bbb'}}>
                    Posted {new Date(l.createdAt).toLocaleDateString('en-IN')}
                    {l.bidCount>0&&` · ${l.bidCount} bid${l.bidCount>1?'s':''}`}
                  </p>
                </div>
                <div style={{textAlign:'right'}}>
                  {l.askingPrice?(
                    <><p style={{margin:'0 0 2px',fontSize:'22px',fontWeight:'800',color:C.vendor}}>₹{l.askingPrice}</p>
                    <p style={{margin:'0 0 12px',fontSize:'11px',color:C.muted}}>per quintal</p></>
                  ):<p style={{margin:'0 0 12px',fontSize:'13px',color:C.muted}}>Open to offers</p>}
                  <Btn small onClick={()=>openBid(l)}>💰 Place Bid</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid modal */}
      {bidModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
          <div style={{background:'#fff',borderRadius:'16px',padding:'28px',maxWidth:'420px',width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h3 style={{margin:0,color:C.vendor}}>Place a Bid</h3>
              <button onClick={()=>setBidModal(null)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:C.muted}}>✕</button>
            </div>
            <div style={{background:C.vendorPale,borderRadius:'10px',padding:'12px',marginBottom:'18px'}}>
              <p style={{margin:'0 0 2px',fontWeight:'700'}}>{bidModal.cropName} — {bidModal.quantity} qtl</p>
              <p style={{margin:0,fontSize:'13px',color:C.sub}}>
                {bidModal.district&&`${bidModal.district}, `}{bidModal.state}
                {bidModal.askingPrice&&` · Asking ₹${bidModal.askingPrice}/qtl`}
              </p>
            </div>
            {bidMsg&&<p style={{color:C.green,background:C.greenLight,padding:'10px',borderRadius:'8px',fontSize:'13px'}}>{bidMsg}</p>}
            {bidErr&&<p style={{color:C.red,background:C.redLight,padding:'10px',borderRadius:'8px',fontSize:'13px'}}>{bidErr}</p>}
            {!bidMsg&&(
              <form onSubmit={submitBid}>
                <label style={lbl}>Your Offer (₹/qtl) *</label>
                <input style={inp} type="number" value={bidForm.offeredPrice}
                  onChange={e=>setBidForm({...bidForm,offeredPrice:e.target.value})} placeholder="Price per quintal" required
                  onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
                <label style={lbl}>Quantity Needed (qtl) *</label>
                <input style={inp} type="number" value={bidForm.quantityNeeded}
                  onChange={e=>setBidForm({...bidForm,quantityNeeded:e.target.value})} placeholder={`Max ${bidModal.quantity}`} required
                  onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
                <label style={lbl}>Message to Farmer (optional)</label>
                <textarea style={{...inp,height:'64px',resize:'vertical'}}
                  value={bidForm.message} onChange={e=>setBidForm({...bidForm,message:e.target.value})}
                  placeholder="Payment terms, pickup, transport…"
                  onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
                <div style={{display:'flex',gap:'10px'}}>
                  <Btn type="button" variant="outline" onClick={()=>setBidModal(null)} style={{flex:1}}>Cancel</Btn>
                  <Btn type="submit" full disabled={bidLoading} style={{flex:2}}>{bidLoading?'Placing…':'✅ Confirm Bid'}</Btn>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── My Bids (Step 4: SSE real-time toasts) ── */
function MyBids({vendor}){
  const [bids,setBids]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toasts,setToasts]=useState([]);
  const esRef=useRef(null);
  const pollRef=useRef(null);

  const addToast=useCallback((msg)=>{
    const id=Date.now();
    setToasts(t=>[...t,{id,msg}]);
  },[]);

  const removeToast=useCallback((id)=>{
    setToasts(t=>t.filter(x=>x.id!==id));
  },[]);

  const load=useCallback(async()=>{
    try{
      const res=await axios.get(`${API}/bids/vendor/${vendor._id}`);
      setBids(res.data.bids||[]);
    }catch{}
    setLoading(false);
  },[vendor._id]);

  useEffect(()=>{
    load();

    // Step 4 — SSE for real-time bid status updates
    const es=new EventSource(`${API}/vendor-listings/stream/${vendor._id}`);
    esRef.current=es;

    es.onmessage=(e)=>{
      const data=JSON.parse(e.data);
      if(data.type==='BID_STATUS'){
        load();
        if(data.status==='accepted')
          addToast(`🎉 Your bid was accepted! Check My Bids for farmer contact.`);
        else if(data.status==='rejected')
          addToast(`❌ Your bid on ${data.cropName||'a listing'} was declined.`);
      }
    };
    es.onerror=()=>{
      es.close();
      pollRef.current=setInterval(load,15000); // fallback polling
    };

    return()=>{ es.close(); if(pollRef.current)clearInterval(pollRef.current); };
  },[vendor._id,load,addToast]);

  const withdraw=async(bidId)=>{
    try{await axios.put(`${API}/bids/${bidId}/withdraw`);load();}catch{}
  };

  if(loading) return <div style={{textAlign:'center',padding:'60px',color:C.muted}}>Loading your bids…</div>;

  return(
    <div>
      <style>{`@keyframes toastIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

      {/* Toast stack */}
      <div style={{position:'fixed',top:'80px',right:'20px',zIndex:9999,display:'flex',flexDirection:'column',gap:'8px'}}>
        {toasts.map(t=><Toast key={t.id} message={t.msg} onDone={()=>removeToast(t.id)}/>)}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
        <p style={{margin:0,color:C.sub,fontSize:'13px'}}>{bids.length} bid{bids.length!==1?'s':''} placed · updates in real time</p>
        <Btn small variant="outline" onClick={load}>🔄 Refresh</Btn>
      </div>

      {bids.length===0?(
        <div style={{textAlign:'center',padding:'60px',color:C.muted}}>
          <p style={{fontSize:'32px'}}>📋</p>
          <p>No bids yet. Browse crop listings to place your first bid.</p>
        </div>
      ):bids.map(bid=>{
        const listing=bid.listingId;
        return(
          <div key={bid._id} style={{...card,borderLeft:`4px solid ${bid.status==='accepted'?C.green:bid.status==='rejected'?C.red:bid.status==='pending'?C.vendor:C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'10px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                  <h3 style={{margin:0,fontSize:'16px'}}>
                    {listing?.cropName?.charAt(0).toUpperCase()+listing?.cropName?.slice(1)||'Crop'}
                  </h3>
                  <Badge status={bid.status}/>
                </div>
                <p style={{margin:'0 0 3px',fontSize:'13px',color:C.sub}}>
                  📦 Need {bid.quantityNeeded} qtl of {listing?.quantity} available
                </p>
                {listing?.state&&<p style={{margin:'0 0 3px',fontSize:'12px',color:C.muted}}>📍 {listing.district&&`${listing.district}, `}{listing.state}</p>}
                {bid.message&&<p style={{margin:'6px 0 0',fontSize:'12px',color:C.sub,fontStyle:'italic'}}>Your note: "{bid.message}"</p>}
                <p style={{margin:'6px 0 0',fontSize:'11px',color:'#bbb'}}>
                  Placed {new Date(bid.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                </p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{margin:'0 0 2px',fontSize:'22px',fontWeight:'800',color:C.vendor}}>₹{bid.offeredPrice}</p>
                <p style={{margin:'0 0 10px',fontSize:'11px',color:C.muted}}>per quintal</p>
                {bid.status==='pending'&&(
                  <Btn small variant="outline-red" onClick={()=>withdraw(bid._id)}>Withdraw</Btn>
                )}
                {bid.status==='accepted'&&listing?.farmerPhone&&(
                  <div style={{background:C.greenLight,borderRadius:'8px',padding:'8px 12px',marginTop:'4px'}}>
                    <p style={{margin:0,fontSize:'12px',color:C.green,fontWeight:'700'}}>📞 Call farmer: {listing.farmerPhone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── My Buy Offers (Step 3) ── */
function MyBuyOffers({vendor}){
  const [offers,setOffers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [step,setStep]=useState('list'); // 'list' | 'form'
  const [form,setForm]=useState({cropName:'',offeredPrice:'',quantityNeeded:'',state:'',district:'',validUntil:'',notes:''});
  const [posting,setPosting]=useState(false);
  const [err,setErr]=useState('');
  const [expandedOffer,setExpandedOffer]=useState(null);
  const [toasts,setToasts]=useState([]);
  const esRef=useRef(null);

  const addToast=useCallback((msg)=>{
    const id=Date.now();setToasts(t=>[...t,{id,msg}]);
  },[]);
  const removeToast=useCallback((id)=>{setToasts(t=>t.filter(x=>x.id!==id));},[]);

  const load=useCallback(async()=>{
    try{
      const r=await axios.get(`${API}/vendor-listings/vendor/${vendor._id}`);
      setOffers(r.data.listings||[]);
    }catch{}
    setLoading(false);
  },[vendor._id]);

  useEffect(()=>{
    load();
    // SSE — get notified when a farmer expresses interest in your buy offer
    const es=new EventSource(`${API}/vendor-listings/stream/${vendor._id}`);
    esRef.current=es;
    es.onmessage=(e)=>{
      const data=JSON.parse(e.data);
      if(data.type==='NEW_INTEREST'){
        load();
        addToast(`✋ A farmer is interested in your buy offer!`);
      }
    };
    es.onerror=()=>es.close();
    return()=>es.close();
  },[vendor._id,load,addToast]);

  const hc=k=>e=>setForm({...form,[k]:e.target.value});

  const submitOffer=async(e)=>{
    e.preventDefault();setErr('');setPosting(true);
    try{
      const res=await axios.post(`${API}/vendor-listings`,{
        vendorId:vendor._id,
        cropName:form.cropName,
        offeredPrice:Number(form.offeredPrice),
        quantityNeeded:Number(form.quantityNeeded),
        state:form.state,district:form.district,
        validUntil:form.validUntil||undefined,
        notes:form.notes
      });
      if(res.data.success){await load();setStep('list');}
      else setErr(res.data.message||'Failed to post.');
    }catch{setErr('Failed to post offer.');}
    setPosting(false);
  };

  const closeOffer=async(id)=>{
    try{await axios.put(`${API}/vendor-listings/${id}/close`);load();}catch{}
  };

  if(step==='form') return(
    <div>
      <button onClick={()=>setStep('list')} style={{background:'none',border:'none',cursor:'pointer',color:C.sub,fontSize:'14px',padding:'0 0 16px',fontFamily:'inherit'}}>← Back</button>
      <h3 style={{margin:'0 0 4px',fontSize:'17px',color:C.vendor}}>Post a Buy Offer</h3>
      <p style={{margin:'0 0 20px',fontSize:'13px',color:C.sub}}>Farmers browsing SmartSell will see this and can express interest directly.</p>
      {err&&<p style={{color:C.red,background:C.redLight,padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'12px'}}>{err}</p>}
      <form onSubmit={submitOffer}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
          <div>
            <label style={lbl}>Crop Name *</label>
            <input style={inp} value={form.cropName} onChange={hc('cropName')} placeholder="e.g. Tomato" required
              onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={lbl}>Your Offered Price (₹/qtl) *</label>
            <input style={inp} type="number" value={form.offeredPrice} onChange={hc('offeredPrice')} placeholder="e.g. 3200" required
              onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={lbl}>Quantity Needed (qtl) *</label>
            <input style={inp} type="number" value={form.quantityNeeded} onChange={hc('quantityNeeded')} placeholder="e.g. 100" required
              onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={lbl}>Valid Until</label>
            <input style={inp} type="date" value={form.validUntil} onChange={hc('validUntil')}
              onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={lbl}>State</label>
            <input style={inp} value={form.state} onChange={hc('state')} placeholder="Preferred state"
              onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={lbl}>District</label>
            <input style={inp} value={form.district} onChange={hc('district')} placeholder="Preferred district"
              onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
        </div>
        <label style={lbl}>Notes for Farmers</label>
        <textarea style={{...inp,height:'68px',resize:'vertical'}} value={form.notes} onChange={hc('notes')}
          placeholder="Quality requirements, pickup terms, payment mode…"
          onFocus={e=>e.target.style.borderColor=C.vendor} onBlur={e=>e.target.style.borderColor=C.border}/>
        <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
          <Btn type="button" variant="outline" onClick={()=>setStep('list')}>Cancel</Btn>
          <Btn type="submit" full disabled={posting}>{posting?'Posting…':'📢 Post Buy Offer'}</Btn>
        </div>
      </form>
    </div>
  );

  return(
    <div>
      <style>{`@keyframes toastIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <div style={{position:'fixed',top:'80px',right:'20px',zIndex:9999,display:'flex',flexDirection:'column',gap:'8px'}}>
        {toasts.map(t=><Toast key={t.id} message={t.msg} onDone={()=>removeToast(t.id)}/>)}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <div>
          <p style={{margin:0,color:C.sub,fontSize:'14px'}}>Post standing buy offers — farmers see them and express interest directly.</p>
        </div>
        <Btn onClick={()=>{setErr('');setForm({cropName:'',offeredPrice:'',quantityNeeded:'',state:'',district:'',validUntil:'',notes:''});setStep('form');}}>+ New Buy Offer</Btn>
      </div>

      {loading?(
        <div style={{textAlign:'center',padding:'48px',color:C.muted}}>Loading…</div>
      ):offers.length===0?(
        <div style={{textAlign:'center',padding:'56px 20px',background:'#FAFAFA',borderRadius:'16px',color:C.muted}}>
          <p style={{fontSize:'36px',margin:'0 0 12px'}}>📢</p>
          <p style={{margin:'0 0 6px',fontSize:'16px',fontWeight:'600',color:C.text}}>No buy offers yet</p>
          <p style={{margin:'0 0 20px',fontSize:'14px'}}>Post what you want to buy and farmers will reach out to you.</p>
          <Btn onClick={()=>setStep('form')}>+ Post your first buy offer</Btn>
        </div>
      ):offers.map(offer=>{
        const isExpanded=expandedOffer===offer._id;
        const interested=offer.interestedFarmers||[];
        return(
          <div key={offer._id} style={{...card,borderLeft:`4px solid ${offer.status==='active'?C.vendor:C.border}`,opacity:offer.status!=='active'?0.7:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                  <p style={{margin:0,fontWeight:'700',fontSize:'16px'}}>
                    {offer.cropName.charAt(0).toUpperCase()+offer.cropName.slice(1)}
                  </p>
                  <span style={{background:offer.status==='active'?C.vendorLight:'#F5F5F5',color:offer.status==='active'?C.vendor:'#757575',padding:'2px 8px',borderRadius:'10px',fontSize:'11px',fontWeight:'700'}}>
                    {offer.status==='active'?'● Active':'○ Closed'}
                  </span>
                </div>
                <p style={{margin:'0 0 3px',fontSize:'13px',color:C.sub}}>
                  Need {offer.quantityNeeded} qtl
                  {offer.district&&` · 📍 ${offer.district}`}
                  {offer.state&&`, ${offer.state}`}
                </p>
                {offer.validUntil&&<p style={{margin:'0 0 3px',fontSize:'12px',color:C.muted}}>Valid till {new Date(offer.validUntil).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>}
                {offer.notes&&<p style={{margin:'4px 0 0',fontSize:'12px',color:C.muted,fontStyle:'italic'}}>{offer.notes}</p>}
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <p style={{margin:'0 0 1px',fontSize:'22px',fontWeight:'800',color:C.vendor}}>₹{offer.offeredPrice}</p>
                <p style={{margin:'0 0 8px',fontSize:'11px',color:C.muted}}>per quintal</p>
                {/* Interested farmers notification */}
                {interested.length>0&&(
                  <button onClick={()=>setExpandedOffer(isExpanded?null:offer._id)} style={{
                    background:C.vendorLight,border:`1px solid ${C.vendor}`,borderRadius:'20px',
                    padding:'3px 12px',fontSize:'12px',fontWeight:'700',color:C.vendor,cursor:'pointer',marginBottom:'6px',display:'block',width:'100%'
                  }}>
                    ✋ {interested.length} farmer{interested.length!==1?'s':''} interested
                  </button>
                )}
                {offer.status==='active'&&(
                  <Btn small variant="outline-red" onClick={()=>closeOffer(offer._id)}>Close</Btn>
                )}
              </div>
            </div>

            {/* Expanded: show interested farmers */}
            {isExpanded&&interested.length>0&&(
              <div style={{marginTop:'14px',paddingTop:'14px',borderTop:`1px solid ${C.border}`}}>
                <p style={{margin:'0 0 10px',fontWeight:'700',fontSize:'13px',color:C.vendor}}>Interested Farmers</p>
                {interested.map((f,i)=>(
                  <div key={i} style={{background:C.vendorPale,borderRadius:'8px',padding:'10px 12px',marginBottom:'8px'}}>
                    <p style={{margin:'0 0 2px',fontWeight:'600',fontSize:'14px'}}>📞 {f.farmerPhone}</p>
                    {f.message&&<p style={{margin:0,fontSize:'12px',color:C.sub,fontStyle:'italic'}}>{f.message}</p>}
                    <p style={{margin:'4px 0 0',fontSize:'11px',color:'#bbb'}}>{new Date(f.expressedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Vendor Profile ── */
function VendorProfile({vendor,onLogout}){
  return(
    <div style={{maxWidth:'420px'}}>
      <div style={{...card,borderTop:`4px solid ${C.vendor}`}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'20px'}}>
          <div style={{width:'56px',height:'56px',borderRadius:'50%',background:C.vendorLight,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>🏢</div>
          <div>
            <h2 style={{margin:0,fontSize:'18px',color:C.vendor}}>{vendor.businessName}</h2>
            <p style={{margin:'2px 0 0',fontSize:'13px',color:C.muted}}>{vendor.name}</p>
          </div>
        </div>
        <div style={{display:'grid',gap:'10px'}}>
          <div><span style={lbl}>Phone</span><p style={{margin:'2px 0 0',color:C.text}}>📞 {vendor.phone}</p></div>
          {vendor.email&&<div><span style={lbl}>Email</span><p style={{margin:'2px 0 0',color:C.text}}>✉️ {vendor.email}</p></div>}
          {vendor.location?.state&&<div><span style={lbl}>Location</span><p style={{margin:'2px 0 0',color:C.text}}>📍 {vendor.location.city&&`${vendor.location.city}, `}{vendor.location.state}</p></div>}
          {vendor.preferredCrops?.length>0&&(
            <div>
              <span style={lbl}>Preferred Crops</span>
              <div style={{marginTop:'4px',display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {vendor.preferredCrops.map(c=>(
                  <span key={c} style={{background:C.vendorLight,color:C.vendor,padding:'3px 10px',borderRadius:'12px',fontSize:'12px',fontWeight:'600'}}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Btn variant="outline-red" full onClick={onLogout} style={{marginTop:'20px'}}>Log Out</Btn>
      </div>
    </div>
  );
}

/* ── Main Vendor Portal ── */
export default function VendorPortal(){
  const [vendor,setVendor]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('vendorProfile')||'null');}catch{return null;}
  });
  const [tab,setTab]=useState('browse');

  const handleLogin=v=>{localStorage.setItem('vendorProfile',JSON.stringify(v));setVendor(v);};
  const handleLogout=()=>{localStorage.removeItem('vendorProfile');setVendor(null);};

  if(!vendor) return <AuthScreen onLogin={handleLogin}/>;

  const tabs=[
    {key:'browse',label:'🌾 Browse Crops'},
    {key:'bids',label:'📋 My Bids'},
    {key:'buyoffers',label:'📢 My Buy Offers'},
    {key:'profile',label:'👤 Profile'},
  ];

  const tb=k=>({
    padding:'9px 18px',border:'none',cursor:'pointer',fontSize:'14px',
    fontWeight:tab===k?'700':'400',
    background:tab===k?C.vendor:'transparent',
    color:tab===k?'#fff':C.sub,borderRadius:'8px',transition:'all 0.15s',fontFamily:'inherit'
  });

  return(
    <div style={{maxWidth:'820px',margin:'0 auto',padding:'0 16px 60px',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:`linear-gradient(135deg, ${C.vendor}, #7B1FA2)`,borderRadius:'16px',padding:'20px 24px',margin:'24px 0',color:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{margin:'0 0 2px',fontSize:'12px',opacity:0.75}}>Vendor Dashboard</p>
            <h2 style={{margin:0,fontSize:'20px'}}>{vendor.businessName}</h2>
            <p style={{margin:'2px 0 0',fontSize:'13px',opacity:0.75}}>{vendor.location?.city||vendor.location?.state}</p>
          </div>
          <div style={{fontSize:'36px'}}>🏢</div>
        </div>
      </div>

      <div style={{display:'flex',gap:'4px',marginBottom:'24px',background:C.vendorPale,padding:'6px',borderRadius:'12px',flexWrap:'wrap'}}>
        {tabs.map(t=><button key={t.key} style={tb(t.key)} onClick={()=>setTab(t.key)}>{t.label}</button>)}
      </div>

      {tab==='browse'    && <BrowseListings vendor={vendor}/>}
      {tab==='bids'      && <MyBids vendor={vendor}/>}
      {tab==='buyoffers' && <MyBuyOffers vendor={vendor}/>}
      {tab==='profile'   && <VendorProfile vendor={vendor} onLogout={handleLogout}/>}
    </div>
  );
}