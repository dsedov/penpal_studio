import CanvasNode, { defaultData as canvasDefaultData } from './CanvasNode';
import PointGridNode, { defaultData as pointGridDefaultData } from './PointGridNode';
import CloneNode, { defaultData as cloneDefaultData } from './CloneNode';
import MergeNode, { defaultData as mergeDefaultData } from './MergeNode';  // Added this

export const nodeTypes = {
  canvas: CanvasNode,
  pointGrid: PointGridNode,
  clone: CloneNode,
  merge: MergeNode  // Added this
};

export const defaultNodeData = {
  canvas: canvasDefaultData,
  pointGrid: pointGridDefaultData,
  clone: cloneDefaultData,
  merge: mergeDefaultData  // Added this
};