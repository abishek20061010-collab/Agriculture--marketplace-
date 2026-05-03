import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getAllFarmers, 
  getAllCrops, 
  addCrop, 
  updateCropPrice, 
  deleteCrop 
} from '../../api/axiosClient';

const CropsTab = ({ warehouseID }) => {
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    CropID: '',
    CropName: '',
    PricePerKg: '',
    FarmerID: ''
  });
  const [loading, setLoading] = useState(false);

  // Edit State
  const [editingCrop, setEditingCrop] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  const loadData = async () => {
    try {
      const [farmersRes, cropsRes] = await Promise.all([
        getAllFarmers(),
        getAllCrops()
      ]);
      setFarmers(farmersRes.data || []);
      setCrops(cropsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.CropID || !formData.CropName || !formData.PricePerKg || !formData.FarmerID) {
      return toast.error('All fields are required');
    }

    setLoading(true);
    try {
      await addCrop({
        CropID: parseInt(formData.CropID),
        CropName: formData.CropName,
        PricePerKg: parseFloat(formData.PricePerKg),
        FarmerID: parseInt(formData.FarmerID)
      });
      
      const selectedFarmer = farmers.find(f => f.FarmerID === parseInt(formData.FarmerID));
      toast.success(`✅ Crop added and assigned to ${selectedFarmer?.Name || 'Farmer'}!`);
      
      setFormData({ CropID: '', CropName: '', PricePerKg: '', FarmerID: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add crop');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrice = async (cropID) => {
    if (!editPrice || parseFloat(editPrice) <= 0) return toast.error('Enter valid price');
    try {
      await updateCropPrice(cropID, parseFloat(editPrice));
      toast.success('Price updated successfully!');
      setEditingCrop(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  const handleDelete = async (cropID) => {
    if (!window.confirm('Are you sure you want to remove this crop?')) return;
    try {
      await deleteCrop(cropID);
      toast.success('Crop removed successfully!');
      loadData();
    } catch (err) {
      toast.error('Failed to delete crop');
    }
  };

  const filteredCrops = crops.filter(c => 
    c.CropName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.FarmerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* SECTION 1: ADD CROP FORM */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">🌱 Add New Crop</h3>
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop ID</label>
            <input 
              type="number" 
              required
              placeholder="e.g., 201"
              value={formData.CropID}
              onChange={e => setFormData({...formData, CropID: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g., Rice, Wheat"
              value={formData.CropName}
              onChange={e => setFormData({...formData, CropName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Kg</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
              <input 
                type="number" 
                step="0.01"
                required
                placeholder="0.00"
                value={formData.PricePerKg}
                onChange={e => setFormData({...formData, PricePerKg: e.target.value})}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Farmer</label>
            <select
              required
              value={formData.FarmerID}
              onChange={e => setFormData({...formData, FarmerID: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
            >
              <option value="">Select Farmer...</option>
              {farmers.map(f => (
                <option key={f.FarmerID} value={f.FarmerID}>
                  {f.Name} (ID: {f.FarmerID}) — {f.Location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-70"
            >
              🌱 Add Crop
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: ALL CROPS TABLE */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Crops</h3>
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search by crop or farmer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {filteredCrops.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3">🌱</div>
            <h4 className="text-lg font-medium text-gray-700">No crops yet</h4>
            <p className="text-sm">Add the first crop above</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/kg</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCrops.map(crop => (
                  <tr key={crop.CropID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{crop.CropID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop.CropName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{crop.FarmerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.FarmerLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {editingCrop === crop.CropID ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">₹</span>
                          <input 
                            type="number"
                            step="0.01"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                          />
                        </div>
                      ) : (
                        `₹${parseFloat(crop.PricePerKg).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCrop === crop.CropID ? (
                        <div className="flex justify-end space-x-3">
                          <button onClick={() => handleSavePrice(crop.CropID)} className="text-green-600 hover:text-green-900">Save</button>
                          <button onClick={() => setEditingCrop(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-4">
                          <button 
                            onClick={() => { setEditingCrop(crop.CropID); setEditPrice(crop.PricePerKg); }} 
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(crop.CropID)} 
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropsTab;
