import React from 'react';
import BaseNode from '../BaseNode';
import Canvas from '../../data/Canvas';

export const defaultData = {
  label: 'Subdivide',
  menu: {
    category: 'Modify',
    label: 'Subdivide',
    description: 'Subdivides lines into smaller segments'
  },
  properties: {
    maxLength: {
      label: 'Max Segment Length',
      type: 'float',
      value: 1.0,
      min: 0.1,
      max: 1000.0
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Subdivide requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      const maxLength = properties.maxLength.value;

      const newPoints = [...canvas.points];
      const newLines = [];

      // Process each line
      for (const line of canvas.lines) {
        if (!line || line.points.length < 2) continue;

        const segments = [];
        // Process each pair of points in the line
        for (let i = 0; i < line.points.length - 1; i++) {
          const p1 = canvas.points[line.points[i]];
          const p2 = canvas.points[line.points[i + 1]];
          
          // Calculate segment length
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const length = Math.sqrt(dx * dx + dy * dy);

          if (length <= maxLength) {
            // If segment is short enough, keep original points
            segments.push([line.points[i], line.points[i + 1]]);
            continue;
          }

          // Calculate number of subsegments needed
          const numSegments = Math.ceil(length / maxLength);
          const stepX = dx / numSegments;
          const stepY = dy / numSegments;

          // Create intermediate points
          let lastPointIndex = line.points[i];
          for (let j = 1; j < numSegments; j++) {
            const newPoint = {
              x: p1.x + stepX * j,
              y: p1.y + stepY * j,
              attributes: { ...p1.attributes }
            };
            const newPointIndex = newPoints.length;
            newPoints.push(newPoint);
            
            segments.push([lastPointIndex, newPointIndex]);
            lastPointIndex = newPointIndex;
          }
          segments.push([lastPointIndex, line.points[i + 1]]);
        }

        // Create new subdivided line
        newLines.push({
          points: segments.flat(),
          color: line.color,
          thickness: line.thickness
        });
      }

      canvas.points = newPoints;
      canvas.lines = newLines;

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to subdivide lines: ${error.message}` };
    }
  }
};

const SubdivideNode = (props) => {
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

export default SubdivideNode; 