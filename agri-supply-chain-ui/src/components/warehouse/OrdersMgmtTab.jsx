import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus } from '../../api/axiosClient';

const OrdersMgmtTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} marked as ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(o => {
      // Status Filter
      if (statusFilter !== 'All' && o.Status !== statusFilter) return false;
      
      // Search Term Filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesBuyer = o.BuyerName?.toLowerCase().includes(lowerSearch);
        const matchesCrop = o.CropName?.toLowerCase().includes(lowerSearch);
        if (!matchesBuyer && !matchesCrop) return false;
      }
      
      // Date Range Filter
      if (dateFrom && new Date(o.OrderDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(o.OrderDate) > new Date(dateTo)) return false;

      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Summary logic
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, o) => sum + parseFloat(o.OrderValue || 0), 0);
  const pendingOrders = orders.filter(o => o.Status === 'PLACED').length;
  const deliveredOrders = orders.filter(o => o.Status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Orders" value={totalOrders} icon="📋" />
        <SummaryCard title="Total Value" value={`₹${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon="💰" />
        <SummaryCard title="Pending" value={pendingOrders} icon="⏳" />
        <SummaryCard title="Delivered" value={deliveredOrders} icon="✅" />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-2">
          {['All', 'PLACED', 'PAID', 'SHIPPED', 'DELIVERED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === s 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">From:</span>
            <input 
              type="date" 
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">To:</span>
            <input 
              type="date" 
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search buyer or crop..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* ORDER TABLE */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="text-5xl mb-4 opacity-80">📦</div>
          <h4 className="text-xl font-medium text-gray-800 mb-1">No orders yet</h4>
          <p className="text-sm text-gray-500">Orders will appear here once buyers start purchasing</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(o => (
                <tr key={o.OrderID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">#{o.OrderID}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {o.BuyerName}
                    <div className="text-xs text-gray-500 font-normal">{o.BuyerCity}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{o.CropName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{o.FarmerName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{o.WarehouseLocation}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{o.Quantity} kg</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">₹{parseFloat(o.OrderValue).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(o.OrderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <StatusBadge status={o.Status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    {(o.Status === 'PLACED' || o.Status === 'PAID') && (
                      <button 
                        onClick={() => handleUpdateStatus(o.OrderID, 'SHIPPED')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded shadow-sm transition-colors text-xs"
                      >
                        Mark as SHIPPED
                      </button>
                    )}
                    {o.Status === 'SHIPPED' && (
                      <button 
                        onClick={() => handleUpdateStatus(o.OrderID, 'DELIVERED')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded shadow-sm transition-colors text-xs"
                      >
                        Mark as DELIVERED
                      </button>
                    )}
                    {o.Status === 'DELIVERED' && (
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">
                        ✅ Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-2xl border border-purple-100">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    PLACED: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-orange-100 text-orange-800',
    DELIVERED: 'bg-green-100 text-green-800',
  };
  const badgeStyle = styles[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeStyle}`}>
      {status}
    </span>
  );
};

export default OrdersMgmtTab;
