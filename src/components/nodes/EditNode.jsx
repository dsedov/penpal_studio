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
    />
  );
};

export default EditNode; 