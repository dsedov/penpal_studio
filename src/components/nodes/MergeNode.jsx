import React from 'react';
import BaseNode from './BaseNode';

export const defaultData = {
  label: 'Merge',
  inputs: []
};

const MergeNode = (props) => {
  const inputs = [{
    id: 'merge',
    type: 'multi'  // This specifies it's a multi-input handle
  }];

  return (
    <BaseNode 
      {...props} 
      inputs={inputs}
    >
      <div className="space-y-2">
        <div>Input Count: {props.data.inputs?.length || 0}</div>
      </div>
    </BaseNode>
  );
};

export default MergeNode;