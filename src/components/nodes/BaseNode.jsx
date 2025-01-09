import React from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ data, id, selected }) => {
  const toggleClass = "w-4 h-8 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition-colors";
  const activeToggleClass = "bg-blue-500 hover:bg-blue-600";

  return (
    <div className="relative bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div 
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 ${toggleClass} ${data.bypass ? activeToggleClass : ''}`}
        onClick={() => data.onToggleBypass(id)}
      />
      
      <div 
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 ${toggleClass} ${data.isOutput ? activeToggleClass : ''}`}
        onClick={() => data.onToggleOutput(id)}
      />

      <div className="mb-2 font-bold border-b pb-2">{data.label}</div>
      
      <div className="bg-gray-50 p-2 rounded mb-2">
        {data.children}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default BaseNode;