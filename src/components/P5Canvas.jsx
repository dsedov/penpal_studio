import React, { useEffect, useRef } from 'react';
import Sketch from 'react-p5';

const P5Canvas = () => {
  const containerRef = useRef(null);
  const viewportRef = useRef({
    x: 0,
    y: 0,
    zoom: 1
  });
  const p5Ref = useRef(null);

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
    
    p5.pop();

    // Handle panning
    if (p5.mouseIsPressed && p5.mouseButton === p5.CENTER) {
      const dx = p5.movedX / viewport.zoom;
      const dy = p5.movedY / viewport.zoom;
      viewport.x += dx;
      viewport.y += dy;
    }
  };

  const mouseWheel = (p5, event) => {
    event.preventDefault();
    const viewport = viewportRef.current;
    
    // Calculate mouse position relative to canvas center before zoom
    const mx = p5.mouseX - p5.width / 2;
    const my = p5.mouseY - p5.height / 2;
    
    // Calculate world position before zoom
    const wx = mx / viewport.zoom - viewport.x;
    const wy = my / viewport.zoom - viewport.y;
    
    // Update zoom
    const oldZoom = viewport.zoom;
    viewport.zoom *= Math.exp(-event.delta * 0.001);
    viewport.zoom = p5.constrain(viewport.zoom, 0.01, 10);
    
    // Update the offset to keep the mouse position fixed
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
      />
    </div>
  );
};

export default P5Canvas;