import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useApi } from '../api/useApi';
import { getFarmerCrops } from '../api/axiosClient';
import EmptyState from './EmptyState';

const getCropEmoji = (name) => {
  const n = name.toLowerCase();
  if (n.includes('rice') || n.includes('wheat')) return '🌾';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('corn') || n.includes('maize')) return '🌽';
  if (n.includes('potato')) return '🥔';
  return '🌿';
};

const getBorderColor = (index) => {
  const colors = ['border-green-500', 'border-blue-500', 'border-amber-500', 'border-purple-500'];
  return colors[index % colors.length];
};

const CropCard = ({ crop, index }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 border-l-4 ${getBorderColor(index)} flex flex-col h-full hover:shadow-md transition-shadow relative`}>
      {/* Top Row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCropEmoji(crop.CropName)}</span>
          <h3 className="text-[18px] font-bold text-[#1a2e1a]">{crop.CropName}</h3>
        </div>
        <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-medium border border-gray-200 shadow-sm">
          ID: {crop.CropID}
        </span>
      </div>

      {/* Price Row */}
      <div className="mb-2 flex-grow">
        <div>
          <p className="text-[20px] font-semibold text-[#F4A300]">₹ {crop.PricePerKg} <span className="text-sm font-normal text-gray-500">/ kg</span></p>
          <p className="text-[10px] text-gray-400 mt-1 italic">Price set by Warehouse Admin</p>
        </div>
      </div>
    </div>
  );
};

const MyCropsTab = ({ farmerId }) => {
  const { data: crops, loading } = useApi(() => getFarmerCrops(farmerId), [farmerId]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrops = crops ? crops.filter(c => c.CropName.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-11 bg-gray-200 rounded-lg w-full"></div>
          <div className="mt-2 h-4 bg-gray-100 rounded w-24"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-36 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-7 w-24 bg-gray-200 rounded"></div>
                <div className="h-5 w-12 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-16 bg-gray-100 rounded"></div>
              </div>
              <div className="h-8 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6 relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search crops by name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-agri-green focus:border-agri-green transition-colors shadow-sm"
        />
        <div className="absolute left-3 top-3 opacity-50 text-lg">🔍</div>
        <div className="mt-2 text-sm text-gray-500 font-medium">
          Showing {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'}
        </div>
      </div>

      {/* Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop, index) => (
            <CropCard key={crop.CropID} crop={crop} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🌱" 
          title={searchTerm ? "No crops match your search" : "No crops listed yet"} 
          subtitle={searchTerm ? "Try a different search term" : "Contact your warehouse admin to list your crops"} 
        />
      )}
    </div>
  );
};

export default MyCropsTab;
