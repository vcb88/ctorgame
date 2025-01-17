import React, { useEffect, useRef } from 'react';

/**
 * Background component for the Game Rules page
 * Combines elements from Tron, Cyberpunk 2077, and Alita
 * Features multiple layers for depth and parallax effect
 */
export const CyberRulesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animation for flowing energy lines (Tron style) - Foreground
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // After null checks, we can assert these are non-null
    const safeCanvas = canvas as HTMLCanvasElement;
    const safeCtx = ctx as CanvasRenderingContext2D;

    const setCanvasSize = () => {
      safeCanvas.width = window.innerWidth;
      safeCanvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Particle system for energy lines
    interface Particle {
      x: number;
      y: number;
      speed: number;
      length: number;
      angle: number;
      color: string;
      alpha: number;
      layer: number; // 1: front, 2: middle, 3: back
    }

    const particles: Particle[] = [];
    const colors = [
      '#00ffff', // Cyan (Tron)
      '#ff0066', // Red (Cyberpunk)
      '#ffd700', // Gold (Alita)
      '#4a90e2', // Blue
      '#50fa7b', // Green
    ];
    
    // Create particles for different layers
    for (let i = 0; i < 60; i++) {
      const layer = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
      particles.push({
        x: Math.random() * safeCanvas.width,
        y: Math.random() * safeCanvas.height,
        speed: (0.3 + Math.random() * 0.7) / layer, // Slower in back layers
        length: (30 + Math.random() * 80) / layer, // Shorter in back layers
        angle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: (0.1 + Math.random() * 0.3) / layer, // More transparent in back layers
        layer,
      });
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      safeCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      safeCtx.fillRect(0, 0, safeCanvas.width, safeCanvas.height);

      // Draw particles by layer (back to front)
      [3, 2, 1].forEach(layer => {
        particles
          .filter(p => p.layer === layer)
          .forEach(particle => {
            // Move particle
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed;

            // Wrap around screen
            if (particle.x < 0) particle.x = safeCanvas.width;
            if (particle.x > safeCanvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = safeCanvas.height;
            if (particle.y > safeCanvas.height) particle.y = 0;

            // Draw energy line
            safeCtx.beginPath();
            safeCtx.moveTo(particle.x, particle.y);
            safeCtx.lineTo(
              particle.x - Math.cos(particle.angle) * particle.length,
              particle.y - Math.sin(particle.angle) * particle.length
            );
            safeCtx.strokeStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
            safeCtx.lineWidth = 2;
            safeCtx.stroke();
          });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Background hexagonal grid effect
  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // After null checks, we can assert these are non-null
    const safeCanvas = canvas as HTMLCanvasElement;
    const safeCtx = ctx as CanvasRenderingContext2D;

    const setCanvasSize = () => {
      safeCanvas.width = window.innerWidth;
      safeCanvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Hexagonal grid parameters
    const hexSize = 60;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;
    const hexVerticalSpacing = hexHeight * 0.75;
    let offset = 0;

    // Animation loop for subtle grid movement
    let animationFrameId: number;
    const animate = () => {
      safeCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      safeCtx.fillRect(0, 0, safeCanvas.width, safeCanvas.height);
      
      // Moving grid effect
      offset = (offset + 0.1) % hexHeight;

      // Draw multiple layers of hexagons with different sizes and opacities
      [
        { size: 1.5, alpha: 0.05, color: '#1a1a1a' },
        { size: 1.2, alpha: 0.08, color: '#2a2a2a' },
        { size: 1.0, alpha: 0.1, color: '#3a3a3a' }
      ].forEach(layer => {
        const currentHexSize = hexSize * layer.size;
        const currentHexWidth = currentHexSize * Math.sqrt(3);
        const currentHexHeight = currentHexSize * 2;
        const currentSpacing = currentHexHeight * 0.75;

        safeCtx.strokeStyle = layer.color;
        safeCtx.lineWidth = 1;
        safeCtx.globalAlpha = layer.alpha;

        for (let row = -1; row < safeCanvas.height / currentSpacing + 1; row++) {
          for (let col = -1; col < safeCanvas.width / currentHexWidth + 1; col++) {
            const x = col * currentHexWidth + (row % 2) * (currentHexWidth / 2);
            const y = row * currentSpacing + offset;

            safeCtx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const hx = x + currentHexSize * Math.cos(angle);
              const hy = y + currentHexSize * Math.sin(angle);
              if (i === 0) safeCtx.moveTo(hx, hy);
              else safeCtx.lineTo(hx, hy);
            }
            safeCtx.closePath();
            safeCtx.stroke();
          }
        }
      });

      safeCtx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Base gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-900/50 to-purple-900/30" />
      
      {/* Floating hexagonal grid - Back layer */}
      <canvas
        ref={backgroundCanvasRef}
        className="fixed inset-0 w-full h-full opacity-50"
        style={{ mixBlendMode: 'lighten' }}
      />

      {/* Middle layer - Additional gradients and effects */}
      <div className="fixed inset-0">
        {/* Vertical light beam effects */}
        <div className="absolute inset-0 flex justify-around">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-full w-1 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent
                         transform translate-y-full animate-beam"
              style={{ 
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
        
        {/* Radial overlay */}
        <div className="absolute inset-0 bg-radial-gradient" />
      </div>

      {/* Flowing energy lines - Front layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Top overlay for extra depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-purple-900/10 backdrop-blur-[1px]" />
    </>
  );
};