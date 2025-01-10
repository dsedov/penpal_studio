import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Point Grid',
  properties: {
    spacing: {
      type: 'float',
      value: 20.0,
      min: 0.1,
      max: 100.0,
    }
  }
};

const PointGridNode = (props) => {
  const inputs = [{
    id: 'default',
    type: 'single'
  }];

  return (
    <BaseNode 
      {...props} 
      inputs={inputs}
    >
    </BaseNode>
  );
};

export default PointGridNode;