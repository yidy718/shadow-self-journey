'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, User, UserX, Sparkles, Brain, ArrowRight, AlertTriangle, BookOpen, Clock, Heart, Shield, Phone } from 'lucide-react';
import { ParticleField } from './ParticleField';
import { IntensitySlider } from './IntensitySlider';
import { getUserPreferences, createNewUser, saveUserPreferences, clearUserData, type UserPreferences } from '../lib/userPreferences';
import type { IntensityLevel } from '../lib/questions';

interface WelcomeScreenProps {
  onContinue: (userPrefs: UserPreferences) => void;
  onDeepAnalysis?: () => void;
}

export const WelcomeScreen = ({ onContinue, onDeepAnalysis }: WelcomeScreenProps) => {
  const [currentStep, setCurrentStep] = useState<'identity' | 'intro' | 'preparation' | 'intensity' | 'preview' | 'safety' | 'warning'>('identity');
  const [userName, setUserName] = useState('');
  const [existingUser, setExistingUser] = useState<UserPreferences | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityLevel>('moderate');

  useEffect(() => {
    const existing = getUserPreferences();
    setExistingUser(existing);
  }, []);

  const handleReturnUser = () => {
    if (existingUser) {
      // Check if user has completed quiz (has quiz progress with full answers) OR assessment history
      const hasCompletedQuiz = existingUser.currentQuizProgress && 
        Object.keys(existingUser.currentQuizProgress.answers).length >= 8; // 8 questions in quiz
      const hasAssessmentHistory = existingUser.assessmentHistory.length > 0;
      
      if (hasCompletedQuiz || hasAssessmentHistory) {
        // Take them straight to results
        onContinue(existingUser);
      } else {
        // No assessments yet, show intro to choose path
        setCurrentStep('intro');
      }
    }
  };

  const handleNewIdentity = () => {
    clearUserData(); // Clear all user data including journal
    setExistingUser(null);
    setCurrentStep('identity');
  };

  const handleAnonymous = () => {
    const newUser = createNewUser();
    saveUserPreferences(newUser);
    setCurrentStep('intensity');
  };

  const handleWithName = () => {
    if (!userName.trim()) {
      setShowNameInput(true);
      return;
    }
    const newUser = createNewUser(userName);
    saveUserPreferences(newUser);
    setCurrentStep('intensity');
  };

  const handleArchetypeAssessment = () => {
    setCurrentStep('preparation');
  };

  const handleDeepAnalysisStart = () => {
    // Save intensity level first, then start Deep Analysis
    const userPrefs = getUserPreferences()!;
    userPrefs.intensityLevel = selectedIntensity;
    saveUserPreferences(userPrefs);
    
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
                  {(() => {
                    const hasCompletedQuiz = existingUser.currentQuizProgress && 
                      Object.keys(existingUser.currentQuizProgress.answers).length >= 8;
                    const assessmentCount = existingUser.assessmentHistory.length + (hasCompletedQuiz ? 1 : 0);
                    return `${assessmentCount} previous assessment${assessmentCount !== 1 ? 's' : ''}`;
                  })()}
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

          {/* Only show identity options if there's no existing user */}
          {!existingUser && (
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
          )}
        </motion.div>
      </div>
    );
  }

  // Preparation - What is Shadow Work
  if (currentStep === 'preparation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={30} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <BookOpen className="w-20 h-20 text-purple-400 mx-auto mb-8" />
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            Understanding Shadow Work
          </h1>
          
          <div className="bg-black/40 rounded-3xl p-8 glass mb-8">
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-xl font-semibold text-purple-200 mb-3">What is the Shadow?</h3>
                <p className="text-gray-300 leading-relaxed">
                  Your shadow contains the parts of yourself you've learned to hide, reject, or ignore. 
                  It's not evil - it's simply unconscious. Carl Jung believed that integrating these 
                  hidden aspects leads to psychological wholeness and authentic self-knowledge.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-purple-200 mb-3">Why Explore It?</h3>
                <p className="text-gray-300 leading-relaxed">
                  When we don't acknowledge our shadow, it influences us unconsciously through 
                  projection, self-sabotage, and repeated patterns. By bringing awareness to these 
                  parts, we gain choice over our reactions and behaviors.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-purple-200 mb-3">Our Approach</h3>
                <p className="text-gray-300 leading-relaxed">
                  We treat shadow patterns as intelligent adaptations, not pathology. Every "negative" 
                  trait served a purpose. Our goal is integration - honoring these parts while 
                  choosing how they express in your life.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3 text-gray-400 mb-8">
            <Clock className="w-5 h-5" />
            <span>Estimated time: 15-25 minutes for core assessment</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep('preview')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-purple-500/30"
          >
            See What to Expect
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Intensity Selection Step
  if (currentStep === 'intensity') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={25} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-6xl mx-auto"
        >
          <IntensitySlider 
            value={selectedIntensity}
            onChange={setSelectedIntensity}
            className="mb-8"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep('identity')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              ← Back
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Save intensity level and continue to intro
                const userPrefs = getUserPreferences()!;
                userPrefs.intensityLevel = selectedIntensity;
                saveUserPreferences(userPrefs);
                setCurrentStep('intro');
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Continue to Assessment Options
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Preview - Sample Question and Archetype
  if (currentStep === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={25} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <Eye className="w-16 h-16 text-blue-400 mx-auto mb-8" />
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            Intensity Preview
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Sample Question */}
            <div className="bg-black/40 rounded-3xl p-8 glass">
              <h3 className="text-2xl font-semibold text-blue-200 mb-4">Sample Question</h3>
              <div className="bg-blue-900/30 rounded-2xl p-6 mb-4">
                <p className="text-blue-100 font-medium mb-4">
                  "When you look in the mirror late at night, what truth about yourself do you refuse to acknowledge?"
                </p>
                <div className="text-sm text-blue-200">
                  Questions explore your relationship with yourself, others, and hidden motivations.
                </div>
              </div>
            </div>
            
            {/* Sample Archetype */}
            <div className="bg-black/40 rounded-3xl p-8 glass">
              <h3 className="text-2xl font-semibold text-green-200 mb-4">Example Insight</h3>
              <div className="bg-green-900/30 rounded-2xl p-6 mb-4">
                <h4 className="text-green-100 font-semibold mb-3">The Self-Destroyer</h4>
                <p className="text-green-100 text-sm mb-3">
                  "Your self-criticism isn't your truth - it's learned behavior from wounds that taught you to attack yourself first."
                </p>
                <div className="text-xs text-green-200">
                  Archetypes come with integration guidance, not judgment.
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="text-yellow-100 font-medium mb-2">
                  Emotional Intensity Level: Moderate to Deep
                </p>
                <p className="text-yellow-200 text-sm">
                  Questions may bring up uncomfortable feelings or memories. This is normal and often part of growth. 
                  You can pause anytime.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep('preparation')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              ← Back
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep('safety')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              I'm Ready to Continue
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Safety Resources
  if (currentStep === 'safety') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={20} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <Shield className="w-16 h-16 text-green-400 mx-auto mb-8" />
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            Your Safety Matters
          </h1>
          
          <div className="bg-black/40 rounded-3xl p-8 glass mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <h3 className="text-xl font-semibold text-green-200 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  During Your Journey
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Take breaks whenever you need them</li>
                  <li>• Skip questions that feel too overwhelming</li>
                  <li>• Remember this is self-exploration, not therapy</li>
                  <li>• Trust your instincts about your capacity</li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="text-xl font-semibold text-green-200 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Professional Support
                </h3>
                <div className="space-y-3 text-gray-300 text-sm">
                  <div className="bg-green-900/30 rounded-xl p-4">
                    <p className="font-medium text-green-100">Crisis Support</p>
                    <p>🇺🇸 USA: Text HOME to 741741</p>
                    <p>🇨🇦 Canada: Text CONNECT to 686868</p>
                  </div>
                  <div className="bg-green-900/30 rounded-xl p-4">
                    <p className="font-medium text-green-100">Suicide Prevention Lifeline</p>
                    <p>🇺🇸🇨🇦 Call or Text 988 (USA & Canada)</p>
                  </div>
                  <p className="text-xs text-green-200 mt-4">
                    If this work brings up overwhelming feelings, consider speaking with a mental health professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3 text-gray-400 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Trauma-informed approach</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Non-diagnostic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Integration-focused</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep('preview')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              ← Back
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep('warning')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              I Understand - Begin Journey
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Final Ready screen (simplified)
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleField count={15} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-2xl"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <Eye className="w-20 h-20 text-purple-400 mx-auto mb-8" />
        </motion.div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Begin
        </h2>
        
        <div className="bg-purple-900/20 border border-purple-500/40 rounded-2xl p-6 mb-8">
          <p className="text-purple-100 leading-relaxed">
            You're prepared for this journey. Trust yourself, take your time, and remember - 
            this is about integration, not judgment.
          </p>
        </div>
        
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400 mb-8"
        >
          Beginning your shadow work assessment...
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onContinue(getUserPreferences()!)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-purple-500/30"
        >
          Begin Assessment
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;