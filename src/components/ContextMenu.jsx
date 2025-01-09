import React from 'react';

const ContextMenu = ({ position, onCreateNode, onClose }) => {
  if (!position?.show) return null;

  const menuItems = [
    { type: 'canvas', label: 'Canvas' },
    { type: 'pointGrid', label: 'Point Grid' },
    { type: 'clone', label: 'Clone' },
  ];

  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg py-2 z-50"
      style={{
        left: position.mouseX,
        top: position.mouseY,
      }}
    >
      {menuItems.map(({ type, label }) => (
        <div
          key={type}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => onCreateNode(type)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;