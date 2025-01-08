import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import MenuBar from './components/MenuBar';
import Flow from './components/Flow';

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