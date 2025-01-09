import React from 'react';
import { defaultNodeData } from './nodes/nodeTypes';

const ContextMenu = ({ position, onCreateNode }) => {
  console.log('ContextMenu props:', { position, onCreateNode });
  if (!position?.show) return null;

  const menuItems = Object.keys(defaultNodeData).map(type => ({
    type,
    label: defaultNodeData[type].label
  }));

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg py-2"
      style={{
        left: position.mouseX,
        top: position.mouseY,
        zIndex: 1000
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