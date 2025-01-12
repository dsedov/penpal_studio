import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow
} from 'reactflow';
import { nodeTypes, defaultNodeData } from './nodes/nodeTypes';
import ContextMenu from './ContextMenu';
import 'reactflow/dist/style.css';
import { computeGraph } from '../lib/nodeComputation';

const Flow = ({
  onNodeSelect,
  onOutputToggle,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onComputeResults,
  computationResults,
  outputNodeId,
}) => {
  const reactFlowWrapper = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { screenToFlowPosition } = useReactFlow();

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
    // If no nodes are selected or selectedNodes is undefined, clear all selections
    if (!selectedNodes || selectedNodes.length === 0) {
      setNodes((nds) => nds.map((node) => ({
        ...node,
        selected: false,
        data: {
          ...node.data,
          isMultiSelected: false
        }
      })));
      onNodeSelect(null);
      return;
    }

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
  }, [setNodes, onNodeSelect]);
  
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
    setEdges((eds) => {
      const targetNode = nodes.find(node => node.id === params.target);
      const isMergeNode = targetNode?.type === 'merge';
      
      // Create new edge with unique ID
      const newEdge = {
        ...params,
        id: generateUniqueId('edge_', eds),
        animated: true,
        data: {
          label: `Connection ${params.source} → ${params.target}`
        },
        style: { stroke: '#999', strokeWidth: 2 }
      };
      
      // For merge nodes, allow multiple connections
      if (isMergeNode) {
        return [...eds, newEdge];
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

      return [...filteredEdges, newEdge];
    });
    setTimeout(() => computeGraphOnce(), 0);
  }, [setEdges, nodes, computeGraphOnce]);

  // Validate connection while dragging
  const onConnectStart = useCallback((event, { nodeId, handleId, handleType }) => {
  }, []);

  const onConnectEnd = useCallback((event) => {
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
    // Add this to trigger recomputation after bypass toggle
    setTimeout(() => computeGraphOnce(), 0);
  }, [setNodes, computeGraphOnce]);

  const handleToggleOutput = useCallback((nodeId) => {
    // First call the parent's output toggle handler
    onOutputToggle(nodeId);
    
    // Then update the nodes directly here
    setNodes(nds => {
      const updatedNodes = nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          isOutput: node.id === nodeId
        }
      }));
      
      // Schedule computation after both state updates
      Promise.resolve().then(() => {
        computeGraphOnce();
      });
      
      return updatedNodes;
    });
  }, [onOutputToggle, setNodes, computeGraphOnce]);

  const onContextMenu = useCallback((event) => {
    event.preventDefault();
    const mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    const flowPosition = screenToFlowPosition(mousePosition);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      flowPosition,
      show: true
    });
  }, [screenToFlowPosition]);

  const generateUniqueId = (prefix, items) => {
    // Find the highest existing ID and add 1
    const maxId = items.reduce((max, item) => {
      const numId = parseInt(item.id.replace(prefix, ''));
      return numId > max ? numId : max;
    }, 0);
    return `${prefix}${maxId + 1}`;
  };

  const onCreateNode = useCallback((nodeType) => {
    const newNode = {
      id: generateUniqueId('node_', nodes),
      position: contextMenu.flowPosition,
      type: nodeType,
      selected: false,
      data: {
        ...defaultNodeData[nodeType],
        bypass: false,
        isOutput: false,
        isMultiSelected: false,
        onToggleBypass: handleToggleBypass,
        onToggleOutput: handleToggleOutput,
      },
    };
    // Preserve existing nodes and add new one
    setNodes(nds => [...nds, newNode]);
    setContextMenu(null);
    
    // Schedule computation after node creation
    setTimeout(() => computeGraphOnce(), 0);
  }, [nodes, contextMenu, setNodes, handleToggleBypass, handleToggleOutput, computeGraphOnce]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle node deletion and its edges
  const handleNodesDelete = useCallback((nodesToDelete) => {
    // Get IDs of nodes being deleted
    const deletedNodeIds = nodesToDelete.map(node => node.id);

    // First, update edges in a single operation
    const newEdges = edges.filter(edge => {
      const sourceDeleted = deletedNodeIds.includes(edge.source);
      const targetDeleted = deletedNodeIds.includes(edge.target);
      const shouldKeep = !sourceDeleted && !targetDeleted;
      return shouldKeep;
    });
    
    // Then, update nodes in a single operation
    const newNodes = nodes.filter(node => !deletedNodeIds.includes(node.id));
    
    // Update both states
    setEdges(newEdges);
    setNodes(newNodes);
    
    // Clear selection if deleted node was selected
    if (deletedNodeIds.some(id => nodes.find(n => n.id === id)?.selected)) {
      onNodeSelect(null);
    }

    // Trigger recomputation after deletion
    setTimeout(() => computeGraphOnce(), 0);
  }, [setEdges, setNodes, nodes, edges, onNodeSelect, computeGraphOnce]);

  const onEdgeClick = useCallback((event, clickedEdge) => {
    event.preventDefault();
    
    if (!event.shiftKey) {
      // Single selection mode
      setEdges((eds) => 
        eds.map((edge) => ({
          ...edge,
          selected: edge.id === clickedEdge.id,
          data: {
            ...edge.data,
            isMultiSelected: false
          }
        }))
      );
      // Clear node selection
      setNodes(nds => nds.map(node => ({
        ...node,
        selected: false,
        data: {
          ...node.data,
          isMultiSelected: false
        }
      })));
      onNodeSelect({
        ...clickedEdge,
        type: 'edge',
        sourceNode: nodes.find(n => n.id === clickedEdge.source),
        targetNode: nodes.find(n => n.id === clickedEdge.target)
      });
    } else {
      // Shift-click mode for edges
      setEdges((eds) => {
        const currentSelected = eds.filter(e => e.selected);
        
        let updatedEdges;
        if (clickedEdge.selected) {
          updatedEdges = eds.map(edge => ({
            ...edge,
            selected: edge.id !== clickedEdge.id && edge.selected,
            data: {
              ...edge.data,
              isMultiSelected: edge.id !== clickedEdge.id && edge.selected && currentSelected.length > 2
            }
          }));
        } else {
          updatedEdges = eds.map(edge => ({
            ...edge,
            selected: edge.id === clickedEdge.id ? true : edge.selected,
            data: {
              ...edge.data,
              isMultiSelected: (edge.id === clickedEdge.id || edge.selected) && (currentSelected.length > 0)
            }
          }));
        }
        
        // Update selection in attribute editor
        const selectedEdges = updatedEdges.filter(e => e.selected);
        if (selectedEdges.length === 1) {
          const edge = selectedEdges[0];
          onNodeSelect({
            ...edge,
            type: 'edge',
            sourceNode: nodes.find(n => n.id === edge.source),
            targetNode: nodes.find(n => n.id === edge.target)
          });
        } else {
          onNodeSelect(null);
        }
        
        return updatedEdges;
      });
    }
  }, [setEdges, setNodes, nodes, onNodeSelect]);

  // Update nodes with outputNodeId
  const nodesWithOutputId = useMemo(() => {
    if (!nodes) return [];
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        outputNodeId,
      }
    }));
  }, [nodes, outputNodeId]);

  const handlePaneClick = useCallback((event) => {
    // Prevent event bubbling
    event.stopPropagation();
    
    // Clear node selection
    onNodeSelect(null);
    
    // Clear node selections in a single update
    setNodes(nds => 
      nds.map(node => ({
        ...node,
        selected: false,
        data: {
          ...node.data,
          isMultiSelected: false
        }
      }))
    );

    // Close context menu if it's open
    if (contextMenu?.show) {
      setContextMenu(null);
    }
  }, [onNodeSelect, setNodes, contextMenu, setContextMenu]);

  // Add safety check for nodes and edges
  if (!nodes || !edges) {
    return null;
  }

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
        nodes={nodesWithOutputId || []}
        edges={edges || []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        onNodeContextMenu={onContextMenu}
        onPaneContextMenu={onContextMenu}
        fitView
        onPaneClick={handlePaneClick}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
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