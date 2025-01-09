import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import MenuBar from './components/MenuBar';
import Flow from './components/Flow';
import P5Canvas from './components/P5Canvas';

const NodeProperties = () => {
  return (
    <div className="w-full h-full bg-green-100 p-4">
      <div className="bg-green-200 w-full h-full rounded">
        Node Properties Area
      </div>
    </div>
  );
};

function App() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="h-screen w-screen flex flex-col">
      <MenuBar />
      <div className="flex-1" style={{ height: 'calc(100vh - 48px)' }}>
        <Allotment>
          {/* Left panel - P5.js Canvas */}
          <Allotment.Pane minSize={200}>
            <P5Canvas />
          </Allotment.Pane>

          {/* Right panel - split vertically */}
          <Allotment.Pane minSize={200}>
            <Allotment vertical>
              {/* Top right - Node Properties */}
              <Allotment.Pane minSize={100}>
                <NodeProperties selectedNode={selectedNode} />
              </Allotment.Pane>

              {/* Bottom right - ReactFlow */}
              <Allotment.Pane minSize={100}>
                <div style={{ width: '100%', height: '100%' }}>
                  <ReactFlowProvider>
                    <Flow />
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