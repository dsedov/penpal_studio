import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Loop',
  menu: {
    category: 'Flow',
    label: 'Loop',
    description: 'Loops through connected nodes multiple times'
  },
  properties: {
    iterations: {
      label: 'Iterations',
      type: 'int',
      value: 5,
      min: 1,
      max: 1000,
      step: 1
    }
  },
  compute: async (inputs, properties) => {
    let currentCanvas = inputs.initial?.result;
    if (!currentCanvas) return { error: 'Loop requires an initial input' };

    try {
      const iterations = properties.iterations.value;
      let result = currentCanvas.clone();

      // First iteration: provide initial canvas to loop network
      let currentLoopCanvas = result.clone();

      for (let i = 0; i < iterations; i++) {
        // Make current canvas available via loopOut
        // Other nodes will use this canvas, process it, and feed it back to loopIn
        result = currentLoopCanvas.clone();

        // Wait for the loop network to process (via loopIn)
        if (inputs.loopIn?.result) {
          // Get the processed canvas and use it for next iteration
          currentLoopCanvas = inputs.loopIn.result.clone();
        }
      }

      return {
        result: currentLoopCanvas, // Final result after all iterations
        outputs: {
          result: currentLoopCanvas,
          loopOut: result // Current iteration canvas for loop network
        },
        error: null
      };
    } catch (error) {
      return { error: `Loop error: ${error.message}` };
    }
  }
};

const LoopNode = (props) => {
  const inputs = [
    { id: 'loopIn', type: 'loop' },
    { id: 'initial', type: 'single' }
  ];

  const outputs = [
    { id: 'loopOut', type: 'loop' },
    { id: 'result', type: 'single' }
  ];

  return (
    <BaseNode 
      {...props} 
      inputs={inputs} 
      outputs={outputs}
      hasError={props.hasError}
    />
  );
};

export default LoopNode; 