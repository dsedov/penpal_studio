import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Clone',
  compute: async (inputData, properties) => {
    const targetCanvas = inputData.target;
    const sourceCanvas = inputData.source;
    
    if (!targetCanvas || !sourceCanvas) return null;

    // Clone the target canvas as our working canvas
    const resultCanvas = targetCanvas.clone();
    
    // Get the center of the source canvas to use as offset reference
    const sourceCenter = sourceCanvas.getPointsCenter();

    // For each point in the target canvas
    for (const targetPoint of targetCanvas.iteratePoints()) {
      // Keep track of the new point IDs for line creation
      const pointIdMap = new Map();

      // First, clone unconnected points
      const unconnectedPoints = sourceCanvas.getUnconnectedPoints();
      for (const sourcePoint of unconnectedPoints) {
        // Calculate offset from source center
        const dx = sourcePoint.x - sourceCenter.x;
        const dy = sourcePoint.y - sourceCenter.y;
        
        // Add new point and store its ID mapping
        const newPointId = resultCanvas.point(
          targetPoint.x + dx,
          targetPoint.y + dy,
          sourcePoint.attributes
        );
        pointIdMap.set(sourcePoint.id, newPointId);
      }

      // Then handle lines and their points
      for (const sourceLine of sourceCanvas.iterateLines()) {
        // First ensure all points for this line exist
        for (const pointId of sourceLine.points) {
          if (!pointIdMap.has(pointId)) {
            const sourcePoint = sourceCanvas.getPoint(pointId);
            const dx = sourcePoint.x - sourceCenter.x;
            const dy = sourcePoint.y - sourceCenter.y;
            
            const newPointId = resultCanvas.point(
              targetPoint.x + dx,
              targetPoint.y + dy,
              sourcePoint.attributes
            );
            pointIdMap.set(pointId, newPointId);
          }
        }

        // Create the line using mapped point IDs
        const newPointIds = sourceLine.points.map(oldId => pointIdMap.get(oldId));
        resultCanvas.line(newPointIds);
      }
    }

    return resultCanvas;
  }
};

const CloneNode = (props) => {
  const inputs = [
    { id: 'source', type: 'single' },
    { id: 'target', type: 'single' }
  ];

  return (
    <BaseNode {...props} inputs={inputs}>
    </BaseNode>
  );
};

export default CloneNode;