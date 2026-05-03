import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllBuyers, getBuyerOrders } from '../../api/axiosClient';

const BuyersTab = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expanded row state: mapping of buyerId -> array of their orders (or null if not expanded)
  const [expandedBuyers, setExpandedBuyers] = useState({});

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const res = await getAllBuyers();
      setBuyers(res.data || []);
    } catch (err) {
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, []);

  const toggleExpand = async (buyerId) => {
    // If already expanded, collapse it
    if (expandedBuyers[buyerId]) {
      const newExpanded = { ...expandedBuyers };
      delete newExpanded[buyerId];
      setExpandedBuyers(newExpanded);
      return;
    }

    // Otherwise, expand and fetch data
    try {
      const res = await getBuyerOrders(buyerId);
      setExpandedBuyers(prev => ({
        ...prev,
        [buyerId]: res.data || []
      }));
    } catch (err) {
      toast.error('Failed to load buyer orders');
    }
  };

  const filteredBuyers = buyers.filter(b => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      b.Name?.toLowerCase().includes(lowerSearch) || 
      b.City?.toLowerCase().includes(lowerSearch)
    );
  });

  const totalBuyersCount = buyers.length;
  const totalOrdersCount = buyers.reduce((sum, b) => sum + parseInt(b.total_orders || 0), 0);
  const grandTotalRevenue = buyers.reduce((sum, b) => sum + parseFloat(b.total_spent || 0), 0);

  return (
    <div className="space-y-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Buyers" value={totalBuyersCount} icon="👥" />
        <SummaryCard title="Total Orders" value={totalOrdersCount} icon="📦" />
        <SummaryCard title="Grand Total Revenue" value={`₹${grandTotalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon="💰" />
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Buyer Directory</h3>
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* BUYERS TABLE */}
      {filteredBuyers.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="text-5xl mb-4 opacity-80">👥</div>
          <h4 className="text-xl font-medium text-gray-800 mb-1">No buyers yet</h4>
          <p className="text-sm text-gray-500">Buyers will appear here after registration</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuyers.map(b => (
                <React.Fragment key={b.BuyerID}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{b.BuyerID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{b.Phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{b.City}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-purple-600">{b.total_orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{parseFloat(b.total_spent).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {b.last_order_date ? new Date(b.last_order_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => toggleExpand(b.BuyerID)}
                        className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold"
                      >
                        {expandedBuyers[b.BuyerID] ? '🔼 Hide Orders' : '👁️ View Orders'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* EXPANDED SUB-TABLE */}
                  {expandedBuyers[b.BuyerID] && (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 bg-purple-50/50 border-t border-purple-100">
                        {expandedBuyers[b.BuyerID].length === 0 ? (
                          <div className="text-center text-sm text-gray-500 py-4">This buyer has no active orders.</div>
                        ) : (
                          <div className="rounded-lg overflow-hidden border border-purple-100 bg-white">
                            <table className="min-w-full divide-y divide-purple-100">
                              <thead className="bg-purple-100/50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-purple-800 uppercase">Order ID</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-purple-800 uppercase">Crop Name</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-purple-800 uppercase">Qty</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-purple-800 uppercase">Value</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-purple-800 uppercase">Date</th>
                                  <th className="px-4 py-2 text-center text-xs font-medium text-purple-800 uppercase">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-purple-50">
                                {expandedBuyers[b.BuyerID].map(order => {
                                  const value = parseFloat(order.Quantity) * parseFloat(order.PricePerKg);
                                  return (
                                    <tr key={order.OrderID} className="hover:bg-purple-50/30">
                                      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-600">#{order.OrderID}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-800">{order.CropName}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-xs text-blue-600 font-medium">{order.Quantity} kg</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-xs text-green-600 font-medium">₹{value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{new Date(order.OrderDate).toLocaleDateString()}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-center">
                                        <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${
                                          order.Status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                          order.Status === 'SHIPPED' ? 'bg-orange-100 text-orange-800' :
                                          order.Status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {order.Status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-3xl border border-purple-100">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

export default BuyersTab;
