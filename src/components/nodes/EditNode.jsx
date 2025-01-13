import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

// Define modification types
export const ModificationType = {
  MOVE_POINT: 'MOVE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
  CREATE_LINE: 'CREATE_LINE',
  DELETE_LINE: 'DELETE_LINE',
  ADD_POINT_TO_LINE: 'ADD_POINT_TO_LINE',
  REMOVE_POINT_FROM_LINE: 'REMOVE_POINT_FROM_LINE'
};

export const defaultData = {
  label: 'Edit',
  menu: {
    category: 'Operators',
    label: 'Edit',
    description: 'Edit canvas elements'
  },
  properties: {
    modifications: {
      label: 'Modifications',
      type: 'modifications',
      value: [], // Array of modifications
      internal: true
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Edit requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      
      // Apply modifications in order
      properties.modifications.value.forEach(mod => {
        if (!mod || !mod.type) return;

        switch (mod.type) {
          case ModificationType.MOVE_POINT:
            if (canvas.points[mod.pointIndex]) {
              canvas.points[mod.pointIndex] = {
                ...canvas.points[mod.pointIndex],
                x: mod.newPos.x,
                y: mod.newPos.y
              };
            }
            break;

          case ModificationType.CREATE_LINE:
            if (Array.isArray(mod.points) && mod.points.length >= 2) {
              canvas.lines.push({
                points: [...mod.points],
                color: mod.color || '#000000',
                thickness: mod.thickness || 2
              });
            }
            break;
        }
      });

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to apply edits: ${error.message}` };
    }
  }
};

const EditNode = (props) => {
  return (
    <BaseNode
      {...props}
      inputs={[
        { id: 'input', label: 'Input' }
      ]}
      outputs={[
        { id: 'output', label: 'Output' }
      ]}
    />
  );
};

export default EditNode; 