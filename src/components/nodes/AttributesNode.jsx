import React, { useEffect } from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';
import { useReactFlow } from 'reactflow';


export const defaultData = {
  label: 'Attributes',
  menu: {
    category: 'Transform',
    label: 'Attributes',
    description: 'Modify attributes of points or lines'
  },
  properties: {
    target: {
      label: 'Target',
      type: 'menu',
      value: 'points',
      options: [
        { value: 'points', label: 'Points' },
        { value: 'lines', label: 'Lines' },
        { value: 'all', label: 'All' }
      ]
    },
    attributeName: {
      label: 'Attribute Name',
      type: 'string',
      value: ''
    },
    attributeType: {
      label: 'Attribute Type',
      type: 'menu',
      value: 'float',
      options: [
        { value: 'float', label: 'Float' },
        { value: 'int', label: 'Integer' },
        { value: 'vec2', label: 'Vector 2D' },
        { value: 'color', label: 'Color' }
      ]
    },
    floatValue: {
      label: 'Value',
      type: 'float',
      value: 0.0,
      visible: false
    },
    intValue: {
      label: 'Value',
      type: 'int',
      value: 0,
      visible: false
    },
    vec2Value: {
      label: 'Value',
      type: 'vec2',
      value: { x: 800, y: 600 },
      min: { x: 1, y: 1 },
      max: { x: 10000, y: 10000 },
      visible: false
    },
    colorValue: {
      label: 'Value',
      type: 'color',
      value: '#000000',
      visible: false
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Attributes node requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      const { target, attributeName, attributeType } = properties;

      // Skip if attribute name is empty
      if (!attributeName.value) {
        return { error: 'Attribute name cannot be empty' };
      }

      // Get the appropriate value based on the attribute type
      let value;
      switch (attributeType.value) {
        case 'float':
          value = properties.floatValue.value;
          break;
        case 'int':
          value = properties.intValue.value;
          break;
        case 'vec2':
          // Ensure vec2 value is properly structured with default values
          const vec2Value = properties.vec2Value.value || { x: 0, y: 0 };
          value = {
            x: typeof vec2Value.x === 'number' ? vec2Value.x : 0,
            y: typeof vec2Value.y === 'number' ? vec2Value.y : 0
          };
          break;
        case 'color':
          value = properties.colorValue.value;
          break;
        default:
          return { error: 'Invalid attribute type' };
      }

      // Apply to points
      if (target.value === 'points' || target.value === 'all') {
        canvas.points = canvas.points.map(point => ({
          ...point,
          [attributeName.value]: value
        }));
      }

      // Apply to lines
      if (target.value === 'lines' || target.value === 'all') {
        canvas.lines = canvas.lines.map(line => ({
          ...line,
          [attributeName.value]: value
        }));
      }

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to modify attributes: ${error.message}` };
    }
  }
};

const AttributesNode = (props) => {
  const { setNodes } = useReactFlow();

  // Handle visibility of value properties based on selected type
  useEffect(() => {
    const type = props.data.properties.attributeType.value;
    
    setNodes(nodes => 
      nodes.map(node => {
        if (node.id === props.id) {
          const updatedProperties = {
            ...node.data.properties,
            floatValue: { ...node.data.properties.floatValue, visible: type === 'float' },
            intValue: { ...node.data.properties.intValue, visible: type === 'int' },
            vec2Value: { 
              ...node.data.properties.vec2Value, 
              visible: type === 'vec2',
              // Ensure vec2 value is always properly structured
              value: type === 'vec2' ? 
                {
                  x: (node.data.properties.vec2Value?.value?.x ?? 0),
                  y: (node.data.properties.vec2Value?.value?.y ?? 0)
                } : 
                {x: 0, y: 0}
            },
            colorValue: { ...node.data.properties.colorValue, visible: type === 'color' }
          };

          return {
            ...node,
            data: {
              ...node.data,
              properties: updatedProperties
            }
          };
        }
        return node;
      })
    );
  }, [props.data.properties.attributeType.value, props.id, setNodes]);

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

export default AttributesNode; 