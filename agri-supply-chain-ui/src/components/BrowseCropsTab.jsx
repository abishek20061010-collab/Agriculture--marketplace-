import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useApi } from '../api/useApi';
import { getAllCrops, getAllWarehouses, placeOrder } from '../api/axiosClient';
import EmptyState from './EmptyState';

const getCropEmoji = (name) => {
  if (!name) return '🌿';
  const n = name.toLowerCase();
  if (n.includes('rice') || n.includes('wheat')) return '🌾';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('corn') || n.includes('maize')) return '🌽';
  if (n.includes('potato')) return '🥔';
  return '🌿';
};

const CropMarketCard = ({ crop, warehouses, buyerId, onOrderSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const handlePlaceOrder = async () => {
    if (quantity < 1) {
      toast.error('Quantity must be at least 1 kg');
      return;
    }

    const targetWarehouseId = warehouses.length > 0 ? warehouses[0].WarehouseID : 101;

    setLoading(true);
    try {
      const payload = {
        BuyerID: buyerId,
        CropID: crop.CropID,
        WarehouseID: parseInt(targetWarehouseId),
        Quantity: parseInt(quantity)
      };
      
      const res = await placeOrder(payload);
      toast.success(`✅ Order placed! Order #${res.data?.order_id || ''}`);
      setOrdered(true);
      if (onOrderSuccess) onOrderSuccess();
      setTimeout(() => setOrdered(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all overflow-hidden group">
      {/* TOP STRIP */}
      <div className="bg-agri-green p-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="text-5xl mb-2 drop-shadow-md relative z-10">{getCropEmoji(crop.CropName)}</span>
        <h3 className="text-white text-[16px] font-bold text-center relative z-10 tracking-wide">{crop.CropName}</h3>
      </div>

      {/* BODY */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <p className="text-[22px] font-bold text-[#F4A300] leading-none">₹ {crop.PricePerKg}</p>
          <p className="text-gray-500 text-[11px] mt-1 uppercase tracking-wider font-semibold">per kilogram</p>
        </div>
        
        <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100 shadow-inner">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">👨‍🌾</span> 
            <span className="font-medium text-gray-800">{crop.FarmerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span> 
            <span>{crop.FarmerLocation}</span>
          </div>
        </div>

        <div className="h-px w-full bg-gray-100 my-2"></div>

        {/* ORDER FORM */}
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-500 uppercase w-20">Qty (kg)</label>
            <input 
              type="number" 
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-colors"
            />
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={loading || ordered}
            className={`w-full mt-2 py-2.5 rounded-lg font-bold transition-all flex justify-center items-center shadow-sm ${
              ordered 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-[#F4A300] hover:bg-[#c47f00] text-[#1a2e1a] border border-transparent'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1a2e1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : ordered ? (
              '✅ Ordered!'
            ) : (
              '🛒 Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const BrowseCropsTab = ({ buyerId, setActiveTab }) => {
  const { data: cropsData, loading: loadingCrops } = useApi(getAllCrops, []);
  const { data: warehousesData, loading: loadingWarehouses } = useApi(getAllWarehouses, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('nameAsc');
  const [locationFilter, setLocationFilter] = useState('All');

  if (loadingCrops || loadingWarehouses) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl w-full"></div>;
  }

  const crops = cropsData || [];
  const warehouses = warehousesData || [];

  const uniqueLocations = ['All', ...new Set(crops.map(c => c.FarmerLocation).filter(Boolean))];

  let filteredCrops = crops.filter(c => {
    let match = true;
    if (searchTerm && !c.CropName.toLowerCase().includes(searchTerm.toLowerCase())) match = false;
    if (c.PricePerKg < minPrice || c.PricePerKg > maxPrice) match = false;
    if (locationFilter !== 'All' && c.FarmerLocation !== locationFilter) match = false;
    return match;
  });

  if (sortBy === 'priceLowHigh') {
    filteredCrops.sort((a, b) => a.PricePerKg - b.PricePerKg);
  } else if (sortBy === 'priceHighLow') {
    filteredCrops.sort((a, b) => b.PricePerKg - a.PricePerKg);
  } else if (sortBy === 'nameAsc') {
    filteredCrops.sort((a, b) => a.CropName.localeCompare(b.CropName));
  }

  return (
    <div>
      {/* FILTER BAR - STICKY */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-1/4">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Search</label>
          <div className="relative">
            <span className="absolute left-3 top-2 opacity-50">🔍</span>
            <input 
              type="text" 
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="w-full lg:w-1/4">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Price Range: <span className="text-[#1a2e1a]">₹{minPrice} – ₹{maxPrice}</span>
          </label>
          <div className="flex gap-2 items-center">
            <input 
              type="range" 
              min="0" max="1000" step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full accent-agri-green h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="w-full lg:w-1/4">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white shadow-sm"
          >
            <option value="nameAsc">Name A–Z</option>
            <option value="priceLowHigh">Price Low → High</option>
            <option value="priceHighLow">Price High → Low</option>
          </select>
        </div>

        <div className="w-full lg:w-1/4">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Location</label>
          <select 
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white shadow-sm"
          >
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map(crop => (
            <CropMarketCard 
              key={crop.CropID} 
              crop={crop} 
              warehouses={warehouses} 
              buyerId={buyerId} 
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🌾" 
          title="No crops available" 
          subtitle="Try clearing your filters or check back later for fresh produce." 
        />
      )}
    </div>
  );
};

export default BrowseCropsTab;
