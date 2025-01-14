import React from 'react';
import BaseNode from '../BaseNode';
import Canvas from '../../data/Canvas';

export const defaultData = {
  label: 'Fuse',
  menu: {
    category: 'Modify',
    label: 'Fuse',
    description: 'Combines lines that share endpoints into single lines'
  },
  properties: {},
  compute: async (inputData) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Fuse requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      let modified = true;
      
      while (modified) {
        modified = false;
        const newLines = [];
        const usedLines = new Set();

        for (let i = 0; i < canvas.lines.length; i++) {
          if (usedLines.has(i)) continue;
          
          let currentLine = { ...canvas.lines[i] };
          usedLines.add(i);
          let foundMatch;

          do {
            foundMatch = false;
            for (let j = 0; j < canvas.lines.length; j++) {
              if (usedLines.has(j)) continue;

              const nextLine = canvas.lines[j];
              const currentFirst = currentLine.points[0];
              const currentLast = currentLine.points[currentLine.points.length - 1];
              const nextFirst = nextLine.points[0];
              const nextLast = nextLine.points[nextLine.points.length - 1];

              // Only fuse if visual properties match
              if (currentLine.color !== nextLine.color || 
                  currentLine.thickness !== nextLine.thickness) {
                continue;
              }

              let newPoints = null;

              // Check all possible connections
              if (currentLast === nextFirst) {
                // current -> next
                newPoints = [...currentLine.points, ...nextLine.points.slice(1)];
              } else if (currentLast === nextLast) {
                // current -> reversed next
                newPoints = [...currentLine.points, ...nextLine.points.slice(0, -1).reverse()];
              } else if (currentFirst === nextLast) {
                // next -> current
                newPoints = [...nextLine.points, ...currentLine.points.slice(1)];
              } else if (currentFirst === nextFirst) {
                // reversed next -> current
                newPoints = [...nextLine.points.slice(0, -1).reverse(), ...currentLine.points];
              }

              if (newPoints) {
                currentLine = {
                  ...currentLine,
                  points: newPoints
                };
                usedLines.add(j);
                foundMatch = true;
                modified = true;
                break;
              }
            }
          } while (foundMatch);

          newLines.push(currentLine);
        }

        canvas.lines = newLines;
      }

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to fuse lines: ${error.message}` };
    }
  }
};

const FuseNode = (props) => {
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

export default FuseNode; 