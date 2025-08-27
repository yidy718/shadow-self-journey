'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart, BookOpen, Target, MessageCircle } from 'lucide-react';
import { getStorageItem, StorageKeys } from '../lib/storageUtils';
import { getUserProgress, getBasicProgressSteps } from '../lib/progressUtils';
import { type UserPreferences } from '../lib/userPreferences';

interface ProgressDashboardProps {
  userPrefs: UserPreferences | null;
  conversations: any[];
  answers: Record<number, any>;
  onBack: () => void;
  onNavigateToJournal: () => void;
  onNavigateToExercises: () => void;
  onNavigateToChat: () => void;
  onNavigateToResults: () => void;
}

export const ProgressDashboard = ({ 
  userPrefs, 
  conversations, 
  answers, 
  onBack, 
  onNavigateToJournal, 
  onNavigateToExercises, 
  onNavigateToChat,
  onNavigateToResults 
}: ProgressDashboardProps) => {
  const hasPhase2Data = getStorageItem(StorageKeys.PHASE2_DATA);
  const completedActions = getStorageItem<string[]>(StorageKeys.COMPLETED_ACTIONS);
  const completedExercises = getStorageItem<string[]>(StorageKeys.COMPLETED_EXERCISES);
  
  // Show basic progress for users without Phase 2 data
  if (!hasPhase2Data) {
    const progress = getUserProgress(userPrefs);
    const basicSteps = getBasicProgressSteps(userPrefs, conversations);
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
                  {progress.hasCompletedQuiz ? '✅' : '⏳'}
                </div>
                <div className="text-purple-200 text-sm font-medium mb-2">Shadow Quiz</div>
                <div className="text-gray-300 text-sm">
                  {progress.hasCompletedQuiz ? 'Archetype Discovered' : 'Not Started'}
                </div>
              </div>
            </motion.div>

            {/* Journal Progress */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-400 mb-2">
                  {progress.hasJournalEntries ? '📖' : '📝'}
                </div>
                <div className="text-indigo-200 text-sm font-medium mb-2">Journal Entries</div>
                <div className="text-gray-300 text-sm">
                  {progress.hasJournalEntries ? 'Active Reflection' : 'Ready to Start'}
                </div>
              </div>
            </motion.div>

            {/* Overall Progress */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {basicSteps.current}/{basicSteps.total}
                </div>
                <div className="text-green-200 text-sm font-medium mb-2">Steps Complete</div>
                <div className="text-gray-300 text-sm">
                  {Math.round((basicSteps.current / basicSteps.total) * 100)}% Journey
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              onClick={onNavigateToResults}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
            >
              <BarChart className="w-5 h-5 mx-auto mb-2" />
              Results
            </motion.button>
            
            <motion.button
              onClick={onNavigateToJournal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600/50 hover:bg-indigo-500/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
            >
              <BookOpen className="w-5 h-5 mx-auto mb-2" />
              Journal
            </motion.button>
            
            <motion.button
              onClick={onNavigateToExercises}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600/50 hover:bg-green-500/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
            >
              <Target className="w-5 h-5 mx-auto mb-2" />
              Exercises
            </motion.button>
            
            <motion.button
              onClick={onNavigateToChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600/50 hover:bg-purple-500/50 text-white px-4 py-3 rounded-xl font-semibold transition-all"
            >
              <MessageCircle className="w-5 h-5 mx-auto mb-2" />
              Chat
            </motion.button>
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Results
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2 Progress Dashboard
  const phase2Data = hasPhase2Data;
  const actionsCompleted = Array.isArray(completedActions) ? completedActions.length : 0;
  const phase2ExercisesCompleted = Array.isArray(completedExercises) ? completedExercises.length : 0;
  const totalActions = (phase2Data as any)?.integration_plan?.immediate_actions?.length || 0;
  const totalPhase2Exercises = (phase2Data as any)?.integration_exercises?.length || 0;
  
  // Also track Integration Exercises (traditional shadow work exercises)
  const integrationExerciseProgress = getStorageItem<Record<string, string>>('shadowExerciseProgress') || {};
  const integrationExercisesCompleted = Object.keys(integrationExerciseProgress).length;
  const totalIntegrationExercises = 5; // Standard integration exercises per archetype
  
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
              <div className="text-green-300 text-sm font-medium mb-4">Actions Complete</div>
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

          {/* Exercises Progress - Clear separation of both exercise types */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 md:col-span-2"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Exercise Progress</h3>
            </div>
            
            {/* Integration Exercises */}
            <div className="bg-blue-900/20 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-blue-300 font-medium">Integration Exercises</div>
                <div className="text-2xl font-bold text-blue-400">
                  {integrationExercisesCompleted}/{totalIntegrationExercises}
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalIntegrationExercises > 0 ? (integrationExercisesCompleted / totalIntegrationExercises) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center">
                Shadow archetype exercises • {totalIntegrationExercises > 0 ? Math.round((integrationExercisesCompleted / totalIntegrationExercises) * 100) : 0}% Complete
              </div>
            </div>
            
            {/* Deep Analysis Exercises */}
            {totalPhase2Exercises > 0 && (
              <div className="bg-cyan-900/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-cyan-300 font-medium">Deep Analysis Exercises</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {phase2ExercisesCompleted}/{totalPhase2Exercises}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-cyan-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalPhase2Exercises > 0 ? (phase2ExercisesCompleted / totalPhase2Exercises) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 text-center">
                  AI-generated personalized exercises • {totalPhase2Exercises > 0 ? Math.round((phase2ExercisesCompleted / totalPhase2Exercises) * 100) : 0}% Complete
                </div>
              </div>
            )}
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
                {Math.round(((actionsCompleted + integrationExercisesCompleted) / Math.max(totalActions + totalIntegrationExercises, 1)) * 100)}%
              </div>
              <div className="text-purple-300 text-sm font-medium mb-4">Overall Progress</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((actionsCompleted + integrationExercisesCompleted) / Math.max(totalActions + totalIntegrationExercises, 1)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">Shadow Integration</div>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Results
          </motion.button>
        </div>
      </div>
    </div>
  );
};