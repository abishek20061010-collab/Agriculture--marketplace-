import React from 'react';

const EmptyState = ({ icon, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border-2 border-dashed border-agri-green/30 text-center w-full">
      <div className="text-5xl mb-4 opacity-80">{icon}</div>
      <h3 className="text-xl font-bold text-agri-dark mb-2">{title}</h3>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  );
};

export default EmptyState;
