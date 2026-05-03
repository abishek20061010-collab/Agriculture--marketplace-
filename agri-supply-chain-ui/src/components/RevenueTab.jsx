import React from 'react';
import { useApi } from '../api/useApi';
import { getFarmerRevenue, getRevenuePerCrop } from '../api/axiosClient';
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

const RevenueTab = ({ farmerId }) => {
  const { data: totalData, loading: loadingTotal } = useApi(() => getFarmerRevenue(farmerId), [farmerId]);
  const { data: cropData, loading: loadingCrops } = useApi(() => getRevenuePerCrop(farmerId), [farmerId]);

  if (loadingTotal || loadingCrops) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl w-full"></div>;
  }

  const totalRevenue = totalData?.total || 0;
  const crops = cropData || [];
  
  const totalOrdersFulfilled = crops.reduce((sum, crop) => sum + Number(crop.order_count), 0);
  const bestSellingCrop = crops.length > 0 ? crops[0].CropName : 'N/A';

  const chartData = {
    labels: crops.map(c => c.CropName),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: crops.map(c => Number(c.revenue)),
        backgroundColor: '#1a6b3c',
        hoverBackgroundColor: '#4CAF50',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Revenue by Crop',
        font: { size: 16, weight: 'bold' },
        color: '#1a2e1a'
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹ ${context.raw}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div>
      {/* TOP ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-agri-gold">₹ {Number(totalRevenue).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Orders Fulfilled</p>
          <p className="text-3xl font-bold text-agri-dark">{totalOrdersFulfilled}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Best Selling Crop</p>
          <p className="text-3xl font-bold text-agri-green">{bestSellingCrop}</p>
        </div>
      </div>

      {crops.length > 0 ? (
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
                    <th className="p-4 font-semibold text-center">Orders</th>
                    <th className="p-4 font-semibold text-right">Revenue (₹)</th>
                    <th className="p-4 font-semibold text-right">Avg / Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {crops.map((crop, idx) => {
                    const rev = Number(crop.revenue);
                    const count = Number(crop.order_count);
                    const avg = count > 0 ? (rev / count).toFixed(2) : '0.00';
                    return (
                      <tr key={idx} className="hover:bg-agri-pale">
                        <td className="p-4 text-sm font-bold text-agri-dark">{crop.CropName}</td>
                        <td className="p-4 text-sm text-gray-600 text-center">{count}</td>
                        <td className="p-4 text-sm font-semibold text-agri-darkgold text-right">₹ {rev.toFixed(2)}</td>
                        <td className="p-4 text-sm text-gray-600 text-right">₹ {avg}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState icon="💰" title="No revenue data" subtitle="Complete orders to see your revenue breakdown." />
      )}
    </div>
  );
};

export default RevenueTab;
