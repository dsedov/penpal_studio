// nodeTypes.js
import CanvasNode, { defaultData as canvasDefaultData } from './CanvasNode';
import PointGridNode, { defaultData as pointGridDefaultData } from './PointGridNode';
import CloneNode, { defaultData as cloneDefaultData } from './CloneNode';

export const nodeTypes = {
  canvas: CanvasNode,
  pointGrid: PointGridNode,
  clone: CloneNode
};

export const defaultNodeData = {
  canvas: canvasDefaultData,
  pointGrid: pointGridDefaultData,
  clone: cloneDefaultData
};