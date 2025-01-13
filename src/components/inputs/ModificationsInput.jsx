import React from 'react';
import { ModificationType } from '../nodes/EditNode';

const ModificationDetails = ({ mod }) => {
  switch (mod.type) {
    case ModificationType.MOVE_POINT:
      return (
        <div className="text-xs text-gray-600">
          Point {mod.pointIndex} → ({mod.newPos.x.toFixed(1)}, {mod.newPos.y.toFixed(1)})
        </div>
      );
    case ModificationType.ADD_POINT:
      return (
        <div className="text-xs text-gray-600">
          At ({mod.position.x.toFixed(1)}, {mod.position.y.toFixed(1)})
        </div>
      );
    case ModificationType.DELETE_POINT:
      return (
        <div className="text-xs text-gray-600">
          Point {mod.pointIndex}
        </div>
      );
    case ModificationType.CREATE_LINE:
      return (
        <div className="text-xs text-gray-600">
          Points: [{mod.points.join(', ')}] 
          {mod.color && <span className="ml-1">Color: {mod.color}</span>}
          {mod.thickness && <span className="ml-1">Width: {mod.thickness}</span>}
        </div>
      );
    default:
      return null;
  }
};

export const ModificationsInput = ({ value, label, onChange }) => {
  const modifications = Array.isArray(value) ? value : [];

  const handleDelete = (index) => {
    const newModifications = [...modifications];
    newModifications.splice(index, 1);
    onChange?.(newModifications);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="text-sm max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
        {modifications.length === 0 ? (
          <div className="text-gray-500 italic">No modifications</div>
        ) : (
          <div className="space-y-1">
            {modifications.map((mod, index) => (
              <div 
                key={index} 
                className="flex items-start justify-between py-1 px-2 border-b border-gray-200 hover:bg-gray-100 rounded"
              >
                <div>
                  <div className="font-medium text-gray-700">
                    {mod.type.split('_').map(word => 
                      word.charAt(0) + word.slice(1).toLowerCase()
                    ).join(' ')}
                  </div>
                  <ModificationDetails mod={mod} />
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded"
                  title="Delete modification"
                >
                  <svg 
                    className="w-4 h-4 text-gray-500 hover:text-red-500" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};