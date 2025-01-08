import React, { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from "@tauri-apps/api/core";
import ReactFlow, { 
  Background,
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import MenuBar from './components/MenuBar';


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
  const { project, getViewport } = useReactFlow();

  const onContextMenu = useCallback((event) => {
    event.preventDefault();
    
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const mousePosition = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };
    
    // Convert mouse position to flow position considering zoom and pan
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
      
      {contextMenu?.show && (
        <div 
          className="fixed bg-white shadow-lg border border-gray-200 rounded z-50"
          style={{
            left: contextMenu.mouseX,
            top: contextMenu.mouseY,
          }}
        >
          <button 
            className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
            onClick={() => onCreateNode('Node A')}
          >
            Node A
          </button>
          <button 
            className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
            onClick={() => onCreateNode('Node B')}
          >
            Node B
          </button>
          <button 
            className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
            onClick={() => onCreateNode('Node C')}
          >
            Node C
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="h-screen flex flex-col">
      <MenuBar />
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

export default App;