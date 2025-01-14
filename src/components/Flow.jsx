import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useKeyPress
} from 'reactflow';
import { nodeTypes, defaultNodeData } from './nodes/nodeTypes';
import ContextMenu from './ContextMenu';
import 'reactflow/dist/style.css';
import { computeGraph } from '../lib/nodeComputation';

const QuickAdd = ({ searchTerm, options, selectedIndex, onSelect, onSearchChange }) => {
  return (
    <div 
      className="bg-white rounded shadow-lg"
      style={{ 
        width: 'auto',
        minWidth: '150px'
      }}
    >
      <input
        autoFocus
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Tab') e.preventDefault();
        }}
        className="w-full p-2 outline-none border-b text-sm"
        placeholder="Search nodes..."
        size={15}
      />
      {options.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={option.type}
              className={`px-2 py-1 cursor-pointer text-sm whitespace-nowrap ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  liveUpdate = true,
}) => {
  const reactFlowWrapper = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { screenToFlowPosition, fitView, getNode, getViewport } = useReactFlow();
  const [quickAdd, setQuickAdd] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const upPressed = useKeyPress('ArrowUp');
  const downPressed = useKeyPress('ArrowDown');
  const enterPressed = useKeyPress('Enter');

  // Define computeGraphOnce first
  const computeGraphOnce = useCallback(async (force = false) => {
    if (!liveUpdate && !force) return; // Skip computation if not live updating
    const result = await computeGraph(nodes, edges);
    onComputeResults(result);
  }, [nodes, edges, onComputeResults, liveUpdate]);

  // Add computation effect with proper dependencies
  useEffect(() => {
    if (liveUpdate) {
      computeGraphOnce();
    }
  }, [nodes, edges, liveUpdate]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    // Force recomputation on edge changes regardless of live update setting
    setTimeout(() => computeGraphOnce(true), 0);
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
    const targetNode = nodes.find(node => node.id === params.target);
    const sourceNode = nodes.find(node => node.id === params.source);
    
    if (!targetNode || !sourceNode) return;

    const isMergeNode = targetNode.type === 'merge';
    
    const newEdge = {
      ...params,
      id: generateUniqueId('edge_', edges),
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: params.sourceHandle || 'default',
      targetHandle: params.targetHandle || 'default',
      animated: true,
      style: { stroke: '#999', strokeWidth: 2 }
    };

    setEdges(eds => {
      let updatedEdges;
      if (isMergeNode) {
        updatedEdges = [...eds, newEdge];
      } else {
        updatedEdges = [
          ...eds.filter(edge => 
            !(edge.target === targetNode.id && 
              edge.targetHandle === (params.targetHandle || 'default'))
          ),
          newEdge
        ];
      }
      return updatedEdges;
    });

    // Force computation after edge update
    requestAnimationFrame(() => {
      computeGraphOnce(true);
    });
  }, [nodes, edges, setEdges, computeGraphOnce]);

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
    // Force recomputation when bypass is toggled
    setTimeout(() => computeGraphOnce(true), 0);
  }, [setNodes, computeGraphOnce]);

  const handleToggleOutput = useCallback((nodeId) => {
    onOutputToggle(nodeId);
    
    setNodes(nds => {
      const updatedNodes = nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          isOutput: node.id === nodeId
        }
      }));
      
      // Force computation when output node changes
      Promise.resolve().then(() => {
        computeGraphOnce(true);
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
    
    // Force computation when new node is created
    setTimeout(() => computeGraphOnce(true), 0);
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

    // Force recomputation after deletion
    setTimeout(() => computeGraphOnce(true), 0);
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
          },
          // Add these style properties for visual feedback
          style: {
            ...edge.style,
            strokeWidth: edge.id === clickedEdge.id ? 4 : 2,
            stroke: edge.id === clickedEdge.id ? '#ff0072' : '#999'
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
            },
            // Add style for multi-select
            style: {
              ...edge.style,
              strokeWidth: (edge.id !== clickedEdge.id && edge.selected) ? 4 : 2,
              stroke: (edge.id !== clickedEdge.id && edge.selected) ? '#ff0072' : '#999'
            }
          }));
        } else {
          updatedEdges = eds.map(edge => ({
            ...edge,
            selected: edge.id === clickedEdge.id ? true : edge.selected,
            data: {
              ...edge.data,
              isMultiSelected: (edge.id === clickedEdge.id || edge.selected) && (currentSelected.length > 0)
            },
            // Add style for multi-select
            style: {
              ...edge.style,
              strokeWidth: (edge.id === clickedEdge.id || edge.selected) ? 4 : 2,
              stroke: (edge.id === clickedEdge.id || edge.selected) ? '#ff0072' : '#999'
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

    // Clear edge selections
    setEdges(eds =>
      eds.map(edge => ({
        ...edge,
        selected: false,
        data: {
          ...edge.data,
          isMultiSelected: false
        },
        style: {
          ...edge.style,
          strokeWidth: 2,
          stroke: '#999'
        }
      }))
    );

    // Close context menu if it's open
    if (contextMenu?.show) {
      setContextMenu(null);
    }
  }, [onNodeSelect, setNodes, setEdges, contextMenu, setContextMenu]);

  // Add safety check for nodes and edges
  if (!nodes || !edges) {
    return null;
  }

  // Add this function to get available node options
  const getNodeOptions = useCallback(() => {
    const searchLower = searchTerm.toLowerCase();
    return Object.entries(defaultNodeData)
      .filter(([type, data]) => {
        const matchLabel = data.label.toLowerCase().includes(searchLower);
        const matchDescription = data.menu.description.toLowerCase().includes(searchLower);
        return matchLabel || matchDescription;
      })
      .map(([type, data]) => ({
        type,
        label: data.label,
        description: data.menu.description
      }));
  }, [searchTerm]);

  // Add handler for quick add selection
  const handleQuickAddSelect = useCallback((option) => {
    const selectedNode = [...nodes].reverse().find(n => n.selected);
    const viewport = getViewport();
    
    let position;
    if (selectedNode) {
      position = {
        x: selectedNode.position.x,
        y: selectedNode.position.y + 100
      };
    } else {
      const flowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const centerX = flowBounds.width / 2;
      const centerY = flowBounds.height / 2;
      
      position = {
        x: (centerX - viewport.x) / viewport.zoom,
        y: (centerY - viewport.y) / viewport.zoom
      };
    }
    
    const newNodeId = generateUniqueId('node_', nodes);
    const newNode = {
      id: newNodeId,
      position,
      type: option.type,
      selected: false,
      data: {
        ...defaultNodeData[option.type],
        bypass: false,
        isOutput: false,
        isMultiSelected: false,
        onToggleBypass: handleToggleBypass,
        onToggleOutput: handleToggleOutput,
      },
    };

    // Add the node
    setNodes(nds => [...nds, newNode]);

    // If there's a selected node, create the connection
    if (selectedNode) {
      // Create connection params
      const params = {
        source: selectedNode.id,
        target: newNodeId,
        sourceHandle: 'default',
        targetHandle: 'default'
      };

      // Use onConnect directly after a small delay to ensure node is added
      requestAnimationFrame(() => {
        onConnect(params);
      });
    }

    // Reset quick add state
    setQuickAdd(null);
    setSearchTerm('');
    setSelectedIndex(0);
  }, [
    nodes,
    setNodes,
    handleToggleBypass,
    handleToggleOutput,
    getViewport,
    onConnect
  ]);

  // Add effect for keyboard navigation
  useEffect(() => {
    if (!quickAdd) return;

    const handleKeyDown = (event) => {
      const options = getNodeOptions();
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => Math.min(options.length - 1, prev + 1));
          break;
        
        case 'Enter':
          event.preventDefault();
          if (options.length > 0) {
            handleQuickAddSelect(options[selectedIndex]);
          }
          break;
        
        case 'Escape':
          event.preventDefault();
          setQuickAdd(null);
          setSearchTerm('');
          setSelectedIndex(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickAdd, getNodeOptions, selectedIndex, handleQuickAddSelect]);

  // Add this effect to handle Tab key
  useEffect(() => {
    const handleTabKey = (event) => {
      if (event.key === 'Tab' && !quickAdd) {
        event.preventDefault();
        setQuickAdd({ position: {} }); // We don't need position anymore
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [quickAdd]);

  return (
    <div 
      className="reactflow-wrapper bg-gray-100" 
      ref={reactFlowWrapper} 
      style={{ 
        width: '100%',
        height: '100%',
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
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onNodeContextMenu={onContextMenu}
        onPaneContextMenu={onContextMenu}
        onPaneClick={handlePaneClick}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        minZoom={0.1}
        maxZoom={4}
        edgesFocusable={true}
        selectNodesOnDrag={false}
      >
        <Background />
        <MiniMap />
      </ReactFlow>
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 5  // Ensure it's above ReactFlow but below other UI elements
        }}
      >
        <div className="flex justify-center">
          {quickAdd && (
            <div 
              className="pointer-events-auto"
              style={{ 
                marginTop: '20px',
                zIndex: 1000  // Ensure the QuickAdd is above everything
              }}
            >
              <QuickAdd
                searchTerm={searchTerm}
                options={getNodeOptions()}
                selectedIndex={selectedIndex}
                onSelect={handleQuickAddSelect}
                onSearchChange={setSearchTerm}
              />
            </div>
          )}
        </div>
      </div>
      <ContextMenu
        position={contextMenu}
        onCreateNode={onCreateNode}
        onClose={() => setContextMenu(null)}
      />
    </div>
  );
};

export default Flow;