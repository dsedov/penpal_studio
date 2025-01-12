import React from 'react';

const ToolbarButton = ({ icon, active, onClick, title, isLiveUpdate }) => {
  // If it's the live update button, use special styling
  if (isLiveUpdate) {
    const colorClasses = active
      ? "bg-green-500 hover:bg-green-400" // Active state (green with lighter hover)
      : "bg-red-500 hover:bg-red-400";    // Inactive state (red with lighter hover)

    return (
      <button
        onClick={onClick}
        title={title}
        className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${colorClasses}`}
      >
        <div className="text-white">
          {icon}
        </div>
      </button>
    );
  }

  // Default styling for other buttons
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${
        active ? 'bg-gray-200' : ''
      }`}
    >
      {icon}
    </button>
  );
};

export default ToolbarButton; 