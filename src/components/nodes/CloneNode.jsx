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
    </BaseNode>
  );
};

export default CloneNode;