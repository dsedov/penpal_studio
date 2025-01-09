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

const Flow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const { project } = useReactFlow();

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
  }, [setNodes]);

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
    console.log('Creating node:', nodeType, defaultNodeData[nodeType]);
    const newNode = {
      id: `${nodes.length + 1}`,
      position: contextMenu.flowPosition,
      type: nodeType,
      data: {
        ...defaultNodeData[nodeType],
        bypass: false,
        isOutput: false,
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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onContextMenu={onContextMenu}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
        className="reactflow-container"
        panOnDrag={[0]}
        panOnScroll={false}
        zoomOnScroll={true}
        preventScrolling={true}
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