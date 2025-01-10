import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Merge',
  compute: async (inputData, properties) => {
    // Merge all input points
    const allPoints = [];
    Object.values(inputData).forEach(input => {
      if (input?.type === 'points') {
        allPoints.push(...input.points);
      }
    });

    return {
      type: 'points',
      points: allPoints
    };
  }
};

const MergeNode = (props) => {
  const inputs = [{
    id: 'merge',
    type: 'multi'
  }];

  return (
    <BaseNode {...props} inputs={inputs}>
    </BaseNode>
  );
};

export default MergeNode;