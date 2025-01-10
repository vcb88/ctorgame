import React, { useEffect, useRef } from 'react';

export const NeonGridBackground: React.FC = () => {
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

    // Grid properties
    const gridSize = 40;
    const perspective = 800;
    let cameraY = 0;
    let glitchOffset = 0;
    
    // Neon signs
    interface NeonSign {
      x: number;
      y: number;
      z: number;
      text: string;
      color: string;
      scale: number;
      glowing: boolean;
    }

    // Kanji and katakana for neon signs
    const neonTexts = ['待機', 'データ', 'セットアップ', '準備', 'ロード', '接続'];
    const neonColors = ['#ff0066', '#00ffff', '#ff3300', '#66ff00', '#ff00ff', '#ffff00'];

    // Create neon signs
    const neonSigns: NeonSign[] = Array(15).fill(null).map(() => ({
      x: (Math.random() - 0.5) * 2000,
      y: Math.random() * 500 - 250,
      z: Math.random() * 2000 + 500,
      text: neonTexts[Math.floor(Math.random() * neonTexts.length)],
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      scale: Math.random() * 0.5 + 0.5,
      glowing: Math.random() > 0.5
    }));

    // Digital rain particles
    interface RainDrop {
      x: number;
      y: number;
      speed: number;
      char: string;
      opacity: number;
    }

    const raindrops: RainDrop[] = Array(100).fill(null).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
      char: String.fromCharCode(0x30A0 + Math.random() * 96),
      opacity: Math.random()
    }));

    function project(x: number, y: number, z: number) {
      const scale = perspective / (z + perspective);
      return {
        x: canvas.width/2 + x * scale,
        y: canvas.height/2 + y * scale,
        scale: scale
      };
    }

    function drawGrid(time: number) {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = -1000; x < 1000; x += gridSize) {
        const start = project(x, 0, 0);
        const end = project(x, 0, 2000);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      // Horizontal lines with z-depth
      for (let z = 0; z < 2000; z += gridSize) {
        const start = project(-1000, 0, z);
        const end = project(1000, 0, z);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }

    function drawNeonSigns(time: number) {
      neonSigns.forEach(sign => {
        const projected = project(sign.x, sign.y, sign.z);
        
        if (sign.glowing) {
          const glowIntensity = Math.sin(time * 0.001) * 0.5 + 0.5;
          ctx.shadowColor = sign.color;
          ctx.shadowBlur = 20 * glowIntensity;
        }

        ctx.font = \`\${Math.floor(30 * projected.scale * sign.scale)}px "Noto Sans JP"\`;
        ctx.fillStyle = sign.color;
        ctx.textAlign = 'center';
        ctx.fillText(sign.text, projected.x, projected.y);
        
        ctx.shadowBlur = 0;
      });
    }

    function drawDigitalRain() {
      ctx.font = '14px monospace';
      
      raindrops.forEach(drop => {
        ctx.fillStyle = \`rgba(0, 255, 255, \${drop.opacity})\`;
        ctx.fillText(drop.char, drop.x, drop.y);
        
        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = 0;
          drop.x = Math.random() * canvas.width;
          drop.char = String.fromCharCode(0x30A0 + Math.random() * 96);
        }
      });
    }

    function createGlitchEffect() {
      if (Math.random() > 0.99) {
        glitchOffset = (Math.random() - 0.5) * 20;
        setTimeout(() => {
          glitchOffset = 0;
        }, 50);
      }
    }

    function draw(time: number) {
      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context for glitch effect
      ctx.save();
      ctx.translate(glitchOffset, 0);

      // Update camera position
      cameraY = Math.sin(time * 0.0005) * 50;

      // Draw background elements
      ctx.save();
      ctx.translate(0, cameraY);
      drawGrid(time);
      drawNeonSigns(time);
      ctx.restore();

      // Draw foreground elements
      drawDigitalRain();

      // Create random glitch effect
      createGlitchEffect();

      // Restore context
      ctx.restore();

      // Add scanline effect
      for (let i = 0; i < canvas.height; i += 2) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, i, canvas.width, 1);
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 bg-black"
    />
  );
};