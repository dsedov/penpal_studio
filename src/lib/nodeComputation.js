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
  if (node.data.bypass) {
    // If node is bypassed, pass through the first input
    // Get the first connected input
    const nodeInputs = getInputNodes(node, nodes, edges);
    if (nodeInputs.length === 0) return null;
    
    const firstInputId = nodeInputs[0].inputId;
    const firstInput = inputData[firstInputId];
    return firstInput || null;
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
const COMPUTE_THROTTLE = 100; // ms

// Main function to compute the entire graph
export const computeGraph = async (nodes, edges) => {
  // Throttle computations
  const now = Date.now();
  if (now - lastComputeTime < COMPUTE_THROTTLE) {
    return computationCache;
  }
  lastComputeTime = now;

  const outputNode = nodes.find(node => node.data.isOutput);
  if (!outputNode) {
    computationCache = new Map();
    return computationCache;
  }

  const computationOrder = getComputationOrder(outputNode, nodes, edges);
  const results = new Map();

  for (const node of computationOrder) {
    const inputNodes = getInputNodes(node, nodes, edges);
    const inputData = {};

    inputNodes.forEach(({ inputId, node: inputNode }) => {
      inputData[inputId] = results.get(inputNode.id);
    });

    const output = await computeNodeOutput(node, inputData, nodes, edges);
    results.set(node.id, output);
  }

  computationCache = results;
  return results;
};

// Add a cleanup function
export const clearComputationCache = () => {
  computationCache = new Map();
  lastComputeTime = 0;
}; 