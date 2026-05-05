import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getFarmerDetails, addFarmer } from '../../api/axiosClient';

const FarmersTab = () => {
  const [farmersData, setFarmersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Farmer Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    FarmerID: '',
    Name: '',
    Phone: '',
    Location: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getFarmerDetails();
      setFarmersData(res.data || []);
    } catch (err) {
      toast.error('Failed to load farmer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.FarmerID || !formData.Name || !formData.Phone || !formData.Location) {
      return toast.error('All fields are required');
    }

    try {
      setLoading(true);
      await addFarmer({
        FarmerID: parseInt(formData.FarmerID),
        Name: formData.Name,
        Phone: formData.Phone,
        Location: formData.Location
      });
      toast.success('👨‍🌾 Farmer added successfully!');
      setFormData({ FarmerID: '', Name: '', Phone: '', Location: '' });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      toast.error('Failed to add farmer');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = farmersData.filter(f => 
    f.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.FarmerID.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">🧑‍🌾 Farmer Management</h3>
        <div className="flex gap-4">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            {showAddForm ? '❌ Cancel' : '🧑‍🌾 Add Farmer'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 shadow-inner">
          <h4 className="font-semibold text-purple-800 mb-3 text-sm uppercase tracking-wider">New Farmer Registration</h4>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farmer ID</label>
              <input 
                type="number" 
                required
                value={formData.FarmerID}
                onChange={e => setFormData({...formData, FarmerID: e.target.value})}
                placeholder="e.g., 501"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.Name}
                onChange={e => setFormData({...formData, Name: e.target.value})}
                placeholder="e.g., John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="text" 
                required
                value={formData.Phone}
                onChange={e => setFormData({...formData, Phone: e.target.value})}
                placeholder="e.g., 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Location</label>
              <input 
                type="text" 
                required
                value={formData.Location}
                onChange={e => setFormData({...formData, Location: e.target.value})}
                placeholder="e.g., Erode"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70 shadow-md"
              >
                Save Farmer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Stored</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (kg)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  No farmer records found.
                </td>
              </tr>
            ) : (
              filteredData.map((f, idx) => (
                <tr key={`${f.FarmerID}-${idx}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{f.FarmerID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{f.Name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.FarmerHome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {f.CropName ? (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-100">
                        {f.CropName}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">No crops</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {f.WarehouseLocation ? (
                      <span className="flex items-center gap-1">
                        🏭 {f.WarehouseLocation}
                      </span>
                    ) : (
                      <span className="text-gray-400">---</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {f.Quantity ? `${f.Quantity.toLocaleString()} kg` : '0 kg'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FarmersTab;
