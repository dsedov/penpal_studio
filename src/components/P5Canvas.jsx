import React, { useEffect, useRef, useState } from 'react';
import Sketch from 'react-p5';
import ToolbarButton from './ToolbarButton';
import { BiMove } from 'react-icons/bi';
import { BsCursor } from 'react-icons/bs';
import { TbRefresh } from 'react-icons/tb';
import { BsCircle } from 'react-icons/bs';
import { BsPencil } from 'react-icons/bs';
import { BsVectorPen } from 'react-icons/bs';
import { BsArrowsMove } from 'react-icons/bs';
import { BsPlus } from 'react-icons/bs';
import { ModificationType } from './nodes/EditNode';
import { BsGrid3X3Gap } from 'react-icons/bs';

const P5Canvas = ({ 
  computedData, 
  viewport = { x: 0, y: 0, zoom: 1 },
  onViewportChange = () => {},
  mode = 'pan',
  onModeChange = () => {},
  showPoints = true,
  onShowPointsChange = () => {},
  liveUpdate = true,
  onLiveUpdateToggle = () => {},
  editMode = false,
  onPointMove = null,
  onPointEdit = null,
  selectedNodeId = null,
  showEditButton = false,
  editType = 'move',
  onEditTypeChange = () => {},
  onLineEdit = null,
  selectedLine = null,
  onLineSelect = null
}) => {
  const containerRef = useRef(null);
  const viewportRef = useRef(viewport);
  const isMouseOver = useRef(false);
  const p5Ref = useRef(null);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const [draggedPoint, setDraggedPoint] = useState(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const [lineEditMode, setLineEditMode] = useState(false);
  const [currentMode, setCurrentMode] = useState('pan');
  const [currentEditType, setCurrentEditType] = useState('move');
  const [currentLine, setCurrentLine] = useState([]);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [creatingPoint, setCreatingPoint] = useState(null);
  const [gridSnap, setGridSnap] = useState(0);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);

  const isEditMode = currentMode === 'edit';

  const gridSnapOptions = [
    { value: 0, label: 'None' },
    { value: 0.1, label: '0.1mm' },
    { value: 1.0, label: '1.0mm' },
    { value: 5.0, label: '5.0mm' },
    { value: 10.0, label: '10.0mm' },
  ];

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const setup = (p5, canvasParentRef) => {
    if (!containerRef.current) return;
    p5Ref.current = p5;
    
    const initialWidth = containerRef.current.clientWidth;
    const initialHeight = containerRef.current.clientHeight;
    
    const canvas = p5.createCanvas(initialWidth, initialHeight).parent(canvasParentRef);
    
    canvas.style('width', '100%');
    canvas.style('height', '100%');
    updateCursor(p5);
  };

  const updateCursor = (p5) => {
    if (!p5?.canvas) return;
    
    if (isEditMode) {
      if (draggedPoint) {
        p5.canvas.style.cursor = 'grabbing';
      } else if (selectedPointIndex !== null) {
        p5.canvas.style.cursor = 'grab';
      } else {
        p5.canvas.style.cursor = 'pointer';
      }
    } else if (currentMode === 'pan') {
      p5.canvas.style.cursor = isPanning.current ? 'grabbing' : 'grab';
    } else {
      p5.canvas.style.cursor = 'default';
    }
  };

  const parseColor = (p5, color) => {
    try {
      if (!color) return p5.color(0);  // Default to black
      if (typeof color === 'string') {
        return p5.color(color);
      }
      if (typeof color === 'number') {
        return p5.color(color);
      }
      // Handle RGB object format
      if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
        return p5.color(color.r, color.g, color.b);
      }
      return p5.color(0);  // Fallback to black
    } catch (e) {
      console.warn('Invalid color:', color);
      return p5.color(0);
    }
  };

  const drawDashedLine = (p5, x1, y1, x2, y2, dashLength = 5) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dashCount = Math.floor(distance / dashLength);
    const dashX = dx / dashCount;
    const dashY = dy / dashCount;

    p5.push();
    for (let i = 0; i < dashCount; i += 2) {
      const startX = x1 + (dashX * i);
      const startY = y1 + (dashY * i);
      const endX = x1 + (dashX * (i + 1));
      const endY = y1 + (dashY * (i + 1));
      p5.line(startX, startY, endX, endY);
    }
    p5.pop();
  };

  const drawCanvas = (p5, viewport, topLeft, bottomRight) => {
    if (!computedData?.result?.result) return;
    const canvas = computedData.result.result;

    // Set background color if provided
    if (canvas.backgroundColor) {
      p5.push();
      p5.fill(parseColor(p5, canvas.backgroundColor));
      p5.stroke(100);
      p5.strokeWeight(1 / viewport.zoom);
      // Draw rectangle representing the canvas
      p5.rect(0, 0, canvas.size.x, canvas.size.y);
      p5.pop();
    }

    // Draw points
    if (showPoints && canvas.points && canvas.points.length > 0) {
      p5.push();
      p5.noStroke();
      p5.fill(255);

      canvas.points.forEach(point => {
        p5.circle(point.x, point.y, 4 / viewport.zoom);
      });
      p5.pop();
    }

    // Draw lines
    if (canvas.lines && canvas.lines.length > 0) {
      p5.push();
      p5.noFill();

      canvas.lines.forEach((line, lineIndex) => {
        if (line.points.length > 1) {
          // Highlight selected line
          if (selectedLine === lineIndex) {
            p5.stroke(255, 165, 0); // Orange for selected line
            p5.strokeWeight((line.thickness + 2) / viewport.zoom);
          } else {
            p5.stroke(parseColor(p5, line.color));
            p5.strokeWeight((line.thickness || 2) / viewport.zoom);
          }

          // Draw line segments
          for (let i = 0; i < line.points.length - 1; i++) {
            const startPoint = canvas.points[line.points[i]];
            const endPoint = canvas.points[line.points[i + 1]];
            if (startPoint && endPoint) {
              p5.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
            }
          }
        }
      });
      p5.pop();
    }

    // Draw line preview
    if (isEditMode && currentEditType === 'line' && computedData?.result?.result?.points) {
      const points = computedData.result.result.points;
      
      p5.push();
      p5.stroke(255, 165, 0); // Orange for preview
      p5.strokeWeight(2 / viewport.zoom);

      // Draw current line
      if (currentLine.length > 0) {
        for (let i = 0; i < currentLine.length - 1; i++) {
          const startPoint = points[currentLine[i]];
          const endPoint = points[currentLine[i + 1]];
          if (startPoint && endPoint) {
            p5.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
          }
        }

        // Draw line to hovered point
        if (hoveredPointIndex !== -1) {
          const lastPoint = points[currentLine[currentLine.length - 1]];
          const hoverPoint = points[hoveredPointIndex];
          if (lastPoint && hoverPoint) {
            drawDashedLine(
              p5,
              lastPoint.x,
              lastPoint.y,
              hoverPoint.x,
              hoverPoint.y,
              10 / viewport.zoom
            );
          }
        }
      }

      // Highlight hoverable points
      points.forEach((point, index) => {
        if (!point) return;
        if (index === hoveredPointIndex) {
          p5.fill(255, 165, 0); // Orange for hovered point
          p5.noStroke();
          p5.circle(point.x, point.y, 8 / viewport.zoom);
        }
      });
      p5.pop();
    }

    // Draw point being created
    if (isEditMode && currentEditType === 'point' && creatingPoint) {
      p5.push();
      p5.stroke(255, 165, 0);
      p5.strokeWeight(2 / viewport.zoom);
      p5.fill(255, 165, 0, 200);
      p5.circle(
        creatingPoint.position.x,
        creatingPoint.position.y,
        8 / viewport.zoom
      );
      p5.pop();
    }
  };

  const mouseEntered = () => {
    isMouseOver.current = true;
  };

  const mouseLeft = () => {
    isMouseOver.current = false;
    isPanning.current = false;
  };

  const screenToWorld = (p5, screenX, screenY) => {
    return {
      x: (screenX - p5.width/2) / viewport.zoom - viewport.x,
      y: (screenY - p5.height/2) / viewport.zoom - viewport.y
    };
  };

  const worldToScreen = (p5, worldX, worldY) => {
    return {
      x: (worldX + viewport.x) * viewport.zoom + p5.width/2,
      y: (worldY + viewport.y) * viewport.zoom + p5.height/2
    };
  };

  const findPointUnderMouse = (p5, points) => {
    const worldPos = screenToWorld(p5, p5.mouseX, p5.mouseY);
    const dragRadius = 20 / viewport.zoom;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;

      const dx = point.x - worldPos.x;
      const dy = point.y - worldPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < dragRadius) {
        return i;
      }
    }
    return -1;
  };

  const mouseMoved = (p5) => {
    if (!isMouseOver.current || !isEditMode || currentEditType !== 'line') return;
    
    const points = computedData?.result?.result?.points || [];
    const pointIndex = findPointUnderMouse(p5, points);
    setHoveredPointIndex(pointIndex);
  };

  const snapToGrid = (value, snapSize) => {
    if (!snapSize) return value;
    return Math.round(value / snapSize) * snapSize;
  };

  const mousePressed = (p5) => {
    if (!isMouseOver.current) return;
    
    console.log('Mouse pressed:', { 
      isEditMode, 
      currentEditType, 
      currentMode 
    });

    if (isEditMode) {
      if (currentEditType === 'point') {
        const points = computedData?.result?.result?.points || [];
        const pointIndex = findPointUnderMouse(p5, points);
        const worldPos = screenToWorld(p5, p5.mouseX, p5.mouseY);
        
        // Snap the world position to grid
        const snappedPos = {
          x: snapToGrid(worldPos.x, gridSnap),
          y: snapToGrid(worldPos.y, gridSnap)
        };

        if (pointIndex !== -1) {
          // If we clicked on existing point, prepare to move it
          const point = points[pointIndex];
          setDraggedPoint({
            index: pointIndex,
            originalPos: { x: point.x, y: point.y }
          });
        } else {
          // Check if we're too close to any existing point
          const tooClose = points.some(point => {
            if (!point) return false;
            const dx = point.x - snappedPos.x;
            const dy = point.y - snappedPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < (20 / viewport.zoom); // Minimum distance between points
          });

          if (!tooClose) {
            // Start creating new point with snapped position
            setCreatingPoint({
              position: snappedPos,
              isDragging: false
            });
          }
        }
      } else if (currentEditType === 'move') {
        // Check if we have valid data before proceeding
        if (!computedData?.result?.result?.points) {
          console.log('No valid points data available');
          return;
        }
        
        const worldPos = screenToWorld(p5, p5.mouseX, p5.mouseY);
        const points = computedData.result.result.points;
        const dragRadius = 20 / viewport.zoom;

        let foundPoint = false;
        let closestDist = Infinity;
        let closestIndex = -1;

        // Find the closest point within radius
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          if (!point) continue;

          const dx = point.x - worldPos.x;
          const dy = point.y - worldPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < dragRadius && dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
            foundPoint = true;
          }
        }

        if (foundPoint) {
          const point = points[closestIndex];
          setSelectedPointIndex(closestIndex);
          setDraggedPoint({
            index: closestIndex,
            originalPos: { x: point.x, y: point.y }
          });
          isPanning.current = false;
        } else {
          setSelectedPointIndex(null);
        }
      } else if (currentEditType === 'line') {
        const points = computedData?.result?.result?.points || [];
        const pointIndex = findPointUnderMouse(p5, points);

        if (pointIndex !== -1) {
          if (currentLine.includes(pointIndex)) {
            // If we click the same point twice, complete the line
            if (currentLine[currentLine.length - 1] === pointIndex) {
              if (currentLine.length >= 2) {
                // Create the line modification
                const modification = {
                  type: ModificationType.CREATE_LINE,
                  points: [...currentLine],
                  color: '#000000',
                  thickness: 2
                };
                onLineEdit?.(modification);
              }
              // Clear current line to start fresh
              setCurrentLine([]);
            } else {
              // If it's a point we used earlier in the line (but not the last point),
              // ignore it to prevent loops
              return;
            }
          } else {
            // Add point to the current line
            setCurrentLine(prev => [...prev, pointIndex]);
            
            // If this is our first two points, create an initial line
            if (currentLine.length === 1) {
              const modification = {
                type: ModificationType.CREATE_LINE,
                points: [...currentLine, pointIndex],
                color: '#000000',
                thickness: 2
              };
              onLineEdit?.(modification);
            }
          }
        } else {
          // If we click empty space, clear the current line
          setCurrentLine([]);
        }
      }
    } else if (currentMode === 'pan') {
      isPanning.current = true;
      prevMouseRef.current = { x: p5.mouseX, y: p5.mouseY };
    }
  };

  const mouseDragged = (p5) => {
    if (!isMouseOver.current) return;

    if (isEditMode) {
      const worldPos = screenToWorld(p5, p5.mouseX, p5.mouseY);

      if (currentEditType === 'point') {
        if (draggedPoint) {
          // Snap the world position to grid
          const snappedPos = {
            x: snapToGrid(worldPos.x, gridSnap),
            y: snapToGrid(worldPos.y, gridSnap)
          };

          // Move existing point
          const modification = {
            type: ModificationType.MOVE_POINT,
            pointIndex: draggedPoint.index,
            originalPos: { 
              x: Number(draggedPoint.originalPos.x),
              y: Number(draggedPoint.originalPos.y)
            },
            newPos: { 
              x: Number(snappedPos.x),
              y: Number(snappedPos.y)
            }
          };
          onPointMove?.(modification);

          // Update visual feedback
          if (computedData?.result?.result?.points) {
            computedData.result.result.points[draggedPoint.index] = {
              ...computedData.result.result.points[draggedPoint.index],
              x: snappedPos.x,
              y: snappedPos.y
            };
          }
        } else if (creatingPoint) {
          // Update position of point being created with snapping
          setCreatingPoint({
            position: {
              x: snapToGrid(worldPos.x, gridSnap),
              y: snapToGrid(worldPos.y, gridSnap)
            },
            isDragging: true
          });
        }
      } else if (currentEditType === 'move' && draggedPoint) {
        // Snap the world position to grid
        const snappedPos = {
          x: snapToGrid(worldPos.x, gridSnap),
          y: snapToGrid(worldPos.y, gridSnap)
        };
        
        const modification = {
          type: ModificationType.MOVE_POINT,
          pointIndex: draggedPoint.index,
          originalPos: { 
            x: Number(draggedPoint.originalPos.x),
            y: Number(draggedPoint.originalPos.y)
          },
          newPos: { 
            x: Number(snappedPos.x),
            y: Number(snappedPos.y)
          }
        };

        onPointMove?.(modification);

        // Update visual feedback
        if (computedData?.result?.result?.points) {
          computedData.result.result.points[draggedPoint.index] = {
            ...computedData.result.result.points[draggedPoint.index],
            x: snappedPos.x,
            y: snappedPos.y
          };
        }
      }
    } else if (currentMode === 'pan' && isPanning.current) {
      const dx = (p5.mouseX - prevMouseRef.current.x) / viewport.zoom;
      const dy = (p5.mouseY - prevMouseRef.current.y) / viewport.zoom;
      viewport.x += dx;
      viewport.y += dy;
      prevMouseRef.current = { x: p5.mouseX, y: p5.mouseY };
      onViewportChange({ ...viewport });
    }
  };

  const mouseReleased = (p5) => {
    if (creatingPoint) {
      // Create the point at final position
      const modification = {
        type: ModificationType.ADD_POINT,
        position: creatingPoint.position
      };
      onPointEdit?.(modification);
      setCreatingPoint(null);
    }
    
    if (draggedPoint) {
      setDraggedPoint(null);
    }
  };

  const draw = (p5) => {
    const viewport = viewportRef.current;
    
    p5.clear();
    p5.background(250);
    
    p5.push();

    p5.translate(p5.width/2, p5.height/2);
    p5.scale(viewport.zoom);
    p5.translate(viewport.x, viewport.y);

    // Calculate visible area
    const topLeft = {
      x: (-p5.width/2) / viewport.zoom - viewport.x,
      y: (-p5.height/2) / viewport.zoom - viewport.y
    };
    const bottomRight = {
      x: (p5.width/2) / viewport.zoom - viewport.x,
      y: (p5.height/2) / viewport.zoom - viewport.y
    };

    // Draw grid
    const gridSize = 20;
    p5.stroke(220);
    p5.strokeWeight(1 / viewport.zoom);

    const startX = Math.floor(topLeft.x / gridSize) * gridSize;
    const endX = Math.ceil(bottomRight.x / gridSize) * gridSize;
    const startY = Math.floor(topLeft.y / gridSize) * gridSize;
    const endY = Math.ceil(bottomRight.y / gridSize) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
      p5.line(x, topLeft.y, x, bottomRight.y);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      p5.line(topLeft.x, y, bottomRight.x, y);
    }

    // Draw axes
    p5.stroke(100);
    p5.strokeWeight(2 / viewport.zoom);
    p5.line(topLeft.x, 0, bottomRight.x, 0);
    p5.line(0, topLeft.y, 0, bottomRight.y);

    // Draw coordinates
    p5.textSize(12 / viewport.zoom);
    p5.fill(0);
    const labelInterval = 100;
    
    for (let x = Math.floor(topLeft.x / labelInterval) * labelInterval; 
         x <= bottomRight.x; 
         x += labelInterval) {
      if (x !== 0) {
        p5.text(x, x, 15 / viewport.zoom);
      }
    }
    
    for (let y = Math.floor(topLeft.y / labelInterval) * labelInterval; 
         y <= bottomRight.y; 
         y += labelInterval) {
      if (y !== 0) {
        p5.text(y, -30 / viewport.zoom, y);
      }
    }

    // Origin label
    p5.text('(0,0)', 5 / viewport.zoom, -5 / viewport.zoom);
    
    // Draw the canvas data
    drawCanvas(p5, viewport, topLeft, bottomRight);

    // Draw points in edit mode - MOVE THIS INSIDE THE TRANSFORMED COORDINATE SYSTEM
    if (isEditMode && computedData?.result?.result?.points) {
      // Only draw edit points if we have valid data
      computedData.result.result.points.forEach((point, index) => {
        if (!point) return;
        
        const isSelected = index === selectedPointIndex;
        const isDragged = draggedPoint && draggedPoint.index === index;
        
        // Draw highlight stroke for selected/dragged points
        if (isSelected || isDragged) {
          p5.stroke(0);
          p5.strokeWeight(2 / viewport.zoom);
        } else {
          p5.noStroke();
        }

        // Fill color based on state
        if (isDragged) {
          p5.fill(255, 165, 0); // Orange for dragged point
        } else if (isSelected) {
          p5.fill(255, 255, 0); // Yellow for selected point
        } else {
          p5.fill(200, 200, 0); // Darker yellow for other points
        }

        const size = (isDragged || isSelected) ? 8 / viewport.zoom : 6 / viewport.zoom;
        p5.circle(point.x, point.y, size);
      });
    }

    p5.pop();

    // Handle panning - add editMode check
    if (currentMode === 'pan' && !isEditMode && isMouseOver.current && p5.mouseIsPressed && p5.mouseButton === p5.LEFT) {
      if (!isPanning.current) {
        isPanning.current = true;
        prevMouseRef.current = { x: p5.mouseX, y: p5.mouseY };
      } else {
        const dx = (p5.mouseX - prevMouseRef.current.x) / viewport.zoom;
        const dy = (p5.mouseY - prevMouseRef.current.y) / viewport.zoom;
        viewport.x += dx;
        viewport.y += dy;
        prevMouseRef.current = { x: p5.mouseX, y: p5.mouseY };
        onViewportChange({ ...viewport });
      }
    } else {
      isPanning.current = false;
    }
    
    updateCursor(p5);
  };

  const mouseWheel = (p5, event) => {
    if (!isMouseOver.current) return;
    event.preventDefault();
    
    const mx = p5.mouseX - p5.width / 2;
    const my = p5.mouseY - p5.height / 2;
    
    const wx = mx / viewport.zoom - viewport.x;
    const wy = my / viewport.zoom - viewport.y;
    
    const oldZoom = viewport.zoom;
    viewport.zoom *= Math.exp(-event.delta * 0.001);
    viewport.zoom = p5.constrain(viewport.zoom, 0.01, 10);
    
    const dx = mx / viewport.zoom - mx / oldZoom;
    const dy = my / viewport.zoom - my / oldZoom;
    viewport.x += dx;
    viewport.y += dy;
    onViewportChange({ ...viewport });
  };

  const keyPressed = (p5) => {
    if (!isMouseOver.current) return;
    
    if (p5.key === 'h' || p5.key === 'H') {
      viewportRef.current = {
        x: 0,
        y: 0,
        zoom: 1
      };
      onViewportChange(viewportRef.current);
    } else if (p5.key === ' ') {
      isSpacePressed.current = true;
    } else if ((p5.key === 'e' || p5.key === 'E') && showEditButton) {
      setCurrentMode('edit');
      setCurrentEditType('move');
    } else if ((p5.key === 'l' || p5.key === 'L') && showEditButton) {
      setCurrentMode('edit');
      setCurrentEditType('line');
    } else if ((p5.key === 'p' || p5.key === 'P') && showEditButton) {
      setCurrentMode('edit');
      setCurrentEditType('point');
    }
  };

  const keyReleased = (p5) => {
    // Only process keyboard events if mouse is over the canvas
    if (!isMouseOver.current) return;
    
    if (p5.key === ' ') {
      isSpacePressed.current = false;
      isPanning.current = false;
    }
  };

  const doubleClicked = (p5) => {
    if (!isMouseOver.current || !isEditMode || currentEditType !== 'point') return;

    const points = computedData?.result?.result?.points || [];
    const pointIndex = findPointUnderMouse(p5, points);

    if (pointIndex !== -1) {
      const modification = {
        type: ModificationType.DELETE_POINT,
        pointIndex: pointIndex
      };

      onPointEdit?.(modification);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (!p5Ref.current) return;
      
      const entry = entries[0];
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;

      if (width > 0 && height > 0) {
        p5Ref.current.resizeCanvas(width, height, true);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const createModification = (type, data) => {
    return {
      ...data,
      type,
      gridSnap
    };
  };

  return (
    <div className="relative w-full h-full flex">
      {/* Left toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <ToolbarButton
          icon={<BsCursor size={20} />}
          active={currentMode === 'select'}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentMode('select');
          }}
          title="Selection Mode (V)"
        />
        <ToolbarButton
          icon={<BiMove size={20} />}
          active={currentMode === 'pan'}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentMode('pan');
          }}
          title="Pan/Zoom Mode (H)"
        />
        {showEditButton && (
          <>
            <ToolbarButton
              icon={<BsArrowsMove size={20} />}
              active={isEditMode && currentEditType === 'move'}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMode('edit');
                setCurrentEditType('move');
              }}
              title="Move Points (E)"
            />
            <ToolbarButton
              icon={<BsVectorPen size={20} />}
              active={isEditMode && currentEditType === 'line'}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMode('edit');
                setCurrentEditType('line');
              }}
              title="Edit Lines (L)"
            />
            <ToolbarButton
              icon={<BsPlus size={20} />}
              active={isEditMode && currentEditType === 'point'}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMode('edit');
                setCurrentEditType('point');
              }}
              title="Add Points (P)"
            />
          </>
        )}
      </div>

      {/* Right toolbar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <ToolbarButton
          icon={<TbRefresh size={20} />}
          active={liveUpdate}
          onClick={() => onLiveUpdateToggle(!liveUpdate)}
          title="Toggle Live Updates"
          isLiveUpdate={true}
        />
        <ToolbarButton
          icon={<BsCircle size={20} />}
          active={showPoints}
          onClick={() => onShowPointsChange(!showPoints)}
          title="Toggle Points Visibility"
        />
        <div className="relative">
          <button
            className="p-2 rounded bg-white shadow hover:bg-gray-100"
            onClick={() => setIsGridMenuOpen(!isGridMenuOpen)}
          >
            <BsGrid3X3Gap 
              className={`w-5 h-5 ${
                gridSnap === 0 
                  ? 'text-gray-400' // Grey when no snap
                  : 'text-green-500' // Green when snap is active
              }`}
            />
          </button>
          
          {isGridMenuOpen && (
            <div 
              className="absolute right-0 mt-1 bg-white rounded shadow-lg p-1 z-50"
              onMouseLeave={() => setIsGridMenuOpen(false)}
            >
              {gridSnapOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-4 py-2 text-sm rounded hover:bg-gray-100 
                    ${gridSnap === option.value ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    setGridSnap(option.value);
                    setIsGridMenuOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full h-full"
        onMouseEnter={mouseEntered}
        onMouseLeave={mouseLeft}
      >
        <Sketch
          setup={setup}
          draw={draw}
          mouseWheel={mouseWheel}
          keyPressed={keyPressed}
          keyReleased={keyReleased}
          mousePressed={mousePressed}
          mouseDragged={mouseDragged}
          mouseReleased={mouseReleased}
          mouseMoved={mouseMoved}
          doubleClicked={doubleClicked}
        />
      </div>
    </div>
  );
};

export default P5Canvas;