import React, { useState } from 'react';
import { useApi } from '../api/useApi';
import { getFarmerOrders } from '../api/axiosClient';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';

const OrdersTab = ({ farmerId }) => {
  const { data: orders, loading } = useApi(() => getFarmerOrders(farmerId), [farmerId]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const clearFilters = () => {
    setStatusFilter('All');
    setFromDate('');
    setToDate('');
  };

  const filteredOrders = (orders || []).filter(order => {
    let match = true;
    if (statusFilter !== 'All' && order.Status !== statusFilter) match = false;
    
    if (fromDate) {
      if (new Date(order.OrderDate) < new Date(fromDate)) match = false;
    }
    if (toDate) {
      if (new Date(order.OrderDate) > new Date(toDate)) match = false;
    }
    return match;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl w-full"></div>;
  }

  return (
    <div>
      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm items-end">
        <div className="w-full md:w-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-agri-green"
          >
            <option value="All">All Statuses</option>
            <option value="PLACED">PLACED</option>
            <option value="PAID">PAID</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">From Date</label>
          <input 
            type="date" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-agri-green"
          />
        </div>
        
        <div className="w-full md:w-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">To Date</label>
          <input 
            type="date" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-agri-green"
          />
        </div>

        <button 
          onClick={clearFilters}
          className="w-full md:w-auto text-sm text-gray-500 hover:text-agri-green px-4 py-2 font-medium bg-gray-50 hover:bg-agri-pale border border-transparent rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* TABLE */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Crop</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Buyer</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">Qty (kg)</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">Value (₹)</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const value = order.Quantity * order.PricePerKg;
                  return (
                    <tr key={order.OrderID} className="hover:bg-agri-pale transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900">#{order.OrderID}</td>
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(order.OrderDate)}</td>
                      <td className="p-4 text-sm font-medium text-agri-dark">{order.CropName}</td>
                      <td className="p-4 text-sm text-gray-600">{order.BuyerName || `ID: ${order.BuyerID}`}</td>
                      <td className="p-4 text-sm text-gray-900 text-right font-medium">{order.Quantity}</td>
                      <td className="p-4 text-sm font-semibold text-agri-darkgold text-right whitespace-nowrap">₹ {(value).toFixed(2)}</td>
                      <td className="p-4 text-center whitespace-nowrap"><StatusBadge status={order.Status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState 
          icon="📦" 
          title="No orders found" 
          subtitle={orders?.length > 0 ? "No orders match your filters." : "Orders appear when buyers purchase your crops."} 
        />
      )}
    </div>
  );
};

export default OrdersTab;
