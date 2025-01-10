import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Clone',
  compute: async (inputData, properties) => {
    const sourcePoints = inputData.source?.points || [];
    const targetPoints = inputData.target?.points || [];

    if (!sourcePoints.length || !targetPoints.length) return null;

    // Clone source points to each target point
    const resultPoints = [];
    targetPoints.forEach(target => {
      sourcePoints.forEach(source => {
        resultPoints.push({
          x: target.x + source.x,
          y: target.y + source.y
        });
      });
    });

    return {
      type: 'points',
      points: resultPoints
    };
  }
};

const CloneNode = (props) => {
  const inputs = [
    { id: 'source', type: 'single' },
    { id: 'target', type: 'single' }
  ];

  return (
    <BaseNode {...props} inputs={inputs}>
    </BaseNode>
  );
};

export default CloneNode;