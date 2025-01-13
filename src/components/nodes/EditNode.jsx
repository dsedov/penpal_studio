import React from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

// Define modification types
export const ModificationType = {
  MOVE_POINT: 'MOVE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
  CREATE_LINE: 'CREATE_LINE',
  DELETE_LINE: 'DELETE_LINE',
  ADD_POINT_TO_LINE: 'ADD_POINT_TO_LINE',
  REMOVE_POINT_FROM_LINE: 'REMOVE_POINT_FROM_LINE'
};

export const defaultData = {
  label: 'Edit',
  menu: {
    category: 'Operators',
    label: 'Edit',
    description: 'Edit canvas elements'
  },
  properties: {
    modifications: {
      label: 'Modifications',
      type: 'modifications',
      value: [], // Array of modifications
      internal: true
    }
  },
  compute: async (inputData, properties) => {
    try {
      const inputCanvas = inputData.input?.result;
      if (!(inputCanvas instanceof Canvas)) {
        return { error: 'Edit requires a canvas input' };
      }

      const canvas = inputCanvas.clone();
      
      // Apply modifications in order
      properties.modifications.value.forEach(mod => {
        if (!mod || !mod.type) return;

        switch (mod.type) {
          case ModificationType.MOVE_POINT:
            if (canvas.points[mod.pointIndex]) {
              canvas.points[mod.pointIndex] = {
                ...canvas.points[mod.pointIndex],
                x: mod.newPos.x,
                y: mod.newPos.y
              };
            }
            break;

          case ModificationType.ADD_POINT:
            canvas.points.push({
              x: mod.position.x,
              y: mod.position.y
            });
            break;

          case ModificationType.CREATE_LINE:
            if (Array.isArray(mod.points) && mod.points.length >= 2) {
              canvas.lines.push({
                points: [...mod.points],
                color: mod.color || '#000000',
                thickness: mod.thickness || 2
              });
            }
            break;

          case ModificationType.DELETE_POINT:
            if (canvas.points[mod.pointIndex]) {
              // Create a mapping of old indices to new ones
              const indexMap = new Map();
              let newIndex = 0;
              
              // Create new points array without the deleted point
              canvas.points = canvas.points.reduce((newPoints, point, oldIndex) => {
                if (oldIndex === mod.pointIndex) {
                  indexMap.set(oldIndex, -1); // Mark deleted point
                  return newPoints;
                }
                indexMap.set(oldIndex, newIndex);
                newIndex++;
                return [...newPoints, point];
              }, []);

              // Update all line references to use new point indices
              canvas.lines = canvas.lines.map(line => ({
                ...line,
                points: line.points
                  .map(p => indexMap.get(p))
                  .filter(p => p !== -1)
              })).filter(line => line.points.length >= 2);
            }
            break;
        }
      });

      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to apply edits: ${error.message}` };
    }
  }
};

const EditNode = (props) => {
  return (
    <BaseNode
      {...props}
      inputs={[
        { id: 'input', label: 'Input' }
      ]}
      outputs={[
        { id: 'output', label: 'Output' }
      ]}
      onPropertyChange={(property, value) => {
        props.data.properties[property].value = value;
        props.onChange?.(props.data);
      }}
    />
  );
};

export default EditNode; 