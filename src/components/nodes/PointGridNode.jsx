import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Point Grid',
  spacing: 20,
  points: []
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
      <div className="space-y-2">
        <div>Spacing: {props.data.spacing}</div>
        <div>Points: {props.data.points?.length || 0}</div>
      </div>
    </BaseNode>
  );
};

export default PointGridNode;