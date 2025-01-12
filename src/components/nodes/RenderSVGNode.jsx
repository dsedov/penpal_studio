import React, { memo } from 'react';
import BaseNode from './BaseNode';
import Canvas from '../data/Canvas';
import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

const generateSVG = (canvas) => {
  // First, group lines by color
  const linesByColor = new Map();
  canvas.lines.forEach(line => {
    const color = line.color || '#000000';  // Default to black if no color
    if (!linesByColor.has(color)) {
      linesByColor.set(color, []);
    }
    linesByColor.get(color).push(line);
  });

  // Convert color to a readable name for group labels
  const getColorName = (color) => {
    // Handle null/undefined case
    if (!color) return 'default';

    // Handle RGB object case first
    if (typeof color === 'object' && color.r !== undefined) {
      return `rgb-${color.r}-${color.g}-${color.b}`;
    }

    // Handle string case (including hex)
    if (typeof color === 'string') {
      if (color.startsWith('#')) {
        return color.slice(1, 7);
      }
      return color.replace(/[^a-zA-Z0-9]/g, '-');
    }

    return 'default';
  };

  // Convert any color format to SVG-compatible color string
  const formatColor = (color) => {
    // Handle null/undefined case
    if (!color) return '#000000';

    // Handle RGB object case
    if (typeof color === 'object' && color.r !== undefined) {
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    // Handle string case or return default
    return typeof color === 'string' ? color : '#000000';
  };

  const width = canvas.size.x;
  const height = canvas.size.y;
  
  let svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
 <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
 <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
 `;

  // Add lines grouped by color
  let groupIndex = 1;
  linesByColor.forEach((lines, color) => {
    const colorName = getColorName(color);
    const svgColor = formatColor(color);
    svgContent += `  <g
     inkscape:groupmode="layer"
     id="layer${groupIndex}"
     inkscape:label="${groupIndex}-${colorName}-layer">
 `;
     
    lines.forEach(line => {
      const startPoint = canvas.points[line.points[0]];
      const endPoint = canvas.points[line.points[1]];
      svgContent += `    <line x1="${startPoint.x}" y1="${startPoint.y}" 
                             x2="${endPoint.x}" y2="${endPoint.y}"
                             stroke="${svgColor}"
                             stroke-width="${line.thickness || 1}"
                       />\n`;
    });
    
    svgContent += `  </g>\n`;
    groupIndex++;
  });

  svgContent += '</svg>';
  return svgContent;
};

export const defaultData = {
  label: 'Render SVG',
  menu: {
    category: 'Render',
    label: 'SVG File',
    description: 'Exports the canvas to an SVG file'
  },
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

        const svgContent = generateSVG(canvas);

        await writeTextFile(filePath, svgContent, { baseDir:BaseDirectory.None });
      
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