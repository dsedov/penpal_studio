import React from 'react';

export const ColorInput = ({ label, value, onChange }) => {
  // Handle both hex string and RGB object formats
  const colorToHex = (color) => {
    if (typeof color === 'string') return color;
    const { r, g, b } = color;
    return `#${[r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={colorToHex(value)}
          onChange={(e) => onChange(hexToRgb(e.target.value))}
          className="w-10 h-10 rounded cursor-pointer"
        />
        <input
          type="text"
          value={colorToHex(value)}
          onChange={(e) => onChange(hexToRgb(e.target.value))}
          className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      </div>
    </div>
  );
};