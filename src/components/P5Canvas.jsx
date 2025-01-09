import React, { useEffect, useRef } from 'react';
import Sketch from 'react-p5';

const P5Canvas = () => {
  const containerRef = useRef(null);
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  const setup = (p5, canvasParentRef) => {
    // Create canvas with parent's size
    const canvas = p5.createCanvas(
      canvasParentRef.clientWidth,
      canvasParentRef.clientHeight
    ).parent(canvasParentRef);

    // Prevent context menu on middle click
    canvas.elt.addEventListener('contextmenu', (e) => {
      if (e.button === 1) { // middle button
        e.preventDefault();
      }
    });

    p5.background(240);
  };

  const draw = (p5) => {
    p5.background(240);
    
    // Apply pan transformation
    p5.translate(panX, panY);

    // Draw grid
    const gridSize = 20;
    p5.stroke(200);
    p5.strokeWeight(1);

    // Calculate grid boundaries based on canvas size and pan position
    const startX = Math.floor(-panX / gridSize) * gridSize;
    const startY = Math.floor(-panY / gridSize) * gridSize;
    const endX = startX + p5.width + gridSize * 2;
    const endY = startY + p5.height + gridSize * 2;
    
    for (let x = startX; x < endX; x += gridSize) {
      p5.line(x, startY, x, endY);
    }
    for (let y = startY; y < endY; y += gridSize) {
      p5.line(startX, y, endX, y);
    }

    // Handle panning with middle mouse
    if (p5.mouseIsPressed && p5.mouseButton === p5.CENTER) {
      if (!isPanning) {
        isPanning = true;
        lastMouseX = p5.mouseX;
        lastMouseY = p5.mouseY;
      } else {
        const dx = p5.mouseX - lastMouseX;
        const dy = p5.mouseY - lastMouseY;
        panX += dx;
        panY += dy;
        lastMouseX = p5.mouseX;
        lastMouseY = p5.mouseY;
      }
    } else {
      isPanning = false;
    }

    // Draw something at origin to help orient
    p5.push();
    p5.stroke(255, 0, 0);
    p5.strokeWeight(2);
    p5.line(-10, 0, 10, 0);
    p5.line(0, -10, 0, 10);
    p5.pop();
  };

  const windowResized = (p5) => {
    // Get current container size
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Resize canvas
    p5.resizeCanvas(width, height);
  };

  // Add resize observer to handle panel resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          const width = entry.contentRect.width;
          const height = entry.contentRect.height;
          if (width > 0 && height > 0) {
            const canvas = document.querySelector('#defaultCanvas0');
            if (canvas) {
              canvas.width = width;
              canvas.height = height;
              canvas.style.width = `${width}px`;
              canvas.style.height = `${height}px`;
            }
          }
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Sketch
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </div>
  );
};

export default P5Canvas;