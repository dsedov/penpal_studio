import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';

export const saveProjectToFile = async (state) => {
  try {
    const filePath = await save({
      filters: [{
        name: 'PenPal Project',
        extensions: ['penpal']
      }]
    });

    if (!filePath) return;

    const projectData = {
      version: '1.0',
      nodes: state.nodes.map(node => ({
        ...node,
        // Ensure we only save serializable data
        data: {
          ...node.data,
          onToggleBypass: undefined,
          onToggleOutput: undefined
        }
      })),
      edges: state.edges,
      viewport: {
        x: state.canvasViewport.x,
        y: state.canvasViewport.y,
        zoom: state.canvasViewport.zoom
      },
      canvasSettings: {
        mode: state.canvasMode,
        showPoints: state.showPoints,
        liveUpdate: state.liveUpdate
      }
    };

    await writeTextFile(filePath, JSON.stringify(projectData, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save project:', error);
    return false;
  }
};

export const loadProjectFromFile = async () => {
  try {
    const filePath = await open({
      filters: [{
        name: 'PenPal Project',
        extensions: ['penpal']
      }]
    });

    if (!filePath) return null;

    const fileContent = await readTextFile(filePath);
    const projectData = JSON.parse(fileContent);

    // Validate version and data structure
    if (!projectData.version || !projectData.nodes || !projectData.edges) {
      throw new Error('Invalid project file format');
    }

    return projectData;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}; 