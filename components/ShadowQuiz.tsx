'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Eye, Skull, ArrowRight, RotateCcw, AlertTriangle, MessageCircle, Send, Loader, Sparkles, Heart, Brain, BookOpen, Target, Plus, HelpCircle, CheckSquare, Download, BarChart } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ParticleField } from './ParticleField';
import { ProgressBar } from './ProgressBar';
import { WelcomeScreen } from './WelcomeScreen';
import ShadowJournal from './ShadowJournal';
import IntegrationExercises from './IntegrationExercises';
import DeepAnalysis from './DeepAnalysis';
import ReAnalysis from './ReAnalysis';
import UserGuide from './UserGuide';
import ExportButton from './ExportButton';
import { questions, getQuestionsByIntensity, getQuestionText, getReflectionText } from '../lib/questions';
import { getShadowArchetype, type ShadowArchetype } from '../lib/shadowArchetypes';
import { askClaude, getDemoInsight, type ShadowProfile, type EnhancedContext } from '../lib/claudeApi';
import { getUserPreferences, saveUserPreferences, saveQuizProgress, clearQuizProgress, addAssessmentResult, type UserPreferences } from '../lib/userPreferences';

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
  const [currentScreen, setCurrentScreen] = useState<'identity' | 'welcome' | 'quiz' | 'results' | 'journal' | 'exercises' | 'chat' | 'deepanalysis' | 'reanalysis' | 'guide' | 'progress'>('identity');
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
  const [currentQuestions, setCurrentQuestions] = useState(questions);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [showEmotionCheckIn, setShowEmotionCheckIn] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'calm' | 'unsettled' | 'intense' | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  const shouldReduceMotion = useReducedMotion();
  
  // Preload next screen data for better performance
  useEffect(() => {
    setIsReady(true);
    // If no user preferences are loaded, use default questions
    if (!userPrefs) {
      setQuestionsReady(true);
    }
  }, [userPrefs]);

  const handleUserPreferences = useCallback((prefs: UserPreferences) => {
    setUserPrefs(prefs);
    
    // Set questions based on intensity level
    const questionsToUse = prefs.intensityLevel ? getQuestionsByIntensity(prefs.intensityLevel) : questions;
    setCurrentQuestions(questionsToUse);
    setQuestionsReady(true);
    
    // Load saved quiz progress if it exists
    if (prefs.currentQuizProgress) {
      // Ensure currentQuestion is within bounds of current questions
      const savedCurrentQuestion = Math.min(
        prefs.currentQuizProgress.currentQuestion, 
        questionsToUse.length - 1
      );
      const boundedCurrentQuestion = Math.max(0, savedCurrentQuestion);
      
      setCurrentQuestion(boundedCurrentQuestion);
      setAnswers(prefs.currentQuizProgress.answers);
      setConversations(prefs.currentQuizProgress.conversations);
      
      // If quiz was completed (has all answers), go to results, otherwise continue quiz
      if (Object.keys(prefs.currentQuizProgress.answers).length >= questionsToUse.length) {
        setCurrentScreen('results');
      } else {
        setCurrentScreen('quiz');
      }
    } else {
      // No quiz progress, but check if we have conversations from localStorage
      const savedConversations = localStorage.getItem('shadowConversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
      setCurrentScreen('welcome');
    }
  }, []);

  const handleSkipQuestion = useCallback(async () => {
    setIsTransitioning(true);
    setSelectedOption(null);
    
    // Skip to next question without saving answer
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (currentQuestion < currentQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      
      // Scroll to top smoothly for next question
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Save progress with skip (no new answer added)
      if (userPrefs) {
        saveQuizProgress(nextQuestion, answers, conversations);
      }
    } else {
      // Last question skipped - go to results with whatever answers we have
      setCurrentScreen('results');
      
      // Save any completed answers to history (even if incomplete)
      if (Object.keys(answers).length > 0) {
        const shadowTraits: Record<string, number> = {};
        Object.values(answers).forEach(answer => {
          Object.entries(answer.shadow).forEach(([trait, value]) => {
            shadowTraits[trait] = (shadowTraits[trait] || 0) + value;
          });
        });
        
        const dominantTraits = Object.entries(shadowTraits)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3) as [string, number][];
        const totalDarkness = Object.values(shadowTraits).reduce((sum, val) => sum + val, 0);
        const archetype = getShadowArchetype(dominantTraits, totalDarkness);
        
        if (userPrefs) {
          addAssessmentResult({
            archetype: archetype.name,
            intensity: totalDarkness > 15 ? 'intense' : totalDarkness > 10 ? 'deep' : totalDarkness > 5 ? 'moderate' : 'gentle',
            dominantTraits: dominantTraits.map(([trait]) => trait),
            totalDarkness
          });
          clearQuizProgress();
        }
      }
    }
    
    setIsTransitioning(false);
  }, [currentQuestion, currentQuestions.length, answers, userPrefs, conversations]);

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
    
    if (currentQuestion < currentQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      
      // Check if we should show emotion check-in after intense questions
      const intensiveQuestions = [2, 4, 6]; // 0-indexed: questions 3, 5, 7
      if (intensiveQuestions.includes(currentQuestion) && userPrefs?.intensityLevel !== 'gentle') {
        setShowEmotionCheckIn(true);
        // Store the next question to advance to after check-in
        sessionStorage.setItem('nextQuestion', nextQuestion.toString());
      } else {
        setCurrentQuestion(nextQuestion);
        
        // Scroll to top smoothly for next question
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Save progress after each answer
        if (userPrefs) {
          saveQuizProgress(nextQuestion, answers, conversations);
        }
      }
    } else {
      setCurrentScreen('results');
      
      // Save completed assessment to history
      const finalAnswers = { ...answers, [questionId]: { optionId, shadow } };
      // Calculate shadow traits for the final answers
      const shadowTraits: Record<string, number> = {};
      Object.values(finalAnswers).forEach(answer => {
        Object.entries(answer.shadow).forEach(([trait, value]) => {
          shadowTraits[trait] = (shadowTraits[trait] || 0) + value;
        });
      });
      
      const dominantTraits = Object.entries(shadowTraits)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3) as [string, number][];
      const totalDarkness = Object.values(shadowTraits).reduce((sum, val) => sum + val, 0);
      const archetype = getShadowArchetype(dominantTraits, totalDarkness);
      
      // Add to assessment history
      addAssessmentResult({
        archetype: archetype.name,
        intensity: archetype.intensity || 'moderate',
        dominantTraits: dominantTraits.map(([trait]) => trait),
        totalDarkness
      });
      
      // Clear quiz progress when completed and save final state
      if (userPrefs) {
        saveQuizProgress(currentQuestions.length, finalAnswers, conversations);
      }
    }
    setIsTransitioning(false);
  }, [currentQuestion, shouldReduceMotion]);

  const handleEmotionCheckIn = useCallback(async (emotion: 'calm' | 'unsettled' | 'intense') => {
    setCurrentEmotion(emotion);
    
    // Small delay for feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get the stored next question
    const nextQuestion = parseInt(sessionStorage.getItem('nextQuestion') || '0');
    sessionStorage.removeItem('nextQuestion');
    
    // Continue to next question
    setCurrentQuestion(nextQuestion);
    setShowEmotionCheckIn(false);
    setCurrentEmotion(null);
    
    // Scroll to top smoothly for next question
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Save progress
    if (userPrefs) {
      saveQuizProgress(nextQuestion, answers, conversations);
    }
    
    setIsTransitioning(false);
  }, [userPrefs, answers, conversations]);

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

        // Gather enhanced context from localStorage
        const enhancedContext = {
          journalEntries: (() => {
            const journalData = localStorage.getItem('shadowJournalEntries');
            if (!journalData) return [];
            const entries = JSON.parse(journalData);
            return entries.slice(-8).map((entry: any) => ({
              date: new Date(entry.date).toLocaleDateString(),
              reflection: entry.reflection || '',
              insights: entry.insights || '',
              integration: entry.integration || '',
              mood: entry.mood || 3
            }));
          })(),
          recentAnalyses: (() => {
            const journalData = localStorage.getItem('shadowJournalEntries');
            if (!journalData) return [];
            const entries = JSON.parse(journalData);
            return entries
              .filter((entry: any) => entry.id?.includes('analysis-') || entry.id?.includes('reanalysis-'))
              .slice(-3)
              .map((entry: any) => entry.insights || entry.reflection);
          })(),
          moodTrends: (() => {
            const journalData = localStorage.getItem('shadowJournalEntries');
            if (!journalData) return [];
            const entries = JSON.parse(journalData);
            return entries.slice(-10).map((entry: any) => entry.mood || 3);
          })(),
          phase2Analysis: (() => {
            // Load the most recent Deep Analysis Phase 2 data from localStorage
            const savedPhase2 = localStorage.getItem('shadowDeepAnalysisPhase2');
            if (savedPhase2) {
              try {
                return JSON.parse(savedPhase2);
              } catch (error) {
                console.error('Error parsing Phase 2 data:', error);
                return null;
              }
            }
            return null;
          })(),
          completedActions: (() => {
            const savedActions = localStorage.getItem('shadowAnalysisCompletedActions');
            return savedActions ? JSON.parse(savedActions) : [];
          })(),
          completedExercises: (() => {
            const savedExercises = localStorage.getItem('shadowAnalysisCompletedExercises');
            return savedExercises ? JSON.parse(savedExercises) : [];
          })(),
          intensityLevel: userPrefs?.intensityLevel
        };
        
        response = await askClaude(userQuestion, shadowProfile, userPrefs?.id, apiConversationHistory, enhancedContext, userPrefs?.name, 'chat');
        isFromAPI = true;
        console.log('✅ Using Claude API response with enhanced context:', {
          conversations: apiConversationHistory.length,
          journalEntries: enhancedContext.journalEntries.length,
          analyses: enhancedContext.recentAnalyses.length,
          moods: enhancedContext.moodTrends.length,
          phase2Analysis: !!enhancedContext.phase2Analysis,
          completedActions: enhancedContext.completedActions?.length || 0,
          completedExercises: enhancedContext.completedExercises?.length || 0
        });
      } catch (error) {
        // Fallback to demo insights if API fails
        response = getDemoInsight(userQuestion, shadowProfile);
      }
      
      // Add source indicator 
      setClaudeResponse(response);
      
      
      // Save conversation to history
      const newConversation: Conversation = {
        question: userQuestion,
        response: response,
        timestamp: Date.now()
      };
      
      const updatedConversations = [...conversations, newConversation];
      setConversations(updatedConversations);
      
      // Save conversations to localStorage for ReAnalysis access
      localStorage.setItem('shadowConversations', JSON.stringify(updatedConversations));
      
      // Save progress with new conversation
      if (userPrefs) {
        saveQuizProgress(currentQuestion, answers, updatedConversations);
      }
      
      // Clear question for next use
      setUserQuestion('');
      
      // Auto-scroll to show the beginning of the new response
      setTimeout(() => {
        if (chatMessagesRef.current) {
          // Find the last Dr. Shadow response element and scroll to it
          const responses = chatMessagesRef.current.querySelectorAll('[data-response]');
          if (responses.length > 0) {
            const lastResponse = responses[responses.length - 1];
            lastResponse.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 200);
      
    } catch (error) {
      const errorResponse = `**Connection Error** ⚠️

Sage is experiencing technical difficulties and cannot respond to your question right now.

**Your question:** "${userQuestion}"

This appears to be a temporary issue. Please try again in a few moments. Your courage in exploring these depths shows tremendous strength, and your shadow work journey is valid and important.

*If this problem persists, there may be an issue with the Claude API configuration.*`;
      
      setClaudeResponse(errorResponse);
      
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

  const openDeepAnalysis = useCallback(() => {
    setCurrentScreen('deepanalysis');
  }, []);

  const closeDeepAnalysis = useCallback(() => {
    // Smart navigation based on user's journey
    const hasQuizAnswers = Object.keys(answers).length > 0;
    const hasAssessmentHistory = userPrefs?.assessmentHistory && userPrefs.assessmentHistory.length > 0;
    const hasDeepAnalysisData = localStorage.getItem('shadowDeepAnalysisPhase2');
    
    if (hasQuizAnswers || hasAssessmentHistory) {
      // User has completed some form of assessment - go to results
      setCurrentScreen('results');
    } else if (hasDeepAnalysisData) {
      // User only completed deep analysis but no main assessments
      // Ask them if they want to take the main assessment or continue with just deep analysis
      setCurrentScreen('results'); // Still show results but with guidance to take main assessment
    } else {
      // No assessments completed at all - go back to welcome to choose path
      setCurrentScreen('welcome');
    }
  }, [answers, userPrefs]);

  const [selectedConversationForJournal, setSelectedConversationForJournal] = useState<Conversation | null>(null);
  const [selectedConversationForExercise, setSelectedConversationForExercise] = useState<Conversation | null>(null);
  const [deepAnalysisForJournal, setDeepAnalysisForJournal] = useState<{summary: string, insights: string, phase2Data?: any} | null>(null);

  const createJournalFromConversation = useCallback((conversation: Conversation) => {
    setSelectedConversationForJournal(conversation);
    setCurrentScreen('journal');
  }, []);
  
  const createExerciseFromConversation = useCallback((conversation: Conversation) => {
    setSelectedConversationForExercise(conversation);
    setCurrentScreen('exercises');
  }, []);

  const createJournalFromDeepAnalysis = useCallback((analysisData: {summary: string, insights: string, phase2Data?: any}) => {
    setDeepAnalysisForJournal(analysisData);
    setSelectedConversationForJournal(null); // Clear conversation journal data
    setCurrentScreen('journal');
  }, []);

  const restart = useCallback(() => {
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    // Clear saved quiz progress
    if (userPrefs) {
      clearQuizProgress();
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
  }, [userPrefs]);
  
  const openJournal = useCallback(() => {
    setCurrentScreen('journal');
  }, []);
  
  const openExercises = useCallback(() => {
    setCurrentScreen('exercises');
  }, []);

  const openReAnalysis = useCallback(() => {
    setCurrentScreen('reanalysis');
  }, []);
  
  const openGuide = useCallback(() => {
    setCurrentScreen('guide');
  }, []);
  
  const closeGuide = useCallback(() => {
    setCurrentScreen('results');
  }, []);
  
  const closeJournal = useCallback(() => {
    setSelectedConversationForJournal(null);
    setCurrentScreen('results');
  }, []);
  
  const closeExercises = useCallback(() => {
    setSelectedConversationForExercise(null);
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
    return <WelcomeScreen onContinue={handleUserPreferences} onDeepAnalysis={openDeepAnalysis} />;
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
            onClick={() => {
              setCurrentScreen('quiz');
              // Scroll to top when starting quiz
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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

  // Emotion Check-in Screen
  if (showEmotionCheckIn) {
    return (
      <div className="min-h-screen bg-supportive flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={20} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 text-center max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Heart className="w-16 h-16 text-light-sage mx-auto mb-4 glow-sage" />
            <h2 className="text-3xl sm:text-4xl font-bold text-light-mist mb-4 text-glow-soft">
              How are you feeling?
            </h2>
            <p className="text-warmth-pearl text-lg">
              Take a moment to check in with yourself after that deep question.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionCheckIn('calm')}
              className={`p-6 rounded-xl transition-all duration-300 ${
                currentEmotion === 'calm' 
                  ? 'bg-light-sage/20 border-light-sage glow-sage' 
                  : 'btn-gentle'
              }`}
            >
              <div className="text-3xl mb-2">🌿</div>
              <div className="text-light-mist font-medium">Calm</div>
              <div className="text-warmth-pearl text-sm mt-1">Feeling grounded</div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionCheckIn('unsettled')}
              className={`p-6 rounded-xl transition-all duration-300 ${
                currentEmotion === 'unsettled' 
                  ? 'bg-light-dawn/20 border-light-dawn glow-warm' 
                  : 'btn-supportive'
              }`}
            >
              <div className="text-3xl mb-2">🌊</div>
              <div className="text-light-mist font-medium">Unsettled</div>
              <div className="text-warmth-pearl text-sm mt-1">A bit stirred up</div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionCheckIn('intense')}
              className={`p-6 rounded-xl transition-all duration-300 ${
                currentEmotion === 'intense' 
                  ? 'bg-shadow-rose/20 border-shadow-rose glow-soft-red' 
                  : 'btn-supportive'
              }`}
            >
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-light-mist font-medium">Intense</div>
              <div className="text-warmth-pearl text-sm mt-1">Feeling a lot</div>
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-light-sage text-sm italic"
          >
            Whatever you're feeling is valid. This is part of the journey.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (currentScreen === 'quiz') {
    // Wait for questions to be ready before rendering
    if (!questionsReady || currentQuestions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading questions...</p>
          </div>
        </div>
      );
    }

    const question = currentQuestions[currentQuestion];
    
    // Safety check: if question is undefined or malformed, return to welcome screen
    if (!question || !question.text || !question.options || !Array.isArray(question.options)) {
      console.error('Question is undefined or malformed at index:', currentQuestion, 'Question:', question, 'Total questions:', currentQuestions.length);
      // Reset to first question if out of bounds
      if (currentQuestion >= currentQuestions.length) {
        setCurrentQuestion(0);
        return null;
      }
      setCurrentScreen('welcome');
      return null;
    }
    
    const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;
    
    // Preload next question for smoother transitions
    const nextQuestion = currentQuestion < currentQuestions.length - 1 ? currentQuestions[currentQuestion + 1] : null;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField count={shouldReduceMotion ? 8 : 20} />
        
        <div className="absolute top-0 left-0 w-full z-20">
          <ProgressBar progress={progress} />
        </div>
        
        <div className="absolute top-8 right-8 text-red-300 font-medium text-xl z-20 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          {currentQuestion + 1} / {currentQuestions.length}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 100, scale: shouldReduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -100, scale: shouldReduceMotion ? 1 : 0.9 }}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.6, ease: "easeInOut" }}
            className="relative z-10 max-w-7xl w-full px-4"
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
                {getQuestionText(question, userPrefs?.gentleMode || false)}
              </h2>
              
              <p className="text-lg sm:text-xl text-red-200 italic opacity-80 max-w-3xl mx-auto font-light px-4">
                {getReflectionText(question, userPrefs?.gentleMode || false)}
              </p>
            </div>
            
            <div className="grid gap-8">
              {question.options.filter(option => option && option.text).map((option, index) => {
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
            
            {/* Skip Question Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkipQuestion}
                disabled={isTransitioning}
                className="group bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-600/40 hover:border-gray-500/60 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Skip this question"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Skip Question</span>
                </span>
              </motion.button>
              <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
                If this question feels too overwhelming right now, you can skip it and continue your journey.
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (currentScreen === 'results') {
    // Check if user has completed archetype quiz
    const hasArchetype = Object.keys(answers).length > 0;
    
    let archetype = null;
    let IconComponent = null;
    
    if (hasArchetype) {
      const { dominantTraits, totalDarkness } = calculateShadow;
      archetype = getShadowArchetype(dominantTraits, totalDarkness);
      IconComponent = archetype.icon;
    }
    
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
              {userPrefs?.gentleMode ? "Your Inner Journey" : "Your Shadow Self"}
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-2xl text-red-200 font-light text-center"
            >
              {userPrefs?.gentleMode ? "Understanding your complete self" : "The darkness you carry"}
            </motion.p>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className={`bg-gradient-to-br ${archetype?.color || 'from-purple-600 to-blue-600'} p-1 rounded-3xl shadow-2xl mb-12 hover:shadow-3xl transition-shadow duration-500`}
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
                {IconComponent ? (
                  <IconComponent className="w-24 h-24 text-white mb-10 mx-auto" />
                ) : (
                  <Eye className="w-24 h-24 text-white mb-10 mx-auto" />
                )}
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-10 text-glow">
                {hasArchetype 
                  ? archetype.name 
                  : (userPrefs?.gentleMode ? 'Your Personal Insights' : 'Your Shadow Analysis')
                }
              </h2>
              
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white/10 rounded-2xl p-10 glass">
                  <h3 className="text-3xl font-semibold text-white mb-6 text-center">
                    {hasArchetype 
                      ? (userPrefs?.gentleMode ? 'Your Inner Patterns' : 'The Shadow You Carry')
                      : (userPrefs?.gentleMode ? 'Your Personal Analysis Complete' : 'Your Deep Analysis Complete')
                    }
                  </h3>
                  <p className="text-xl text-white/90 leading-relaxed text-center font-light">
                    {hasArchetype 
                      ? archetype.description 
                      : 'Your comprehensive behavioral analysis has been completed and saved to your journal. Access it anytime through the Journal section, or continue your shadow work journey by chatting with Sage.'}
                  </p>
                </div>
                
                {hasArchetype && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Claude AI Integration */}
          {/* Primary Action - Deep Analysis CTA only */}
          <motion.div 
            variants={itemVariants}
            className="mb-8"
          >
            {(() => {
              const hasPhase2Data = localStorage.getItem('shadowDeepAnalysisPhase2');
              
              if (hasPhase2Data) {
                // Only show the big progress card if they have actual Phase 2 data
                const completedActions = localStorage.getItem('shadowAnalysisCompletedActions');
                const completedExercises = localStorage.getItem('shadowAnalysisCompletedExercises');
                // Show Progress Dashboard if they have Deep Analysis data
                const phase2Data = JSON.parse(hasPhase2Data);
                const actionsCompleted = completedActions ? JSON.parse(completedActions).length : 0;
                const exercisesCompleted = completedExercises ? JSON.parse(completedExercises).length : 0;
                const totalActions = phase2Data?.integration_plan?.immediate_actions?.length || 0;
                const totalExercises = phase2Data?.integration_exercises?.length || 0;
                
                return (
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 p-1 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                    <div className="bg-black/60 backdrop-blur-sm rounded-3xl p-8 glass">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Your Progress Dashboard</h3>
                        <p className="text-lg text-green-200">
                          Track your shadow work journey with interactive exercises and personalized actions.
                        </p>
                      </div>
                      
                      {/* Progress Stats */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center bg-black/30 rounded-2xl p-4">
                          <div className="text-3xl font-bold text-green-400">
                            {actionsCompleted}/{totalActions}
                          </div>
                          <div className="text-sm text-green-300">Actions Completed</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${totalActions > 0 ? (actionsCompleted / totalActions) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-center bg-black/30 rounded-2xl p-4">
                          <div className="text-3xl font-bold text-blue-400">
                            {exercisesCompleted}/{totalExercises}
                          </div>
                          <div className="text-sm text-blue-300">Exercises Started</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${totalExercises > 0 ? (exercisesCompleted / totalExercises) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentScreen('progress')}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-400"
                        aria-label="View your progress and continue exercises"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <CheckSquare className="w-8 h-8" />
                          <span>View Progress & Continue</span>
                          <ArrowRight className="w-8 h-8" />
                        </div>
                        <div className="text-sm opacity-90 mt-2">
                          Access your interactive exercises and track completion
                        </div>
                      </motion.button>
                    </div>
                  </div>
                );
              } else {
                // Show Deep Analysis CTA if they haven't done it yet
                return (
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                    <div className="bg-black/60 backdrop-blur-sm rounded-3xl p-8 glass">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to Go Deeper?</h3>
                        <p className="text-lg text-purple-200">
                          You've discovered your shadow archetype. Now unlock the full power of behavioral analysis 
                          with personalized exercises and ultra-specific guidance.
                        </p>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openDeepAnalysis}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        aria-label="Take comprehensive behavioral analysis"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <Eye className="w-8 h-8" />
                          <span>Start Deep Analysis</span>
                          <ArrowRight className="w-8 h-8" />
                        </div>
                        <div className="text-sm opacity-90 mt-2">
                          Get interactive exercises & comprehensive AI insights
                        </div>
                      </motion.button>
                    </div>
                  </div>
                );
              }
            })()}
          </motion.div>

          {/* Secondary Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
          >
            {/* Export Data Button */}
            <motion.div
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-green-500/30"
            >
              <Download className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">Export Data</div>
              <div className="text-sm opacity-90 mb-3">Download Journey</div>
              <ExportButton variant="minimal" className="w-full justify-center text-xs px-2 py-1 bg-black/30 hover:bg-black/50 border-green-400/30" />
            </motion.div>
            <motion.button
              onClick={openChat}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Chat with Sage"
            >
              <MessageCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">Chat with Sage</div>
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

            {/* Progress Button - Always available */}
            {(() => {
              const hasPhase2Data = localStorage.getItem('shadowDeepAnalysisPhase2');
              const completedActions = localStorage.getItem('shadowAnalysisCompletedActions');
              const actionsCompleted = completedActions ? JSON.parse(completedActions).length : 0;
              
              // Check basic progress indicators
              const journalEntries = localStorage.getItem('shadowJournalEntries');
              const journalCount = journalEntries ? JSON.parse(journalEntries).length : 0;
              const conversationCount = conversations.length;
              const hasCompletedQuiz = Object.keys(answers).length > 0;
              
              if (hasPhase2Data) {
                const phase2Data = JSON.parse(hasPhase2Data);
                const totalActions = phase2Data?.integration_plan?.immediate_actions?.length || 0;
                
                return (
                  <motion.button
                    onClick={() => setCurrentScreen('progress')}
                    whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                    whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="View progress dashboard with interactive exercises"
                  >
                    <BarChart className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-lg font-bold">Progress</div>
                    <div className="text-sm opacity-90">
                      {actionsCompleted}/{totalActions} Actions
                    </div>
                  </motion.button>
                );
              } else {
                // Show basic progress for users without Phase 2 data
                const basicProgress = (hasCompletedQuiz ? 1 : 0) + Math.min(journalCount, 1) + Math.min(conversationCount, 1);
                
                return (
                  <motion.button
                    onClick={() => setCurrentScreen('progress')}
                    whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                    whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="View progress dashboard"
                  >
                    <BarChart className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-lg font-bold">Progress</div>
                    <div className="text-sm opacity-90">
                      {basicProgress}/3 Steps
                    </div>
                  </motion.button>
                );
              }
            })()}

            <motion.button
              onClick={openGuide}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="User guide and best practices"
            >
              <HelpCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">User Guide</div>
              <div className="text-sm opacity-90">How to Use</div>
            </motion.button>

            <motion.button
              onClick={openReAnalysis}
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Re-analyze all data with Sage"
            >
              <Brain className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">Re-analyze</div>
              <div className="text-sm opacity-90">Evolved Insights</div>
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
                  Consult with Sage
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
                      Sage's Insight
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
                © 2025 yidy. All rights reserved. For personal use only.
              </p>
              <p className="text-xs">
                Commercial use prohibited. This application is not a substitute for professional psychological treatment.
                <br />
                <a href="/license" className="text-red-400 hover:text-red-300 underline mx-2">License</a>
                <a href="/terms" className="text-red-400 hover:text-red-300 underline mx-2">Terms</a>
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
        initialContent={
          selectedConversationForJournal ? {
            question: selectedConversationForJournal.question,
            response: selectedConversationForJournal.response
          } : deepAnalysisForJournal ? {
            question: 'Deep Shadow Analysis Results',
            response: `${deepAnalysisForJournal.summary}\n\n${deepAnalysisForJournal.insights}`,
            phase2Data: deepAnalysisForJournal.phase2Data
          } : undefined
        }
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
        conversationContext={selectedConversationForExercise ? {
          question: selectedConversationForExercise.question,
          response: selectedConversationForExercise.response
        } : undefined}
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
        
        <div className="relative z-10 flex flex-col h-screen max-w-6xl mx-auto w-full px-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Sage {userPrefs?.name ? `& ${userPrefs.name}` : ''}
              </h2>
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
          <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {userPrefs?.name 
                    ? `Welcome ${userPrefs.name}, ready to chat with Sage?` 
                    : 'Start a conversation with Sage'
                  }
                </p>
                <p className="text-sm mt-2">Ask about your shadow work, relationships, patterns, or anything on your mind.</p>
              </div>
            ) : (
              conversations.map((conv, index) => (
                <div key={index} className="space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white p-3 rounded-2xl rounded-br-md max-w-[75%]">
                      {conv.question}
                    </div>
                  </div>
                  
                  {/* Sage response */}
                  <div className="flex justify-start">
                    <div data-response className="bg-gray-800 text-gray-100 p-4 rounded-2xl rounded-bl-md max-w-[80%]">
                      <div className="text-sm text-purple-400 mb-2">Sage</div>
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
                  <div className="text-sm text-purple-400 mb-2">Sage</div>
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
                placeholder="Ask Sage anything about your shadow work journey..."
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

  if (currentScreen === 'deepanalysis') {
    // Load journal entries for analysis
    const journalEntries = localStorage.getItem('shadowJournalEntries');
    const parsedEntries = journalEntries ? JSON.parse(journalEntries) : [];
    
    // Get archetype if user has completed quiz
    const currentArchetype = Object.keys(answers).length > 0 ? getShadowArchetype(calculateShadow.dominantTraits || [], calculateShadow.totalDarkness || 0) : null;
    
    return (
      <DeepAnalysis 
        onClose={closeDeepAnalysis}
        shadowProfile={currentArchetype ? {
          archetype: currentArchetype.name,
          traits: calculateShadow.dominantTraits?.slice(0, 5).map(t => t[0]) || [],
          intensity: (() => {
            const totalScore = calculateShadow.totalDarkness || 0;
            return totalScore > 15 ? 'intense' : totalScore > 10 ? 'deep' : totalScore > 5 ? 'moderate' : 'gentle';
          })(),
          description: currentArchetype.description
        } : undefined}
        journalEntries={parsedEntries}
        setCurrentScreen={setCurrentScreen}
        onCreateJournal={createJournalFromDeepAnalysis}
      />
    );
  }

  if (currentScreen === 'reanalysis') {
    // Get archetype if user has completed quiz
    const hasAnswers = Object.keys(answers).length > 0;
    let currentArchetype = null;
    
    if (hasAnswers) {
      const { dominantTraits, totalDarkness } = calculateShadow;
      currentArchetype = getShadowArchetype(dominantTraits, totalDarkness);
    }
    
    return (
      <ReAnalysis 
        onClose={() => setCurrentScreen('results')}
        shadowProfile={currentArchetype ? {
          archetype: currentArchetype.name,
          traits: calculateShadow.dominantTraits.map(([trait]) => trait),
          intensity: currentArchetype.intensity || 'moderate',
          description: currentArchetype.description
        } : undefined}
      />
    );
  }

  // Handle user guide screen
  if (currentScreen === 'guide') {
    return <UserGuide onClose={closeGuide} />;
  }

  // Handle dedicated progress dashboard screen
  if (currentScreen === 'progress') {
    const hasPhase2Data = localStorage.getItem('shadowDeepAnalysisPhase2');
    const completedActions = localStorage.getItem('shadowAnalysisCompletedActions');
    const completedExercises = localStorage.getItem('shadowAnalysisCompletedExercises');
    
    // Show basic progress for users without Phase 2 data
    if (!hasPhase2Data) {
      const journalEntries = localStorage.getItem('shadowJournalEntries');
      const journalCount = journalEntries ? JSON.parse(journalEntries).length : 0;
      const conversationCount = conversations.length;
      const hasCompletedQuiz = Object.keys(answers).length > 0;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 p-4">
          <div className="max-w-6xl mx-auto py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-bold text-white mb-4"
              >
                Your Progress Dashboard
              </motion.h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Track your shadow work journey - complete Deep Analysis below to unlock exercise tracking!
              </p>
            </div>

            {/* Basic Progress Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Quiz Status */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {hasCompletedQuiz ? '✅' : '⏳'}
                  </div>
                  <div className="text-purple-200 text-sm font-medium mb-2">Shadow Quiz</div>
                  <div className="text-gray-300 text-sm">
                    {hasCompletedQuiz ? 'Archetype Discovered' : 'Not Started'}
                  </div>
                </div>
              </motion.div>

              {/* Journal Progress */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-black/40 backdrop-blur-sm border border-gray-500/30 rounded-2xl p-6"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-400 mb-2">
                    {journalCount}
                  </div>
                  <div className="text-gray-200 text-sm font-medium mb-2">Journal Entries</div>
                  <div className="text-gray-300 text-sm">
                    {journalCount > 0 ? 'Insights Recorded' : 'Ready to Start'}
                  </div>
                </div>
              </motion.div>

              {/* Conversations */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {conversationCount}
                  </div>
                  <div className="text-blue-200 text-sm font-medium mb-2">Sage Conversations</div>
                  <div className="text-gray-300 text-sm">
                    {conversationCount > 0 ? 'Active Dialogue' : 'Ready to Chat'}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-3xl shadow-2xl mb-8">
              <div className="bg-black/60 backdrop-blur-sm rounded-3xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Ready to Go Deeper?</h3>
                  <p className="text-lg text-purple-200">
                    Unlock comprehensive behavioral analysis with personalized exercises and interactive progress tracking.
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentScreen('deepanalysis')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl border border-purple-500/30"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Eye className="w-8 h-8" />
                    <span>Start Deep Analysis</span>
                    <ArrowRight className="w-8 h-8" />
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    Get interactive exercises & comprehensive insights
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.button
                onClick={() => setCurrentScreen('results')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
              >
                ← Back to Results
              </motion.button>
              
              <motion.button
                onClick={() => setCurrentScreen('journal')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600/50 hover:bg-purple-500/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
              >
                Journal
              </motion.button>
              
              <motion.button
                onClick={() => setCurrentScreen('chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600/50 hover:bg-blue-500/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
              >
                Chat with Sage
              </motion.button>
              
              <motion.button
                onClick={() => setCurrentScreen('exercises')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600/50 hover:bg-green-500/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
              >
                Exercises
              </motion.button>
            </div>
          </div>
        </div>
      );
    }

    const phase2Data = JSON.parse(hasPhase2Data);
    const actionsCompleted = completedActions ? JSON.parse(completedActions).length : 0;
    const exercisesCompleted = completedExercises ? JSON.parse(completedExercises).length : 0;
    const totalActions = phase2Data?.integration_plan?.immediate_actions?.length || 0;
    const totalExercises = phase2Data?.integration_exercises?.length || 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 p-4">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
            >
              Your Progress Dashboard 📊
            </motion.h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Track your shadow work journey with comprehensive insights and actionable progress.
            </p>
          </div>

          {/* Progress Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Actions Progress */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {actionsCompleted}/{totalActions}
                </div>
                <div className="text-green-300 text-sm font-medium mb-4">Immediate Actions</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalActions > 0 ? (actionsCompleted / totalActions) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {totalActions > 0 ? Math.round((actionsCompleted / totalActions) * 100) : 0}% Complete
                </div>
              </div>
            </motion.div>

            {/* Exercises Progress */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {exercisesCompleted}/{totalExercises}
                </div>
                <div className="text-blue-300 text-sm font-medium mb-4">Integration Exercises</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalExercises > 0 ? (exercisesCompleted / totalExercises) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {totalExercises > 0 ? Math.round((exercisesCompleted / totalExercises) * 100) : 0}% Complete
                </div>
              </div>
            </motion.div>

            {/* Overall Progress */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {Math.round(((actionsCompleted + exercisesCompleted) / Math.max(totalActions + totalExercises, 1)) * 100)}%
                </div>
                <div className="text-purple-300 text-sm font-medium mb-4">Overall Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((actionsCompleted + exercisesCompleted) / Math.max(totalActions + totalExercises, 1)) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2">Shadow Integration</div>
              </div>
            </motion.div>

            {/* Journey Stage */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {actionsCompleted + exercisesCompleted === 0 ? '🌱' : 
                   actionsCompleted + exercisesCompleted < (totalActions + totalExercises) * 0.5 ? '🌿' :
                   actionsCompleted + exercisesCompleted < (totalActions + totalExercises) * 0.8 ? '🌳' : '🏆'}
                </div>
                <div className="text-yellow-300 text-sm font-medium mb-2">Journey Stage</div>
                <div className="text-xs text-gray-300">
                  {actionsCompleted + exercisesCompleted === 0 ? 'Getting Started' :
                   actionsCompleted + exercisesCompleted < (totalActions + totalExercises) * 0.5 ? 'Building Awareness' :
                   actionsCompleted + exercisesCompleted < (totalActions + totalExercises) * 0.8 ? 'Active Integration' : 'Shadow Mastery'}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Next Steps Guidance */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white text-center mb-6">What Should You Focus On?</h3>
            
            {(() => {
              const totalProgress = actionsCompleted + exercisesCompleted;
              const totalItems = totalActions + totalExercises;
              const progressPercent = totalItems > 0 ? (totalProgress / totalItems) * 100 : 0;
              
              if (actionsCompleted === 0 && totalActions > 0) {
                // Haven't started actions yet
                return (
                  <div className="text-center">
                    <div className="bg-green-900/30 rounded-xl p-6 mb-4">
                      <h4 className="text-xl font-semibold text-green-200 mb-3">Start with Immediate Actions</h4>
                      <p className="text-gray-300 mb-4">
                        Your analysis identified {totalActions} immediate actions to begin your shadow integration. 
                        These are designed to create quick wins and build momentum.
                      </p>
                      <p className="text-green-200 font-medium">
                        Start with the "easy" difficulty actions first - they'll build your confidence!
                      </p>
                    </div>
                  </div>
                );
              } else if (actionsCompleted < totalActions && exercisesCompleted === 0) {
                // Working on actions, haven't started exercises
                return (
                  <div className="text-center">
                    <div className="bg-blue-900/30 rounded-xl p-6 mb-4">
                      <h4 className="text-xl font-semibold text-blue-200 mb-3">Great Progress! Keep Going</h4>
                      <p className="text-gray-300 mb-4">
                        You've completed {actionsCompleted}/{totalActions} immediate actions. 
                        Finish these first before moving to the deeper integration exercises.
                      </p>
                      <p className="text-blue-200 font-medium">
                        Focus: Complete your remaining immediate actions
                      </p>
                    </div>
                  </div>
                );
              } else if (actionsCompleted >= totalActions && exercisesCompleted === 0) {
                // Finished actions, ready for exercises
                return (
                  <div className="text-center">
                    <div className="bg-purple-900/30 rounded-xl p-6 mb-4">
                      <h4 className="text-xl font-semibold text-purple-200 mb-3">Ready for Integration Exercises!</h4>
                      <p className="text-gray-300 mb-4">
                        Excellent! You've completed all {totalActions} immediate actions. 
                        Now it's time for the deeper integration exercises that will create lasting change.
                      </p>
                      <p className="text-purple-200 font-medium">
                        Next: Start your personalized integration exercises
                      </p>
                    </div>
                  </div>
                );
              } else {
                // Working on both or completed
                return (
                  <div className="text-center">
                    <div className="bg-yellow-900/30 rounded-xl p-6 mb-4">
                      <h4 className="text-xl font-semibold text-yellow-200 mb-3">
                        {progressPercent >= 80 ? "Shadow Integration Mastery!" : "Deep Integration Phase"}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {progressPercent >= 80 ? 
                          `Incredible work! You've completed ${progressPercent.toFixed(0)}% of your shadow work journey. Focus on maintaining these practices and exploring deeper insights.` :
                          `You're in the active integration phase with ${progressPercent.toFixed(0)}% completion. Continue balancing actions with exercises for optimal growth.`
                        }
                      </p>
                      <p className="text-yellow-200 font-medium">
                        {progressPercent >= 80 ? "Maintain & Deepen" : "Balance Actions & Exercises"}
                      </p>
                    </div>
                  </div>
                );
              }
            })()}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('exercises')}
              className="flex-1 max-w-xs bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl"
            >
              Go to Exercises
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('journal')}
              className="flex-1 max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl"
            >
              Journal Insights
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('reanalysis')}
              className="flex-1 max-w-xs bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl"
            >
              Deep Insights
            </motion.button>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen('results')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              ← Back to Results
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ShadowQuiz;