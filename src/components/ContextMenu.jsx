import React from 'react';

const ContextMenu = ({ position, onCreateNode, onClose }) => {
  if (!position?.show) return null;

  return (
    <div 
      className="fixed bg-white shadow-lg border border-gray-200 rounded z-50"
      style={{
        left: position.mouseX,
        top: position.mouseY,
      }}
    >
      <button 
        className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
        onClick={() => onCreateNode('Node A')}
      >
        Node A
      </button>
      <button 
        className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
        onClick={() => onCreateNode('Node B')}
      >
        Node B
      </button>
      <button 
        className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
        onClick={() => onCreateNode('Node C')}
      >
        Node C
      </button>
    </div>
  );
};

export default ContextMenu;