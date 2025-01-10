import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Merge',
  compute: async (inputData, properties) => {
    // Get all input canvases
    const canvases = Object.values(inputData)
      .filter(input => input && input instanceof Canvas);

    if (canvases.length === 0) return null;
    if (canvases.length === 1) return canvases[0];

    // Start with the first canvas and iteratively merge the rest
    let mergedCanvas = canvases[0].clone();
    
    // Iterate through the remaining canvases and merge them one by one
    for (let i = 1; i < canvases.length; i++) {
      mergedCanvas = mergedCanvas.merge(canvases[i]);
    }

    return mergedCanvas;
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