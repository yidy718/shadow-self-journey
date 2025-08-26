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
  const [currentStep, setCurrentStep] = useState<'splash' | 'quote' | 'identity' | 'intro' | 'preparation' | 'intensity' | 'preview' | 'safety' | 'warning'>('splash');
  const [userName, setUserName] = useState('');
  const [existingUser, setExistingUser] = useState<UserPreferences | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityLevel>('moderate');
  const [gentleMode, setGentleMode] = useState(false);

  // Inspiring quotes for the quote screen
  const quotes = [
    {
      text: "The privilege of a lifetime is being who you are.",
      author: "Joseph Campbell"
    },
    {
      text: "Everything that irritates us about others can lead us to an understanding of ourselves.",
      author: "Carl Jung"
    },
    {
      text: "The most terrifying thing is to accept oneself completely.",
      author: "Carl Jung"
    },
    {
      text: "What we know of ourselves is only a small part of what we are.",
      author: "Carl Jung"
    },
    {
      text: "Your task is not to seek for love, but to find all the barriers within yourself that you have built against it.",
      author: "Rumi"
    },
    {
      text: "The wound is the place where the Light enters you.",
      author: "Rumi"
    }
  ];

  // Random quote selection
  const [selectedQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const existing = getUserPreferences();
    setExistingUser(existing);
  }, []);

  // Auto-progression timing for splash and quote screens
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (currentStep === 'splash') {
      timer = setTimeout(() => {
        setCurrentStep('quote');
      }, 2500); // Show splash for 2.5 seconds (slightly longer to appreciate the animation)
    } else if (currentStep === 'quote') {
      timer = setTimeout(() => {
        setCurrentStep('identity');
      }, 4500); // Show quote for 4.5 seconds (longer to read and appreciate)
    }
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleReturnUser = () => {
    if (existingUser) {
      // Check what data they have to provide best continue experience
      const hasCompletedQuiz = existingUser.currentQuizProgress && 
        existingUser.currentQuizProgress.answers &&
        Object.keys(existingUser.currentQuizProgress.answers).length >= 8; // 8 questions in quiz
      const hasAssessmentHistory = existingUser.assessmentHistory && existingUser.assessmentHistory.length > 0;
      const hasPhase2Data = localStorage.getItem('shadowDeepAnalysisPhase2');
      const hasPartialQuiz = existingUser.currentQuizProgress && 
        existingUser.currentQuizProgress.answers &&
        Object.keys(existingUser.currentQuizProgress.answers).length > 0 &&
        Object.keys(existingUser.currentQuizProgress.answers).length < 8;
      
      // Check additional progress indicators
      const journalEntries = localStorage.getItem('shadowJournalEntries');
      const hasJournalEntries = journalEntries ? JSON.parse(journalEntries).length > 0 : false;
      const conversationHistory = localStorage.getItem('shadowConversations');
      const hasConversations = conversationHistory ? JSON.parse(conversationHistory).length > 0 : false;
      
      // Enhanced Priority System - direct users to best experience
      if (hasPhase2Data && (hasCompletedQuiz || hasAssessmentHistory)) {
        // They have comprehensive data - go to results
        onContinue(existingUser);
      } else if (hasCompletedQuiz || hasAssessmentHistory) {
        // Take them to results (no additional activity yet)
        onContinue(existingUser);
      } else if (hasPartialQuiz) {
        // Continue quiz where they left off
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
    newUser.gentleMode = gentleMode; // Initialize with current gentle mode setting
    saveUserPreferences(newUser);
    setCurrentStep('intensity');
  };

  const handleWithName = () => {
    if (!userName.trim()) {
      setShowNameInput(true);
      return;
    }
    const newUser = createNewUser(userName);
    newUser.gentleMode = gentleMode; // Initialize with current gentle mode setting
    saveUserPreferences(newUser);
    setCurrentStep('intensity');
  };

  const handleArchetypeAssessment = () => {
    setCurrentStep('preparation');
  };

  const handleDeepAnalysisStart = () => {
    // Save intensity level and gentle mode first, then start Deep Analysis
    const userPrefs = getUserPreferences();
    if (userPrefs) {
      userPrefs.intensityLevel = selectedIntensity;
      userPrefs.gentleMode = gentleMode;
      saveUserPreferences(userPrefs);
    }
    
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

  // Splash Screen - Clean opening
  if (currentStep === 'splash') {
    return (
      <div 
        className="min-h-screen bg-supportive flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
        onClick={() => setCurrentStep('quote')}
        role="button"
        aria-label="Skip to quote"
      >
        <ParticleField count={30} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="mb-8"
          >
            <Eye className="w-32 h-32 text-light-dawn mx-auto glow-warm" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-light-dawn via-light-mist to-shadow-rose font-display tracking-tight"
          >
            THE ABYSS
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7] }}
            transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
            className="text-2xl text-light-sage font-light italic mt-4"
          >
            Gazes Into You
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-warmth-pearl/60 animate-subtle-pulse"
          >
            tap to continue
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Quote Screen - Inspiring wisdom  
  if (currentStep === 'quote') {
    return (
      <div 
        className="min-h-screen bg-supportive flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
        onClick={() => setCurrentStep('identity')}
        role="button"
        aria-label="Skip to identity selection"
      >
        <ParticleField count={20} />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <Sparkles className="w-16 h-16 text-light-dawn mx-auto glow-warm" />
          </motion.div>
          
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="text-2xl sm:text-3xl lg:text-4xl text-light-mist font-light leading-relaxed mb-8 text-glow-soft italic"
          >
            "{selectedQuote.text}"
          </motion.blockquote>
          
          <motion.cite
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-xl text-light-sage font-medium"
          >
            — {selectedQuote.author}
          </motion.cite>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="mt-12 text-warmth-pearl text-sm opacity-60"
          >
            Preparing your journey...
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2.8, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-warmth-pearl/60 animate-subtle-pulse"
          >
            tap to continue
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto bg-gray-800/80 p-8 rounded-xl">
          <div className="mb-8">
            <Eye className="w-24 h-24 text-red-400 mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-white mb-4">THE ABYSS</h1>
            <p className="text-2xl text-red-200 mb-4">Gazes Back</p>
            <p className="text-gray-300 text-lg italic">
              "He who fights monsters should be careful lest he thereby become a monster."
            </p>
          </div>
          
          <div className="mb-8 p-6 bg-gray-700/50 rounded-lg">
            <h2 className="text-xl text-white font-semibold mb-4">Your Journey Awaits</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">1</div>
                <p>Choose Intensity</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">2</div>
                <p>Explore Questions</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">3</div>
                <p>Discover Archetype</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">4</div>
                <p>AI Integration</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <button
              onClick={handleArchetypeAssessment}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Brain className="mr-2 w-5 h-5" />
              Archetype Assessment
            </button>
            
            {onDeepAnalysis && (
              <button
                onClick={handleDeepAnalysisStart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Eye className="mr-2 w-5 h-5" />
                Deep Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'identity') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl">
          <h2 className="text-4xl font-bold text-white mb-8">
            How shall we address you?
          </h2>
          
          <p className="text-gray-300 mb-8">
            Your choice affects only your local experience. No data leaves your device.
          </p>
          
          {existingUser && (
            <div className="mb-8 p-4 bg-blue-900/30 rounded-lg border border-blue-500/40">
              <h3 className="text-xl text-white font-semibold mb-2">
                Welcome Back{existingUser.name ? `, ${existingUser.name}` : ''}!
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleReturnUser}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg transition-colors"
                >
                  Continue Journey
                </button>
                <button
                  onClick={handleNewIdentity}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors"
                >
                  New Identity
                </button>
              </div>
            </div>
          )}
          
          {!existingUser && (
            <div className="grid gap-4">
              <button
                onClick={handleAnonymous}
                className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg transition-colors"
              >
                🕶️ Anonymous Journey
              </button>
              
              <button
                onClick={() => setShowNameInput(!showNameInput)}
                className="bg-purple-700 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors"
              >
                👤 Named Journey
              </button>
            </div>
          )}
          
          {showNameInput && (
            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Enter your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
              />
              <button
                onClick={handleWithName}
                disabled={!userName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
              >
                Begin Journey
              </button>
            </div>
          )}
        </div>
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
            gentleMode={gentleMode}
            onGentleModeChange={setGentleMode}
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
                // Save intensity level and gentle mode, then continue to intro
                const userPrefs = getUserPreferences();
                if (userPrefs) {
                  userPrefs.intensityLevel = selectedIntensity;
                  userPrefs.gentleMode = gentleMode;
                  saveUserPreferences(userPrefs);
                  setCurrentStep('intro');
                } else {
                  console.error('No user preferences found');
                  setCurrentStep('identity');
                }
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