// components/AttributeEditor.jsx
import React, { useState } from 'react';
import { NumericInput } from './inputs/NumericInput';
import { Vec2Input } from './inputs/Vec2Input';
import { ColorInput } from './inputs/ColorInput';
import { StringInput } from './inputs/StringInput';
import { CodeInput } from './inputs/CodeInput';

const AttributeEditor = ({ selectedNode, onPropertyChange, computedData }) => {
  // Add local tab state
  const [activeTab, setActiveTab] = useState('properties');

  if (!selectedNode) {
    return (
      <div className="w-full h-full bg-gray-100 p-4">
        <div className="bg-gray-50 w-full h-full rounded p-4 text-gray-500">
          Select a node or edge to edit its properties
        </div>
      </div>
    );
  }

  const isEdge = selectedNode.type === 'edge';

  const properties = selectedNode.data.properties || {};

  const handlePropertyChange = (propertyName, value) => {
    onPropertyChange(selectedNode.id, propertyName, value);
  };

  const renderPropertyInput = (propertyName, property) => {
    if (property.type === 'internal') return null;

    const commonProps = {
      value: property.value,
      onChange: (value) => handlePropertyChange(propertyName, value),
      min: property.min,
      max: property.max,
      label: property.label != null ? property.label : propertyName
    };

    switch (property.type) {
      case 'float':
        return <NumericInput {...commonProps} step={0.1} />;
      case 'int':
        return <NumericInput {...commonProps} step={1} />;
      case 'vec2':
        return <Vec2Input {...commonProps} />;
      case 'color':
        return <ColorInput {...commonProps} />;
      case 'string':
        return <StringInput {...commonProps} />;
      case 'code':
        return (
          <CodeInput
            {...commonProps}
            language={property.language || 'javascript'}
          />
        );
      case 'file':
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-grow px-2 py-1 border rounded"
              value={property.value}
              readOnly
              placeholder="Click to select file..."
            />
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={async () => {
                const { remote } = window.require('electron');
                const { dialog } = remote;
                const result = await dialog.showSaveDialog({
                  filters: [
                    { name: 'SVG', extensions: ['svg'] }
                  ]
                });
                if (!result.canceled) {
                  handlePropertyChange(propertyName, result.filePath);
                }
              }}
            >
              Browse
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 p-4 overflow-y-auto">
      <div className="bg-white rounded shadow p-4">
        {/* Debug info */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm font-mono">
          {isEdge ? (
            <>
              <div>Edge ID: {selectedNode.id}</div>
              <div>From: {selectedNode.sourceNode?.data?.label} (ID: {selectedNode.source})</div>
              <div>To: {selectedNode.targetNode?.data?.label} (ID: {selectedNode.target})</div>
            </>
          ) : (
            <>
              <div>Node ID: {selectedNode.id}</div>
              <div>Type: {selectedNode.type}</div>
            </>
          )}
        </div>

        {/* Show tabs only for nodes, not edges */}
        {!isEdge && (
          <div className="flex mb-4 space-x-2">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-3 py-1 rounded ${
                activeTab === 'properties' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded ${
                activeTab === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('computed')}
              className={`px-3 py-1 rounded ${
                activeTab === 'computed' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Computed
            </button>
          </div>
        )}

        {/* Show error message if present */}
        {(computedData?.error || computedData?.result?.error) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold mb-1">Computation Error</h3>
            <p>{computedData.error || computedData.result.error}</p>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'properties' ? (
          <>
            <h2 className="text-lg font-semibold mb-4">
              {selectedNode.data.label} Properties
            </h2>
            <div className="space-y-4">
              {Object.entries(properties).map(([name, prop]) => (
                <div key={name} className="property-input">
                  {renderPropertyInput(name, prop)}
                </div>
              ))}
            </div>
          </>
        ) : activeTab === 'code' ? (
          /* Code tab: read-only display of the node's data */
          <CodeInput
            value={JSON.stringify(selectedNode.data, null, 2)}
            onChange={() => {}}
            language="json"
            readOnly
          />
        ) : (
          /* Computed tab: show computation results */
          <div>
            <h2 className="text-lg font-semibold mb-4">Computed Data</h2>
            {computedData && !computedData.result?.error ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Canvas Properties</h3>
                  <CodeInput
                    value={JSON.stringify({
                      size: computedData.result?.result?.size,
                      backgroundColor: computedData.result?.result?.backgroundColor
                    }, null, 2)}
                    onChange={() => {}}
                    language="json"
                    readOnly
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Points ({computedData.result?.result?.points?.length || 0})</h3>
                  <CodeInput
                    value={JSON.stringify(computedData.result?.result?.points, null, 2)}
                    onChange={() => {}}
                    language="json"
                    readOnly
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Lines ({computedData.result?.result?.lines?.length || 0})</h3>
                  <CodeInput
                    value={JSON.stringify(computedData.result?.result?.lines, null, 2)}
                    onChange={() => {}}
                    language="json"
                    readOnly
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                No computed data available for this node
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeEditor;