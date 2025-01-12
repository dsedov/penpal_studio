import React, { useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ data, id, selected, inputs = ['default'], showInputs = true }) => {
  const baseToggleClass = "w-4 h-8 rounded cursor-pointer transition-colors";
  const leftToggleClass = `${baseToggleClass} ${
    data.bypass
      ? "bg-yellow-400 hover:bg-yellow-500"
      : "bg-gray-200 hover:bg-gray-300"
  }`;
  const rightToggleClass = `${baseToggleClass} ${
    id === data.outputNodeId
      ? "bg-blue-500 hover:bg-blue-600"
      : "bg-gray-200 hover:bg-gray-300"
  }`;

  // Calculate positions for multiple inputs
  const getInputPosition = (index, total) => {
    if (total === 1) return 0.5; // Center if only one input
    const step = 1 / (total + 1);
    return step * (index + 1);
  };

  const PropertyInput = ({ property, onChange }) => {
    switch (property.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={property.value}
            onChange={(e) => onChange(e.target.checked)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-lg p-4 min-w-[200px] border-4 ${
      selected 
        ? data.isMultiSelected 
          ? 'border-blue-500' 
          : 'border-green-500'
        : data.hasError
          ? 'border-red-500'
          : 'border-gray-300'
    }`}
      style={{ opacity: data.bypass ? 0.5 : 1 }}
    >
      {/* Input Handles */}
      {showInputs && inputs.map((input, index) => (
        <Handle
          key={`input-${input.id || input}`}
          type="target"
          position={Position.Top}
          id={input.id || input}
          className={input.type === 'multi' ? "w-6 h-6" : "w-3 h-3"}
          style={{ 
            left: `${getInputPosition(index, inputs.length) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
      
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 ${leftToggleClass}`}
        onClick={() => data.onToggleBypass(id)}
        title="Toggle bypass"
      />
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 ${rightToggleClass}`}
        title="Set as output"
        onClick={() => data.onToggleOutput(id)}
      />
      <div className="font-bold">{data.label}</div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
      />
    </div>
  );
};

export default BaseNode;