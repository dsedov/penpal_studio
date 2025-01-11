import React, { memo } from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Merge',
  compute: async (inputData, properties) => {
    try {
      // Get all input canvases
      const canvases = Object.values(inputData)
        .filter(input => input?.result instanceof Canvas)
        .map(input => input.result);

      if (canvases.length === 0) {
        return { error: 'Merge requires at least one canvas input' };
      }
      if (canvases.length === 1) {
        return { result: canvases[0], error: null };
      }

      // Start with the first canvas and iteratively merge the rest
      let mergedCanvas = canvases[0].clone();
      // Keep the background color from the first canvas
      const backgroundColor = mergedCanvas.backgroundColor;
      
      // Iterate through the remaining canvases and merge them one by one
      for (let i = 1; i < canvases.length; i++) {
        mergedCanvas = mergedCanvas.merge(canvases[i]);
      }

      // Restore the background color after merging
      mergedCanvas.backgroundColor = backgroundColor;

      return { result: mergedCanvas, error: null };
    } catch (error) {
      return { error: `Failed to merge canvases: ${error.message}` };
    }
  }
};

const MergeNode = memo(({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Merge"
      color="rgb(229, 231, 235)"
      inputs={[
        { id: 'input1', label: 'Input 1' },
        { id: 'input2', label: 'Input 2' }
      ]}
      outputs={[
        { id: 'output', label: 'Output' }
      ]}
    />
  );
});

export default MergeNode;