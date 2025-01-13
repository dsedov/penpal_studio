// Export
import ExportSVGNode, { defaultData as exportSVGDefaultData } from './Export/ExportSVGNode';

// Generate
import CanvasNode, { defaultData as canvasDefaultData } from './Generate/CanvasNode';
import PointGridNode, { defaultData as pointGridDefaultData } from './Generate/PointGridNode';
import LineNode, { defaultData as lineDefaultData } from './Generate/LineNode';
import ConnectNode, { defaultData as connectDefaultData } from './Generate/ConnectNode';
import CloneNode, { defaultData as cloneDefaultData } from './Generate/CloneNode';
import DuplicateNode, { defaultData as duplicateDefaultData } from './Generate/DuplicateNode';

// Attributes
import AttributesNode, { defaultData as attributesDefaultData } from './Attributes/AttributesNode';

//Modify
import TransformNode, { defaultData as transformDefaultData } from './Modify/TransformNode';
import CropNode, { defaultData as cropDefaultData } from './Modify/CropNode';
import EditNode, { defaultData as editDefaultData } from './Modify/EditNode';
import CleanupNode, { defaultData as cleanupDefaultData } from './Modify/CleanupNode';
import SubdivideNode, { defaultData as subdivideDefaultData } from './Modify/SubdivideNode';

// Utility
import CodeNode, { defaultData as codeDefaultData, onPropertyChange as codePropertyChange } from './Utility/CodeNode';
import MergeNode, { defaultData as mergeDefaultData } from './Utility/MergeNode';
import LoopNode, { defaultData as loopDefaultData } from './Utility/LoopNode';

// Deform
import SoftTransformNode, { defaultData as softTransformDefaultData } from './Deform/SoftTransformNode';

import { ModificationsInput } from '../inputs/ModificationsInput';






export const nodeTypes = {
  canvas: CanvasNode,
  pointGrid: PointGridNode,
  exportSVG: ExportSVGNode,
  merge: MergeNode,
  line: LineNode,
  connect: ConnectNode,
  crop: CropNode,
  cleanup: CleanupNode,
  transform: TransformNode,
  code: CodeNode,
  softTransform: SoftTransformNode,
  edit: EditNode,
  loop: LoopNode,
  clone: CloneNode,
  attributes: AttributesNode,
  duplicate: DuplicateNode,
  subdivide: SubdivideNode
};

export const defaultNodeData = {
  canvas: canvasDefaultData,
  pointGrid: pointGridDefaultData,
  exportSVG: exportSVGDefaultData,
  merge: mergeDefaultData,
  line: lineDefaultData,
  connect: connectDefaultData,
  crop: cropDefaultData,
  cleanup: cleanupDefaultData,
  transform: transformDefaultData,
  code: codeDefaultData,
  softTransform: softTransformDefaultData,
  edit: editDefaultData,
  loop: loopDefaultData,
  clone: cloneDefaultData,
  attributes: attributesDefaultData,
  duplicate: duplicateDefaultData,
  subdivide: subdivideDefaultData
};

export const propertyChangeHandlers = {
  code: codePropertyChange
};

export const customInputTypes = {
  modifications: ModificationsInput
}; 