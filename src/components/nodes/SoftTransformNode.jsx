import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Soft Transform',
  menu: {
    category: 'Operators',
    label: 'Soft Transform',
    description: 'Transforms canvas content with distance-based falloff'
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
    pivot: {
      label: 'Pivot Point',
      type: 'vec2',
      value: { x: 0, y: 0 },
      min: -10000,
      max: 10000
    },
    radius: {
      label: 'Radius',
      type: 'float',
      value: 100,
      min: 0,
      max: 10000
    },
    decayFunction: {
      label: 'Decay Function',
      type: 'menu',
      value: 'linear',
      options: [
        { value: 'linear', label: 'Linear' },
        { value: 'smooth', label: 'Smooth' },
        { value: 'exponential', label: 'Exponential' }
      ]
    },
    inverse: {
      label: 'Inverse Effect',
      type: 'boolean',
      value: false
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Soft Transform requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      
      // Get transform parameters
      const { x: tx, y: ty } = properties.translate.value;
      const rotation = properties.rotate.value * Math.PI / 180;
      const { x: sx, y: sy } = properties.scale.value;
      const actualScaleY = properties.uniformScale.value ? sx : sy;
      const { x: px, y: py } = properties.pivot.value;
      const radius = properties.radius.value;
      const inverse = properties.inverse.value;

      // Decay function implementations
      const decayFunctions = {
        linear: (t) => 1 - t,
        smooth: (t) => Math.cos(t * Math.PI / 2),
        exponential: (t) => Math.exp(-4 * t)
      };

      const getStrength = (distance) => {
        if (distance >= radius) return inverse ? 1 : 0;
        if (distance <= 0) return inverse ? 0 : 1;
        
        const t = distance / radius;
        const decay = decayFunctions[properties.decayFunction.value](t);
        return inverse ? 1 - decay : decay;
      };

      // Transform each point
      canvas.points = canvas.points.map(point => {
        if (!point) return point;

        // Calculate distance from pivot
        const dx = point.x - px;
        const dy = point.y - py;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate transform strength
        const strength = getStrength(distance);

        // Apply weighted transformations
        let x = point.x;
        let y = point.y;

        // Translation
        x += tx * strength;
        y += ty * strength;

        // Rotation and scale (relative to pivot)
        if (rotation !== 0 || sx !== 1 || actualScaleY !== 1) {
          // Move to origin relative to pivot
          x -= px;
          y -= py;

          // Apply rotation
          if (rotation !== 0) {
            const cos = Math.cos(rotation * strength);
            const sin = Math.sin(rotation * strength);
            const xRot = x * cos - y * sin;
            const yRot = x * sin + y * cos;
            x = xRot;
            y = yRot;
          }

          // Apply scale
          const effectiveScaleX = 1 + (sx - 1) * strength;
          const effectiveScaleY = 1 + (actualScaleY - 1) * strength;
          x *= effectiveScaleX;
          y *= effectiveScaleY;

          // Move back from pivot
          x += px;
          y += py;
        }

        return { ...point, x, y };
      });

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to apply soft transform: ${error.message}` };
    }
  }
};

const SoftTransformNode = (props) => {
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

export default SoftTransformNode; 