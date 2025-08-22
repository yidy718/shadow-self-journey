'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

export const ParticleField = ({ count = 30 }: { count?: number }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const shouldReduceMotion = useReducedMotion();
  
  // Reduce particle count for reduced motion preference
  const adjustedCount = useMemo(() => {
    if (shouldReduceMotion) return Math.max(1, Math.floor(count / 3));
    return count;
  }, [count, shouldReduceMotion]);

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const colors = ['#ffffff', '#fecaca', '#fed7d7', '#fbb6ce', '#e9d5ff'];
    
    for (let i = 0; i < adjustedCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 0.5,
        duration: shouldReduceMotion ? 20 : Math.random() * 25 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setParticles(newParticles);
  }, [adjustedCount, shouldReduceMotion]);

  useEffect(() => {
    generateParticles();
    
    // Regenerate particles periodically for dynamic effect (less frequent if reduced motion)
    const intervalTime = shouldReduceMotion ? 60000 : 30000;
    const interval = setInterval(generateParticles, intervalTime);
    return () => clearInterval(interval);
  }, [generateParticles, shouldReduceMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${shouldReduceMotion ? 'animate-subtle-pulse' : 'particle'}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            backgroundColor: particle.color,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`,
            filter: 'blur(1px)',
            willChange: shouldReduceMotion ? 'opacity' : 'transform, opacity'
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ParticleField;