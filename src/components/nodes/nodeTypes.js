import CanvasNode, { defaultData as canvasDefaultData } from './CanvasNode';
import PointGridNode, { defaultData as pointGridDefaultData } from './PointGridNode';
import RenderSVGNode, { defaultData as renderSVGDefaultData } from './RenderSVGNode';
import MergeNode, { defaultData as mergeDefaultData } from './MergeNode';
import LineNode, { defaultData as lineDefaultData } from './LineNode';
import ConnectNearbyNode, { defaultData as connectNearbyDefaultData } from './ConnectNearbyNode';

export const nodeTypes = {
  canvas: CanvasNode,
  pointGrid: PointGridNode,
  renderSVG: RenderSVGNode,
  merge: MergeNode,
  line: LineNode,
  connectNearby: ConnectNearbyNode,
};

export const defaultNodeData = {
  canvas: canvasDefaultData,
  pointGrid: pointGridDefaultData,
  renderSVG: renderSVGDefaultData,
  merge: mergeDefaultData,
  line: lineDefaultData,
  connectNearby: connectNearbyDefaultData,
}; 