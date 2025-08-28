'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, Flower, Waves, Wind, Coffee, Sparkles } from 'lucide-react';

interface MicroBreakProps {
  onContinue: () => void;
  onSkip: () => void;
  intensity?: 'gentle' | 'moderate' | 'deep' | 'intense';
  questionNumber?: number;
  totalQuestions?: number;
}

interface BreakSuggestion {
  icon: React.ComponentType<any>;
  title: string;
  duration: string;
  description: string;
  action: string;
  color: string;
}

const getBreakSuggestions = (intensity: string = 'moderate'): BreakSuggestion[] => {
  const baseBreaks: BreakSuggestion[] = [
    {
      icon: Heart,
      title: "Breathing Space",
      duration: "30 seconds",
      description: "Take three deep breaths to center yourself",
      action: "Inhale for 4, hold for 4, exhale for 6",
      color: "text-pink-400"
    },
    {
      icon: Waves,
      title: "Mindful Moment",
      duration: "1 minute", 
      description: "Notice what you're feeling right now",
      action: "Name 3 things you can sense around you",
      color: "text-blue-400"
    },
    {
      icon: Coffee,
      title: "Hydration Break",
      duration: "30 seconds",
      description: "Take a sip of water and reset",
      action: "Drink slowly and mindfully",
      color: "text-amber-400"
    },
    {
      icon: Flower,
      title: "Gentle Stretch",
      duration: "1 minute",
      description: "Move your body to release tension",
      action: "Roll shoulders, stretch neck, wiggle fingers",
      color: "text-green-400"
    }
  ];

  const intensityBreaks: BreakSuggestion[] = [
    {
      icon: Wind,
      title: "Reset Moment",
      duration: "2 minutes",
      description: "Step back from the intensity and breathe",
      action: "Feel your feet on the ground, breathe deeply",
      color: "text-cyan-400"
    },
    {
      icon: Sparkles,
      title: "Self-Compassion",
      duration: "1 minute",
      description: "Remind yourself you're doing brave work",
      action: "Place hand on heart, offer yourself kindness",
      color: "text-purple-400"
    }
  ];

  if (intensity === 'deep' || intensity === 'intense') {
    return [...baseBreaks, ...intensityBreaks];
  }

  return baseBreaks;
};

export const MicroBreak: React.FC<MicroBreakProps> = ({
  onContinue,
  onSkip,
  intensity = 'moderate',
  questionNumber,
  totalQuestions
}) => {
  const [selectedBreak, setSelectedBreak] = useState<BreakSuggestion | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  const breakSuggestions = getBreakSuggestions(intensity);
  
  // Auto-select a random break suggestion
  useEffect(() => {
    const randomBreak = breakSuggestions[Math.floor(Math.random() * breakSuggestions.length)];
    setSelectedBreak(randomBreak);
  }, []);

  const startBreak = (duration: string) => {
    const seconds = duration.includes('30 seconds') ? 30 : 
                   duration.includes('1 minute') ? 60 : 
                   duration.includes('2 minutes') ? 120 : 60;
    
    setTimeRemaining(seconds);
    setIsActive(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!isActive || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setIsActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-2xl mx-auto bg-black/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/30"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4"
          >
            <Heart className="w-12 h-12 text-pink-400 mx-auto" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Time for a Micro-Break
          </h2>
          
          <p className="text-gray-300 mb-4">
            You've been exploring deep territory. Let's pause and recharge.
          </p>
          
          {questionNumber && totalQuestions && (
            <p className="text-sm text-gray-400">
              Progress: {questionNumber} of {totalQuestions} questions
            </p>
          )}
        </div>

        {/* Break Timer */}
        {isActive && timeRemaining !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-8 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30"
          >
            <div className="text-4xl font-bold text-white mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-purple-200">
              {selectedBreak?.action}
            </p>
          </motion.div>
        )}

        {/* Break Suggestions */}
        {!isActive && selectedBreak && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/40">
              <div className="flex items-center mb-4">
                <selectedBreak.icon className={`w-6 h-6 mr-3 ${selectedBreak.color}`} />
                <h3 className="text-xl font-semibold text-white">
                  {selectedBreak.title}
                </h3>
                <span className="ml-auto text-gray-400 text-sm">
                  {selectedBreak.duration}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">
                {selectedBreak.description}
              </p>
              
              <p className="text-gray-400 text-sm italic">
                "{selectedBreak.action}"
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!isActive ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectedBreak && startBreak(selectedBreak.duration)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Start Break
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSkip}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Skip & Continue
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsActive(false);
                setTimeRemaining(null);
                onContinue();
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              End Break Early
            </motion.button>
          )}
        </div>

        {/* Auto-continue when timer ends */}
        {!isActive && timeRemaining === null && selectedBreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
            >
              Continue Journey
            </motion.button>
          </motion.div>
        )}

        {/* Other break options */}
        {!isActive && (
          <div className="mt-6 pt-6 border-t border-gray-600/30">
            <p className="text-gray-400 text-sm mb-3 text-center">
              Or choose a different break:
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              {breakSuggestions
                .filter(breakSugg => breakSugg !== selectedBreak)
                .slice(0, 3)
                .map((breakSugg, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedBreak(breakSugg)}
                    className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white text-xs rounded-lg transition-all duration-300"
                  >
                    <breakSugg.icon className={`w-3 h-3 inline mr-1 ${breakSugg.color}`} />
                    {breakSugg.title}
                  </motion.button>
                ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MicroBreak;