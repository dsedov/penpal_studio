import React from 'react';
import BaseNode from '../BaseNode';
import Canvas from '../../data/Canvas';

export const defaultData = {
  label: 'Line',
  menu: {
    category: 'Generate',
    label: 'Line',
    description: 'Adds a line to the canvas'
  },
  properties: {
    start: {
      label: 'Start Point',
      type: 'vec2',
      value: { x: 0, y: 0 },
      min: { x: -10000, y: -10000 },
      max: { x: 10000, y: 10000 }
    },
    end: {
      label: 'End Point',
      type: 'vec2',
      value: { x: 100, y: 100 },
      min: { x: -10000, y: -10000 },
      max: { x: 10000, y: 10000 }
    },
    color: {
      label: 'Color',
      type: 'color',
      value: '#000000'
    },
    thickness: {
      label: 'Thickness',
      type: 'float',
      value: 1.0,
      min: 0.1,
      max: 100.0
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Line requires a canvas input' };
      }

      // Clone the input canvas to avoid modifying the original
      const canvas = inputCanvas.clone();
      
      // Add the line to the canvas
      canvas.line(
        properties.start.value.x,
        properties.start.value.y,
        properties.end.value.x,
        properties.end.value.y,
        properties.color.value,
        properties.thickness.value
      );

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to create line: ${error.message}` };
    }
  }
};

const LineNode = (props) => {
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

export default LineNode; 