import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export function AnimatedBackground() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let particles = [];
        let animationFrameId;
        // Set canvas size
        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };
        // Create particles
        const initParticles = () => {
            particles = [];
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3
                });
            }
        };
        // Draw connecting lines between nearby particles
        const connectParticles = () => {
            const maxDistance = 150;
            const isDark = document.documentElement.classList.contains('dark');
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = isDark
                            ? `rgba(236, 72, 153, ${opacity})` // pink in dark mode
                            : `rgba(219, 39, 119, ${opacity})`; // darker pink in light mode
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Update and draw particles
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width)
                    particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height)
                    particle.speedY *= -1;
                // Draw particle
                const isDark = document.documentElement.classList.contains('dark');
                ctx.fillStyle = isDark
                    ? 'rgba(236, 72, 153, 0.3)' // pink in dark mode
                    : 'rgba(219, 39, 119, 0.3)'; // darker pink in light mode
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            connectParticles();
            animationFrameId = requestAnimationFrame(animate);
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        animate();
        // Cleanup
        return () => {
            window.removeEventListener('resize', updateSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return (_jsx("canvas", { ref: canvasRef, className: "fixed inset-0 pointer-events-none", style: { zIndex: 0 } }));
}
