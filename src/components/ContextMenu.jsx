import React, { useState, useEffect } from 'react';
import { nodeTypes, defaultNodeData } from './nodes/nodeTypes';

const SubMenu = ({ category, nodes, onCreateNode, position }) => {
  const [adjustedStyle, setAdjustedStyle] = useState({
    left: '100%',
    top: '0',
    marginLeft: '2px',
    minWidth: '120px'
  });

  useEffect(() => {
    // Get submenu element after render
    const submenu = document.getElementById(`submenu-${category}`);
    if (!submenu) return;

    const rect = submenu.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let newStyle = { ...adjustedStyle };

    // Check vertical overflow
    if (rect.bottom > windowHeight) {
      const topAdjustment = rect.height > windowHeight ? 
        -position.mouseY + 10 : // If menu is taller than window, align to top
        -(rect.bottom - windowHeight) - 10; // Otherwise, push up just enough
      newStyle.top = `${topAdjustment}px`;
    }

    // Check horizontal overflow
    if (rect.right > windowWidth) {
      newStyle.left = 'auto';
      newStyle.right = '100%';
      newStyle.marginLeft = '0';
      newStyle.marginRight = '2px';
    }

    setAdjustedStyle(newStyle);
  }, [category, position]);

  return (
    <div 
      id={`submenu-${category}`}
      className="absolute bg-white rounded shadow-lg py-1"
      style={adjustedStyle}
    >
      {nodes.map(({ type, label }) => (
        <div
          key={type}
          className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
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
  const [menuStyle, setMenuStyle] = useState({
    left: 0,
    top: 0,
    zIndex: 1000,
    minWidth: '120px'
  });

  useEffect(() => {
    if (!position?.show) return;

    const menuElement = document.getElementById('context-menu');
    if (!menuElement) return;

    // Get window dimensions
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Calculate menu dimensions
    const rect = menuElement.getBoundingClientRect();
    
    // Initialize with clicked position
    let left = position.mouseX;
    let top = position.mouseY;

    // Adjust if menu would overflow right edge
    if (left + rect.width > windowWidth) {
      left = windowWidth - rect.width - 10;
    }

    // Adjust if menu would overflow bottom edge
    if (top + rect.height > windowHeight) {
      top = windowHeight - rect.height - 10;
    }

    // Ensure menu doesn't go off the left or top edge
    left = Math.max(10, left);
    top = Math.max(10, top);

    setMenuStyle({
      ...menuStyle,
      left,
      top
    });
  }, [position]);

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
      id="context-menu"
      className="fixed bg-white rounded shadow-lg py-1"
      style={menuStyle}
    >
      {Object.entries(nodesByCategory).map(([category, nodes]) => (
        <div 
          key={category}
          className="relative px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
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

const nodeCategories = {
  Input: ['canvas', 'pointGrid'],
  Transform: ['transform', 'softTransform', 'crop', 'cleanup', 'edit'],
  Draw: ['line', 'renderSVG'],
  Connect: ['connectNearby', 'merge'],
  Code: ['code'],
  Flow: ['loop']
};

const categoryColors = {
  Input: '#2ecc71',
  Transform: '#e74c3c',
  Draw: '#3498db',
  Connect: '#f1c40f',
  Code: '#9b59b6',
  Flow: '#8B4513'
};

const categoryLabels = {
  Input: 'Input Nodes',
  Transform: 'Transform Nodes',
  Draw: 'Draw Nodes',
  Connect: 'Connect Nodes',
  Code: 'Code Nodes',
  Flow: 'Flow Control'
};

const nodeLabels = {
  canvas: 'Canvas',
  pointGrid: 'Point Grid',
  transform: 'Transform',
  softTransform: 'Soft Transform',
  crop: 'Crop',
  cleanup: 'Cleanup',
  edit: 'Edit',
  line: 'Line',
  renderSVG: 'Render SVG',
  connectNearby: 'Connect Nearby',
  merge: 'Merge',
  code: 'Code',
  loop: 'Loop'
};

export default ContextMenu;