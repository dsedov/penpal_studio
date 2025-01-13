import React from 'react';
import BaseNode from '../BaseNode';
import Canvas from '../../data/Canvas';

export const defaultData = {
  label: 'Clone',
  menu: {
    category: 'Generate',
    label: 'Clone',
    description: 'Clone pattern from source to target points'
  },
  compute: async (inputData, properties) => {
    try {
      const targetCanvas = inputData.target?.result;
      const sourceCanvas = inputData.source?.result;
      
      if (!(targetCanvas instanceof Canvas) || !(sourceCanvas instanceof Canvas)) {
        return { error: 'Clone requires both source and target canvas inputs' };
      }

      const canvas = targetCanvas.clone();
      
      // Get the center of the source canvas
      const sourcePoints = sourceCanvas.points.filter(p => p !== undefined);
      if (sourcePoints.length === 0) {
        return { result: canvas, error: null };
      }

      const sourceCenter = sourcePoints.reduce(
        (center, point) => ({
          x: center.x + point.x / sourcePoints.length,
          y: center.y + point.y / sourcePoints.length
        }),
        { x: 0, y: 0 }
      );

      // For each point in the target canvas
      canvas.points.forEach((targetPoint, targetIndex) => {
        if (!targetPoint) return;

        // Keep track of new point indices
        const pointIndexMap = new Map();
        
        // First, clone unconnected points
        const unconnectedPoints = sourceCanvas.points.filter((p, i) => 
          p && !sourceCanvas.lines.some(l => l.points.includes(i))
        );

        unconnectedPoints.forEach((sourcePoint, sourceIndex) => {
          const dx = sourcePoint.x - sourceCenter.x;
          const dy = sourcePoint.y - sourceCenter.y;
          
          const newPoint = {
            x: targetPoint.x + dx,
            y: targetPoint.y + dy
          };
          
          const newIndex = canvas.points.length;
          canvas.points.push(newPoint);
          pointIndexMap.set(sourceIndex, newIndex);
        });

        // Then handle lines and their points
        sourceCanvas.lines.forEach(sourceLine => {
          // First ensure all points for this line exist
          sourceLine.points.forEach(pointIndex => {
            if (!pointIndexMap.has(pointIndex)) {
              const sourcePoint = sourceCanvas.points[pointIndex];
              if (!sourcePoint) return;

              const dx = sourcePoint.x - sourceCenter.x;
              const dy = sourcePoint.y - sourceCenter.y;
              
              const newPoint = {
                x: targetPoint.x + dx,
                y: targetPoint.y + dy
              };
              
              const newIndex = canvas.points.length;
              canvas.points.push(newPoint);
              pointIndexMap.set(pointIndex, newIndex);
            }
          });

          // Create the line using mapped point indices
          const newPoints = sourceLine.points
            .map(oldIndex => pointIndexMap.get(oldIndex))
            .filter(index => index !== undefined);

          if (newPoints.length >= 2) {
            canvas.lines.push({
              points: newPoints,
              color: sourceLine.color,
              thickness: sourceLine.thickness
            });
          }
        });
      });

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to clone: ${error.message}` };
    }
  }
};

const CloneNode = (props) => {
  return (
    <BaseNode
      {...props}
      inputs={[
        { id: 'source', label: 'Source' },
        { id: 'target', label: 'Target' }
      ]}
      outputs={[
        { id: 'output', label: 'Output' }
      ]}
    />
  );
};

export default CloneNode;