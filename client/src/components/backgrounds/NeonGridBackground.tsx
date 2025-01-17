import React, { useEffect, useRef } from 'react';

export const NeonGridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // After null checks, we can assert these are non-null
    const safeCanvas = canvas as HTMLCanvasElement;
    const safeCtx = ctx as CanvasRenderingContext2D;

    // Set canvas size to window size
    const resize = () => {
      safeCanvas.width = window.innerWidth;
      safeCanvas.height = window.innerHeight;
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
      x: Math.random() * safeCanvas.width,
      y: Math.random() * safeCanvas.height,
      speed: Math.random() * 2 + 1,
      char: String.fromCharCode(0x30A0 + Math.random() * 96),
      opacity: Math.random()
    }));

    function project(x: number, y: number, z: number) {
      const scale = perspective / (z + perspective);
      return {
        x: safeCanvas.width/2 + x * scale,
        y: safeCanvas.height/2 + y * scale,
        scale: scale
      };
    }

    function drawGrid(time: number) {
      safeCtx.strokeStyle = '#1a1a1a';
      safeCtx.lineWidth = 1;

      // Vertical lines
      for (let x = -1000; x < 1000; x += gridSize) {
        const start = project(x, 0, 0);
        const end = project(x, 0, 2000);
        safeCtx.beginPath();
        safeCtx.moveTo(start.x, start.y);
        safeCtx.lineTo(end.x, end.y);
        safeCtx.stroke();
      }

      // Horizontal lines with z-depth
      for (let z = 0; z < 2000; z += gridSize) {
        const start = project(-1000, 0, z);
        const end = project(1000, 0, z);
        safeCtx.beginPath();
        safeCtx.moveTo(start.x, start.y);
        safeCtx.lineTo(end.x, end.y);
        safeCtx.stroke();
      }
    }

    function drawNeonSigns(time: number) {
      neonSigns.forEach(sign => {
        const projected = project(sign.x, sign.y, sign.z);
        
        if (sign.glowing) {
          const glowIntensity = Math.sin(time * 0.001) * 0.5 + 0.5;
          safeCtx.shadowColor = sign.color;
          safeCtx.shadowBlur = 20 * glowIntensity;
        }

        safeCtx.font = Math.floor(30 * projected.scale * sign.scale) + 'px "Noto Sans JP"';
        safeCtx.fillStyle = sign.color;
        safeCtx.textAlign = 'center';
        safeCtx.fillText(sign.text, projected.x, projected.y);
        
        safeCtx.shadowBlur = 0;
      });
    }

    function drawDigitalRain() {
      safeCtx.font = '14px monospace';
      
      raindrops.forEach(drop => {
        safeCtx.fillStyle = 'rgba(0, 255, 255, ' + drop.opacity + ')';
        safeCtx.fillText(drop.char, drop.x, drop.y);
        
        drop.y += drop.speed;
        if (drop.y > safeCanvas.height) {
          drop.y = 0;
          drop.x = Math.random() * safeCanvas.width;
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
      safeCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      safeCtx.fillRect(0, 0, safeCanvas.width, safeCanvas.height);

      // Save context for glitch effect
      safeCtx.save();
      safeCtx.translate(glitchOffset, 0);

      // Update camera position
      cameraY = Math.sin(time * 0.0005) * 50;

      // Draw background elements
      safeCtx.save();
      safeCtx.translate(0, cameraY);
      drawGrid(time);
      drawNeonSigns(time);
      safeCtx.restore();

      // Draw foreground elements
      drawDigitalRain();

      // Create random glitch effect
      createGlitchEffect();

      // Restore context
      safeCtx.restore();

      // Add scanline effect
      for (let i = 0; i < safeCanvas.height; i += 2) {
        safeCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        safeCtx.fillRect(0, i, safeCanvas.width, 1);
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