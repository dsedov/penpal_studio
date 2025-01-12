import React, { useContext, useState, useEffect } from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';
import P5Canvas from '../P5Canvas';

export const defaultData = {
  label: 'Edit',
  menu: {
    category: 'Operators',
    label: 'Edit',
    description: 'Manually edit point positions and lines'
  },
  properties: {
    modifications: {
      label: 'Modifications',
      type: 'modifications',
      value: new Map(),
      internal: true
    },
    lineEdits: {
      label: 'Line Edits',
      type: 'internal',
      value: {
        selectedLine: null,
        currentLine: [], // Array of point indices for new line creation
      },
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
      
      // Apply stored modifications
      properties.modifications.value.forEach((mod, pointIndex) => {
        if (canvas.points[pointIndex]) {
          canvas.points[pointIndex] = {
            ...canvas.points[pointIndex],
            x: mod.newPos.x,
            y: mod.newPos.y
          };
        }
      });

      // Apply line edits if there are any
      if (properties.lineEdits.value.currentLine?.length >= 2) {
        canvas.lines.push({
          points: [...properties.lineEdits.value.currentLine],
          color: '#000000',
          thickness: 2
        });
      }

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
      renderOutput={(computedData) => (
        <P5Canvas
          computedData={computedData}
          showEditButton={true}
          onPointMove={(pointIndex, modification) => {
            if (!props.data.onPropertyChange) return;
            const modifications = new Map(props.data.properties.modifications.value);
            modifications.set(pointIndex, modification);
            props.data.onPropertyChange(props.id, 'modifications', modifications);
          }}
          onLineEdit={(points) => {
            if (!props.data.onPropertyChange) return;
            const lineEdits = {...props.data.properties.lineEdits.value};
            
            // If we received an array of points, create a new line
            if (Array.isArray(points) && points.length >= 2) {
              // Create a new line with the points
              canvas.lines.push({
                points: points,
                color: '#000000',
                thickness: 2
              });
              // Clear the current line
              lineEdits.currentLine = [];
            } else {
              // Single point selection logic
              const pointIndex = points;
              if (!lineEdits.selectedLine) {
                lineEdits.currentLine = [pointIndex];
              } else {
                const currentLine = [...lineEdits.currentLine];
                const pointIdx = currentLine.indexOf(pointIndex);
                
                if (pointIdx === -1) {
                  currentLine.push(pointIndex);
                } else {
                  currentLine.splice(pointIdx, 1);
                }
                lineEdits.currentLine = currentLine;
              }
            }
            
            props.data.onPropertyChange(props.id, 'lineEdits', {...lineEdits});
          }}
          selectedLine={props.data.properties.lineEdits?.value?.selectedLine}
          onLineSelect={(lineIndex) => {
            if (!props.data.onPropertyChange) return;
            const lineEdits = {...props.data.properties.lineEdits.value};
            lineEdits.selectedLine = lineIndex;
            props.data.onPropertyChange(props.id, 'lineEdits', {...lineEdits});
          }}
        />
      )}
    />
  );
};

export default EditNode; 