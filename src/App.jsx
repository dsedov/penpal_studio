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

const MenuBar = () => {
  const [isFileOpen, setIsFileOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleExit = async () => {
    try {
    await invoke('log_message', { message: "Exit clicked" });
    await invoke('quit_app');
    setIsFileOpen(false); // Close the menu
    // We'll add the actual exit functionality once we confirm this works
    } catch (e) {
      console.error(e);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsFileOpen(false);
      setIsEditOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex bg-gray-100 border-b border-gray-200">
      <div className="relative">
        <button 
          className="px-4 py-1 text-sm hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation(); // Prevent immediate closing
            setIsFileOpen(!isFileOpen);
            setIsEditOpen(false);
          }}
        >
          File
        </button>
        {isFileOpen && (
          <div 
            className="absolute left-0 top-full bg-white shadow-lg border border-gray-200 z-50"
            onClick={(e) => e.stopPropagation()} // Prevent menu from closing when clicking inside
          >
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('New clicked');
                setIsFileOpen(false);
              }}
            >
              New
            </button>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Open clicked');
                setIsFileOpen(false);
              }}
            >
              Open
            </button>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Save clicked');
                setIsFileOpen(false);
              }}
            >
              Save
            </button>
            <div className="border-t border-gray-200"></div>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={handleExit}
            >
              Exit
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <button 
          className="px-2 py-1 text-sm hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditOpen(!isEditOpen);
            setIsFileOpen(false);
          }}
        >
          Edit
        </button>
        {isEditOpen && (
          <div 
            className="absolute left-0 top-full bg-white shadow-lg border border-gray-200 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Undo clicked');
                setIsEditOpen(false);
              }}
            >
              Undo
            </button>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Redo clicked');
                setIsEditOpen(false);
              }}
            >
              Redo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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