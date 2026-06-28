'use client';

import { useRef, useCallback } from 'react';

export default function TiltCard({ children, className = '', tiltDegree = 8, perspective = 1000 }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -tiltDegree;
    const ry = ((x - cx) / cx) * tiltDegree;
    el.style.transform =
      `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
  }, [tiltDegree, perspective]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  }, [perspective]);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
}
