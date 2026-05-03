import React, { useState } from 'react';
import { useApi } from '../api/useApi';
import { getDeliveryTracking } from '../api/axiosClient';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';

const TrackingCard = ({ shipment }) => {
  const dateStr = new Date(shipment.OrderDate).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const steps = [
    { id: 1, label: 'Order Placed', statuses: ['PLACED', 'PAID', 'SHIPPED', 'DELIVERED'] },
    { id: 2, label: 'Payment Done', statuses: ['PAID', 'SHIPPED', 'DELIVERED'] },
    { id: 3, label: 'Shipped', statuses: ['SHIPPED', 'DELIVERED'] },
    { id: 4, label: 'Delivered', statuses: ['DELIVERED'] }
  ];

  const currentStatus = shipment.OrderStatus.toUpperCase();
  // Determine current active step
  const statusValue = currentStatus === 'PLACED' ? 1 :
                      currentStatus === 'PAID' ? 2 :
                      currentStatus === 'SHIPPED' ? 3 :
                      currentStatus === 'DELIVERED' ? 4 : 0; // 0 for cancelled etc

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-5 hover:shadow-md transition-shadow">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <div>
          <h3 className="font-bold text-[#1a2e1a] text-[16px] mb-1">🚚 Order #{shipment.OrderID}</h3>
          <p className="text-gray-600 text-sm font-medium">
            {shipment.CropName} — {shipment.Quantity} kg
          </p>
        </div>
        <StatusBadge status={shipment.OrderStatus} />
      </div>

      {/* DRIVER INFO ROW */}
      <div className="bg-gray-50 rounded-lg p-3 mt-4 border border-gray-100 flex flex-col md:flex-row gap-x-6 gap-y-2 text-sm text-gray-700 shadow-inner">
        <div><span className="mr-1">🚗</span> <span className="font-medium text-gray-500 uppercase tracking-wider text-xs">Vehicle:</span> {shipment.VehicleNo || 'Pending Allocation'}</div>
        <div><span className="mr-1">👨‍✈️</span> <span className="font-medium text-gray-500 uppercase tracking-wider text-xs">Driver:</span> {shipment.DriverName || 'Pending Allocation'}</div>
        <div className="md:ml-auto"><span className="mr-1">🏭</span> <span className="font-medium text-gray-500 uppercase tracking-wider text-xs">Warehouse:</span> {shipment.WarehouseLocation}</div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mt-8 mb-6 relative px-2">
        <div className="flex justify-between relative z-10 px-2 sm:px-6">
          {steps.map((step, index) => {
            const isCompleted = statusValue > step.id || (statusValue === 4 && step.id === 4);
            const isCurrent = statusValue === step.id && statusValue !== 4; // if 4, all are completed

            return (
              <div key={step.id} className="flex flex-col items-center relative w-1/4">
                {/* Connector Line */}
                {index > 0 && (
                  <div 
                    className={`absolute right-1/2 top-4 w-full h-[2px] -z-10 -translate-y-1/2 ${
                      statusValue >= step.id ? 'bg-[#4CAF50]' : 'bg-gray-200'
                    }`} 
                  />
                )}

                {/* Circle */}
                <div className="relative">
                  {isCurrent && (
                    <div className="absolute inset-0 bg-[#4CAF50] rounded-full animate-ping opacity-75"></div>
                  )}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 relative transition-colors ${
                      isCompleted 
                        ? 'bg-[#4CAF50] text-white shadow-md border-2 border-white ring-2 ring-[#4CAF50]/30' 
                        : isCurrent 
                          ? 'bg-[#4CAF50] text-white shadow-md border-2 border-white ring-2 ring-[#4CAF50]/30' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                </div>

                {/* Label */}
                <p className={`mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center max-w-[80px] ${
                  isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center text-xs">
        <p className="text-gray-500 font-medium">📅 Ordered: {dateStr}</p>
        {statusValue === 4 && (
          <p className="text-green-600 font-bold tracking-wide flex items-center gap-1">
            <span className="text-base">🎉</span> Delivered!
          </p>
        )}
      </div>
    </div>
  );
};

const TrackDeliveryTab = ({ buyerId }) => {
  const { data: trackingData, loading } = useApi(() => getDeliveryTracking(buyerId), [buyerId]);
  const [filter, setFilter] = useState('All');

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl w-full"></div>;
  }

  const shipments = trackingData || [];

  let filteredShipments = shipments;
  if (filter === 'In Transit') {
    filteredShipments = shipments.filter(s => ['SHIPPED', 'PAID', 'PLACED'].includes(s.OrderStatus));
  } else if (filter === 'Delivered') {
    filteredShipments = shipments.filter(s => s.OrderStatus === 'DELIVERED');
  }

  return (
    <div>
      {/* FILTER TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto hide-scrollbar">
        {['All', 'In Transit', 'Delivered'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              filter === tab 
                ? 'bg-agri-pale text-[#1a6b3c] border-b-2 border-[#1a6b3c]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filteredShipments.length > 0 ? (
        <div className="space-y-4">
          {filteredShipments.map(shipment => (
            <TrackingCard key={shipment.TransportID || shipment.OrderID} shipment={shipment} />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🚚" 
          title={filter === 'All' ? "No shipments yet" : `No ${filter.toLowerCase()} shipments`} 
          subtitle="Pay for orders to initiate delivery tracking" 
        />
      )}
    </div>
  );
};

export default TrackDeliveryTab;
