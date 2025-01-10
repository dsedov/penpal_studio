import CanvasNode, { defaultData as canvasDefaultData } from './CanvasNode';
import PointGridNode, { defaultData as pointGridDefaultData } from './PointGridNode';
import MergeNode, { defaultData as mergeDefaultData } from './MergeNode';

export const nodeTypes = {
  canvas: (props) => <CanvasNode {...props} />,
  pointGrid: (props) => <PointGridNode {...props} />,
  merge: (props) => <MergeNode {...props} />
};

export const defaultNodeData = {
  canvas: canvasDefaultData,
  pointGrid: pointGridDefaultData,
  merge: mergeDefaultData
};