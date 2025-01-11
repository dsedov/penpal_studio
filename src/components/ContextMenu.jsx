import React, { useState } from 'react';
import { nodeTypes, defaultNodeData } from './nodes/nodeTypes';

const SubMenu = ({ category, nodes, onCreateNode, position }) => {
  return (
    <div 
      className="absolute bg-white rounded shadow-lg py-1"
      style={{
        left: '100%',
        top: '0',
        marginLeft: '2px',
        minWidth: '120px'
      }}
    >
      {nodes.map(({ type, label }) => (
        <div
          key={type}
          className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => onCreateNode(type)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

const ContextMenu = ({ position, onCreateNode }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  if (!position?.show) return null;

  // Group nodes by category
  const nodesByCategory = Object.entries(defaultNodeData).reduce((acc, [type, data]) => {
    const category = data.menu?.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      type,
      label: data.menu.label
    });
    return acc;
  }, {});

  return (
    <div
      className="fixed bg-white rounded shadow-lg py-1"
      style={{
        left: position.mouseX,
        top: position.mouseY,
        zIndex: 1000,
        minWidth: '120px'
      }}
    >
      {Object.entries(nodesByCategory).map(([category, nodes]) => (
        <div 
          key={category}
          className="relative px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm"
          onMouseEnter={() => setActiveCategory(category)}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <span>{category}</span>
          {activeCategory === category && (
            <SubMenu 
              category={category}
              nodes={nodes}
              onCreateNode={onCreateNode}
              position={position}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;