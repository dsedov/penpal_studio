import React from 'react';

const ToolbarButton = ({ icon, active, onClick, title }) => {
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