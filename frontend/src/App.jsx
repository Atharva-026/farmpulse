import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar      from './components/Navbar';
import LandingPage from './pages/LandingPage';
import About       from './pages/About';
import Dashboard   from './pages/Dashboard';
import CropRecommend from './pages/CropRecommend';
import DiseaseDetect from './pages/DiseaseDetect';
import LoanGateway   from './pages/LoanGateway';
import SmartSell     from './pages/SmartSell';
import VendorPortal  from './pages/VendorPortal';
import Community     from './pages/Community';

function loadFarmer() {
  try { return JSON.parse(localStorage.getItem('farmerProfile') || 'null'); } catch { return null; }
}
function loadVendor() {
  try { return JSON.parse(localStorage.getItem('vendorProfile') || 'null'); } catch { return null; }
}

function FarmerApp({ farmer, onLogout }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('farmerProfile');
    localStorage.removeItem('farmerId');
    localStorage.removeItem('farmerState');
    localStorage.removeItem('farmerPhone');
    onLogout();
    navigate('/');
  };
  return (
    <>
      <Navbar farmer={farmer} onLogout={handleLogout} />
      <div style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/crop"      element={<CropRecommend />} />
          <Route path="/disease"   element={<DiseaseDetect />} />
          <Route path="/loan"      element={<LoanGateway />} />
          <Route path="/sell"      element={<SmartSell />} />
          <Route path="/community" element={<Community farmer={farmer} />} />
          <Route path="/about"     element={<About />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function VendorApp({ onVendorLogout }) {
  return (
    <Routes>
      <Route path="/vendor"   element={<VendorPortal onLogout={onVendorLogout} />} />
      <Route path="/vendor/*" element={<VendorPortal onLogout={onVendorLogout} />} />
      <Route path="*"         element={<Navigate to="/vendor" />} />
    </Routes>
  );
}

function AppShell() {
  const [farmer, setFarmer] = useState(loadFarmer);
  const [, setVendor]       = useState(loadVendor);
  const location            = useLocation();
  const isVendorPath        = location.pathname.startsWith('/vendor');
  const vendorLoggedIn      = !!loadVendor();

  const handleFarmerLogin = (f) => {
    localStorage.setItem('farmerProfile', JSON.stringify(f));
    localStorage.setItem('farmerId', f._id);
    localStorage.setItem('farmerState', f.location?.state || '');
    localStorage.setItem('farmerPhone', f.phone || '');
    setFarmer(f);
  };
  const handleVendorLogin = (v) => {
    localStorage.setItem('vendorProfile', JSON.stringify(v));
    setVendor(v);
    window.location.href = '/vendor';
  };
  const handleFarmerLogout = () => setFarmer(null);
  const handleVendorLogout = () => {
    localStorage.removeItem('vendorProfile');
    setVendor(null);
    window.location.href = '/';
  };

  if (isVendorPath) {
    if (!vendorLoggedIn) return <Navigate to="/" />;
    return <VendorApp onVendorLogout={handleVendorLogout} />;
  }
  if (!farmer) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage onFarmerLogin={handleFarmerLogin} onVendorLogin={handleVendorLogin} />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }
  return <FarmerApp farmer={farmer} onLogout={handleFarmerLogout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}