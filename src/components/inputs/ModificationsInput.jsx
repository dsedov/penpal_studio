import React from 'react';
import { ModificationType } from '../nodes/EditNode';

export const ModificationsInput = ({ value, label }) => {
  // Simple array check
  const modifications = Array.isArray(value) ? value : [];

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="text-sm max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
        {modifications.length === 0 ? (
          <div className="text-gray-500 italic">No modifications</div>
        ) : (
          <div className="space-y-1">
            {modifications.map((mod, index) => (
              <div key={index} className="py-1 border-b border-gray-200">
                {mod.type || 'Unknown modification'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};