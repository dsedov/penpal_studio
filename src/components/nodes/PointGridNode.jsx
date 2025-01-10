import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Point Grid',
  properties: {
    spacing: {
      label: 'Spacing',
      type: 'float',
      value: 20.0,
      min: 0.1,
      max: 100.0,
    }
  },
  compute: async (inputData, properties) => {
    const inputCanvas = inputData.default;
    console.log('PointGrid input:', inputData.default);
    if (!inputCanvas) return null;

    // Clone the input canvas to avoid modifying the original
    const canvas = inputCanvas.clone();
    const spacing = properties.spacing.value;
    
    // Create grid of points
    for (let x = 0; x < canvas.size.x; x += spacing) {
      for (let y = 0; y < canvas.size.y; y += spacing) {
        canvas.point(x, y);
      }
    }

    console.log('PointGrid output:', canvas);
    return canvas;
  }
};

const PointGridNode = (props) => {
  const inputs = [{
    id: 'default',
    type: 'single'
  }];

  return (
    <BaseNode {...props} inputs={inputs}>
    </BaseNode>
  );
};

export default PointGridNode;