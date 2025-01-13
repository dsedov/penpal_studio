import React from 'react';
import BaseNode from '../BaseNode';
import Canvas from '../../data/Canvas';

export const defaultData = {
  label: 'Close',
  menu: {
    category: 'Modify',
    label: 'Close',
    description: 'Closes open shapes by connecting last point to first point'
  },
  properties: {},
  compute: async (inputData) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Close requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      
      // Process each line
      canvas.lines = canvas.lines.map(line => {
        // Only process lines with more than 2 points
        if (line.points.length <= 2) {
          return line;
        }

        // Check if the shape is already closed
        const firstPointIndex = line.points[0];
        const lastPointIndex = line.points[line.points.length - 1];
        
        if (firstPointIndex === lastPointIndex) {
          return line; // Shape is already closed
        }

        // Close the shape by adding the first point index to the end
        return {
          ...line,
          points: [...line.points, firstPointIndex]
        };
      });

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to close shapes: ${error.message}` };
    }
  }
};

const CloseNode = (props) => {
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

export default CloseNode; 