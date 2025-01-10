import React from 'react';
import BaseNode from './BaseNode';

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
  // Add compute function
  compute: async (inputData, properties) => {
    const canvas = inputData.default;
    if (!canvas || canvas.type !== 'canvas') return null;

    const points = [];
    const spacing = properties.spacing.value;
    
    for (let x = 0; x < canvas.size.x; x += spacing) {
      for (let y = 0; y < canvas.size.y; y += spacing) {
        points.push({ x, y });
      }
    }

    return {
      type: 'points',
      points: points
    };
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