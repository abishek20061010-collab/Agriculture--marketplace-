import React, { useState } from 'react';
import { useApi } from '../api/useApi';
import { getBuyerOrders } from '../api/axiosClient';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';

const OrderCard = ({ order, setActiveTab }) => {
  const value = order.Quantity * order.PricePerKg;
  const dateStr = new Date(order.OrderDate).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4 hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h3 className="font-semibold text-[#1a2e1a] text-[15px]">Order #{order.OrderID}</h3>
          <p className="text-gray-500 text-xs mt-0.5">📅 {dateStr}</p>
        </div>
        <StatusBadge status={order.Status} />
      </div>

      <div className="h-px bg-gray-100 mb-4 w-full"></div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mb-4">
        <div className="text-sm">
          <span className="text-gray-500">🌾 Crop:</span> <span className="font-medium text-gray-800">{order.CropName}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">👨‍🌾 Farmer:</span> <span className="font-medium text-gray-800">{order.FarmerName}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">📦 Qty:</span> <span className="font-medium text-gray-800">{order.Quantity} kg</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">₹ Rate:</span> <span className="font-medium text-gray-800">₹{order.PricePerKg}/kg</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">🏭 Warehouse:</span> <span className="font-medium text-gray-800">{order.WarehouseLocation || `ID: ${order.WarehouseID}`}</span>
        </div>
        <div className="text-sm bg-amber-50 p-1.5 rounded inline-block w-max border border-amber-100">
          <span className="text-gray-600">💰 Total:</span> <span className="font-bold text-agri-darkgold ml-1">₹ {value.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mt-2 pt-3 border-t border-gray-50">
        {order.Status === 'PLACED' && (
          <button 
            onClick={() => setActiveTab('Payment')}
            className="bg-[#F4A300] hover:bg-[#c47f00] text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            💳 Pay Now
          </button>
        )}
        {(order.Status === 'PAID' || order.Status === 'SHIPPED') && (
          <button 
            onClick={() => setActiveTab('TrackDelivery')}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            🚚 Track Delivery
          </button>
        )}
        {order.Status === 'DELIVERED' && (
          <div className="bg-green-100 text-green-800 font-semibold text-sm px-4 py-2 rounded-lg border border-green-200">
            ✅ Delivered
          </div>
        )}
        {order.Status === 'CANCELLED' && (
          <div className="bg-red-100 text-red-800 font-semibold text-sm px-4 py-2 rounded-lg border border-red-200">
            ❌ Cancelled
          </div>
        )}
      </div>
    </div>
  );
};

const MyOrdersTab = ({ buyerId, setActiveTab }) => {
  const { data: orders, loading } = useApi(() => getBuyerOrders(buyerId), [buyerId]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl w-full"></div>;
  }

  const statuses = ['All', 'PLACED', 'PAID', 'SHIPPED', 'DELIVERED'];

  let filteredOrders = orders || [];
  
  if (statusFilter !== 'All') {
    filteredOrders = filteredOrders.filter(o => o.Status.toUpperCase() === statusFilter.toUpperCase());
  }

  if (sortOrder === 'newest') {
    filteredOrders.sort((a, b) => new Date(b.OrderDate) - new Date(a.OrderDate));
  } else {
    filteredOrders.sort((a, b) => new Date(a.OrderDate) - new Date(b.OrderDate));
  }

  const totalSpent = filteredOrders.reduce((sum, o) => sum + (o.Quantity * o.PricePerKg), 0);

  return (
    <div>
      {/* FILTER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors border ${
                statusFilter === status 
                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sort:</span>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* SUMMARY BAR */}
      <div className="flex justify-between items-center mb-4 px-1">
        <p className="text-sm font-semibold text-gray-600">{filteredOrders.length} orders found</p>
        <p className="text-sm font-bold text-[#1a2e1a]">Total value: <span className="text-agri-gold ml-1">₹{totalSpent.toFixed(2)}</span></p>
      </div>

      {/* LIST */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.OrderID} order={order} setActiveTab={setActiveTab} />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="📋" 
          title={statusFilter === 'All' ? "No orders yet" : `No ${statusFilter.toLowerCase()} orders found`} 
          subtitle={statusFilter === 'All' ? "Browse crops and place your first order!" : "Try selecting a different status filter."} 
        />
      )}
    </div>
  );
};

export default MyOrdersTab;
