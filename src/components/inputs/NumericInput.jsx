import React from 'react';

export const NumericInput = ({ label, value, onChange, min, max, step }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};