// components/nodes/BaseNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ data, id, selected, inputs = ['default'], showInputs = true }) => {
  const baseToggleClass = "w-4 h-8 rounded cursor-pointer transition-colors";
  const leftToggleClass = `${baseToggleClass} ${
    data.bypass 
      ? "bg-yellow-400 hover:bg-yellow-500" 
      : "bg-gray-200 hover:bg-gray-300"
  }`;
  const rightToggleClass = `${baseToggleClass} ${
    data.isOutput 
      ? "bg-blue-500 hover:bg-blue-600" 
      : "bg-gray-200 hover:bg-gray-300"
  }`;

  return (
    <div className="relative bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      {/* Input Handles */}
      {showInputs && inputs.map((input, index) => (
        <Handle 
          key={`input-${input}`}
          type="target"
          position={Position.Top}
          id={input}
          className="w-3 h-3"
          style={{
            left: inputs.length === 1 
              ? '50%' 
              : `${(index + 1) * (100 / (inputs.length + 1))}%`
          }}
        />
      ))}
      
      {/* Toggles */}
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

      <div className="mb-2 font-bold border-b pb-2">{data.label}</div>
      
      <div className="bg-gray-50 p-2 rounded mb-2">
        {data.children}
      </div>

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