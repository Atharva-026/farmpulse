import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CropRecommend from './pages/CropRecommend';
import DiseaseDetect from './pages/DiseaseDetect';
import LoanGateway from './pages/LoanGateway';
import SmartSell from './pages/SmartSell';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/crop" element={<CropRecommend />} />
          <Route path="/disease" element={<DiseaseDetect />} />
          <Route path="/loan" element={<LoanGateway />} />
          <Route path="/sell" element={<SmartSell />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;