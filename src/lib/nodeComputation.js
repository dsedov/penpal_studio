// Helper to get all input nodes for a given node
export const getInputNodes = (node, nodes, edges) => {
  const inputEdges = edges.filter(edge => edge.target === node.id);
  return inputEdges.map(edge => ({
    inputId: edge.targetHandle,
    node: nodes.find(n => n.id === edge.source)
  }));
};

// Traverse the DAG and return nodes in computation order
export const getComputationOrder = (outputNode, nodes, edges) => {
  const visited = new Set();
  const order = [];

  const visit = (node) => {
    if (visited.has(node.id)) return;
    
    // First visit all input nodes
    const inputNodes = getInputNodes(node, nodes, edges);
    inputNodes.forEach(({ node: inputNode }) => {
      visit(inputNode);
    });

    visited.add(node.id);
    order.push(node);
  };

  visit(outputNode);
  return order;
};

// Main computation function
export const computeNodeOutput = async (node, inputData, nodes, edges) => {
  // If node is bypassed, return the first input
  if (node.data.bypass) {
    const nodeInputs = getInputNodes(node, nodes, edges);
    if (nodeInputs.length > 0) {
      const firstInputId = nodeInputs[0].inputId || 'input';
      return inputData[firstInputId];
    }
    return null;
  }

  // Get the compute function for this node type
  const computeFn = node.data.compute;
  if (!computeFn) {
    console.warn(`No compute function found for node ${node.id}`);
    return null;
  }

  try {
    return await computeFn(inputData, node.data.properties);
  } catch (error) {
    console.error(`Error computing node ${node.id}:`, error);
    return null;
  }
};

// Cache for computation results
let computationCache = new Map();
let lastComputeTime = 0;
const COMPUTE_THROTTLE = 50; // Reduce throttle time for better responsiveness

// Main function to compute the entire graph
export const computeGraph = async (nodes, edges) => {
  const results = new Map();
  const visited = new Set();

  const computeNodeOutput = async (nodeId) => {
    if (visited.has(nodeId)) return results.get(nodeId);
    visited.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    try {
      // Handle bypass first
      if (node.data.bypass) {
        const inputEdges = edges.filter(edge => edge.target === nodeId);
        if (inputEdges.length > 0) {
          const firstInputResult = await computeNodeOutput(inputEdges[0].source);
          return firstInputResult;
        }
        return { result: null, error: null };
      }

      // Get input data
      const inputData = {};
      const inputEdges = edges.filter(edge => edge.target === nodeId);

      // Process each input edge
      for (const edge of inputEdges) {
        const sourceResult = await computeNodeOutput(edge.source);
        if (sourceResult?.error) {
          return { error: `Input error: ${sourceResult.error}` };
        }
        if (edge.targetHandle) {
          inputData[edge.targetHandle] = sourceResult?.result;
        } else {
          inputData.default = sourceResult?.result;
        }
      }

      // Compute result
      const result = await node.data.compute(inputData, node.data.properties);
      return { result, error: null };
    } catch (error) {
      console.log(`Error in node ${nodeId}:`, error.message);
      return { error: error.message };
    }
  };

  // Compute for all nodes
  for (const node of nodes) {
    results.set(node.id, await computeNodeOutput(node.id));
  }

  return results;
};

// Add a cleanup function
export const clearComputationCache = () => {
  computationCache = new Map();
  lastComputeTime = 0;
};

async function computeNode(node, nodeInputs, computedNodes) {
  // ... existing compute node logic ...

  if (node.type === 'loop') {
    let currentCanvas = nodeInputs['initial-input']?.canvas;
    if (!currentCanvas) return null;

    const iterations = node.data.properties.iterations.value;
    
    // Store the initial canvas for the loop network
    computedNodes[node.id] = {
      canvas: currentCanvas.clone(),
      outputs: {
        'loop-out': currentCanvas.clone(),
        'final-output': null
      }
    };

    // Perform the iterations
    for (let i = 0; i < iterations; i++) {
      // The loop-out handle provides the current canvas to the loop network
      computedNodes[node.id].outputs['loop-out'] = currentCanvas.clone();
      
      // Wait for the loop network to process (loop-in will be updated by connected nodes)
      const loopResult = nodeInputs['loop-in']?.canvas;
      
      if (loopResult) {
        currentCanvas = loopResult.clone();
      }
    }

    // Set the final output
    computedNodes[node.id].outputs['final-output'] = currentCanvas;
    return computedNodes[node.id];
  }

  // ... rest of the compute node logic ...
} 