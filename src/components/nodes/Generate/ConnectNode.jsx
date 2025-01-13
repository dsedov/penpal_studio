import React from 'react';
import BaseNode from '../BaseNode';
import Canvas from '../../data/Canvas';

// Seeded random number generator
const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const defaultData = {
  label: 'Connect',
  menu: {
    category: 'Generate',
    label: 'Connect',
    description: 'Connects points within a given radius'
  },
  properties: {
    radius: {
      label: 'Connection Radius',
      type: 'float',
      value: 50.0,
      min: 0.1,
      max: 1000.0
    },
    probability: {
      label: 'Connection Probability',
      type: 'float',
      value: 1.0,
      min: 0.0,
      max: 1.0
    },
    seed: {
      label: 'Random Seed',
      type: 'float',
      value: 1,
      min: 0,
      max: 10000
    },
    usePointProbability: {
      label: 'Use Point Probability',
      type: 'boolean',
      value: false
    },
    lineColor: {
      label: 'Line Color',
      type: 'color',
      value: '#000000'
    },
    lineThickness: {
      label: 'Line Thickness',
      type: 'float',
      value: 1.0,
      min: 0.1,
      max: 100.0
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Connect Nearby requires a canvas input' };
      }

      // Clone the input canvas to avoid modifying the original
      const canvas = inputCanvas.clone();
      const points = canvas.points;
      let currentSeed = properties.seed.value;
      
      // For each pair of points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          
          // Calculate distance between points
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If points are within radius
          if (distance <= properties.radius.value) {
            let shouldConnect = true;
            
            // Check probability
            if (properties.probability.value < 1.0) {
              const rand = seededRandom(currentSeed++);
              shouldConnect = rand < properties.probability.value;
            }
            
            // Check point probability if enabled
            if (shouldConnect && properties.usePointProbability.value) {
              const p1Prob = p1.attributes?.pprob ?? 1.0;
              const p2Prob = p2.attributes?.pprob ?? 1.0;
              const rand = seededRandom(currentSeed++);
              shouldConnect = rand < Math.min(p1Prob, p2Prob);
            }
            
            // Connect points if all conditions are met
            if (shouldConnect) {
              canvas.line(
                p1.x, p1.y,
                p2.x, p2.y,
                properties.lineColor.value,
                properties.lineThickness.value
              );
            }
          }
        }
      }

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to connect points: ${error.message}` };
    }
  }
};

const ConnectNode = (props) => {
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

export default ConnectNode; 