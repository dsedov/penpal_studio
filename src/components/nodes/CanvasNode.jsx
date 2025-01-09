import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Canvas',
  width: 800,
  height: 600,
  margins: [50, 50, 50, 50]
};

const CanvasNode = (props) => {
  return (
    <BaseNode {...props} showInputs={false}>
      <div className="space-y-2">
        <div>Canvas Size: {props.data.width} x {props.data.height}</div>
        <div>Margins: {props.data.margins.join(', ')}</div>
      </div>
    </BaseNode>
  );
};

export default CanvasNode;