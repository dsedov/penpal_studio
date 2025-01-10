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
    </BaseNode>
  );
};

export default MergeNode;