import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Crop',
  menu: {
    category: 'Operators',
    label: 'Crop',
    description: 'Crops canvas content to specified bounds'
  },
  properties: {
    x: {
      label: 'X Position',
      type: 'float',
      value: 0,
      min: -10000,
      max: 10000
    },
    y: {
      label: 'Y Position',
      type: 'float',
      value: 0,
      min: -10000,
      max: 10000
    },
    width: {
      label: 'Width',
      type: 'float',
      value: 100,
      min: 0,
      max: 10000
    },
    height: {
      label: 'Height',
      type: 'float',
      value: 100,
      min: 0,
      max: 10000
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        // Return an empty canvas if there's no input
        const emptyCanvas = new Canvas(
          properties.width.value,
          properties.height.value
        );
        return { result: emptyCanvas, error: null };
      }

      // Clone the input canvas
      const canvas = inputCanvas.clone();
      
      // Define crop bounds
      const bounds = {
        minX: properties.x.value,
        minY: properties.y.value,
        maxX: properties.x.value + properties.width.value,
        maxY: properties.y.value + properties.height.value
      };

      // Create a map of points to remove
      const pointsToRemove = new Set();
      canvas.points.forEach((point, index) => {
        if (point.x < bounds.minX || point.x > bounds.maxX ||
            point.y < bounds.minY || point.y > bounds.maxY) {
          pointsToRemove.add(index);
        }
      });

      // Create new point array without removed points
      const newPoints = [];
      const pointIndexMap = new Map(); // Maps old indices to new ones

      canvas.points.forEach((point, index) => {
        if (!point) return; // Skip undefined points
        if (!pointsToRemove.has(index)) {
          pointIndexMap.set(index, newPoints.length);
          newPoints.push(point);
        }
      });

      // Update lines to use new point indices, keeping lines that still have at least 2 points
      canvas.lines = canvas.lines
        .map(line => ({
          ...line,
          points: line.points
            .filter(oldIndex => !pointsToRemove.has(oldIndex))
            .map(oldIndex => pointIndexMap.get(oldIndex))
        }))
        .filter(line => line.points.length >= 2);

      // Update canvas points
      canvas.points = newPoints;

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to crop canvas: ${error.message}` };
    }
  }
};

const CropNode = (props) => {
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

export default CropNode; 