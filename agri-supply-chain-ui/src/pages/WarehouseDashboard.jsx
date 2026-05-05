import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWarehouseStats } from '../api/axiosClient';
import CropsTab from '../components/warehouse/CropsTab';
import WarehouseMgmtTab from '../components/warehouse/WarehouseMgmtTab';
import OrdersMgmtTab from '../components/warehouse/OrdersMgmtTab';
import AssignDriverTab from '../components/warehouse/AssignDriverTab';
import BuyersTab from '../components/warehouse/BuyersTab';
import AnalyticsTab from '../components/warehouse/AnalyticsTab';
import FarmersTab from '../components/warehouse/FarmersTab';

const WarehouseDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total_crops: 0,
    total_farmers: 0,
    total_orders: 0,
    pending_orders: 0,
    total_revenue: 0,
    active_deliveries: 0
  });
  const [activeTab, setActiveTab] = useState('Crops');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'warehouse') {
      navigate('/login');
      return;
    }
    setUser(parsedUser);

    // Fetch Stats
    getWarehouseStats()
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(err => console.error("Error fetching warehouse stats", err));
  }, [navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const tabs = [
    { id: 'Crops', label: '🌱 Crops' },
    { id: 'Warehouse', label: '🏭 Warehouse' },
    { id: 'Farmers', label: '🧑‍🌾 Farmers' },
    { id: 'Orders', label: '📦 Orders' },
    { id: 'Assign Driver', label: '🚚 Assign Driver' },
    { id: 'Buyers', label: '👥 Buyers' },
    { id: 'Analytics', label: '📊 Analytics' }
  ];

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-purple-50">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 text-white shadow-md" style={{ backgroundColor: '#6C3483' }}>
        <div className="text-xl font-bold">🏭 AgriChain — Warehouse Admin</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">{user.name}</span>
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">ADMIN</span>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* WELCOME BAR */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            🏭 Warehouse Control Centre — {user.name}
          </h2>
          <div className="text-gray-500 text-sm font-medium">{currentDate}</div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon="📦" label="Total Crops Listed" value={stats.total_crops} />
          <StatCard icon="🧑‍🌾" label="Active Farmers" value={stats.total_farmers} />
          <StatCard icon="🛒" label="Total Orders" value={stats.total_orders} />
          <StatCard icon="⏳" label="Pending Orders" value={stats.pending_orders} />
          <StatCard icon="🚚" label="Active Deliveries" value={stats.active_deliveries} />
        </div>

        {/* TAB BAR */}
        <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
          <TabContent activeTab={activeTab} warehouseID={user.id} />
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl mb-2 shadow-inner">
      {icon}
    </div>
    <div className="text-[26px] font-bold text-gray-800 mb-1 leading-none">{value}</div>
    <div className="text-xs text-gray-500 font-medium">{label}</div>
  </div>
);

const TabContent = ({ activeTab, warehouseID }) => {
  // Pass warehouseID to sub-components when implemented
  switch(activeTab) {
    case 'Crops': return <CropsTab warehouseID={warehouseID} />;
    case 'Warehouse': return <WarehouseMgmtTab warehouseID={warehouseID} />;
    case 'Farmers': return <FarmersTab />;
    case 'Orders': return <OrdersMgmtTab warehouseID={warehouseID} />;
    case 'Assign Driver': return <AssignDriverTab warehouseID={warehouseID} />;
    case 'Buyers': return <BuyersTab warehouseID={warehouseID} />;
    case 'Analytics': return <AnalyticsTab warehouseID={warehouseID} />;
    default: return null;
  }
};

export default WarehouseDashboard;
