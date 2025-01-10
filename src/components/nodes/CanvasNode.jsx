import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Canvas',
  properties: {
    width: {
      type: 'int',
      value: 800,
      min: 1,
      max: 10000,
    },
    height: {
      type: 'int',
      value: 600,
      min: 1,
      max: 10000,
    }
  },
  compute: async (inputData, properties) => {
    return {
      type: 'canvas',
      width: properties.width.value,
      height: properties.height.value
    };
  }
};

const CanvasNode = (props) => {
  return (
    <BaseNode {...props} showInputs={false}>
    </BaseNode>
  );
};

export default CanvasNode;