import { useEffect, useRef } from 'react';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fixed agent nodes representing "AI agents"
    const agents = [
      { xPct: 0.2, yPct: 0.25, baseRadius: 8, rgb: '6, 182, 212' },   // cyan (#06B6D4)
      { xPct: 0.5, yPct: 0.65, baseRadius: 10, rgb: '20, 184, 166' }, // teal (#14B8A6)
      { xPct: 0.8, yPct: 0.35, baseRadius: 7, rgb: '6, 182, 212' },   // cyan (#06B6D4)
      { xPct: 0.85, yPct: 0.8, baseRadius: 9, rgb: '20, 184, 166' }   // teal (#14B8A6)
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(45, Math.floor((canvas.width * canvas.height) / 38000));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 2, // 2px to 5px
          speedY: -(Math.random() * 0.3 + 0.1), // Float up slowly
          speedX: (Math.random() * 0.15 - 0.075), // Slight drift
          opacity: Math.random() * 0.2 + 0.3 // low opacity (0.3 to 0.5)
        });
      }
    };

    const drawNetwork = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now();
      const pulseFactor = Math.sin(time / 800);

      // 1. Draw Network Lines connecting nearby particles (cyan tinted)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 140) {
            const alpha = 0.15 * (1 - dist / 140);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 2. Draw Floating Particles (#5eead4 / light teal)
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94, 234, 212, ${p.opacity})`;
        ctx.fill();

        if (!prefersReducedMotion) {
          p.y += p.speedY;
          p.x += p.speedX;

          // Wrap around screen boundaries
          if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < 0 || p.x > canvas.width) {
            p.speedX = -p.speedX;
          }
        }
      });

      // 3. Draw Pulsing Agent Nodes
      agents.forEach(agent => {
        const x = agent.xPct * canvas.width;
        const y = agent.yPct * canvas.height;
        
        // Static values if reduced motion is preferred
        const sizeScale = prefersReducedMotion ? 1 : (1 + pulseFactor * 0.15);
        const glowOpacity = prefersReducedMotion ? 0.25 : (0.25 + pulseFactor * 0.08);
        const coreOpacity = prefersReducedMotion ? 0.8 : (0.7 + pulseFactor * 0.15);
        
        const currentRadius = agent.baseRadius * sizeScale;

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, currentRadius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${agent.rgb}, ${glowOpacity * 0.4})`;
        ctx.fill();

        // Inner glowing circle
        ctx.beginPath();
        ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${agent.rgb}, ${coreOpacity})`;
        ctx.fill();

        // Core white dot
        ctx.beginPath();
        ctx.arc(x, y, currentRadius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });
    };

    const animate = () => {
      drawNetwork();
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default ParticleCanvas;
