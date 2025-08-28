'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Skull, Heart, ArrowRight } from 'lucide-react';
import { ParticleField } from './ParticleField';
import { ProgressBar } from './ProgressBar';
import { QuestionSkeleton } from './Skeletons';
import { getQuestionText, getReflectionText } from '../lib/questions';
import { type UserPreferences } from '../lib/userPreferences';

interface Answer {
  optionId: string;
  shadow: Record<string, number>;
}

interface Question {
  id: number;
  text: string;
  gentleText?: string;
  reflection: string;
  gentleReflection?: string;
  options: Array<{
    id: string;
    text: string;
    shadow: Record<string, number>;
  }>;
}

interface QuizScreenProps {
  currentQuestion: number;
  currentQuestions: Question[];
  questionsReady: boolean;
  selectedOption: string | null;
  isTransitioning: boolean;
  focusedOptionIndex: number;
  userPrefs: UserPreferences | null;
  optionRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  onAnswer: (questionId: number, optionId: string, shadow: Record<string, number>) => void;
  onSkipQuestion: () => void;
  onSetFocusedOptionIndex: (index: number) => void;
  onWelcomeScreen: () => void;
  onSetCurrentQuestion: (question: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  currentQuestion,
  currentQuestions,
  questionsReady,
  selectedOption,
  isTransitioning,
  focusedOptionIndex,
  userPrefs,
  optionRefs,
  onAnswer,
  onSkipQuestion,
  onSetFocusedOptionIndex,
  onWelcomeScreen,
  onSetCurrentQuestion,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Wait for questions to be ready before rendering
  if (!questionsReady || currentQuestions.length === 0) {
    return <QuestionSkeleton />;
  }

  const question = currentQuestions[currentQuestion];
  
  // Safety check: if question is undefined or malformed, return to welcome screen
  if (!question || !question.text || !question.options || !Array.isArray(question.options)) {
    console.error('Question is undefined or malformed at index:', currentQuestion, 'Question:', question, 'Total questions:', currentQuestions.length);
    // Reset to first question if out of bounds
    if (currentQuestion >= currentQuestions.length) {
      onSetCurrentQuestion(0);
      return null;
    }
    onWelcomeScreen();
    return null;
  }
  
  const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/10 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Skip Links */}
      <div className="sr-only focus-within:not-sr-only">
        <a 
          href="#question-content" 
          className="absolute top-4 left-4 bg-black text-white p-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Skip to question
        </a>
        <a 
          href="#answer-options" 
          className="absolute top-4 left-32 bg-black text-white p-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Skip to answer options
        </a>
      </div>
      <ParticleField count={shouldReduceMotion ? 8 : 20} />
      
      <div className="absolute top-0 left-0 w-full z-20">
        <ProgressBar progress={progress} />
      </div>
      
      <div 
        className="absolute top-8 right-8 text-red-300 font-medium text-xl z-20 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm"
        aria-label={`Question ${currentQuestion + 1} of ${currentQuestions.length}`}
        role="status"
        aria-live="polite"
      >
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
          <div className="text-center mb-20" id="question-content">
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
              <Skull className="w-16 h-16 text-red-400 mx-auto mb-10" aria-hidden="true" />
            </motion.div>
            
            <h2 
              className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 sm:mb-10 leading-tight max-w-5xl mx-auto text-glow px-4"
              id={`question-${currentQuestion}`}
              aria-describedby={`reflection-${currentQuestion}`}
              tabIndex={-1}
            >
              {getQuestionText(question, userPrefs?.gentleMode || false)}
            </h2>
            
            <p 
              className="text-lg sm:text-xl text-red-200 italic opacity-80 max-w-3xl mx-auto font-light px-4"
              id={`reflection-${currentQuestion}`}
            >
              {getReflectionText(question, userPrefs?.gentleMode || false)}
            </p>
          </div>
          
          <div className="grid gap-8" role="radiogroup" aria-labelledby={`question-${currentQuestion}`} id="answer-options">
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              Use arrow keys to navigate options, Enter or Space to select. Question {currentQuestion + 1} of {currentQuestions.length}
            </div>
            {question.options.filter(option => option && option.text).map((option, index) => {
              const isSelected = selectedOption === option.id;
              const isFocused = focusedOptionIndex === index;
              return (
                <motion.button
                  key={option.id}
                  ref={(el) => { optionRefs.current[index] = el; }}
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
                  onClick={() => onAnswer(question.id, option.id, option.shadow)}
                  onFocus={() => onSetFocusedOptionIndex(index)}
                  className={`group btn-secondary text-lg sm:text-xl lg:text-2xl p-4 sm:p-8 lg:p-10 mx-4 sm:mx-0 relative overflow-hidden transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-red-400 bg-red-900/30' : ''
                  } ${isFocused ? 'ring-2 ring-red-300 ring-offset-2 ring-offset-black' : ''} hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400`}
                  disabled={isTransitioning}
                  role="radio"
                  aria-checked={isSelected}
                  aria-describedby={`option-${index}-description`}
                  data-option-id={option.id}
                  tabIndex={isFocused ? 0 : -1}
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
                        aria-hidden="true"
                      >
                        <Heart className="w-5 h-5 text-red-400" />
                      </motion.div>
                    )}
                    <span id={`option-${index}-description`}>
                      {option.text}
                    </span>
                    <ArrowRight 
                      className={`ml-2 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 transition-all text-red-400 relative z-10 ${
                        isSelected 
                          ? 'opacity-100 translate-x-2' 
                          : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-2'
                      }`} 
                      aria-hidden="true"
                    />
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
              onClick={onSkipQuestion}
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
};

export default QuizScreen;