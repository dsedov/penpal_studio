import React from 'react';

export const ModificationsInput = ({ value, label }) => {
  const modifications = Array.from(value.entries());

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="text-sm max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
        {modifications.length === 0 ? (
          <div className="text-gray-500 italic">No modifications</div>
        ) : (
          <div className="space-y-1">
            {modifications.map(([pointIndex, mod]) => (
              <div key={pointIndex} className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="font-medium">Point {pointIndex}:</span>
                <div className="text-xs">
                  <div>From: ({mod.originalPos.x.toFixed(1)}, {mod.originalPos.y.toFixed(1)})</div>
                  <div>To: ({mod.newPos.x.toFixed(1)}, {mod.newPos.y.toFixed(1)})</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};