import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import MenuBar from './components/MenuBar';
import Flow from './components/Flow';
import P5Canvas from './components/P5Canvas';
import AttributeEditor from './components/AttributeEditor';
import { useNodesState, useEdgesState } from 'reactflow';
import { computeGraph } from './lib/nodeComputation';
import { saveProjectToFile, loadProjectFromFile } from './lib/fileOperations';
import { defaultNodeData } from './components/nodes/nodeTypes';
import { nanoid } from 'nanoid';

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [outputNodeId, setOutputNodeId] = useState(null);
  const [computationResults, setComputationResults] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [canvasViewport, setCanvasViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [canvasMode, setCanvasMode] = useState('pan');
  const [showPoints, setShowPoints] = useState(true);
  const [liveUpdate, setLiveUpdate] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Handle computation results
  const handleComputeResults = useCallback((results) => {
    setComputationResults(results);
  }, []);

  const handleNodeSelect = useCallback((node) => {
    setSelectedNodeId(node ? node.id : null);
    // Clear edit mode if we're not selecting an Edit node
    if (!node || node.type !== 'edit') {
      setEditMode(false);
      setCanvasMode('pan');
    }
  }, []);

  const handleOutputToggle = useCallback((nodeId) => {
    // If clicking the current output node, turn it off
    if (nodeId === outputNodeId) {
      setOutputNodeId(null);
      return;
    }
    // Otherwise, set the new output node
    setOutputNodeId(nodeId);
  }, [outputNodeId]);

  const handlePropertyChange = useCallback((nodeId, propertyName, value) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              properties: {
                ...node.data.properties,
                [propertyName]: {
                  ...node.data.properties[propertyName],
                  value,
                },
              },
            },
          };
        }
        return node;
      })
    );
  }, []);

  const selectedNode = selectedNodeId
    ? nodes.find((node) => node.id === selectedNodeId)
    : null;

  const onMouseDown = (event) => {
    if (!event.target.closest('.react-flow')) return;
    if (event.button === 0) {
      setIsPanning(true);
    }
  };

  const onMouseUp = () => {
    setIsPanning(false);
  };

  const onMouseMove = (event) => {
    if (!isPanning) return;
    if (!event.target.closest('.react-flow')) {
      setIsPanning(false);
      return;
    }
    // ... panning logic ...
  };

  const handleSaveProject = async () => {
    const success = await saveProjectToFile({
      nodes,
      edges,
      canvasViewport,
      canvasSettings: {
        mode: canvasMode,
        showPoints,
        liveUpdate
      }
    });
    if (success) {
      console.log('Project saved successfully');
    }
  };

  const handleLoadProject = async () => {
    const projectData = await loadProjectFromFile();
    if (projectData) {
      // Reconstruct nodes with their functions
      const reconstructedNodes = projectData.nodes.map(node => {
        const nodeType = node.type;
        const defaultData = defaultNodeData[nodeType];
        
        return {
          ...node,
          data: {
            ...node.data,
            ...defaultData,
            properties: node.data.properties,
            compute: defaultData.compute,
            onToggleBypass: (id) => handleBypassToggle(id),
            onToggleOutput: (id) => handleOutputToggle(id),
            bypass: node.data.bypass
          }
        };
      });

      // Update outputNodeId for all nodes
      const savedOutputNode = projectData.nodes.find(node => node.data.isOutput);
      if (savedOutputNode) {
        setOutputNodeId(savedOutputNode.id);
      }

      setNodes(reconstructedNodes);
      setEdges(projectData.edges);
      setCanvasViewport(projectData.viewport);
      setCanvasMode(projectData.canvasSettings.mode);
      setShowPoints(projectData.canvasSettings.showPoints);
      setLiveUpdate(projectData.canvasSettings.liveUpdate);
    }
  };

  const handleBypassToggle = useCallback((nodeId) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              bypass: !node.data.bypass
            }
          };
        }
        return node;
      })
    );
  }, []);

  const handleDuplicateNode = useCallback(() => {
    if (!selectedNodeId) return;
    
    const nodeToDuplicate = nodes.find(node => node.id === selectedNodeId);
    if (!nodeToDuplicate) return;

    const newNode = {
      ...nodeToDuplicate,
      id: `node_${nanoid()}`,
      position: {
        x: nodeToDuplicate.position.x + 20,
        y: nodeToDuplicate.position.y + 20
      },
      data: {
        ...nodeToDuplicate.data,
        bypass: false,
        onToggleBypass: (id) => handleBypassToggle(id),
        onToggleOutput: (id) => handleOutputToggle(id),
      },
      selected: false
    };

    setNodes(nds => [...nds, newNode]);
  }, [selectedNodeId, nodes, handleBypassToggle, handleOutputToggle]);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();  // Prevent browser's bookmark dialog
        handleDuplicateNode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDuplicateNode]);

  // Add handler for point movement
  const handlePointMove = useCallback((pointIndex, modification) => {
    console.log('Moving point:', pointIndex, modification);
    if (!selectedNodeId) return;

    setNodes(nodes => nodes.map(node => {
      if (node.id !== selectedNodeId) return node;

      // Create a new Map if it doesn't exist
      const currentMods = node.data.properties.modifications.value || new Map();
      const newMods = new Map(currentMods);
      newMods.set(pointIndex, modification);

      return {
        ...node,
        data: {
          ...node.data,
          properties: {
            ...node.data.properties,
            modifications: {
              ...node.data.properties.modifications,
              value: newMods
            }
          }
        }
      };
    }));
  }, [selectedNodeId]);

  // Update canvas mode handler
  const handleCanvasModeChange = useCallback((mode) => {
    if (mode === 'edit') {
      // Only allow edit mode if an Edit node is selected
      const selectedNode = nodes.find(n => n.id === selectedNodeId);
      if (selectedNode?.type === 'edit') {
        // Check if the node has any input connections
        const hasInput = edges.some(edge => edge.target === selectedNodeId);
        if (!hasInput) {
          // If no input, stay in pan mode
          setCanvasMode('pan');
          return;
        }
        setEditMode(true);
      } else {
        setCanvasMode('pan');
      }
    } else {
      setCanvasMode(mode);
      setEditMode(false);
    }
  }, [selectedNodeId, nodes, edges]);

  return (
    <div className="h-screen w-screen flex flex-col dark">
      <MenuBar 
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
      />
      <div className="flex-1" style={{ height: 'calc(100vh - 48px)' }}>
        <Allotment>
          <Allotment.Pane minSize={200}>
            <P5Canvas 
              computedData={outputNodeId ? computationResults?.get(outputNodeId) : null}
              viewport={canvasViewport}
              onViewportChange={setCanvasViewport}
              mode={canvasMode}
              onModeChange={handleCanvasModeChange}
              showPoints={showPoints}
              onShowPointsChange={setShowPoints}
              liveUpdate={liveUpdate}
              onLiveUpdateToggle={setLiveUpdate}
              editMode={editMode}
              onPointMove={handlePointMove}
              selectedNodeId={selectedNodeId}
              showEditButton={selectedNode?.type === 'edit'}
            />
          </Allotment.Pane>
          <Allotment.Pane minSize={200}>
            <Allotment vertical>
              <Allotment.Pane minSize={100}>
                <AttributeEditor
                  selectedNode={selectedNode}
                  onPropertyChange={handlePropertyChange}
                  computedData={selectedNodeId ? computationResults?.get(selectedNodeId) : null}
                />
              </Allotment.Pane>
              <Allotment.Pane minSize={100}>
                <div style={{ width: '100%', height: '100%' }}>
                  <ReactFlowProvider>
                    <Flow
                      onNodeSelect={handleNodeSelect}
                      onOutputToggle={handleOutputToggle}
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      setNodes={setNodes}
                      setEdges={setEdges}
                      onComputeResults={handleComputeResults}
                      computationResults={computationResults}
                      outputNodeId={outputNodeId}
                      liveUpdate={liveUpdate}
                    />
                  </ReactFlowProvider>
                </div>
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}

export default App;