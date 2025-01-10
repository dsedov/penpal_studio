import React from 'react';

export const Vec2Input = ({ label, value, onChange, min, max, step }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value.x}
          min={min.x}
          max={max.x}
          step={step}
          onChange={(e) => onChange({ ...value, x: parseFloat(e.target.value) })}
          className="px-2 py-1 border rounded w-full"
          placeholder="X"
        />
        <input
          type="number"
          value={value.y}
          min={min.y}
          max={max.y}
          step={step}
          onChange={(e) => onChange({ ...value, y: parseFloat(e.target.value) })}
          className="px-2 py-1 border rounded w-full"
          placeholder="Y"
        />
      </div>
    </div>
  );
};