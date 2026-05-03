import React from 'react';

const StatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';

  switch (status?.toUpperCase()) {
    case 'PLACED':
      bgColor = 'bg-[#dbeafe]';
      textColor = 'text-[#1e40af]';
      break;
    case 'PAID':
      bgColor = 'bg-[#fef3c7]';
      textColor = 'text-[#92400e]';
      break;
    case 'SHIPPED':
      bgColor = 'bg-[#ffedd5]';
      textColor = 'text-[#9a3412]';
      break;
    case 'DELIVERED':
      bgColor = 'bg-[#dcfce7]';
      textColor = 'text-[#166534]';
      break;
    case 'CANCELLED':
      bgColor = 'bg-[#fee2e2]';
      textColor = 'text-[#991b1b]';
      break;
    default:
      break;
  }

  return (
    <span className={`${bgColor} ${textColor} rounded-full inline-block text-center`} style={{ padding: '2px 10px', fontSize: '11px', fontWeight: 500 }}>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
