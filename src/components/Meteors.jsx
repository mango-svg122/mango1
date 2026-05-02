import React, { useEffect, useRef } from 'react';

const Meteors = () => {
  const canvasRef = useRef(null);
  const meteorsRef = useRef([]);
  const animationRef = useRef(null);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    class Meteor {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        const depth = Math.random();

        this.x = Math.random() * width * 1.5;
        this.y = initial ? Math.random() * height * 0.6 : -50;
        this.depth = depth;

        this.length = 100 + depth * 200 + Math.random() * 150;
        this.speed = (1.5 + Math.random() * 4) * (0.5 + depth * 0.5);
        this.opacity = 0.4 + Math.random() * 0.4;
        this.width = 1 + depth * 1.5;

        const baseHue = 200 + Math.random() * 60;
        this.headColor = `hsla(${baseHue}, 80%, 90%, ${this.opacity})`;
        this.tailColor = `hsla(${baseHue}, 70%, 70%, 0)`;

        const angle = 28 + Math.random() * 20;
        const radians = (angle * Math.PI) / 180;
        this.vx = Math.cos(radians) * this.speed;
        this.vy = Math.sin(radians) * this.speed;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.y > height + 100 || this.x > width + 100) {
          this.reset();
        }
      }

      draw(ctx) {
        const tailX = this.x - this.vx * (this.length / this.speed);
        const tailY = this.y - this.vy * (this.length / this.speed);

        const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        gradient.addColorStop(0, this.tailColor);
        gradient.addColorStop(0.5, this.headColor);
        gradient.addColorStop(1, `hsla(60, 100%, 95%, ${this.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        const glowSize = 3 + this.depth * 4;
        const glowGradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, glowSize
        );
        glowGradient.addColorStop(0, `hsla(60, 100%, 95%, ${this.opacity * 0.7})`);
        glowGradient.addColorStop(0.4, `hsla(${200 + this.depth * 60}, 80%, 80%, ${this.opacity * 0.3})`);
        glowGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
      }
    }

    const spawnMeteor = () => {
      const now = Date.now();
      const spawnInterval = 10000 + Math.random() * 10000;

      if (now - lastSpawnRef.current > spawnInterval) {
        meteorsRef.current.push(new Meteor());
        lastSpawnRef.current = now;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      spawnMeteor();

      for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
        const m = meteorsRef.current[i];
        m.update();
        m.draw(ctx);

        if (m.y > height + 100 || m.x > width + 100) {
          meteorsRef.current.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }} />;
};

export default Meteors;