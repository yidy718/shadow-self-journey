'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flower, Waves, Flame, Zap } from 'lucide-react';
import type { IntensityLevel } from '../lib/questions';

interface IntensitySliderProps {
  value: IntensityLevel;
  onChange: (intensity: IntensityLevel) => void;
  className?: string;
}

interface IntensityOption {
  level: IntensityLevel;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  example: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const intensityOptions: IntensityOption[] = [
  {
    level: 'gentle',
    label: 'Gentle',
    icon: Flower,
    description: 'Soft self-reflection with supportive guidance',
    example: '"What do you sometimes wish was different?"',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-500/40'
  },
  {
    level: 'moderate',
    label: 'Moderate',
    icon: Waves,
    description: 'Balanced introspection with gentle challenges',
    example: '"What do you tend to hide from others?"',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500/40'
  },
  {
    level: 'deep',
    label: 'Deep',
    icon: Flame,
    description: 'Profound psychological exploration',
    example: '"What truth do you refuse to acknowledge?"',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500/40'
  },
  {
    level: 'intense',
    label: 'Intense',
    icon: Zap,
    description: 'Maximum depth confrontational shadow work',
    example: '"What reality would shatter your self-image?"',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500/40'
  }
];

export const IntensitySlider = ({ value, onChange, className = '' }: IntensitySliderProps) => {
  const [hoveredLevel, setHoveredLevel] = useState<IntensityLevel | null>(null);

  const selectedOption = intensityOptions.find(option => option.level === value);
  const displayOption = hoveredLevel 
    ? intensityOptions.find(option => option.level === hoveredLevel)
    : selectedOption;

  return (
    <div className={`bg-black/40 rounded-3xl p-8 glass ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-3">Choose Your Depth</h2>
        <p className="text-gray-300 text-sm max-w-2xl mx-auto">
          How deeply do you want to explore your shadow? You can change this anytime during your journey.
        </p>
      </div>

      {/* Intensity Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {intensityOptions.map((option, index) => {
          const IconComponent = option.icon;
          const isSelected = value === option.level;
          const isHovered = hoveredLevel === option.level;
          
          return (
            <motion.button
              key={option.level}
              onClick={() => onChange(option.level)}
              onMouseEnter={() => setHoveredLevel(option.level)}
              onMouseLeave={() => setHoveredLevel(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? `${option.bgColor} ${option.borderColor} shadow-lg`
                  : 'bg-gray-800/40 border-gray-600/40 hover:border-gray-500/60'
              }`}
            >
              <div className="flex items-center mb-3">
                <IconComponent 
                  className={`w-6 h-6 mr-3 ${
                    isSelected || isHovered ? option.color : 'text-gray-400'
                  }`} 
                />
                <h3 className={`font-semibold ${
                  isSelected || isHovered ? 'text-white' : 'text-gray-300'
                }`}>
                  {option.label}
                </h3>
              </div>
              
              <p className={`text-sm mb-3 ${
                isSelected || isHovered ? 'text-gray-200' : 'text-gray-400'
              }`}>
                {option.description}
              </p>
              
              {/* Intensity Indicator */}
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 w-4 rounded-full transition-colors ${
                      level <= index + 1
                        ? isSelected || isHovered
                          ? option.color.replace('text-', 'bg-')
                          : 'bg-gray-500'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Option Details */}
      {displayOption && (
        <motion.div
          key={displayOption.level}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${displayOption.bgColor} rounded-2xl p-6 border ${displayOption.borderColor}`}
        >
          <div className="flex items-center mb-4">
            <displayOption.icon className={`w-8 h-8 mr-3 ${displayOption.color}`} />
            <h3 className="text-xl font-bold text-white">
              {displayOption.label} Shadow Work
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">What to Expect:</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {displayOption.description}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">Example Question:</h4>
              <p className={`text-sm italic ${displayOption.color} leading-relaxed`}>
                {displayOption.example}
              </p>
            </div>
          </div>

          {displayOption.level === 'intense' && (
            <div className="mt-4 pt-4 border-t border-red-500/20">
              <p className="text-red-200 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Intense mode explores the deepest psychological depths. Consider professional support if overwhelming.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default IntensitySlider;