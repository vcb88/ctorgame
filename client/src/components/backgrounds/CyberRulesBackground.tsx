import React, { useEffect, useRef } from 'react';

/**
 * Background component for the Game Rules page
 * Combines elements from Tron, Cyberpunk 2077, and Alita
 */
export const CyberRulesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation for flowing energy lines (Tron style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Energy line particle
    interface Particle {
      x: number;
      y: number;
      speed: number;
      length: number;
      angle: number;
      color: string;
      alpha: number;
    }

    // Create particles
    const particles: Particle[] = [];
    const colors = ['#00ffff', '#ff0066', '#ffd700'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        length: 50 + Math.random() * 100,
        angle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.1 + Math.random() * 0.4,
      });
    }

    // Hexagonal grid parameters
    const hexSize = 40;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;
    const hexVerticalSpacing = hexHeight * 0.75;
    
    // Draw hexagonal grid
    const drawHexGrid = () => {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;

      for (let row = 0; row < canvas.height / hexVerticalSpacing + 1; row++) {
        for (let col = 0; col < canvas.width / hexWidth + 1; col++) {
          const x = col * hexWidth + (row % 2) * (hexWidth / 2);
          const y = row * hexVerticalSpacing;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + hexSize * Math.cos(angle);
            const hy = y + hexSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hexagonal grid
      drawHexGrid();

      // Update and draw particles
      particles.forEach(particle => {
        // Move particle
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw energy line
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(
          particle.x - Math.cos(particle.angle) * particle.length,
          particle.y - Math.sin(particle.angle) * particle.length
        );
        ctx.strokeStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-blue-900 opacity-90" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      <div className="fixed inset-0 bg-blue-900/5 backdrop-blur-[2px]" />
    </>
  );
};