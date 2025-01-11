import React, { memo } from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';

export const defaultData = {
  label: 'Render SVG',
  properties: {
    filePath: { type: 'file', value: '', extension: '.svg' }
  },
  compute: async (inputData, properties) => {
    try {
      const canvas = inputData.input?.result;
      if (!(canvas instanceof Canvas)) {
        return { error: 'Input must be a canvas' };
      }

      const filePath = properties.filePath?.value;
      if (!filePath) {
        return { error: 'No output file specified' };
      }

      // For now, just create an empty SVG file
      const fs = window.require('electron').remote.require('fs');
      const emptySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvas.size.x}" height="${canvas.size.y}" xmlns="http://www.w3.org/2000/svg">
</svg>`;

      fs.writeFileSync(filePath, emptySvg);
      
      return { result: canvas, error: null };
    } catch (error) {
      return { error: `Failed to save SVG: ${error.message}` };
    }
  }
};

const RenderSVGNode = memo(({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      title="Render SVG"
      color="rgb(229, 231, 235)"
      inputs={[
        { id: 'input', label: 'Input' }
      ]}
      outputs={[
        { id: 'output', label: 'Output' }
      ]}
    />
  );
});

export default RenderSVGNode; 