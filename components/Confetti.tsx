
import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
    onComplete: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const timeoutId = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        const colors = ['#FFC72C', '#FFD700', '#DAA520', '#FFFFFF', '#8A4F4F'];
        const confettiCount = 200;
        const confetti: any[] = [];

        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * canvas.width / dpr,
                y: Math.random() * canvas.height / dpr - canvas.height / dpr,
                r: Math.random() * 5 + 2,
                d: Math.random() * confettiCount,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < confettiCount; i++) {
                const p = confetti[i];
                ctx.beginPath();
                ctx.lineWidth = p.r / 1.5;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt, p.y);
                ctx.lineTo(p.x, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            }

            update();
            animationFrameId.current = requestAnimationFrame(draw);
        };

        const update = () => {
            for (let i = 0; i < confettiCount; i++) {
                const p = confetti[i];
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.d);
                p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

                if (p.y > canvas.height / dpr) {
                    // Reset confetti that goes off screen
                    p.x = Math.random() * canvas.width / dpr;
                    p.y = -10;
                    p.tilt = Math.floor(Math.random() * 10) - 10;
                }
            }
        };

        animationFrameId.current = requestAnimationFrame(draw);

        timeoutId.current = window.setTimeout(() => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            onComplete();
        }, 5000); // Stop animation after 5 seconds

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (timeoutId.current) {
                window.clearTimeout(timeoutId.current);
            }
        };
    }, [onComplete]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1000,
            }}
        />
    );
};

export default Confetti;
