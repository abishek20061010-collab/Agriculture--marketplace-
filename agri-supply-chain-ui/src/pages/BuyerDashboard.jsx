import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useApi } from '../api/useApi';
import { getBuyerOrders } from '../api/axiosClient';
import BrowseCropsTab from '../components/BrowseCropsTab';
import MyOrdersTab from '../components/MyOrdersTab';
import PaymentTab from '../components/PaymentTab';
import TrackDeliveryTab from '../components/TrackDeliveryTab';

// Tab Placeholders
// const BrowseCropsTab = ({ buyerId }) => <EmptyState icon="🛍️" title="Browse Crops" subtitle="Coming soon in Phase 4A" />;
// const MyOrdersTab = ({ buyerId }) => <EmptyState icon="📋" title="My Orders" subtitle="Coming soon in Phase 4B" />;
// const PaymentTab = ({ buyerId }) => <EmptyState icon="💳" title="Payment" subtitle="Coming soon in Phase 4C" />;
// const TrackDeliveryTab = ({ buyerId }) => <EmptyState icon="🚚" title="Track Delivery" subtitle="Coming soon in Phase 4D" />;

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('BrowseCrops');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'buyer') {
      navigate('/login');
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  useEffect(() => {
    document.title = "AgriChain | Buyer Portal";
  }, []);

  // Using getBuyerOrders to compute the stats requested in Phase 4A
  const { data: orders, loading, error, refetch } = useApi(
    () => user ? getBuyerOrders(user.id) : Promise.resolve({ data: [] }), 
    [user]
  );

  // Refetch orders whenever the user switches tabs to ensure the top metrics stay in sync
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

  const ordersPlaced = orders ? orders.length : 0;
  const delivered = orders ? orders.filter(o => o.Status === 'DELIVERED').length : 0;
  const pendingPayment = orders ? orders.filter(o => o.Status === 'PLACED').length : 0;
  const totalSpent = orders ? orders.filter(o => o.Status !== 'CANCELLED').reduce((sum, o) => sum + (o.Quantity * o.PricePerKg), 0) : 0;
  
  let lastOrderDate = '---';
  if (orders && orders.length > 0) {
    const sortedDates = orders.map(o => new Date(o.OrderDate)).sort((a, b) => b - a);
    lastOrderDate = sortedDates[0].toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'BrowseCrops': return <BrowseCropsTab buyerId={user.id} setActiveTab={setActiveTab} />;
      case 'MyOrders': return <MyOrdersTab buyerId={user.id} setActiveTab={setActiveTab} />;
      case 'Payment': return <PaymentTab buyerId={user.id} />;
      case 'TrackDelivery': return <TrackDeliveryTab buyerId={user.id} />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'BrowseCrops', label: '🛍️ Browse Crops' },
    { id: 'MyOrders', label: '📋 My Orders' },
    { id: 'Payment', label: '💳 Payment' },
    { id: 'TrackDelivery', label: '🚚 Track Delivery' }
  ];

  return (
    <div className="min-h-screen bg-agri-bg pb-12">
      <Navbar title="Buyer Portal" />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Welcome Bar */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <h1 className="text-[20px] text-[#1a2e1a] font-medium">Welcome, {user.name} 👋</h1>
            <span className="text-gray-500 text-sm mt-1 md:mt-0">{today}</span>
          </div>
          <div className="h-[2px] w-full bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-transparent rounded-full opacity-30"></div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full text-blue-700 text-xl">🛒</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Orders Placed</p>
                <p className="text-[28px] font-bold text-[#1a2e1a] leading-tight">{ordersPlaced}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-green-100 p-3 rounded-full text-green-700 text-xl">✅</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Delivered</p>
                <p className="text-[28px] font-bold text-[#1a2e1a] leading-tight">{delivered}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-amber-100 p-3 rounded-full text-amber-700 text-xl">⏳</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Pending Payment</p>
                <p className="text-[28px] font-bold text-[#1a2e1a] leading-tight">{pendingPayment}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full text-purple-700 text-xl">💰</div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Total Spent</p>
                <p className="text-[28px] font-bold text-[#1a2e1a] leading-tight">₹ {totalSpent.toFixed(2)}</p>
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
              className="w-full border-2 border-[#1e3a8a] text-[#1e3a8a] rounded-lg h-[40px] px-3 font-semibold focus:outline-none"
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
                      ? 'border-b-[3px] border-[#1e3a8a] text-[#1e3a8a] font-semibold' 
                      : 'text-gray-500 hover:text-[#1e3a8a] border-b-[3px] border-transparent font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 md:p-6 min-h-[400px]">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;
