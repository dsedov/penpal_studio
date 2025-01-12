import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Transform',
  menu: {
    category: 'Operators',
    label: 'Transform',
    description: 'Transforms canvas content (translate, rotate, scale)'
  },
  properties: {
    translate: {
      label: 'Translate',
      type: 'vec2',
      value: { x: 0, y: 0 },
      min: -10000,
      max: 10000
    },
    rotate: {
      label: 'Rotate (degrees)',
      type: 'float',
      value: 0,
      min: -360,
      max: 360
    },
    scale: {
      label: 'Scale',
      type: 'vec2',
      value: { x: 1, y: 1 },
      min: -100,
      max: 100
    },
    uniformScale: {
      label: 'Uniform Scale',
      type: 'boolean',
      value: true
    },
    pivotMode: {
      label: 'Pivot Mode',
      type: 'menu',
      value: 'center',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'custom', label: 'Custom' }
      ]
    },
    pivot: {
      label: 'Pivot Point',
      type: 'vec2',
      value: { x: 0, y: 0 },
      min: -10000,
      max: 10000
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Transform requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      
      // Get transform parameters
      const { x: tx, y: ty } = properties.translate.value;
      const rotation = properties.rotate.value * Math.PI / 180; // Convert to radians
      const { x: sx, y: sy } = properties.scale.value;
      const actualScaleY = properties.uniformScale.value ? sx : sy;
      
      // Determine pivot point based on mode
      let px, py;
      if (properties.pivotMode.value === 'center') {
        // Calculate canvas center
        const bounds = canvas.getBounds();
        px = (bounds.minX + bounds.maxX) / 2;
        py = (bounds.minY + bounds.maxY) / 2;
      } else {
        // Use custom pivot
        ({ x: px, y: py } = properties.pivot.value);
      }

      // Transform each point
      canvas.points = canvas.points.map(point => {
        if (!point) return point;

        // Step 1: Translate to origin relative to pivot
        let x = point.x - px;
        let y = point.y - py;

        // Step 2: Apply rotation
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const xRot = x * cos - y * sin;
        const yRot = x * sin + y * cos;
        x = xRot;
        y = yRot;

        // Step 3: Apply scale
        x *= sx;
        y *= actualScaleY;

        // Step 4: Translate back from pivot and apply translation
        x += px + tx;
        y += py + ty;

        return { ...point, x, y };
      });

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to transform canvas: ${error.message}` };
    }
  }
};

const TransformNode = (props) => {
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

export default TransformNode; 