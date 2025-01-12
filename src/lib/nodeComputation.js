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
          // Get the first input's result
          const firstInputResult = await computeNodeOutput(inputEdges[0].source);
          return firstInputResult; // Pass through the input result directly
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
          // If input has error, propagate it
          console.log(`Error propagated from input ${edge.source}:`, sourceResult.error);
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