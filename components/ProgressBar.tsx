'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar = ({ progress, className = '' }: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);
  
  return (
    <div className={`w-full h-3 bg-black/60 rounded-full overflow-hidden backdrop-blur-sm border border-red-900/30 ${className}`}>
      <motion.div 
        className="h-full bg-gradient-to-r from-red-600 via-red-400 to-purple-600 relative rounded-full shadow-glow-red"
        initial={{ width: 0 }}
        animate={{ width: `${displayProgress}%` }}
        transition={{
          duration: shouldReduceMotion ? 0.3 : 0.8,
          ease: "easeOut"
        }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${Math.round(progress)}%`}
      >
        {!shouldReduceMotion && (
          <>
            <div className="absolute inset-0 bg-shimmer animate-shimmer opacity-50" />
            <motion.div 
              className="absolute top-0 right-0 w-2 h-full bg-white/80 blur-sm"
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ProgressBar;