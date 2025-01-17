import React, { useEffect, useRef } from 'react';

export const IronCityBackground: React.FC = () => {
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

    // Colors inspired by Iron City from Alita
    const colors = {
      sky: '#1a0f2e',
      buildings: '#0a0a14',
      neon: '#ff69b4',
      accent: '#4fc3f7',
      highlight: '#ff4081'
    };

    // Define types
    interface Window {
      x: number;
      y: number;
      lit: boolean;
    }

    interface NeonLine {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
    }

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
    }

    // Building properties
    interface Building {
      x: number;
      y: number;
      width: number;
      height: number;
      windows: Window[];
      neonLines: NeonLine[];
    }

    // Generate random buildings
    const generateBuildings = (count: number): Building[] => {
      const buildings: Building[] = [];
      const maxHeight = canvas.height * 0.8;
      const minHeight = canvas.height * 0.3;
      const maxWidth = canvas.width / (count * 0.7);
      const minWidth = maxWidth * 0.4;

      for (let i = 0; i < count; i++) {
        const width = minWidth + Math.random() * (maxWidth - minWidth);
        const height = minHeight + Math.random() * (maxHeight - minHeight);
        const x = (i * canvas.width / count) + Math.random() * (canvas.width / count * 0.3);
        const y = canvas.height - height;

        // Generate windows
        const windows = [];
        const windowSize = width * 0.1;
        const windowsPerRow = Math.floor(width / (windowSize * 1.5));
        const windowsPerCol = Math.floor(height / (windowSize * 1.5));

        for (let row = 0; row < windowsPerCol; row++) {
          for (let col = 0; col < windowsPerRow; col++) {
            if (Math.random() > 0.3) { // 70% windows are lit
              windows.push({
                x: x + (col * windowSize * 1.5) + windowSize * 0.25,
                y: y + (row * windowSize * 1.5) + windowSize * 0.25,
                lit: Math.random() > 0.5
              });
            }
          }
        }

        // Generate neon lines
        const neonLines = [];
        const neonCount = Math.floor(Math.random() * 3) + 1;
        for (let n = 0; n < neonCount; n++) {
          const startX = x + Math.random() * width;
          const startY = y + Math.random() * height;
          const length = Math.random() * width * 0.5;
          const vertical = Math.random() > 0.5;
          
          neonLines.push({
            x1: startX,
            y1: startY,
            x2: vertical ? startX : startX + length,
            y2: vertical ? startY + length : startY,
            color: Math.random() > 0.5 ? colors.neon : colors.accent
          });
        }

        buildings.push({ x, y, width, height, windows, neonLines });
      }
      return buildings;
    };

    // Animation variables
    let buildings = generateBuildings(12);
    let frame = 0;
    const fps = 30;
    let lastNeonFlicker = 0;

    function addFloatingParticles(): Particle[] {
      const particles: Particle[] = [];
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speedY: -Math.random() * 0.5 - 0.2,
          opacity: Math.random()
        });
      }
      
      return particles;
    }

    let particles: Particle[] = addFloatingParticles();

    function drawScene(time: number) {
      if (!canvas || !ctx) return;
      ctx.fillStyle = colors.sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating particles
      particles.forEach((particle, index) => {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + particle.opacity + ')';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Update particle position
        particle.y += particle.speedY;
        particle.opacity = Math.sin(time * 0.001 + index) * 0.5 + 0.5;

        // Reset particle if it goes off screen
        if (particle.y < 0) {
          particle.y = canvas.height;
          particle.x = Math.random() * canvas.width;
        }
      });

      // Draw buildings
      buildings.forEach(building => {
        // Main building shape
        ctx.fillStyle = colors.buildings;
        ctx.fillRect(building.x, building.y, building.width, building.height);

        // Windows
        building.windows.forEach(window => {
          if (window.lit) {
            const flickerIntensity = Math.random() * 0.2 + 0.8;
            ctx.fillStyle = 'rgba(255, 255, 200, ' + flickerIntensity + ')';
            ctx.fillRect(window.x, window.y, building.width * 0.08, building.width * 0.08);
          }
        });

        // Neon lines
        building.neonLines.forEach(line => {
          const flickerIntensity = Math.sin(time * 0.01) * 0.2 + 0.8;
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.stroke();

          // Neon glow
          ctx.shadowColor = line.color;
          ctx.shadowBlur = 15;
          ctx.strokeStyle = `rgba(255, 105, 180, ${flickerIntensity})`; // Convert hex to rgba for neon
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
      });

      // Random neon flicker effect
      if (time - lastNeonFlicker > 1000) {
        buildings.forEach(building => {
          building.windows.forEach(window => {
            if (Math.random() > 0.99) {
              window.lit = !window.lit;
            }
          });
        });
        lastNeonFlicker = time;
      }

      // Request next frame
      frame++;
      requestAnimationFrame(drawScene);
    }

    // Start animation
    requestAnimationFrame(drawScene);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
    />
  );
};