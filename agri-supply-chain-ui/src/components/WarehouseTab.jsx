import React, { useMemo } from 'react';
import { useApi } from '../api/useApi';
import { getFarmerWarehouse } from '../api/axiosClient';
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

const WarehouseCard = ({ warehouse }) => {
  const capacity = Number(warehouse.Capacity);
  const usedQty = Number(warehouse.usedQty);
  let pct = capacity > 0 ? (usedQty / capacity) * 100 : 0;
  if (pct > 100) pct = 100;
  
  let barColor = 'bg-[#4CAF50]'; // green
  if (pct >= 70 && pct <= 90) barColor = 'bg-amber-400';
  if (pct > 90) barColor = 'bg-red-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
        <h3 className="font-bold text-[#1a2e1a] text-lg flex items-center gap-2">
          <span className="text-2xl">🏭</span> {warehouse.Location}
        </h3>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-mono font-semibold shadow-inner border border-gray-200">
          ID: {warehouse.WarehouseID}
        </span>
      </div>

      {/* CAPACITY BAR */}
      <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
        <div className="flex justify-between text-sm font-semibold mb-3">
          <span className="text-gray-500 uppercase tracking-wide text-xs">Capacity Used: <span className="text-gray-900 ml-1">{usedQty} / {capacity} kg</span></span>
          <span className={`text-sm ${pct > 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'}`}>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`} 
            style={{ width: `${pct}%` }}
          ></div>
        </div>
      </div>

      {/* CROPS MINI TABLE */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Stored Crops</h4>
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Crop</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Qty Stored (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {warehouse.crops.map((c, idx) => (
                <tr key={idx} className="hover:bg-agri-pale transition-colors bg-white">
                  <td className="px-4 py-3 font-bold text-gray-800 flex items-center gap-3">
                    <span className="text-xl bg-gray-50 rounded-md p-1 border border-gray-100">{getCropEmoji(c.CropName)}</span>
                    {c.CropName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-agri-darkgold text-right">
                    {c.Quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const WarehouseTab = ({ farmerId }) => {
  const { data: rawData, loading } = useApi(() => getFarmerWarehouse(farmerId), [farmerId]);

  const { warehouses, totalWarehousesUsed, totalQtyStored } = useMemo(() => {
    if (!rawData || rawData.length === 0) return { warehouses: [], totalWarehousesUsed: 0, totalQtyStored: 0 };

    const whMap = {};
    let totalQty = 0;

    rawData.forEach(row => {
      if (!whMap[row.WarehouseID]) {
        whMap[row.WarehouseID] = {
          WarehouseID: row.WarehouseID,
          Location: row.Location,
          Capacity: row.Capacity,
          usedQty: 0,
          crops: []
        };
      }
      
      const qty = Number(row.Quantity);
      whMap[row.WarehouseID].usedQty += qty;
      whMap[row.WarehouseID].crops.push({
        CropID: row.CropID,
        CropName: row.CropName,
        Quantity: qty
      });
      
      totalQty += qty;
    });

    return {
      warehouses: Object.values(whMap).sort((a, b) => b.usedQty - a.usedQty),
      totalWarehousesUsed: Object.keys(whMap).length,
      totalQtyStored: totalQty
    };
  }, [rawData]);

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl w-full"></div>;
  }

  return (
    <div>
      {/* SUMMARY CARD */}
      <div className="bg-gradient-to-r from-[#1a6b3c] to-[#258249] text-white rounded-2xl p-6 mb-8 shadow-md flex flex-col sm:flex-row gap-6 sm:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <span className="text-9xl">🏭</span>
        </div>
        <div className="flex-1 border-b sm:border-b-0 sm:border-r border-white/20 pb-4 sm:pb-0 relative z-10">
          <p className="text-green-100 text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">Total Warehouses Used</p>
          <p className="text-4xl font-bold">{totalWarehousesUsed}</p>
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-green-100 text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">Total Quantity Stored</p>
          <p className="text-4xl font-bold text-[#F4A300]">{totalQtyStored} <span className="text-xl font-medium text-green-100/80">kg</span></p>
        </div>
      </div>

      {/* WAREHOUSE CARDS */}
      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warehouses.map(wh => (
            <WarehouseCard key={wh.WarehouseID} warehouse={wh} />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🏭" 
          title="No warehouse allocation" 
          subtitle="Allocate crops through the order system when buyers place orders." 
        />
      )}
    </div>
  );
};

export default WarehouseTab;
