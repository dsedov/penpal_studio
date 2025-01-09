import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Clone',
  sourcePoints: [],
  targetPoints: []
};

const CloneNode = (props) => {
  const inputs = [
    {
      id: 'source',
      type: 'single'
    },
    {
      id: 'target',
      type: 'single'
    }
  ];

  return (
    <BaseNode 
      {...props} 
      inputs={inputs}
    >
      <div className="space-y-2">
        <div>Source Points: {props.data.sourcePoints?.length || 0}</div>
        <div>Target Points: {props.data.targetPoints?.length || 0}</div>
      </div>
    </BaseNode>
  );
};

export default CloneNode;