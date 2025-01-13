import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Canvas',
  menu: {
    category: 'Generate',
    label: 'Canvas',
    description: 'Creates a blank canvas with specified size and background color'
  },
  properties: {
    size: {
      label: 'Size',
      type: 'vec2',
      value: { x: 800, y: 600 },
      min: { x: 1, y: 1 },
      max: { x: 10000, y: 10000 }
    },
    margins: {
      label: 'Horizontal and vertical margins',
      type: 'vec2',
      value: { x: 0, y: 0 },
      min: { x: 0, y: 0 },
      max: { x: 10000, y: 10000 }
    },
    backgroundColor: {
      label: 'Background color',
      type: 'color',
      value: '#ffffff',
    }
  },
  compute: async (inputData, properties) => {
    const canvas = new Canvas(
      properties.size.value.x,
      properties.size.value.y,
      properties.backgroundColor.value
    );
    return { result: canvas, error: null };
  }
};

const CanvasNode = (props) => {
  return (
    <BaseNode {...props} showInputs={false} hasError={props.hasError}>
    </BaseNode>
  );
};

export default CanvasNode;