import React from 'react';

interface CheckIconProps {
  size?: string; // e.g., 'w-6 h-6'
  color?: string; // e.g., 'text-green-400'
}

const CheckIcon: React.FC<CheckIconProps> = ({ size = 'w-6 h-6', color = 'text-emerald-400' }) => {
  return (
    <svg
      className={`${size} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5" // Slightly bolder checkmark
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
};

export default CheckIcon;