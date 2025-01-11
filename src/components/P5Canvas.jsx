import React, { useEffect, useRef } from 'react';
import Sketch from 'react-p5';

const P5Canvas = ({ computedData }) => {
  const containerRef = useRef(null);
  const viewportRef = useRef({
    x: 0,
    y: 0,
    zoom: 1
  });
  const p5Ref = useRef(null);
  const isSpacePressed = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);

  const setup = (p5, canvasParentRef) => {
    if (!containerRef.current) return;
    p5Ref.current = p5;
    
    // Create canvas with initial size
    const initialWidth = containerRef.current.clientWidth;
    const initialHeight = containerRef.current.clientHeight;
    
    const canvas = p5.createCanvas(initialWidth, initialHeight).parent(canvasParentRef);
    
    canvas.style('width', '100%');
    canvas.style('height', '100%');
    
    p5.canvas.addEventListener('auxclick', (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });
  };

  const drawCanvas = (p5, viewport, topLeft, bottomRight) => {
    if (!computedData?.result?.result) return;
    const canvas = computedData.result.result;

    // Set background color if provided
    if (canvas.backgroundColor) {
      p5.push();
      p5.fill(canvas.backgroundColor);
      p5.stroke(100);
      p5.strokeWeight(1 / viewport.zoom);
      // Draw rectangle representing the canvas
      p5.rect(0, 0, canvas.size.x, canvas.size.y);
      p5.pop();
    }

    // Draw points
    if (canvas.points && canvas.points.length > 0) {
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
      p5.strokeWeight(2 / viewport.zoom);
      p5.stroke(0);
      p5.noFill();

      canvas.lines.forEach(line => {
        if (line.points.length > 1) {
          p5.beginShape();
          line.points.forEach(pointId => {
            const point = canvas.points[pointId];
            if (point) {
              p5.vertex(point.x, point.y);
            }
          });
          p5.endShape();
        }
      });
      p5.pop();
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
    
    p5.pop();

    // Handle panning
    if ((p5.mouseIsPressed && p5.mouseButton === p5.CENTER) || 
        (isSpacePressed.current && p5.mouseIsPressed && p5.mouseButton === p5.LEFT)) {
      
      if (!isPanning.current) {
        isPanning.current = true;
        prevMouseRef.current = { x: p5.mouseX, y: p5.mouseY };
      } else {
        const dx = (p5.mouseX - prevMouseRef.current.x) / viewport.zoom;
        const dy = (p5.mouseY - prevMouseRef.current.y) / viewport.zoom;
        viewport.x += dx;
        viewport.y += dy;
        prevMouseRef.current = { x: p5.mouseX, y: p5.mouseY };
      }
    } else {
      isPanning.current = false;
    }
  };

  const mouseWheel = (p5, event) => {
    event.preventDefault();
    const viewport = viewportRef.current;
    
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
  };

  const keyPressed = (p5) => {
    if (p5.key === 'h' || p5.key === 'H') {
      viewportRef.current = {
        x: 0,
        y: 0,
        zoom: 1
      };
    } else if (p5.key === ' ') {
      isSpacePressed.current = true;
    }
  };

  const keyReleased = (p5) => {
    if (p5.key === ' ') {
      isSpacePressed.current = false;
      isPanning.current = false;
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

  return (
    <div ref={containerRef} className="w-full h-full">
      <Sketch
        setup={setup}
        draw={draw}
        mouseWheel={mouseWheel}
        keyPressed={keyPressed}
        keyReleased={keyReleased}
      />
    </div>
  );
};

export default P5Canvas;