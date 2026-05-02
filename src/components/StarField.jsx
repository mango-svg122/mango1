import React, { useEffect, useRef } from 'react';

const StarField = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const createStars = () => {
      const stars = [];
      const starCount = Math.floor((width * height) / 3000);

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          baseAlpha: Math.random() * 0.8 + 0.2,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        });
      }
      return stars;
    };

    starsRef.current = createStars();

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);

      starsRef.current.forEach(star => {
        star.alpha += star.twinkleSpeed * star.twinkleDirection;

        if (star.alpha >= star.baseAlpha) {
          star.twinkleDirection = -1;
        } else if (star.alpha <= star.baseAlpha - 0.3) {
          star.twinkleDirection = 1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        if (star.radius > 1.2 && star.alpha > 0.7) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${star.alpha * 0.15})`;
          ctx.fill();
        }
      });
    };

    const animate = () => {
      drawStars();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      starsRef.current = createStars();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" />;
};

export default StarField;