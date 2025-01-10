import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import { nodeTypes, defaultNodeData } from './nodes/nodeTypes';
import ContextMenu from './ContextMenu';
import 'reactflow/dist/style.css';
import { computeGraph } from '../lib/nodeComputation';

const Flow = ({
  onNodeSelect,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onComputeResults,
}) => {
  const reactFlowWrapper = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { project } = useReactFlow();

  // Define computeGraphOnce first
  const computeGraphOnce = useCallback(async () => {
    const result = await computeGraph(nodes, edges);
    onComputeResults(result);
  }, [nodes, edges, onComputeResults]);

  // Add computation effect with proper dependencies
  useEffect(() => {
    computeGraphOnce();
  }, [computeGraphOnce]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    // Force recomputation on next tick for edge deletions/changes
    setTimeout(() => computeGraphOnce(), 0);
  }, [onEdgesChange, computeGraphOnce]);

  const onNodeClick = useCallback((event, clickedNode) => {
    event.preventDefault();
    
    if (!event.shiftKey) {
      // Single selection mode
      setNodes((nds) => 
        nds.map((node) => ({
          ...node,
          selected: node.id === clickedNode.id,
          data: {
            ...node.data,
            isMultiSelected: false
          }
        }))
      );
      // Find the updated node to pass to onNodeSelect
      const updatedNode = nodes.find(node => node.id === clickedNode.id);
      onNodeSelect(updatedNode);
    } else {
      // Shift-click mode
      setNodes((nds) => {
        // Get current selection state
        const currentSelected = nds.filter(n => n.selected);
        
        let updatedNodes;
        // If clicked node is already selected, remove it
        if (clickedNode.selected) {
          updatedNodes = nds.map(node => ({
            ...node,
            selected: node.id !== clickedNode.id && node.selected,
            data: {
              ...node.data,
              isMultiSelected: node.id !== clickedNode.id && node.selected && currentSelected.length > 2
            }
          }));
        } else {
          // If clicked node is not selected, add it to selection
          updatedNodes = nds.map(node => ({
            ...node,
            selected: node.id === clickedNode.id ? true : node.selected,
            data: {
              ...node.data,
              isMultiSelected: (node.id === clickedNode.id || node.selected) && (currentSelected.length > 0)
            }
          }));
        }
  
        // Update the selected node in parent if this is the only selected node
        const selectedNodes = updatedNodes.filter(n => n.selected);
        if (selectedNodes.length === 1) {
          onNodeSelect(selectedNodes[0]);
        } else if (selectedNodes.length === 0) {
          onNodeSelect(null);
        }
  
        return updatedNodes;
      });
    }
  }, [setNodes, nodes, onNodeSelect]);
  
  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setNodes((nds) => {
      const selectedIds = selectedNodes.map(node => node.id);
      const hasShift = window.event?.shiftKey;
  
      if (hasShift) {
        // Get existing selected nodes
        const existingSelectedIds = nds
          .filter(node => node.selected)
          .map(node => node.id);
  
        // Combine existing and new selections
        const allSelectedIds = [...new Set([...existingSelectedIds, ...selectedIds])];
  
        return nds.map((node) => ({
          ...node,
          selected: allSelectedIds.includes(node.id),
          data: {
            ...node.data,
            isMultiSelected: allSelectedIds.includes(node.id) && allSelectedIds.length > 1
          }
        }));
      } else {
        // Regular selection
        return nds.map((node) => ({
          ...node,
          selected: selectedIds.includes(node.id),
          data: {
            ...node.data,
            isMultiSelected: selectedIds.includes(node.id) && selectedIds.length > 1
          }
        }));
      }
    });
  }, [setNodes]);
  
  const handlePropertyChange = useCallback((nodeId, propertyName, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              properties: {
                ...node.data.properties,
                [propertyName]: {
                  ...node.data.properties[propertyName],
                  value
                }
              }
            }
          };
        }
        return node;
      })
    );
    // Computation will be triggered by the useEffect
  }, [setNodes]);
  // Check if the connection is valid
  const onConnect = useCallback((params) => {
    console.log('Connection attempt:', params);
    setEdges((eds) => {
      // Find the target node
      const targetNode = nodes.find(node => node.id === params.target);
      const isMergeNode = targetNode?.type === 'merge';
      
      // For merge nodes, allow multiple connections
      if (isMergeNode) {
        return [...eds, { 
          ...params, 
          animated: true,
          style: { stroke: '#999', strokeWidth: 2 }
        }];
      }
      
      // For other nodes, replace existing connection to the same input
      const existingConnection = eds.find(
        edge => 
          edge.target === params.target && 
          edge.targetHandle === params.targetHandle
      );
      
      const filteredEdges = existingConnection 
        ? eds.filter(edge => edge !== existingConnection)
        : eds;

      return [...filteredEdges, { 
        ...params, 
        animated: true,
        style: { stroke: '#999', strokeWidth: 2 }
      }];
    });
    // Force recomputation on next tick
    setTimeout(() => computeGraphOnce(), 0);
  }, [setEdges, nodes, computeGraphOnce]);

  // Validate connection while dragging
  const onConnectStart = useCallback((event, { nodeId, handleId, handleType }) => {
    console.log('Connection started:', { nodeId, handleId, handleType });
  }, []);

  const onConnectEnd = useCallback((event) => {
    console.log('Connection ended');
  }, []);

  const handleToggleBypass = useCallback((nodeId) => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          bypass: node.id === nodeId ? !node.data.bypass : node.data.bypass,
        },
      }))
    );
  }, [setNodes]);

  const handleToggleOutput = useCallback((nodeId) => {
    setNodes((nds) => {
      // Find the node we're toggling
      const targetNode = nds.find(node => node.id === nodeId);
      
      // If this node is already the output node, we're just turning it off
      if (targetNode?.data.isOutput) {
        return nds.map(node => ({
          ...node,
          data: {
            ...node.data,
            isOutput: false
          }
        }));
      }
      
      // Otherwise, turn off all other nodes and turn this one on
      return nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          isOutput: node.id === nodeId
        }
      }));
    });
    // Force recomputation on next tick to ensure state is updated
    setTimeout(() => computeGraphOnce(), 0);
  }, [setNodes, computeGraphOnce]);

  const onContextMenu = useCallback((event) => {
    console.log('Context menu triggered');
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const mousePosition = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };
    const flowPosition = project({
      x: mousePosition.x,
      y: mousePosition.y,
    });
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      flowPosition,
      show: true
    });
  }, [project]);

  const onCreateNode = useCallback((nodeType) => {
    const newNode = {
      id: `${nodes.length + 1}`,
      position: contextMenu.flowPosition,
      type: nodeType,
      selected: false,  // Add this
      data: {
        ...defaultNodeData[nodeType],
        bypass: false,
        isOutput: false,
        isMultiSelected: false,  // Add this
        onToggleBypass: handleToggleBypass,
        onToggleOutput: handleToggleOutput,
      },
    };
    setNodes([...nodes, newNode]);
    setContextMenu(null);
  }, [nodes, contextMenu, setNodes, handleToggleBypass, handleToggleOutput]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div 
      className="reactflow-wrapper bg-gray-100" 
      ref={reactFlowWrapper} 
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'relative'
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onContextMenu={onContextMenu}
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
        className="reactflow-container"
        panOnDrag={[0]}
        panOnScroll={false}
        zoomOnScroll={true}
        preventScrolling={true}
        snapToGrid={true}
        snapGrid={[20, 20]}
        connectionMode="loose"
        selectNodesOnDrag={true} 
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        onNodesChange={(changes) => {
          // Filter out selection changes that come from clicking
          const filteredChanges = changes.filter(change => 
            change.type !== 'select' || !change.selected
          );
          onNodesChange(filteredChanges);
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <ContextMenu
        position={contextMenu}
        onCreateNode={onCreateNode}
        onClose={() => setContextMenu(null)}
      />
    </div>
  );
};

export default Flow;