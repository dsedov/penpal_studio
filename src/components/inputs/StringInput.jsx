import React from 'react';

export const StringInput = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};