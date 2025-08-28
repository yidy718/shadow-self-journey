'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Eye, RotateCcw, MessageCircle, BookOpen, Target, HelpCircle, 
  Brain, Heart, Send, Loader, ArrowRight, Download, CheckSquare 
} from 'lucide-react';
import { ParticleField } from './ParticleField';
import { ResultsSkeleton, ChatLoadingSkeleton } from './Skeletons';
import ExportButton from './ExportButton';
import { getShadowArchetype } from '../lib/shadowArchetypes';
import { getStorageItem, StorageKeys } from '../lib/storageUtils';
import { saveUserPreferences, type UserPreferences } from '../lib/userPreferences';

interface Answer {
  optionId: string;
  shadow: Record<string, number>;
}

interface Conversation {
  question: string;
  response: string;
  timestamp: number;
}

interface ResultsScreenProps {
  answers: Record<number, Answer>;
  calculateShadow: {
    dominantTraits: [string, number][];
    totalDarkness: number;
  };
  userPrefs: UserPreferences | null;
  conversations: Conversation[];
  showFeedback: boolean;
  userQuestion: string;
  isLoadingResponse: boolean;
  claudeResponse: string;
  showConversationHistory: boolean;
  containerVariants: any;
  itemVariants: any;
  isLoadingResults?: boolean;
  onSetUserPrefs: (prefs: UserPreferences) => void;
  onSetCurrentScreen: (screen: string) => void;
  onOpenDeepAnalysis: () => void;
  onOpenChat: () => void;
  onOpenJournal: () => void;
  onOpenExercises: () => void;
  onOpenGuide: () => void;
  onOpenReAnalysis: () => void;
  onRestart: () => void;
  onSetShowFeedback: (show: boolean) => void;
  onSetUserQuestion: (question: string) => void;
  onHandleAskClaude: () => void;
  onSetShowConversationHistory: (show: boolean) => void;
  onCreateJournalFromConversation: (conv: Conversation) => void;
  onCreateExerciseFromConversation: (conv: Conversation) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  answers,
  calculateShadow,
  userPrefs,
  conversations,
  showFeedback,
  userQuestion,
  isLoadingResponse,
  claudeResponse,
  showConversationHistory,
  containerVariants,
  itemVariants,
  isLoadingResults = false,
  onSetUserPrefs,
  onSetCurrentScreen,
  onOpenDeepAnalysis,
  onOpenChat,
  onOpenJournal,
  onOpenExercises,
  onOpenGuide,
  onOpenReAnalysis,
  onRestart,
  onSetShowFeedback,
  onSetUserQuestion,
  onHandleAskClaude,
  onSetShowConversationHistory,
  onCreateJournalFromConversation,
  onCreateExerciseFromConversation,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Show loading skeleton while results are being calculated
  if (isLoadingResults) {
    return <ResultsSkeleton />;
  }

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

        {/* Primary Action - Deep Analysis CTA or Progress Dashboard */}
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          {(() => {
            const hasPhase2Data = getStorageItem(StorageKeys.PHASE2_DATA);
            
            if (hasPhase2Data) {
              // Only show the big progress card if they have actual Phase 2 data
              const completedActions = getStorageItem<string[]>(StorageKeys.COMPLETED_ACTIONS) || [];
              const completedPhase2Exercises = getStorageItem<string[]>(StorageKeys.COMPLETED_EXERCISES) || [];
              
              // Also track Integration Exercises (traditional shadow work exercises)
              const integrationExerciseProgress = getStorageItem<Record<string, string>>('shadowExerciseProgress') || {};
              const integrationExercisesCompleted = Object.keys(integrationExerciseProgress).length;
              const totalIntegrationExercises = 5;
              
              // Show Progress Dashboard if they have Deep Analysis data
              const phase2Data = hasPhase2Data;
              const actionsCompleted = completedActions.length;
              const phase2ExercisesCompleted = completedPhase2Exercises.length;
              const totalActions = (phase2Data as any)?.integration_plan?.immediate_actions?.length || 0;
              const totalPhase2Exercises = (phase2Data as any)?.integration_exercises?.length || 0;
              
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
                          {integrationExercisesCompleted}/{totalIntegrationExercises}
                        </div>
                        <div className="text-sm text-blue-300">Integration Exercises</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${totalIntegrationExercises > 0 ? (integrationExercisesCompleted / totalIntegrationExercises) * 100 : 0}%` }}
                          />
                        </div>
                        {totalPhase2Exercises > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-600">
                            <div className="text-sm text-cyan-400">
                              {phase2ExercisesCompleted}/{totalPhase2Exercises} Deep Analysis
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                              <div 
                                className="bg-cyan-500 h-1 rounded-full transition-all duration-500"
                                style={{ width: `${totalPhase2Exercises > 0 ? (phase2ExercisesCompleted / totalPhase2Exercises) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSetCurrentScreen('progress')}
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
                      onClick={onOpenDeepAnalysis}
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
            onClick={onOpenChat}
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
            onClick={onOpenJournal}
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
            onClick={onOpenExercises}
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Open integration exercises"
          >
            <Target className="w-6 h-6 mx-auto mb-2" />
            <div className="text-lg font-bold">Exercises</div>
            <div className="text-sm opacity-90">Integration Work</div>
          </motion.button>

          <motion.button
            onClick={onOpenGuide}
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
            onClick={onOpenReAnalysis}
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Re-analyze all data with Sage"
          >
            <Brain className="w-6 h-6 mx-auto mb-2" />
            <div className="text-lg font-bold">Re-analyze</div>
            <div className="text-sm opacity-90">Evolved Insights</div>
          </motion.button>

          {/* Settings Button to toggle Gentle Mode */}
          <motion.button
            onClick={() => {
              if (userPrefs) {
                const updatedPrefs = { ...userPrefs, gentleMode: !userPrefs.gentleMode };
                saveUserPreferences(updatedPrefs);
                onSetUserPrefs(updatedPrefs);
              }
            }}
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            className={`${userPrefs?.gentleMode 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
            } text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border ${userPrefs?.gentleMode ? 'border-green-500/30' : 'border-gray-500/30'} focus:outline-none focus:ring-2 ${userPrefs?.gentleMode ? 'focus:ring-green-400' : 'focus:ring-gray-400'}`}
            aria-label={`${userPrefs?.gentleMode ? 'Disable' : 'Enable'} gentle mode`}
          >
            <Heart className="w-6 h-6 mx-auto mb-2" />
            <div className="text-lg font-bold">
              {userPrefs?.gentleMode ? 'Gentle' : 'Standard'}
            </div>
            <div className="text-sm opacity-90">Mode</div>
          </motion.button>
        </motion.div>

        {/* Sage Consultation Feedback */}
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
                onChange={(e) => onSetUserQuestion(e.target.value)}
                placeholder="What would you like to understand about your shadow? Be specific about what you're experiencing, feeling, or struggling with..."
                className="w-full bg-gray-800/80 text-white p-6 rounded-2xl mb-6 text-lg border border-red-500/30 focus:border-red-400/70 transition-colors backdrop-blur-sm"
                rows={4}
                disabled={isLoadingResponse}
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onHandleAskClaude}
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
                  onClick={() => onSetShowFeedback(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-full text-lg font-medium transition-all duration-300"
                >
                  Close
                </button>
              </div>
              
              {isLoadingResponse && !claudeResponse && (
                <ChatLoadingSkeleton />
              )}
              
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
                        onClick={() => onCreateJournalFromConversation(conversations[conversations.length - 1])}
                        className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Journal This
                      </button>
                      <button
                        onClick={() => onCreateExerciseFromConversation(conversations[conversations.length - 1])}
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
                    onClick={() => onSetShowConversationHistory(!showConversationHistory)}
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
                                onClick={() => onCreateJournalFromConversation(conv)}
                                className="flex items-center bg-emerald-600/70 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs transition-all"
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                Journal
                              </button>
                              <button
                                onClick={() => onCreateExerciseFromConversation(conv)}
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
        
        {/* Restart Button and Legal */}
        <div className="text-center">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
            onClick={onRestart}
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
};

export default ResultsScreen;