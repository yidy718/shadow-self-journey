'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, User, UserX, Sparkles, Brain, ArrowRight, AlertTriangle } from 'lucide-react';
import { ParticleField } from './ParticleField';
import { getUserPreferences, createNewUser, saveUserPreferences, clearUserData, type UserPreferences } from '../lib/userPreferences';

interface WelcomeScreenProps {
  onContinue: (userPrefs: UserPreferences) => void;
  onDeepAnalysis?: () => void;
}

export const WelcomeScreen = ({ onContinue, onDeepAnalysis }: WelcomeScreenProps) => {
  const [currentStep, setCurrentStep] = useState<'identity' | 'intro' | 'warning'>('identity');
  const [userName, setUserName] = useState('');
  const [existingUser, setExistingUser] = useState<UserPreferences | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    const existing = getUserPreferences();
    setExistingUser(existing);
  }, []);

  const handleReturnUser = () => {
    if (existingUser) {
      // If user has assessment history, take them straight to results
      if (existingUser.assessmentHistory.length > 0) {
        onContinue(existingUser);
      } else {
        // No assessments yet, show intro to choose path
        setCurrentStep('intro');
      }
    }
  };

  const handleNewIdentity = () => {
    setCurrentStep('identity');
  };

  const handleAnonymous = () => {
    const newUser = createNewUser();
    saveUserPreferences(newUser);
    setCurrentStep('intro');
  };

  const handleWithName = () => {
    if (!userName.trim()) {
      setShowNameInput(true);
      return;
    }
    const newUser = createNewUser(userName);
    saveUserPreferences(newUser);
    setCurrentStep('intro');
  };

  const handleArchetypeAssessment = () => {
    setCurrentStep('warning');
    setTimeout(() => onContinue(getUserPreferences()!), 2000);
  };

  const handleDeepAnalysisStart = () => {
    if (onDeepAnalysis) {
      onDeepAnalysis();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={40} />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 text-center max-w-5xl"
        >
          <motion.div variants={itemVariants} className="mb-12 relative">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Eye className="w-32 h-32 text-red-400 mx-auto mb-6" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-black rounded-full w-32 h-32 mx-auto opacity-20 animate-pulse-glow" />
            <Sparkles className="w-6 h-6 text-red-300 absolute top-4 right-1/3 animate-pulse" />
            <Sparkles className="w-4 h-4 text-red-200 absolute bottom-8 left-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-white to-black mb-6 sm:mb-8 tracking-tight hover:scale-105 transition-transform duration-300 cursor-default"
          >
            THE ABYSS
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl text-red-200 mb-6 sm:mb-8 font-light tracking-wide"
          >
            Gazes Back
          </motion.p>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed font-light italic px-4"
          >
            "He who fights monsters should be careful lest he thereby become a monster. 
            And if you gaze long into an abyss, the abyss also gazes into you." — Nietzsche
          </motion.p>


          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleArchetypeAssessment}
                className="group btn-primary text-lg sm:text-xl px-6 sm:px-8 py-4 sm:py-5 relative overflow-hidden transition-all duration-300 hover:shadow-2xl flex-1"
                aria-label="Begin the shadow archetype assessment"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <Brain className="mr-2 sm:mr-3 w-6 h-6" />
                  Archetype Assessment
                  <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>

              {onDeepAnalysis && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeepAnalysisStart}
                  className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg sm:text-xl px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl relative overflow-hidden flex-1"
                  aria-label="Begin deep behavioral analysis"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Eye className="mr-2 sm:mr-3 w-6 h-6" />
                    Deep Analysis
                    <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.button>
              )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'identity') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={30} />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-3xl"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-5xl font-bold text-white mb-6"
          >
            How shall we address you in the darkness?
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-300 mb-12 leading-relaxed"
          >
            Your choice affects only your local experience. No data leaves your device.
          </motion.p>

          <AnimatePresence>
            {existingUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-6 bg-purple-900/30 border border-purple-500/40 rounded-2xl max-w-md mx-auto"
              >
                <h3 className="text-purple-200 font-semibold mb-2">
                  Welcome back{existingUser.name ? `, ${existingUser.name}` : ''}
                </h3>
                <p className="text-purple-300 text-sm mb-4">
                  {existingUser.assessmentHistory.length} previous assessment{existingUser.assessmentHistory.length !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleReturnUser}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                  >
                    Continue Journey
                  </button>
                  <button
                    onClick={() => {
                      clearUserData(); // Clear all user data including journal
                      setExistingUser(null);
                      setCurrentStep('identity');
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                  >
                    New Identity
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-6 max-w-md mx-auto">
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnonymous}
              className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-500/30 hover:border-gray-400/50 rounded-2xl p-6 text-left transition-all duration-300 group"
            >
              <div className="flex items-center mb-3">
                <UserX className="w-6 h-6 text-gray-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Anonymous</h3>
              </div>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Journey nameless into the abyss. Each session resets, leaving no trace.
              </p>
            </motion.button>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNameInput(!showNameInput)}
                className="w-full bg-purple-800/80 hover:bg-purple-700/80 border border-purple-500/30 hover:border-purple-400/50 rounded-2xl p-6 text-left transition-all duration-300 group"
              >
                <div className="flex items-center mb-3">
                  <User className="w-6 h-6 text-purple-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Named Journey</h3>
                </div>
                <p className="text-purple-200 group-hover:text-purple-100 transition-colors">
                  Carry a name through your shadow work. Progress saved locally.
                </p>
              </motion.button>

              <AnimatePresence>
                {showNameInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Enter your name or chosen identity..."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-gray-800/80 text-white p-4 rounded-xl border border-purple-500/30 focus:border-purple-400/70 transition-colors text-center"
                      onKeyPress={(e) => e.key === 'Enter' && handleWithName()}
                      autoFocus
                    />
                    <button
                      onClick={handleWithName}
                      disabled={!userName.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Begin Named Journey
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Warning screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleField count={20} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-3xl"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-8" />
        </motion.div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          PSYCHOLOGICAL DEPTH WARNING
        </h2>
        
        <div className="bg-red-900/20 border border-red-500/40 rounded-2xl p-8 mb-8 text-left">
          <p className="text-red-100 leading-relaxed mb-4">
            This journey explores the darkest recesses of the human psyche. You will confront thoughts, 
            feelings, and aspects of yourself you may have never acknowledged.
          </p>
          <p className="text-red-200 font-medium">
            Consider speaking with a mental health professional if this material brings up overwhelming feelings.
          </p>
        </div>
        
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400"
        >
          Preparing your descent...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;