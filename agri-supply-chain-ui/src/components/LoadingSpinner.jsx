import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green mb-4"></div>
      <p className="text-agri-green font-medium">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
