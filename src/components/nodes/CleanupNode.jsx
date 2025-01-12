import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

const arePointsEqual = (p1, p2, tolerance = 0.0001) => {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
};

const areLinesEqual = (line1Points, line2Points, points, tolerance = 0.0001) => {
  const line1Start = points[line1Points[0]];
  const line1End = points[line1Points[1]];
  const line2Start = points[line2Points[0]];
  const line2End = points[line2Points[1]];

  // Check both directions as lines can be defined in reverse
  return (
    (arePointsEqual(line1Start, line2Start, tolerance) && arePointsEqual(line1End, line2End, tolerance)) ||
    (arePointsEqual(line1Start, line2End, tolerance) && arePointsEqual(line1End, line2Start, tolerance))
  );
};

// Helper to check if lines are visually the same (same coordinates AND same visual properties)
const areLinesVisuallyEqual = (line1, line2, points, tolerance = 0.0001) => {
  if (!areLinesEqual(line1.points, line2.points, points, tolerance)) {
    return false;
  }
  
  // Check if visual properties are the same
  return line1.color === line2.color && 
          line1.thickness === line2.thickness;
};

export const defaultData = {
  label: 'Cleanup',
  menu: {
    category: 'Operators',
    label: 'Cleanup',
    description: 'Removes duplicate points and lines'
  },
  properties: {
    tolerance: {
      label: 'Position Tolerance',
      type: 'float',
      value: 0.0001,
      min: 0.00001,
      max: 1.0
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Cleanup requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      const tolerance = properties.tolerance.value;

      // Step 1: Find unconnected points and remove duplicates
      const unconnectedPoints = canvas.getUnconnectedPoints();
      const uniqueUnconnectedPoints = [];
      const pointsToRemove = new Set();

      // Process unconnected points from last to first (keep latest)
      for (let i = unconnectedPoints.length - 1; i >= 0; i--) {
        const point = unconnectedPoints[i];
        const isDuplicate = uniqueUnconnectedPoints.some(p => arePointsEqual(p, point, tolerance));
        if (!isDuplicate) {
          uniqueUnconnectedPoints.push(point);
        } else {
          pointsToRemove.add(point.id);
        }
      }

      // Step 2: Process lines and their points
      let newLines = [...canvas.lines];
      const processedLines = new Set();

      // Process lines from first to last, removing earlier duplicates
      for (let i = 0; i < canvas.lines.length; i++) {
        for (let j = i + 1; j < canvas.lines.length; j++) {
          if (areLinesEqual(canvas.lines[i].points, canvas.lines[j].points, canvas.points, tolerance)) {
            // Remove the earlier line (i) by marking it as null
            newLines[i] = null;
            break;  // Stop checking this line against later ones
          }
        }
      }
      
      // Filter out null lines and keep all properties
      newLines = newLines.filter(line => line !== null);

      // Create new arrays without the removed elements
      const newPoints = canvas.points.filter((_, index) => !pointsToRemove.has(index));
      const pointIndexMap = new Map();
      canvas.points.forEach((_, index) => {
        if (!pointsToRemove.has(index)) {
          pointIndexMap.set(index, pointIndexMap.size);
        }
      });

      // Update line point indices
      newLines = newLines.map(line => ({
        ...line,
        points: line.points.map(oldIndex => pointIndexMap.get(oldIndex))
      }));

      // Update canvas with cleaned data
      canvas.points = newPoints;
      canvas.lines = newLines;

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to cleanup canvas: ${error.message}` };
    }
  }
};

const CleanupNode = (props) => {
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

export default CleanupNode; 