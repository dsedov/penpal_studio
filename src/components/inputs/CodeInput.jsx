import React, { useState } from 'react';

export const CodeInput = ({ label, value, onChange, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-gray-600">{label}</label>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
          isExpanded ? 'h-96' : 'h-32'
        }`}
        spellCheck="false"
        style={{
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          whiteSpace: 'pre',
          overflowWrap: 'normal',
          overflowX: 'auto'
        }}
      />
      <div className="mt-1 text-xs text-gray-500">Language: {language}</div>
    </div>
  );
};