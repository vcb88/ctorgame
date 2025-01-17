import React, { useEffect, useRef } from 'react';

export const DeepSpaceBackground: React.FC = () => {
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

    // Star properties
    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
    }

    // Create stars
    const stars: Star[] = Array(600).fill(null).map(() => ({
      x: Math.random() * safeCanvas.width - safeCanvas.width/2,
      y: Math.random() * safeCanvas.height - safeCanvas.height/2,
      z: Math.random() * 2000,
      prevZ: 0
    }));

    // Nebula properties
    interface NebulaCloud {
      x: number;
      y: number;
      size: number;
      hue: number;
      opacity: number;
      speed: number;
    }

    // Create nebula clouds
    const nebulaClouds: NebulaCloud[] = Array(15).fill(null).map(() => ({
      x: Math.random() * safeCanvas.width,
      y: Math.random() * safeCanvas.height,
      size: Math.random() * 200 + 100,
      hue: Math.random() * 60 + 240, // Blue to purple
      opacity: Math.random() * 0.5,
      speed: Math.random() * 0.2 + 0.1
    }));

    let frame = 0;

    function moveStars() {
      stars.forEach(star => {
        star.prevZ = star.z;
        star.z = star.z - 10;
        if (star.z < 1) {
          star.z = 2000;
          star.prevZ = 2000;
          star.x = Math.random() * safeCanvas.width - safeCanvas.width/2;
          star.y = Math.random() * safeCanvas.height - safeCanvas.height/2;
        }
      });
    }

    function drawStars() {
      const cx = safeCanvas.width / 2;
      const cy = safeCanvas.height / 2;

      stars.forEach(star => {
        const sx = map(star.x / star.z, 0, 1, 0, safeCanvas.width) + cx;
        const sy = map(star.y / star.z, 0, 1, 0, safeCanvas.height) + cy;
        const px = map(star.x / star.prevZ, 0, 1, 0, safeCanvas.width) + cx;
        const py = map(star.y / star.prevZ, 0, 1, 0, safeCanvas.height) + cy;
        
        const size = map(star.z, 0, 2000, 3, 0);
        const opacity = map(star.z, 0, 2000, 1, 0);

        safeCtx.beginPath();
        safeCtx.strokeStyle = 'rgba(255, 255, 255, ' + opacity + ')';
        safeCtx.lineWidth = size;
        safeCtx.moveTo(px, py);
        safeCtx.lineTo(sx, sy);
        safeCtx.stroke();
      });
    }

    function drawNebula(time: number) {
      nebulaClouds.forEach(cloud => {
        const gradient = safeCtx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, cloud.size
        );

        // Создаем пульсацию
        const pulseOpacity = Math.sin(time * 0.001 * cloud.speed) * 0.2 + 0.8;
        
        const baseColor = `hsla(${cloud.hue}, 70%, 50%, 1)`;
        const midColor = `hsla(${cloud.hue}, 70%, 50%, 0.5)`;
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.4, midColor);
        gradient.addColorStop(1, 'transparent');

        safeCtx.fillStyle = gradient;
        safeCtx.globalAlpha = cloud.opacity * pulseOpacity;
        safeCtx.fillRect(0, 0, safeCanvas.width, safeCanvas.height);

        // Медленно двигаем облака
        cloud.x += cloud.speed;
        cloud.y += cloud.speed * 0.5;

        // Возвращаем облака на экран
        if (cloud.x > safeCanvas.width + cloud.size) cloud.x = -cloud.size;
        if (cloud.y > safeCanvas.height + cloud.size) cloud.y = -cloud.size;
      });
      
      safeCtx.globalAlpha = 1;
    }

    // Utility function for mapping ranges
    function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
      return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    }

    function draw(time: number) {
      // Clear canvas with slight fade for trail effect
      safeCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      safeCtx.fillRect(0, 0, safeCanvas.width, safeCanvas.height);

      drawNebula(time);
      moveStars();
      drawStars();

      frame++;
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
      className="fixed inset-0 w-full h-full -z-10"
    />
  );
};