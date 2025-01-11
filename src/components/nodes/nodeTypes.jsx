import CanvasNode, { defaultData as canvasDefaultData } from './CanvasNode';
import PointGridNode, { defaultData as pointGridDefaultData } from './PointGridNode';
import MergeNode, { defaultData as mergeDefaultData } from './MergeNode';
import RenderSVGNode, { defaultData as renderSVGDefaultData } from './RenderSVGNode';

export const nodeTypes = {
  canvas: (props) => <CanvasNode {...props} />,
  pointGrid: (props) => <PointGridNode {...props} />,
  merge: (props) => <MergeNode {...props} />,
  renderSVG: (props) => <RenderSVGNode {...props} />
};

export const defaultNodeData = {
  canvas: canvasDefaultData,
  pointGrid: pointGridDefaultData,
  merge: mergeDefaultData,
  renderSVG: renderSVGDefaultData
};