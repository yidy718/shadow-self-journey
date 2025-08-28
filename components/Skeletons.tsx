'use client';

import { motion } from 'framer-motion';
import React from 'react';

// Base skeleton animation
const skeletonPulse = {
  initial: { opacity: 0.4 },
  animate: { opacity: 1 },
  transition: { duration: 1, repeat: Infinity, repeatType: 'reverse' as const }
};

// Generic skeleton component
const SkeletonBox = ({ className = '', ...props }) => (
  <motion.div
    {...skeletonPulse}
    className={`bg-gray-600/30 rounded-lg ${className}`}
    {...props}
  />
);

// Text line skeleton
export const SkeletonText = ({ 
  lines = 1, 
  className = '',
  width = '100%' 
}: { 
  lines?: number; 
  className?: string; 
  width?: string | string[];
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox
        key={i}
        className="h-4"
        style={{ 
          width: Array.isArray(width) 
            ? width[i % width.length] 
            : i === lines - 1 && lines > 1 
              ? '75%' 
              : width 
        }}
      />
    ))}
  </div>
);

// Question skeleton for quiz loading
export const QuestionSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
    {/* Progress bar skeleton */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
      <motion.div
        className="h-full bg-red-500/30"
        initial={{ width: '0%' }}
        animate={{ width: '45%' }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </div>

    {/* Question counter skeleton */}
    <div className="absolute top-8 right-8">
      <SkeletonBox className="w-20 h-10 rounded-full" />
    </div>

    <div className="max-w-7xl w-full px-4">
      {/* Question title skeleton */}
      <div className="text-center mb-20">
        <SkeletonBox className="w-16 h-16 rounded mx-auto mb-10" />
        <div className="max-w-5xl mx-auto space-y-4 mb-8">
          <SkeletonText lines={2} width={['90%', '75%']} className="text-center" />
        </div>
        <SkeletonText lines={1} width="60%" className="text-center max-w-3xl mx-auto" />
      </div>

      {/* Options skeleton */}
      <div className="grid gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="btn-secondary p-8 mx-4 sm:mx-0 relative"
          >
            <SkeletonText lines={2} width={['85%', '70%']} />
          </motion.div>
        ))}
      </div>

      {/* Skip button skeleton */}
      <div className="text-center mt-12">
        <SkeletonBox className="w-40 h-12 rounded-xl mx-auto" />
      </div>
    </div>
  </div>
);

// Results skeleton for results page
export const ResultsSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex flex-col justify-center items-center relative p-4">
    <div className="max-w-6xl w-full mx-auto">
      {/* Header skeleton */}
      <div className="text-center mb-16">
        <SkeletonBox className="w-20 h-20 rounded-full mx-auto mb-8" />
        <SkeletonText lines={1} width="60%" className="text-center max-w-2xl mx-auto mb-4" />
        <SkeletonText lines={2} width={['80%', '65%']} className="text-center max-w-4xl mx-auto" />
      </div>

      {/* Archetype cards skeleton */}
      <div className="space-y-8 mb-12">
        {/* Main archetype */}
        <div className="bg-white/10 rounded-2xl p-10 glass">
          <SkeletonText lines={1} width="40%" className="text-center mb-6" />
          <SkeletonText lines={3} width={['95%', '85%', '90%']} className="text-center" />
        </div>

        {/* Deep Truth */}
        <div className="bg-yellow-900/30 rounded-2xl p-10 glass">
          <SkeletonText lines={1} width="30%" className="text-center mb-6" />
          <SkeletonText lines={2} width={['90%', '75%']} className="text-center" />
        </div>

        {/* Integration Path */}
        <div className="bg-green-900/40 rounded-2xl p-10 glass">
          <SkeletonText lines={1} width="35%" className="text-center mb-6" />
          <SkeletonText lines={2} width={['85%', '80%']} className="text-center" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="btn-secondary p-6 text-center"
          >
            <SkeletonBox className="w-8 h-8 mx-auto mb-3" />
            <SkeletonText lines={1} width="60%" className="text-center mb-2" />
            <SkeletonText lines={1} width="80%" className="text-center" />
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Chat loading skeleton
export const ChatLoadingSkeleton = () => (
  <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-8 glass">
    <div className="flex items-center mb-4">
      <SkeletonBox className="w-6 h-6 rounded mr-3" />
      <SkeletonText lines={1} width="40%" />
    </div>
    
    <div className="space-y-4">
      <SkeletonText lines={4} width={['95%', '88%', '92%', '75%']} />
      
      <div className="flex items-center space-x-3 pt-4">
        <motion.div
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
        <span className="text-purple-200 text-sm ml-2">Sage is thinking...</span>
      </div>
    </div>
  </div>
);

// Deep Analysis loading skeleton
export const DeepAnalysisSkeleton = ({ phase }: { phase: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-blue-900/20 flex items-center justify-center p-4">
    <div className="max-w-4xl w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <SkeletonBox className="w-full h-full rounded-full" />
        </motion.div>
        <SkeletonText lines={1} width="50%" className="text-center mb-4" />
        <SkeletonText lines={1} width="70%" className="text-center" />
      </div>

      {/* Analysis progress */}
      <div className="bg-black/40 rounded-3xl p-8 glass mb-8">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <motion.div
                className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  ease: 'linear',
                  delay: i * 0.2
                }}
              />
              <div className="flex-1">
                <SkeletonText lines={1} width="80%" />
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ 
                      duration: 3, 
                      delay: i * 0.5,
                      ease: 'easeInOut'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current phase indicator */}
      <div className="text-center">
        <div className="bg-purple-900/30 rounded-2xl p-4 inline-block">
          <SkeletonText lines={1} width="200px" className="text-center" />
        </div>
      </div>
    </div>
  </div>
);

// Export loading skeleton
export const ExportLoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center space-x-3"
  >
    <motion.div
      className="w-4 h-4 border border-green-400 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
    <SkeletonText lines={1} width="120px" />
  </motion.div>
);

// List skeleton for journal entries, exercises, etc.
export const ListSkeleton = ({ 
  items = 3, 
  showAvatar = false,
  className = ''
}: { 
  items?: number; 
  showAvatar?: boolean;
  className?: string;
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1, duration: 0.4 }}
        className="bg-gray-800/40 rounded-xl p-4"
      >
        <div className="flex space-x-4">
          {showAvatar && <SkeletonBox className="w-12 h-12 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-3">
            <SkeletonText lines={1} width="60%" />
            <SkeletonText lines={2} width={['90%', '75%']} />
            <div className="flex space-x-2">
              <SkeletonBox className="w-16 h-6 rounded" />
              <SkeletonBox className="w-16 h-6 rounded" />
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);