import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactFlow, { 
  Background,
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import ContextMenu from './ContextMenu';

function Flow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1' },
      type: 'default'
    },
    {
      id: '2',
      position: { x: 300, y: 100 },
      data: { label: 'Node 2' },
      type: 'default'
    }
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      animated: true
    }
  ]);

  const [contextMenu, setContextMenu] = useState(null);
  const { project } = useReactFlow();

  const onContextMenu = useCallback((event) => {
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
      data: { label: nodeType },
      type: 'default'
    };
    
    setNodes([...nodes, newNode]);
    setContextMenu(null);
  }, [nodes, contextMenu, setNodes]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={reactFlowWrapper} className="flex-1 bg-gray-100 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onContextMenu={onContextMenu}
        defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
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
}

export default Flow;