// components/AttributeEditor.jsx
import React, { useState } from 'react';
import { NumericInput } from './inputs/NumericInput';
import { Vec2Input } from './inputs/Vec2Input';
import { ColorInput } from './inputs/ColorInput';
import { StringInput } from './inputs/StringInput';
import { CodeInput } from './inputs/CodeInput';

const AttributeEditor = ({ selectedNode, onPropertyChange }) => {
  // Add local tab state
  const [activeTab, setActiveTab] = useState('properties');

  if (!selectedNode) {
    return (
      <div className="w-full h-full bg-gray-100 p-4">
        <div className="bg-gray-50 w-full h-full rounded p-4 text-gray-500">
          Select a node to edit its properties
        </div>
      </div>
    );
  }

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
      label: propertyName
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
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 p-4 overflow-y-auto">
      <div className="bg-white rounded shadow p-4">

        {/* Simple tab buttons */}
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
        </div>

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
        ) : (
          /* Code tab: read-only display of the node's data */
          <CodeInput
            value={JSON.stringify(selectedNode.data, null, 2)}
            onChange={() => {}}
            language="json"
            readOnly
          />
        )}
      </div>
    </div>
  );
};

export default AttributeEditor;