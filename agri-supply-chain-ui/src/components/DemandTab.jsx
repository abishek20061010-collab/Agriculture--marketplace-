import React, { useMemo } from 'react';
import { useApi } from '../api/useApi';
import { getFarmerOrders } from '../api/axiosClient';
import EmptyState from './EmptyState';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DemandTab = ({ farmerId }) => {
  const { data: orders, loading } = useApi(() => getFarmerOrders(farmerId), [farmerId]);

  const { cropStats, topCrop, averageDemand } = useMemo(() => {
    if (!orders || orders.length === 0) return { cropStats: [], topCrop: null, averageDemand: 0 };
    
    const statsMap = {};
    let totalQtyAll = 0;
    
    orders.forEach(o => {
      if (!statsMap[o.CropName]) {
        statsMap[o.CropName] = { cropName: o.CropName, totalQty: 0, orderCount: 0 };
      }
      statsMap[o.CropName].totalQty += Number(o.Quantity);
      statsMap[o.CropName].orderCount += 1;
      totalQtyAll += Number(o.Quantity);
    });

    const statsArray = Object.values(statsMap).sort((a, b) => b.totalQty - a.totalQty);
    const avg = totalQtyAll / statsArray.length;

    // Assign demand levels
    statsArray.forEach(stat => {
      if (stat.totalQty > avg * 1.2) stat.level = 'High';
      else if (stat.totalQty < avg * 0.8) stat.level = 'Low';
      else stat.level = 'Medium';
    });

    return { 
      cropStats: statsArray, 
      topCrop: statsArray.length > 0 ? statsArray[0] : null,
      averageDemand: avg 
    };
  }, [orders]);

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl w-full"></div>;
  }

  if (!cropStats || cropStats.length === 0) {
    return <EmptyState icon="📊" title="No demand data" subtitle="Orders must be placed to calculate crop demand." />;
  }

  const chartData = {
    labels: cropStats.map(c => c.cropName),
    datasets: [
      {
        label: 'Total Qty Ordered (kg)',
        data: cropStats.map(c => c.totalQty),
        backgroundColor: cropStats.map(c => c.level === 'High' ? '#1a6b3c' : c.level === 'Medium' ? '#4CAF50' : '#9ca3af'),
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Quantity Ordered by Crop',
        font: { size: 16, weight: 'bold' },
        color: '#1a2e1a'
      }
    },
    scales: {
      x: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      y: { grid: { display: false } }
    }
  };

  const getBadgeStyle = (level) => {
    switch(level) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return '';
    }
  };

  return (
    <div>
      {/* INSIGHT CARD */}
      {topCrop && (
        <div className="mb-6 bg-gradient-to-r from-agri-pale to-white border border-agri-light/30 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
          <div className="text-4xl bg-white p-3 rounded-full shadow-sm hidden sm:block">💡</div>
          <div>
            <h3 className="text-lg font-bold text-agri-dark mb-1">
              <span className="text-agri-green">{topCrop.cropName}</span> is your most demanded crop!
            </h3>
            <p className="text-sm text-gray-600">
              It has been ordered {topCrop.orderCount} times for a total of <span className="font-semibold text-agri-dark">{topCrop.totalQty} kg</span>. Keep stock ready!
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* CHART */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-[350px]">
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* TABLE */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden self-start">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Crop Name</th>
                  <th className="p-4 font-semibold text-right">Total Qty (kg)</th>
                  <th className="p-4 font-semibold text-center">Orders</th>
                  <th className="p-4 font-semibold text-center">Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cropStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-agri-pale transition-colors">
                    <td className="p-4 text-sm font-bold text-agri-dark">{stat.cropName}</td>
                    <td className="p-4 text-sm font-medium text-gray-900 text-right">{stat.totalQty}</td>
                    <td className="p-4 text-sm text-gray-600 text-center">{stat.orderCount}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm ${getBadgeStyle(stat.level)}`}>
                        {stat.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandTab;
