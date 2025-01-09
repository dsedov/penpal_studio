import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Clone',
  sourcePoints: [],
  targetPoints: []
};

const CloneNode = (props) => {
  return (
    <BaseNode {...props}>
      <div className="space-y-2">
        <div>Source Points: {props.data.sourcePoints?.length || 0}</div>
        <div>Target Points: {props.data.targetPoints?.length || 0}</div>
      </div>
    </BaseNode>
  );
};

export default CloneNode;