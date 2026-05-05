import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getUnassignedTransport, 
  getAllTransport, 
  assignTransport, 
  updateTransportStatus,
  shipTransport
} from '../../api/axiosClient';

const AssignDriverTab = () => {
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for forms inside the cards
  const [forms, setForms] = useState({});

  const loadData = async () => {
    try {
      const [unRes, allRes] = await Promise.all([
        getUnassignedTransport(),
        getAllTransport()
      ]);
      setUnassignedOrders(unRes.data || []);
      setActiveDeliveries(allRes.data || []);
      
      // Initialize form state for unassigned orders
      const newForms = {};
      (unRes.data || []).forEach(o => {
        newForms[o.OrderID] = { TransportID: '', VehicleNo: '', DriverName: '' };
      });
      setForms(prev => ({...newForms, ...prev})); // Keep existing input
    } catch (err) {
      toast.error('Failed to load transport data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (orderId, field, value) => {
    setForms(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value }
    }));
  };

  const handleAssignDriver = async (orderId) => {
    const formData = forms[orderId];
    if (!formData.TransportID || !formData.VehicleNo || !formData.DriverName) {
      return toast.error('All fields are required');
    }

    try {
      setLoading(true);
      await assignTransport({
        TransportID: parseInt(formData.TransportID),
        OrderID: orderId,
        VehicleNo: formData.VehicleNo,
        DriverName: formData.DriverName
      });
      toast.success(`🚚 Driver assigned! Now mark as SHIPPED to start delivery.`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign driver');
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (transportId) => {
    try {
      await shipTransport(transportId);
      toast.success('Order marked as SHIPPED!');
      loadData();
    } catch (err) {
      toast.error('Failed to ship order');
    }
  };

  const handleMarkDelivered = async (transportId) => {
    try {
      await updateTransportStatus(transportId, 'DELIVERED');
      toast.success('Status updated to DELIVERED');
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-10">
      {/* SECTION 1: UNASSIGNED PAID ORDERS */}
      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">🚚 Unassigned Paid Orders</h3>
        {unassignedOrders.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
            <div className="text-4xl mb-2 opacity-50">🎉</div>
            <p className="font-medium">All paid orders have drivers assigned!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unassignedOrders.map(o => (
              <div key={o.OrderID} className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-400 p-5 flex flex-col lg:flex-row gap-6">
                
                {/* LEFT side — Order details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-lg text-gray-800">Order #{o.OrderID}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {o.Status}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">🌾 {o.CropName}</span> — {o.Quantity} kg
                  </div>
                  <div className="text-gray-600 text-sm">
                    🛒 Buyer: <span className="font-medium">{o.BuyerName}</span>, {o.BuyerCity}
                  </div>
                  <div className="text-gray-600 text-sm">
                    🏭 Warehouse: <span className="font-medium">{o.WarehouseLocation}</span>
                  </div>
                  <div className="text-gray-500 text-xs mt-2">
                    📅 Ordered: {new Date(o.OrderDate).toLocaleDateString()}
                  </div>
                </div>

                {/* RIGHT side — Driver assignment form */}
                <div className="lg:w-96 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Assign Transport</h4>
                  <div className="space-y-3">
                    <div>
                      <input 
                        type="number"
                        placeholder="TransportID (e.g., 701)"
                        value={forms[o.OrderID]?.TransportID || ''}
                        onChange={e => handleFormChange(o.OrderID, 'TransportID', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input 
                        type="text"
                        placeholder="Vehicle No (e.g., TN01AB1234)"
                        value={forms[o.OrderID]?.VehicleNo || ''}
                        onChange={e => handleFormChange(o.OrderID, 'VehicleNo', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input 
                        type="text"
                        placeholder="Driver Name (e.g., Rajan Kumar)"
                        value={forms[o.OrderID]?.DriverName || ''}
                        onChange={e => handleFormChange(o.OrderID, 'DriverName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleAssignDriver(o.OrderID)}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded transition-colors text-sm disabled:opacity-70 mt-1"
                    >
                      🚚 Assign Driver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: ACTIVE DELIVERIES TABLE */}
      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">📋 All Transport Records</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    No active transport records found.
                  </td>
                </tr>
              ) : (
                activeDeliveries.map(t => (
                  <tr key={t.TransportID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">#{t.TransportID}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{t.OrderID}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{t.CropName} <span className="text-xs text-gray-500">({t.Quantity}kg)</span></td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{t.BuyerName}, {t.City}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{t.DriverName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{t.VehicleNo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        t.TransportStatus === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        t.TransportStatus === 'IN_TRANSIT' ? 'bg-orange-100 text-orange-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {t.TransportStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {t.TransportStatus === 'ASSIGNED' ? (
                        <button 
                          onClick={() => handleShipOrder(t.TransportID)}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-colors text-xs font-bold shadow-sm"
                        >
                          🚢 Mark Shipped
                        </button>
                      ) : t.TransportStatus === 'IN_TRANSIT' ? (
                        <button 
                          onClick={() => handleMarkDelivered(t.TransportID)}
                          className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors text-xs font-bold border border-green-200"
                        >
                          ✅ Mark Delivered
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AssignDriverTab;
