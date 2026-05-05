import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useApi } from '../api/useApi';
import { getFarmerStats } from '../api/axiosClient';

import MyCropsTab from '../components/MyCropsTab';
import OrdersTab from '../components/OrdersTab';
import RevenueTab from '../components/RevenueTab';
import DemandTab from '../components/DemandTab';
import WarehouseTab from '../components/WarehouseTab';

// Tab Placeholders
// const OrdersTab = ({ farmerId }) => <EmptyState icon="📦" title="Orders" subtitle="Coming soon in Phase 3C" />;
// const RevenueTab = ({ farmerId }) => <EmptyState icon="💰" title="Revenue" subtitle="Coming soon in Phase 3D" />;
// const WarehouseTab = ({ farmerId }) => <EmptyState icon="🏭" title="Warehouse" subtitle="Coming soon in Phase 3E" />;
// const DemandTab = ({ farmerId }) => <EmptyState icon="📊" title="Demand" subtitle="Coming soon" />;

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('MyCrops');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'farmer') {
      navigate('/login');
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  useEffect(() => {
    document.title = "AgriChain | Farmer Portal";
  }, []);

  // Use the combined stats endpoint from Phase 1B instead of firing 4 separate endpoints
  const { data: stats, loading, error, refetch } = useApi(
    () => user ? getFarmerStats(user.id) : Promise.resolve({ data: null }), 
    [user]
  );

  // Refetch stats whenever the user switches tabs to ensure the top metrics stay in sync
  useEffect(() => {
    if (user && refetch) {
      refetch();
    }
  }, [activeTab]);

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'MyCrops': return <MyCropsTab farmerId={user.id} />;
      case 'Orders': return <OrdersTab farmerId={user.id} />;
      case 'Revenue': return <RevenueTab farmerId={user.id} />;
      case 'Warehouse': return <WarehouseTab farmerId={user.id} />;
      case 'Demand': return <DemandTab farmerId={user.id} />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'MyCrops', label: '🌱 My Crops' },
    { id: 'Orders', label: '📦 Orders' },
    { id: 'Revenue', label: '💰 Revenue' },
    { id: 'Warehouse', label: '🏭 Warehouse' },
    { id: 'Demand', label: '📊 Demand' }
  ];

  return (
    <div className="min-h-screen bg-agri-bg pb-12">
      <Navbar title="Farmer Portal" />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Welcome Bar */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <h1 className="text-[20px] text-[#1a2e1a] font-medium">Good morning, {user.name} 🌾</h1>
            <span className="text-gray-500 text-sm mt-1 md:mt-0">{today}</span>
          </div>
          <div className="h-[2px] w-full bg-gradient-to-r from-agri-green via-agri-light to-transparent rounded-full opacity-30"></div>
        </div>

        {/* Read-Only Notice Banner */}
        <div className="bg-green-50 border-l-4 border-agri-green p-4 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-agri-green mt-0.5">ℹ️</div>
            <div className="ml-3">
              <p className="text-sm text-green-800 font-medium">
                Crop listings are managed by the Warehouse Admin. Contact your warehouse to add or update crop listings.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {loading ? (
          <div className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Crops */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-green-100 p-3 rounded-full text-green-700 text-xl">🌱</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Total Crops</p>
                <p className="text-[28px] font-bold text-agri-dark leading-tight">{stats?.total_crops || 0}</p>
              </div>
            </div>
            {/* Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full text-blue-700 text-xl">📦</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Orders Received</p>
                <p className="text-[28px] font-bold text-agri-dark leading-tight">{stats?.total_orders || 0}</p>
              </div>
            </div>
            {/* Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-amber-100 p-3 rounded-full text-amber-700 text-xl">💰</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Total Revenue</p>
                <p className="text-[28px] font-bold text-agri-dark leading-tight">₹ {stats?.total_revenue || 0}</p>
              </div>
            </div>
            {/* Warehouse */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full text-purple-700 text-xl">🏭</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">In Warehouse</p>
                <p className="text-[28px] font-bold text-agri-dark leading-tight">{stats?.warehouse_qty || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className="mt-8 mb-6">
          <div className="block sm:hidden mb-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full border-2 border-[#1a6b3c] text-[#1a6b3c] rounded-lg h-[40px] px-3 font-semibold focus:outline-none"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block border-b border-gray-200 overflow-x-auto hide-scrollbar">
            <div className="flex space-x-8 min-w-max px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-[15px] transition-colors whitespace-nowrap btn-press ${
                    activeTab === tab.id 
                      ? 'border-b-[3px] border-[#1a6b3c] text-[#1a6b3c] font-semibold' 
                      : 'text-gray-500 hover:text-[#1a6b3c] border-b-[3px] border-transparent font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 md:p-6 p-2 min-h-[400px]">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;
