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
      type: 'number',
      value: 1,
      min: 1,
      max: 5,
      step: 1
    }
  },
  compute: async (inputs, properties) => {
    let currentCanvas = inputs.initial?.result;
    if (!currentCanvas) return { error: 'Loop requires an initial input' };

    try {
      const iterations = properties.iterations.value;
      let result = currentCanvas.clone();

      for (let i = 0; i < iterations; i++) {
        if (inputs.loopIn?.result) {
          result = inputs.loopIn.result.clone();
        }
      }

      return {
        result: result,
        outputs: {
          result: result,
          loopOut: currentCanvas
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