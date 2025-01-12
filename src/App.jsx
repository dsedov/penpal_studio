import React, { useState, useCallback } from 'react';
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

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [outputNodeId, setOutputNodeId] = useState(null);
  const [computationResults, setComputationResults] = useState(null);
  const [isPanning, setIsPanning] = useState(false);

  // Handle computation results
  const handleComputeResults = useCallback((results) => {
    setComputationResults(results);
  }, []);

  const handleNodeSelect = (node) => {
    setSelectedNodeId(node ? node.id : null);
  };

  const handleOutputToggle = useCallback((nodeId) => {
    setOutputNodeId(nodeId);
  }, []);

  const handlePropertyChange = (nodeId, propertyName, value) => {
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
  };

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

  return (
    <div className="h-screen w-screen flex flex-col dark">
      <MenuBar />
      <div className="flex-1" style={{ height: 'calc(100vh - 48px)' }}>
        <Allotment>
          <Allotment.Pane minSize={200}>
            <P5Canvas 
              computedData={outputNodeId ? computationResults?.get(outputNodeId) : null} 
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