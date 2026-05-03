import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getWarehouseAnalytics } from '../../api/axiosClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const AnalyticsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getWarehouseAnalytics();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[340px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="h-[340px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 bg-gray-100 rounded animate-pulse flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-8 border-gray-200"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[340px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="h-[340px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- CHART 1: Revenue by Crop (Bar) ---
  const cropData = {
    labels: data.revenue_by_crop.map(d => d.CropName),
    datasets: [{
      label: 'Revenue (₹)',
      data: data.revenue_by_crop.map(d => parseFloat(d.revenue)),
      backgroundColor: 'rgba(147, 51, 234, 0.7)', // purple-600
      borderColor: 'rgba(147, 51, 234, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };

  // --- CHART 2: Orders by Status (Doughnut) ---
  const statusColors = {
    'PLACED': 'rgba(59, 130, 246, 0.7)', // blue-500
    'PAID': 'rgba(245, 158, 11, 0.7)',   // amber-500
    'SHIPPED': 'rgba(249, 115, 22, 0.7)', // orange-500
    'DELIVERED': 'rgba(34, 197, 94, 0.7)',// green-500
    'CANCELLED': 'rgba(239, 68, 68, 0.7)' // red-500
  };
  
  const statusLabels = data.orders_by_status.map(d => d.Status);
  const statusData = {
    labels: statusLabels,
    datasets: [{
      data: data.orders_by_status.map(d => parseInt(d.count)),
      backgroundColor: statusLabels.map(s => statusColors[s] || 'rgba(156, 163, 175, 0.7)'),
      borderWidth: 1,
    }]
  };

  // --- CHART 3: Revenue by Farmer (Horizontal Bar) ---
  const farmerData = {
    labels: data.revenue_by_farmer.map(d => d.FarmerName),
    datasets: [{
      label: 'Revenue (₹)',
      data: data.revenue_by_farmer.map(d => parseFloat(d.revenue)),
      backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };

  // --- CHART 4: Monthly Trend (Mixed: Bar for Orders, Line for Revenue) ---
  const trendData = {
    labels: data.monthly_trend.map(d => d.month),
    datasets: [
      {
        type: 'line',
        label: 'Revenue (₹)',
        data: data.monthly_trend.map(d => parseFloat(d.revenue)),
        borderColor: 'rgba(147, 51, 234, 1)', // purple
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y1',
        fill: true,
      },
      {
        type: 'bar',
        label: 'Orders Count',
        data: data.monthly_trend.map(d => parseInt(d.orders)),
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y',
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Orders Count' },
        grid: { drawOnChartArea: false },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Revenue (₹)' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <div className="space-y-6">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-[600] text-purple-700 mb-4">Revenue by Crop</h3>
          <div className="h-[280px]">
            <Bar data={cropData} options={baseOptions} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-[600] text-purple-700 mb-4">Orders by Status</h3>
          <div className="h-[280px] flex justify-center">
            <Doughnut data={statusData} options={{ ...baseOptions, cutout: '60%' }} />
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-[600] text-purple-700 mb-4">Revenue by Farmer</h3>
          <div className="h-[280px]">
            <Bar 
              data={farmerData} 
              options={{ ...baseOptions, indexAxis: 'y' }} 
            />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-[600] text-purple-700 mb-4">Monthly Orders & Revenue trend</h3>
          <div className="h-[280px]">
            <Chart type='bar' data={trendData} options={trendOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
