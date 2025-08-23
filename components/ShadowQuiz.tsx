'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, Skull, ArrowRight, RotateCcw, AlertTriangle, MessageCircle, Send, Loader, Sparkles, Heart, Brain, BookOpen, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ParticleField } from './ParticleField';
import { ProgressBar } from './ProgressBar';
import { WelcomeScreen } from './WelcomeScreen';
import ShadowJournal from './ShadowJournal';
import IntegrationExercises from './IntegrationExercises';
import { questions } from '../lib/questions';
import { getShadowArchetype, type ShadowArchetype } from '../lib/shadowArchetypes';
import { askClaude, getDemoInsight, type ShadowProfile } from '../lib/claudeApi';
import { getUserPreferences, saveUserPreferences, type UserPreferences } from '../lib/userPreferences';

interface Answer {
  optionId: string;
  shadow: Record<string, number>;
}

interface Conversation {
  question: string;
  response: string;
  timestamp: number;
}

const ShadowQuiz = () => {
  const [currentScreen, setCurrentScreen] = useState<'identity' | 'welcome' | 'quiz' | 'results' | 'journal' | 'exercises' | 'chat'>('identity');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [claudeResponse, setClaudeResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();
  
  // Preload next screen data for better performance
  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleUserPreferences = useCallback((prefs: UserPreferences) => {
    setUserPrefs(prefs);
    setCurrentScreen('welcome');
  }, []);

  const handleAnswer = useCallback(async (questionId: number, optionId: string, shadow: Record<string, number>) => {
    // Immediate visual feedback
    setSelectedOption(optionId);
    
    // Haptic feedback for mobile
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Wait for visual confirmation
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: { optionId, shadow }
    }));
    
    setIsTransitioning(true);
    setSelectedOption(null);
    
    // Optimized transition timing
    await new Promise(resolve => setTimeout(resolve, shouldReduceMotion ? 200 : 400));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentScreen('results');
    }
    setIsTransitioning(false);
  }, [currentQuestion, shouldReduceMotion]);

  const calculateShadow = useMemo(() => {
    const shadowTraits: Record<string, number> = {};
    let totalDarkness = 0;
    
    Object.values(answers).forEach(answer => {
      Object.entries(answer.shadow).forEach(([trait, value]) => {
        shadowTraits[trait] = (shadowTraits[trait] || 0) + value;
        totalDarkness += value;
      });
    });

    const dominantTraits = Object.entries(shadowTraits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3) as [string, number][];

    return { shadowTraits, dominantTraits, totalDarkness };
  }, [answers]);

  const handleAskClaude = useCallback(async () => {
    if (!userQuestion.trim()) return;
    
    setIsLoadingResponse(true);
    
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    try {
      const { dominantTraits, totalDarkness } = calculateShadow;
      const archetype = getShadowArchetype(dominantTraits, totalDarkness);
      
      const shadowProfile: ShadowProfile = {
        archetype: archetype.name,
        traits: dominantTraits.map(([trait]) => trait),
        intensity: archetype.intensity || 'moderate',
        description: archetype.description
      };

      let response: string;
      let isFromAPI = false;
      
      // Try Claude API first, fallback to demo insights
      try {
        // Convert conversations to the format expected by the API
        const apiConversationHistory = conversations.map(conv => ({
          question: conv.question,
          response: conv.response
        }));
        
        response = await askClaude(userQuestion, shadowProfile, userPrefs?.id, apiConversationHistory);
        isFromAPI = true;
        console.log('✅ Using Claude API response with', apiConversationHistory.length, 'previous exchanges');
      } catch (error) {
        // Fallback to demo insights if API fails
        response = getDemoInsight(userQuestion, shadowProfile);
        console.log('⚠️ Using fallback response:', error);
      }
      
      // Add source indicator 
      setClaudeResponse(response);
      
      // Log the source for debugging
      if (isFromAPI) {
        console.log('✅ Dr. Shadow (Claude 3.5 Sonnet API) responded');
      } else {
        console.log('⚠️ Using fallback - Dr. Shadow unavailable');
      }
      
      // Save conversation to history
      const newConversation: Conversation = {
        question: userQuestion,
        response: response,
        timestamp: Date.now()
      };
      
      setConversations(prev => [...prev, newConversation]);
      
      // Clear question for next use
      setUserQuestion('');
      
    } catch (error) {
      const errorResponse = `**Connection Error** ⚠️

Dr. Shadow is experiencing technical difficulties and cannot respond to your question right now.

**Your question:** "${userQuestion}"

This appears to be a temporary issue. Please try again in a few moments. Your courage in exploring these depths shows tremendous strength, and your shadow work journey is valid and important.

*If this problem persists, there may be an issue with the Claude API configuration.*`;
      
      setClaudeResponse(errorResponse);
      console.log('❌ Connection error:', error);
      
      // Save error conversation too
      const errorConversation: Conversation = {
        question: userQuestion,
        response: errorResponse,
        timestamp: Date.now()
      };
      setConversations(prev => [...prev, errorConversation]);
    } finally {
      setIsLoadingResponse(false);
    }
  }, [userQuestion, calculateShadow, userPrefs?.id]);

  const openChat = useCallback(() => {
    setCurrentScreen('chat');
  }, []);
  
  const closeChat = useCallback(() => {
    setCurrentScreen('results');
  }, []);

  const createJournalFromConversation = useCallback((conversation: Conversation) => {
    // Navigate to journal with pre-filled content
    setCurrentScreen('journal');
    // We'll enhance the journal component to accept initial content
  }, []);
  
  const createExerciseFromConversation = useCallback((conversation: Conversation) => {
    // Navigate to exercises with suggested practice
    setCurrentScreen('exercises');
    // We'll enhance the exercises component to accept conversation context
  }, []);

  const restart = useCallback(() => {
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    setCurrentScreen('identity');
    setCurrentQuestion(0);
    setAnswers({});
    setShowFeedback(false);
    setUserQuestion('');
    setClaudeResponse('');
    setIsTransitioning(false);
    setSelectedOption(null);
    setConversations([]);
    setUserPrefs(null);
  }, []);
  
  const openJournal = useCallback(() => {
    setCurrentScreen('journal');
  }, []);
  
  const openExercises = useCallback(() => {
    setCurrentScreen('exercises');
  }, []);
  
  const closeJournal = useCallback(() => {
    setCurrentScreen('results');
  }, []);
  
  const closeExercises = useCallback(() => {
    setCurrentScreen('results');
  }, []);

  // Enhanced motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: shouldReduceMotion ? 0.3 : 0.8,
        staggerChildren: shouldReduceMotion ? 0.05 : 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: shouldReduceMotion ? 0.2 : 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.2 : 0.6 }
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  if (currentScreen === 'identity') {
    return <WelcomeScreen onContinue={handleUserPreferences} />;
  }

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={shouldReduceMotion ? 15 : 40} />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 text-center max-w-5xl"
        >
          <motion.div 
            variants={itemVariants}
            className="mb-12 relative"
          >
            <motion.div
              animate={{ 
                rotate: shouldReduceMotion ? 0 : [0, 5, -5, 0],
                scale: shouldReduceMotion ? 1 : [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: shouldReduceMotion ? 0 : Infinity, 
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
            className="bg-red-900/20 border border-red-500/40 rounded-2xl p-4 sm:p-8 mb-8 sm:mb-12 max-w-3xl mx-4 sm:mx-auto backdrop-blur-sm glass hover:border-red-400/60 transition-colors duration-300"
          >
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
              <p className="text-red-200 text-xl font-semibold">PSYCHOLOGICAL DEPTH WARNING</p>
            </div>
            <p className="text-red-100 leading-relaxed">
              This journey explores the darkest recesses of the human psyche. You will confront thoughts, 
              feelings, and aspects of yourself you may have never acknowledged. This is not entertainment 
              — it is profound psychological archaeology. Only proceed if you are prepared to face what you 
              find and have support systems in place.
            </p>
            <p className="text-red-200 mt-4 font-medium">
              Consider speaking with a mental health professional if this material brings up overwhelming feelings.
            </p>
          </motion.div>
          
          <motion.button
            variants={itemVariants}
            whileHover={{ 
              scale: shouldReduceMotion ? 1 : 1.05, 
              boxShadow: "0 10px 40px rgba(239, 68, 68, 0.3)"
            }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            onClick={() => setCurrentScreen('quiz')}
            className="group btn-primary text-lg sm:text-2xl px-8 sm:px-12 py-4 sm:py-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
            aria-label="Begin the shadow self assessment"
          >
            <span className="relative z-10 flex items-center">
              <Brain className="mr-2 sm:mr-3 w-6 h-6 sm:w-7 sm:h-7" />
              Descend Into Darkness
              <ArrowRight className="ml-2 sm:ml-4 w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-2 transition-transform relative z-10" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (currentScreen === 'quiz') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    
    // Preload next question for smoother transitions
    const nextQuestion = currentQuestion < questions.length - 1 ? questions[currentQuestion + 1] : null;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={shouldReduceMotion ? 8 : 20} />
        
        <div className="absolute top-0 left-0 w-full z-20">
          <ProgressBar progress={progress} />
        </div>
        
        <div className="absolute top-8 right-8 text-red-300 font-medium text-xl z-20 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          {currentQuestion + 1} / {questions.length}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 100, scale: shouldReduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -100, scale: shouldReduceMotion ? 1 : 0.9 }}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.6, ease: "easeInOut" }}
            className="relative z-10 max-w-6xl w-full"
          >
            <div className="text-center mb-20">
              <motion.div
                animate={{ 
                  rotate: shouldReduceMotion ? 0 : [0, 5, -5, 0],
                  scale: shouldReduceMotion ? 1 : [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: shouldReduceMotion ? 0 : Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Skull className="w-16 h-16 text-red-400 mx-auto mb-10" />
              </motion.div>
              
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 sm:mb-10 leading-tight max-w-5xl mx-auto text-glow px-4">
                {question.text}
              </h2>
              
              <p className="text-lg sm:text-xl text-red-200 italic opacity-80 max-w-3xl mx-auto font-light px-4">
                {question.reflection}
              </p>
            </div>
            
            <div className="grid gap-8">
              {question.options.map((option, index) => {
                const isSelected = selectedOption === option.id;
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: shouldReduceMotion ? 0 : index * 0.15, 
                      duration: shouldReduceMotion ? 0.2 : 0.6 
                    }}
                    whileHover={{ 
                      scale: shouldReduceMotion ? 1 : 1.02, 
                      y: shouldReduceMotion ? 0 : -4,
                      boxShadow: "0 20px 40px rgba(239, 68, 68, 0.2)"
                    }}
                    whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
                    onClick={() => handleAnswer(question.id, option.id, option.shadow)}
                    className={`group btn-secondary text-lg sm:text-xl lg:text-2xl p-4 sm:p-8 lg:p-10 mx-4 sm:mx-0 relative overflow-hidden transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-red-400 bg-red-900/30' : ''
                    } hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400`}
                    disabled={isTransitioning}
                    aria-label={`Option ${index + 1}: ${option.text}`}
                  >
                    <span className={`relative z-10 transition-colors leading-relaxed flex items-center ${
                      isSelected 
                        ? 'text-red-100' 
                        : 'text-gray-100 group-hover:text-red-100'
                    }`}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mr-3"
                        >
                          <Heart className="w-5 h-5 text-red-400" />
                        </motion.div>
                      )}
                      {option.text}
                      <ArrowRight className={`ml-2 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 transition-all text-red-400 relative z-10 ${
                        isSelected 
                          ? 'opacity-100 translate-x-2' 
                          : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-2'
                      }`} />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-purple-900/20"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (currentScreen === 'results') {
    const { dominantTraits, totalDarkness } = calculateShadow;
    const archetype = getShadowArchetype(dominantTraits, totalDarkness);
    const IconComponent = archetype.icon;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={shouldReduceMotion ? 10 : 25} />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl w-full"
        >
          <div className="text-center mb-16">
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-white to-gray-300 mb-6 tracking-tight hover:scale-105 transition-transform duration-300 cursor-default text-center"
            >
              Your Shadow Self
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-2xl text-red-200 font-light text-center"
            >
              The darkness you carry
            </motion.p>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className={`bg-gradient-to-br ${archetype.color} p-1 rounded-3xl shadow-2xl mb-12 hover:shadow-3xl transition-shadow duration-500`}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-3xl p-12 glass">
              <motion.div
                animate={{ 
                  rotate: shouldReduceMotion ? 0 : [0, 5, -5, 0],
                  scale: shouldReduceMotion ? 1 : [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: shouldReduceMotion ? 0 : Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <IconComponent className="w-24 h-24 text-white mb-10 mx-auto" />
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-10 text-glow">
                {archetype.name}
              </h2>
              
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-white/10 rounded-2xl p-10 glass">
                  <h3 className="text-3xl font-semibold text-white mb-6 text-center">The Shadow You Carry</h3>
                  <p className="text-xl text-white/90 leading-relaxed text-center font-light">
                    {archetype.description}
                  </p>
                </div>
                
                <div className="bg-yellow-900/30 rounded-2xl p-10 glass">
                  <h3 className="text-3xl font-semibold text-yellow-200 mb-6 text-center">The Deep Truth</h3>
                  <p className="text-xl text-yellow-100 leading-relaxed text-center italic font-light">
                    {archetype.deepTruth}
                  </p>
                </div>
                
                <div className="bg-green-900/40 rounded-2xl p-10 glass">
                  <h3 className="text-3xl font-semibold text-green-200 mb-6 text-center">Path to Integration</h3>
                  <p className="text-xl text-green-100 leading-relaxed text-center font-light">
                    {archetype.integration}
                  </p>
                </div>
                
                <div className="bg-purple-900/30 rounded-2xl p-8 glass">
                  <h3 className="text-2xl font-semibold text-purple-200 mb-4 text-center">
                    Shadow Intensity: {archetype.intensity?.toUpperCase()}
                  </h3>
                  <p className="text-purple-100 text-center font-light">
                    Remember: Your shadow is not your enemy — it is the part of you that needs the most compassion. 
                    Integration, not elimination, is the goal.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Claude AI Integration */}
          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12"
          >
            <motion.button
              onClick={openChat}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Chat with Dr. Shadow"
            >
              <MessageCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">Chat with Dr. Shadow</div>
              <div className="text-sm opacity-90">{conversations.length > 0 ? `${conversations.length} exchanges` : 'Start conversation'}</div>
            </motion.button>
            
            <motion.button
              onClick={openJournal}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Open shadow journal"
            >
              <BookOpen className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">Journal</div>
              <div className="text-sm opacity-90">Track Insights</div>
            </motion.button>
            
            <motion.button
              onClick={openExercises}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Open integration exercises"
            >
              <Target className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">Exercises</div>
              <div className="text-sm opacity-90">Integration Work</div>
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.5 }}
                className="bg-black/40 rounded-3xl p-10 glass mb-12"
              >
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">
                  Consult with Dr. Shadow
                </h3>
                <textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="What would you like to understand about your shadow? Be specific about what you're experiencing, feeling, or struggling with..."
                  className="w-full bg-gray-800/80 text-white p-6 rounded-2xl mb-6 text-lg border border-red-500/30 focus:border-red-400/70 transition-colors backdrop-blur-sm"
                  rows={4}
                  disabled={isLoadingResponse}
                />
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleAskClaude}
                    disabled={!userQuestion.trim() || isLoadingResponse}
                    className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl flex items-center"
                  >
                    {isLoadingResponse ? (
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    {isLoadingResponse ? 'Getting Insight...' : 'Get Personal Insight'}
                  </button>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-full text-lg font-medium transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
                
                {claudeResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-8 glass"
                  >
                    <h4 className="text-xl font-semibold text-indigo-200 mb-4 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Dr. Shadow's Insight
                    </h4>
                    <p className="text-indigo-100 leading-relaxed text-lg font-light whitespace-pre-line">
                      {claudeResponse}
                    </p>
                    
                    {/* Action buttons for latest response */}
                    {conversations.length > 0 && (
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => createJournalFromConversation(conversations[conversations.length - 1])}
                          className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Journal This
                        </button>
                        <button
                          onClick={() => createExerciseFromConversation(conversations[conversations.length - 1])}
                          className="flex items-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Practice This
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Conversation History */}
                {conversations.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6"
                  >
                    <button
                      onClick={() => setShowConversationHistory(!showConversationHistory)}
                      className="text-purple-300 hover:text-purple-200 font-medium flex items-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {showConversationHistory ? 'Hide' : 'Show'} Conversation History ({conversations.length})
                    </button>
                    
                    <AnimatePresence>
                      {showConversationHistory && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-4 max-h-96 overflow-y-auto"
                        >
                          {conversations.slice().reverse().map((conv, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-xl p-4 text-sm">
                              <div className="text-gray-300 font-medium mb-2">
                                Q: {conv.question}
                              </div>
                              <div className="text-gray-100 mb-3 whitespace-pre-line">
                                {conv.response}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => createJournalFromConversation(conv)}
                                  className="flex items-center bg-emerald-600/70 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs transition-all"
                                >
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  Journal
                                </button>
                                <button
                                  onClick={() => createExerciseFromConversation(conv)}
                                  className="flex items-center bg-amber-600/70 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-xs transition-all"
                                >
                                  <Target className="w-3 h-3 mr-1" />
                                  Practice
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="text-center">
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              onClick={restart}
              className="group bg-gradient-to-r from-gray-800 to-red-800 hover:from-gray-700 hover:to-red-700 text-white px-12 py-6 rounded-full text-xl font-semibold transition-all duration-300 shadow-2xl border border-red-500/30 glow-red focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Restart the shadow self assessment"
            >
              <RotateCcw className="inline-block mr-4 w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              Journey Again
            </motion.button>
            
            {/* Legal Notice */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 text-center text-gray-400 text-sm max-w-2xl mx-auto"
            >
              <p className="mb-2">
                © 2024 yidy. All rights reserved. For personal use only.
              </p>
              <p className="text-xs">
                Commercial use prohibited. This application is not a substitute for professional psychological treatment.
                <br />
                <a href="/LICENSE.md" className="text-red-400 hover:text-red-300 underline mx-2">License</a>
                <a href="/TERMS.md" className="text-red-400 hover:text-red-300 underline mx-2">Terms</a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Handle journal screen
  if (currentScreen === 'journal') {
    return (
      <ShadowJournal 
        currentArchetype={Object.keys(answers).length > 0 ? getShadowArchetype(calculateShadow.dominantTraits, calculateShadow.totalDarkness).name : undefined}
        onClose={closeJournal} 
      />
    );
  }
  
  // Handle exercises screen
  if (currentScreen === 'exercises') {
    const archetype = Object.keys(answers).length > 0 
      ? getShadowArchetype(calculateShadow.dominantTraits, calculateShadow.totalDarkness) 
      : null;
      
    return (
      <IntegrationExercises 
        archetype={archetype?.name || 'Universal'}
        onClose={closeExercises} 
      />
    );
  }
  
  // Handle chat screen
  if (currentScreen === 'chat') {
    const archetype = Object.keys(answers).length > 0 
      ? getShadowArchetype(calculateShadow.dominantTraits, calculateShadow.totalDarkness) 
      : null;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex flex-col relative overflow-hidden">
        <ParticleField count={shouldReduceMotion ? 15 : 30} />
        
        <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur">
            <div>
              <h2 className="text-xl font-semibold text-white">Dr. Shadow</h2>
              <p className="text-gray-400 text-sm">{archetype?.name || 'Shadow Work Consultation'}</p>
            </div>
            <button
              onClick={closeChat}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with Dr. Shadow</p>
                <p className="text-sm mt-2">Ask about your shadow work, relationships, patterns, or anything on your mind.</p>
              </div>
            ) : (
              conversations.map((conv, index) => (
                <div key={index} className="space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white p-3 rounded-2xl rounded-br-md max-w-[80%]">
                      {conv.question}
                    </div>
                  </div>
                  
                  {/* Dr. Shadow response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-100 p-4 rounded-2xl rounded-bl-md max-w-[85%]">
                      <div className="text-sm text-purple-400 mb-2">Dr. Shadow</div>
                      <div className="whitespace-pre-line">{conv.response}</div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => createJournalFromConversation(conv)}
                          className="flex items-center bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-3 py-1 rounded-lg text-xs transition-all"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          Journal
                        </button>
                        <button
                          onClick={() => createExerciseFromConversation(conv)}
                          className="flex items-center bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 px-3 py-1 rounded-lg text-xs transition-all"
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Practice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoadingResponse && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-100 p-4 rounded-2xl rounded-bl-md">
                  <div className="text-sm text-purple-400 mb-2">Dr. Shadow</div>
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 bg-gray-900/50 backdrop-blur">
            <div className="flex space-x-2">
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ask Dr. Shadow anything about your shadow work journey..."
                className="flex-1 bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskClaude();
                  }
                }}
              />
              <button
                onClick={handleAskClaude}
                disabled={!userQuestion.trim() || isLoadingResponse}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors flex items-center"
              >
                {isLoadingResponse ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ShadowQuiz;