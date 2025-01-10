import React, { useEffect, useRef } from 'react';

export const DeepSpaceBackground: React.FC = () => {
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

    // Star properties
    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
    }

    // Create stars
    const stars: Star[] = Array(600).fill(null).map(() => ({
      x: Math.random() * canvas.width - canvas.width/2,
      y: Math.random() * canvas.height - canvas.height/2,
      z: Math.random() * 2000,
      prevZ: 0
    }));

    // Nebula properties
    interface NebulaCloud {
      x: number;
      y: number;
      size: number;
      color: string;
      opacity: number;
      speed: number;
    }

    // Create nebula clouds
    const nebulaClouds: NebulaCloud[] = Array(15).fill(null).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 200 + 100,
      color: \`hsl(\${Math.random() * 60 + 240}, 70%, 50%)\`, // Blue to purple
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
          star.x = Math.random() * canvas.width - canvas.width/2;
          star.y = Math.random() * canvas.height - canvas.height/2;
        }
      });
    }

    function drawStars() {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      stars.forEach(star => {
        const sx = map(star.x / star.z, 0, 1, 0, canvas.width) + cx;
        const sy = map(star.y / star.z, 0, 1, 0, canvas.height) + cy;
        const px = map(star.x / star.prevZ, 0, 1, 0, canvas.width) + cx;
        const py = map(star.y / star.prevZ, 0, 1, 0, canvas.height) + cy;
        
        const size = map(star.z, 0, 2000, 3, 0);
        const opacity = map(star.z, 0, 2000, 1, 0);

        ctx.beginPath();
        ctx.strokeStyle = \`rgba(255, 255, 255, \${opacity})\`;
        ctx.lineWidth = size;
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      });
    }

    function drawNebula(time: number) {
      nebulaClouds.forEach(cloud => {
        const gradient = ctx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, cloud.size
        );

        // Создаем пульсацию
        const pulseOpacity = Math.sin(time * 0.001 * cloud.speed) * 0.2 + 0.8;
        
        gradient.addColorStop(0, \`\${cloud.color}\`);
        gradient.addColorStop(0.4, \`\${cloud.color}88\`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = cloud.opacity * pulseOpacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Медленно двигаем облака
        cloud.x += cloud.speed;
        cloud.y += cloud.speed * 0.5;

        // Возвращаем облака на экран
        if (cloud.x > canvas.width + cloud.size) cloud.x = -cloud.size;
        if (cloud.y > canvas.height + cloud.size) cloud.y = -cloud.size;
      });
      
      ctx.globalAlpha = 1;
    }

    // Utility function for mapping ranges
    function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
      return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    }

    function draw(time: number) {
      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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