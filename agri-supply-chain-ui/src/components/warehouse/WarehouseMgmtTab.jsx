import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getAllWarehouses, 
  getWarehouseAllocations, 
  updateWarehouseLocation, 
  updateWarehouseAllocation, 
  createWarehouseAllocation,
  getAllCrops,
  addWarehouse
} from '../../api/axiosClient';

const WarehouseMgmtTab = ({ warehouseID }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Warehouse Form State
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [warehouseFormData, setWarehouseFormData] = useState({
    WarehouseID: '',
    Location: '',
    Capacity: '5000'
  });

  // Edit Location State
  const [editingLocId, setEditingLocId] = useState(null);
  const [newLocValue, setNewLocValue] = useState('');

  // Edit Qty State
  const [editingAlloc, setEditingAlloc] = useState(null); // { wId, cId }
  const [newQtyValue, setNewQtyValue] = useState('');

  // Add Allocation Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    WarehouseID: '',
    CropID: '',
    Quantity: ''
  });

  const loadData = async () => {
    try {
      const [whRes, allocRes, cropsRes] = await Promise.all([
        getAllWarehouses(),
        getWarehouseAllocations(),
        getAllCrops()
      ]);
      setWarehouses(whRes.data || []);
      setAllocations(allocRes.data || []);
      setCrops(cropsRes.data || []);
    } catch (err) {
      toast.error('Failed to load warehouse data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveLocation = async (id) => {
    if (!newLocValue.trim()) return toast.error('Location cannot be empty');
    try {
      await updateWarehouseLocation(id, newLocValue.trim());
      toast.success('Location updated');
      setEditingLocId(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update location');
    }
  };

  const handleSaveQty = async (wId, cId) => {
    if (!newQtyValue || parseInt(newQtyValue) < 0) return toast.error('Enter valid quantity');
    try {
      await updateWarehouseAllocation({ WarehouseID: wId, CropID: cId, Quantity: parseInt(newQtyValue) });
      toast.success('Quantity updated');
      setEditingAlloc(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleAddAllocation = async (e) => {
    e.preventDefault();
    if (!formData.WarehouseID || !formData.CropID || !formData.Quantity) {
      return toast.error('All fields required');
    }
    setLoading(true);
    try {
      await createWarehouseAllocation({
        WarehouseID: parseInt(formData.WarehouseID),
        CropID: parseInt(formData.CropID),
        Quantity: parseInt(formData.Quantity)
      });
      toast.success('Allocation added successfully');
      setFormData({ WarehouseID: '', CropID: '', Quantity: '' });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      toast.error('Failed to add allocation');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    if (!warehouseFormData.WarehouseID || !warehouseFormData.Location) {
      return toast.error('ID and Location are required');
    }
    setLoading(true);
    try {
      await addWarehouse({
        WarehouseID: parseInt(warehouseFormData.WarehouseID),
        Location: warehouseFormData.Location,
        Capacity: parseInt(warehouseFormData.Capacity)
      });
      toast.success('Warehouse added successfully');
      setWarehouseFormData({ WarehouseID: '', Location: '', Capacity: '5000' });
      setShowAddWarehouse(false);
      loadData();
    } catch (err) {
      toast.error('Failed to add warehouse');
    } finally {
      setLoading(false);
    }
  };

  const getUsedCapacity = (wId) => {
    return allocations
      .filter(a => a.WarehouseID === wId)
      .reduce((sum, a) => sum + parseInt(a.Quantity || 0), 0);
  };

  const getCropsCount = (wId) => {
    return allocations.filter(a => a.WarehouseID === wId).length;
  };

  return (
    <div className="space-y-10">
      {/* SECTION 1: WAREHOUSE LOCATIONS */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">🏭 Warehouse Locations</h3>
          <button 
            onClick={() => setShowAddWarehouse(!showAddWarehouse)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            {showAddWarehouse ? '❌ Cancel' : '➕ Add Warehouse'}
          </button>
        </div>

        {showAddWarehouse && (
          <div className="bg-purple-50 rounded-xl p-5 mb-6 border border-purple-100 shadow-inner">
            <h4 className="font-semibold text-purple-800 mb-3 text-sm uppercase tracking-wider">New Warehouse Details</h4>
            <form onSubmit={handleAddWarehouse} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse ID</label>
                <input 
                  type="number" 
                  required
                  value={warehouseFormData.WarehouseID}
                  onChange={e => setWarehouseFormData({...warehouseFormData, WarehouseID: e.target.value})}
                  placeholder="e.g., 103"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                <input 
                  type="text" 
                  required
                  value={warehouseFormData.Location}
                  onChange={e => setWarehouseFormData({...warehouseFormData, Location: e.target.value})}
                  placeholder="e.g., Coimbatore"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg)</label>
                <input 
                  type="number" 
                  required
                  value={warehouseFormData.Capacity}
                  onChange={e => setWarehouseFormData({...warehouseFormData, Capacity: e.target.value})}
                  placeholder="e.g., 5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70 shadow-md"
                >
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map(w => {
            const used = getUsedCapacity(w.WarehouseID);
            const capacity = w.Capacity || 10000;
            const percent = Math.min((used / capacity) * 100, 100);
            const colorClass = percent < 50 ? 'bg-green-500' : percent < 85 ? 'bg-amber-500' : 'bg-red-500';

            return (
              <div key={w.WarehouseID} className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 p-5 relative transition-transform hover:-translate-y-1">
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">
                  ID: {w.WarehouseID}
                </div>
                
                {editingLocId === w.WarehouseID ? (
                  <div className="mb-3 flex items-center gap-2">
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-full"
                      value={newLocValue}
                      onChange={e => setNewLocValue(e.target.value)}
                    />
                    <button onClick={() => handleSaveLocation(w.WarehouseID)} className="text-green-600 text-sm font-medium hover:underline">Save</button>
                    <button onClick={() => setEditingLocId(null)} className="text-gray-500 text-sm hover:underline">Cancel</button>
                  </div>
                ) : (
                  <div className="mb-3 flex items-center justify-between mt-1 pr-14">
                    <h4 className="text-lg font-bold text-gray-800">🏭 {w.Location}</h4>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium">
                    <span>Capacity: {used.toLocaleString()} / {capacity.toLocaleString()} kg</span>
                    <span>{percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${colorClass} h-2 rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Total Crops Stored: <span className="font-bold text-gray-700">{getCropsCount(w.WarehouseID)}</span>
                  </div>
                  {editingLocId !== w.WarehouseID && (
                    <button 
                      onClick={() => { setEditingLocId(w.WarehouseID); setNewLocValue(w.Location); }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                    >
                      ✏️ Edit Location
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: ALLOCATIONS */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">📦 Crop-Warehouse Allocations</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            {showAddForm ? '❌ Cancel' : '➕ Add Allocation'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-purple-50 rounded-xl p-5 mb-6 border border-purple-100 shadow-inner">
            <h4 className="font-semibold text-purple-800 mb-3">Add New Allocation</h4>
            <form onSubmit={handleAddAllocation} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <select 
                  required
                  value={formData.WarehouseID}
                  onChange={e => setFormData({...formData, WarehouseID: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                >
                  <option value="">Select Warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w.WarehouseID} value={w.WarehouseID}>{w.Location} (ID: {w.WarehouseID})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                <select 
                  required
                  value={formData.CropID}
                  onChange={e => setFormData({...formData, CropID: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                >
                  <option value="">Select Crop...</option>
                  {crops.map(c => (
                    <option key={c.CropID} value={c.CropID}>{c.CropName} (Farmer: {c.FarmerName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={formData.Quantity}
                  onChange={e => setFormData({...formData, Quantity: e.target.value})}
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Stored (kg)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No allocations found.
                  </td>
                </tr>
              ) : (
                allocations.map(a => {
                  const isEditing = editingAlloc?.wId === a.WarehouseID && editingAlloc?.cId === a.CropID;
                  return (
                    <tr key={`${a.WarehouseID}-${a.CropID}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.Location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.CropName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.FarmerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {isEditing ? (
                          <input 
                            type="number"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            value={newQtyValue}
                            onChange={e => setNewQtyValue(e.target.value)}
                          />
                        ) : (
                          `${a.Quantity.toLocaleString()} kg`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing ? (
                          <div className="flex justify-end space-x-3">
                            <button onClick={() => handleSaveQty(a.WarehouseID, a.CropID)} className="text-green-600 hover:text-green-900">Save</button>
                            <button onClick={() => setEditingAlloc(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setEditingAlloc({wId: a.WarehouseID, cId: a.CropID}); setNewQtyValue(a.Quantity); }} 
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                          >
                            ✏️ Edit Qty
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default WarehouseMgmtTab;
