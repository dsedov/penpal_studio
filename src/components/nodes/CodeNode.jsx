import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

const DEFAULT_GLOBAL_CODE = `// Modify canvas directly
// Example:
// canvas.points.push({ x: 0, y: 0 });
// return canvas;`;

const DEFAULT_POINT_CODE = `// Modify each point
// Available variables:
// point - current point object { x, y, attributes }
// index - point index
// Example:
// point.x += 10;
// point.attributes.visited = true;`;

const DEFAULT_LINE_CODE = `// Modify each line
// Available variables:
// line - current line object { points[], color, thickness }
// index - line index
// Example:
// line.color = '#FF0000';
// line.thickness *= 2;`;

export const defaultData = {
  label: 'Code',
  menu: {
    category: 'Operators',
    label: 'Code',
    description: 'Execute custom code on canvas elements'
  },
  properties: {
    mode: {
      label: 'Execution Mode',
      type: 'menu',
      value: 'global',
      options: [
        { value: 'global', label: 'Global' },
        { value: 'point', label: 'Per Point' },
        { value: 'line', label: 'Per Line' }
      ]
    },
    code: {
      label: 'Code',
      type: 'code',
      value: DEFAULT_GLOBAL_CODE,
      language: 'javascript'
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Code node requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      const mode = properties.mode.value;
      const code = properties.code.value;

      // Create function from code
      let processFunction;
      try {
        switch (mode) {
          case 'global':
            processFunction = new Function('canvas', code);
            break;
          case 'point':
            processFunction = new Function('point', 'index', code);
            break;
          case 'line':
            processFunction = new Function('line', 'index', code);
            break;
          default:
            throw new Error(`Invalid mode: ${mode}`);
        }
      } catch (error) {
        return { error: `Code compilation error: ${error.message}` };
      }

      // Execute code based on mode
      try {
        switch (mode) {
          case 'global':
            // Execute global code with canvas as argument
            const result = processFunction(canvas);
            // If function returns a canvas, use it
            if (result instanceof Canvas) {
              return { result: result, error: null };
            }
            // Otherwise return the modified canvas
            return { result: canvas, error: null };

          case 'point':
            // Execute code for each point
            canvas.points = canvas.points.map((point, index) => {
              if (!point) return point;
              processFunction(point, index);
              return point;
            });
            return { result: canvas, error: null };

          case 'line':
            // Execute code for each line
            canvas.lines = canvas.lines.map((line, index) => {
              processFunction(line, index);
              return line;
            });
            return { result: canvas, error: null };
        }
      } catch (error) {
        return { error: `Runtime error: ${error.message}` };
      }
    } catch (error) {
      return { error: `Failed to execute code: ${error.message}` };
    }
  }
};

// Update code template when mode changes
export const onPropertyChange = (propertyName, value, properties) => {
  if (propertyName === 'mode') {
    switch (value) {
      case 'global':
        return { code: { value: DEFAULT_GLOBAL_CODE } };
      case 'point':
        return { code: { value: DEFAULT_POINT_CODE } };
      case 'line':
        return { code: { value: DEFAULT_LINE_CODE } };
    }
  }
  return null;
};

const CodeNode = (props) => {
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

export default CodeNode; 