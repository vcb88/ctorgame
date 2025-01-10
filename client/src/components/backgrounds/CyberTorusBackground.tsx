import React, { useEffect, useRef } from 'react';

export const CyberTorusBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation variables
    let rotation = 0;
    const torusRadius = Math.min(canvas.width, canvas.height) * 0.4;
    const tubeRadius = torusRadius * 0.3;
    const segments = 40;
    const tubes = 20;

    // Grid lines
    const gridLines = 12;
    
    // Colors
    const mainColor = '#0ff';
    const glowColor = '#0ff8';
    const dimColor = '#0ff2';

    function drawTorus(time: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center point
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Rotation angles
      const rotationX = rotation;
      const rotationY = rotation * 0.5;
      const rotationZ = rotation * 0.3;

      // Draw grid segments
      for (let i = 0; i <= segments; i++) {
        const segmentAngle = (i * Math.PI * 2) / segments;
        
        for (let j = 0; j <= tubes; j++) {
          const tubeAngle = (j * Math.PI * 2) / tubes;

          // Calculate 3D coordinates
          const x = (torusRadius + tubeRadius * Math.cos(tubeAngle)) * Math.cos(segmentAngle);
          const y = (torusRadius + tubeRadius * Math.cos(tubeAngle)) * Math.sin(segmentAngle);
          const z = tubeRadius * Math.sin(tubeAngle);

          // Rotate points
          const rotatedX = x * Math.cos(rotationZ) - y * Math.sin(rotationZ);
          const rotatedY = x * Math.sin(rotationZ) + y * Math.cos(rotationZ);
          const rotatedZ = z;

          // Project 3D to 2D
          const scale = 1000 / (1000 + rotatedZ);
          const projectedX = centerX + rotatedX * scale;
          const projectedY = centerY + rotatedY * scale;

          // Draw grid points and lines
          if (i % (segments / gridLines) === 0 || j % (tubes / gridLines) === 0) {
            ctx.beginPath();
            ctx.arc(projectedX, projectedY, 2, 0, Math.PI * 2);
            ctx.fillStyle = mainColor;
            ctx.fill();

            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = glowColor;
          }
        }
      }

      // Draw grid lines
      ctx.strokeStyle = dimColor;
      ctx.lineWidth = 1;

      for (let i = 0; i < gridLines; i++) {
        ctx.beginPath();
        const angle = (i * Math.PI * 2) / gridLines;
        
        for (let r = 0; r < segments; r++) {
          const radius = torusRadius + tubeRadius * Math.cos(angle);
          const x = centerX + radius * Math.cos((r * Math.PI * 2) / segments);
          const y = centerY + radius * Math.sin((r * Math.PI * 2) / segments);
          
          if (r === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Animate rotation
      rotation += 0.002;
      requestAnimationFrame(() => drawTorus(time + 16));
    }

    // Start animation
    requestAnimationFrame(drawTorus);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 bg-gradient-to-b from-blue-900 via-gray-900 to-black"
      style={{ filter: 'blur(1px)' }}
    />
  );
};