import React from 'react';
import { Handle } from 'reactflow';

const BaseNode = ({ 
  data, 
  id, 
  selected, 
  inputs = ['default'], 
  outputs = ['default'],
  showInputs = true 
}) => {
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

  // Calculate positions for multiple inputs/outputs
  const getPosition = (index, total) => {
    if (total === 1) return 0.5; // Center if only one
    const step = 1 / (total + 1);
    return step * (index + 1);
  };

  // Get handle style based on type
  const getHandleStyle = (type, position, isOutput = false) => {
    const baseStyle = {
      left: `${position * 100}%`,
      transform: isOutput ? 'translate(-50%, 9px)' : 'translate(-50%, -9px)'
    };

    switch(type) {
      case 'loop':
        return {
          ...baseStyle,
          width: '48px',
          height: '12px',
          borderRadius: '4px',
          background: '#000'
        };
      case 'multi':
        return {
          ...baseStyle,
          width: '24px',
          height: '24px'
        };
      default: // 'single'
        return {
          ...baseStyle,
          width: '12px',
          height: '12px'
        };
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
      {showInputs && inputs.map((input, index) => {
        const inputId = input.id || input;
        const position = getPosition(index, inputs.length);
        return (
          <Handle
            key={`input-${inputId}`}
            type="target"
            position="top"
            id={inputId}
            style={getHandleStyle(input.type, position)}
          />
        );
      })}
      
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

      {/* Output Handles */}
      {outputs.map((output, index) => {
        const outputId = output.id || output;
        const position = getPosition(index, outputs.length);
        return (
          <Handle
            key={`output-${outputId}`}
            type="source"
            position="bottom"
            id={outputId}
            style={getHandleStyle(output.type, position, true)}
          />
        );
      })}
    </div>
  );
};

export default BaseNode;