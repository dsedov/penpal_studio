import React from 'react';
import BaseNode from '../BaseNode';
import Canvas from '../../data/Canvas';

export const defaultData = {
  label: 'Duplicate',
  menu: {
    category: 'Generate',
    label: 'Duplicate',
    description: 'Creates multiple copies with transformation'
  },
  properties: {
    copies: {
      label: 'Number of Copies',
      type: 'int',
      value: 1,
      min: 1,
      max: 100
    },
    translate: {
      label: 'Translate per Copy',
      type: 'vec2',
      value: { x: 10, y: 0 },
      min: -10000,
      max: 10000
    },
    rotate: {
      label: 'Rotate per Copy (degrees)',
      type: 'float',
      value: 0,
      min: -360,
      max: 360
    },
    scale: {
      label: 'Scale per Copy',
      type: 'vec2',
      value: { x: 1, y: 1 },
      min: -100,
      max: 100
    },
    uniformScale: {
      label: 'Uniform Scale',
      type: 'boolean',
      value: true
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Duplicate requires a canvas input' };
      }

      let resultCanvas = inputCanvas.clone();
      const numCopies = properties.copies.value;
      
      // Get transform parameters
      const { x: tx, y: ty } = properties.translate.value;
      const rotation = properties.rotate.value * Math.PI / 180;
      const { x: sx, y: sy } = properties.scale.value;
      const actualScaleY = properties.uniformScale.value ? sx : sy;

      // Create and transform copies
      for (let i = 1; i < numCopies; i++) {
        const copy = inputCanvas.clone();
        const bounds = copy.getBounds();
        const px = (bounds.minX + bounds.maxX) / 2;
        const py = (bounds.minY + bounds.maxY) / 2;

        // Just transform the points
        copy.points = copy.points.map(p => {
          let x = p.x - px;
          let y = p.y - py;

          const cos = Math.cos(rotation * i);
          const sin = Math.sin(rotation * i);
          const xRot = x * cos - y * sin;
          const yRot = x * sin + y * cos;

          x = xRot * Math.pow(sx, i);
          y = yRot * Math.pow(actualScaleY, i);

          return { x: x + px + (tx * i), y: y + py + (ty * i) };
        });

        resultCanvas = resultCanvas.merge(copy);
      }

      return { result: resultCanvas, error: null };
    } catch (error) {
      return { error: `Failed to duplicate canvas: ${error.message}` };
    }
  }
};

const DuplicateNode = (props) => {
  return (
    <BaseNode
      {...props}
      inputs={[
        { id: 'input', label: 'Input' }
      ]}
      outputs={[
        { id: 'output', label: 'Output' }
      ]}
    />
  );
};

export default DuplicateNode; 