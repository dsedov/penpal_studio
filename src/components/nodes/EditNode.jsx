import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Edit',
  menu: {
    category: 'Operators',
    label: 'Edit',
    description: 'Manually edit point positions'
  },
  properties: {
    modifications: {
      label: 'Modifications',
      type: 'modifications', // We'll need to create a new input type for this
      value: new Map(), // Map of pointIndex -> {originalPos: {x,y}, newPos: {x,y}}
      internal: true // This prevents direct editing in the attribute editor
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Edit requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      
      // Apply stored modifications
      properties.modifications.value.forEach((mod, pointIndex) => {
        if (canvas.points[pointIndex]) {
          canvas.points[pointIndex] = {
            ...canvas.points[pointIndex],
            x: mod.newPos.x,
            y: mod.newPos.y
          };
        }
      });

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to apply edits: ${error.message}` };
    }
  }
};

const EditNode = (props) => {
  console.log('Edit node props:', props);
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