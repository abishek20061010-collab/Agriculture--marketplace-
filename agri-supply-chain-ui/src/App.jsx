import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import WarehouseDashboard from './pages/WarehouseDashboard'

const PrivateRoute = ({ children, role }) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" replace />;
  const user = JSON.parse(userStr);
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-agri-bg">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/farmer/*" 
          element={
            <PrivateRoute role="farmer">
              <FarmerDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/buyer/*" 
          element={
            <PrivateRoute role="buyer">
              <BuyerDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/warehouse/*" 
          element={
            <PrivateRoute role="warehouse">
              <WarehouseDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App
