import CanvasNode, { defaultData as canvasDefaultData } from './CanvasNode';
import PointGridNode, { defaultData as pointGridDefaultData } from './PointGridNode';
import RenderSVGNode, { defaultData as renderSVGDefaultData } from './RenderSVGNode';
import MergeNode, { defaultData as mergeDefaultData } from './MergeNode';
import LineNode, { defaultData as lineDefaultData } from './LineNode';
import ConnectNearbyNode, { defaultData as connectNearbyDefaultData } from './ConnectNearbyNode';
import CropNode, { defaultData as cropDefaultData } from './CropNode';
import CleanupNode, { defaultData as cleanupDefaultData } from './CleanupNode';
import TransformNode, { defaultData as transformDefaultData } from './TransformNode';
import CodeNode, { defaultData as codeDefaultData, onPropertyChange as codePropertyChange } from './CodeNode';
import SoftTransformNode, { defaultData as softTransformDefaultData } from './SoftTransformNode';
import EditNode, { defaultData as editDefaultData } from './EditNode';
import { ModificationsInput } from '../inputs/ModificationsInput';
import LoopNode, { defaultData as loopDefaultData } from './LoopNode';

export const nodeTypes = {
  canvas: CanvasNode,
  pointGrid: PointGridNode,
  renderSVG: RenderSVGNode,
  merge: MergeNode,
  line: LineNode,
  connectNearby: ConnectNearbyNode,
  crop: CropNode,
  cleanup: CleanupNode,
  transform: TransformNode,
  code: CodeNode,
  softTransform: SoftTransformNode,
  edit: EditNode,
  loop: LoopNode
};

export const defaultNodeData = {
  canvas: canvasDefaultData,
  pointGrid: pointGridDefaultData,
  renderSVG: renderSVGDefaultData,
  merge: mergeDefaultData,
  line: lineDefaultData,
  connectNearby: connectNearbyDefaultData,
  crop: cropDefaultData,
  cleanup: cleanupDefaultData,
  transform: transformDefaultData,
  code: codeDefaultData,
  softTransform: softTransformDefaultData,
  edit: editDefaultData,
  loop: loopDefaultData
};

export const propertyChangeHandlers = {
  code: codePropertyChange
};

export const customInputTypes = {
  modifications: ModificationsInput
}; 