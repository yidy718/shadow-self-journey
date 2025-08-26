'use client';

import { UserPreferences } from './userPreferences';
import { getStorageItem, StorageKeys } from './storageUtils';

export interface UserProgress {
  hasCompletedQuiz: boolean;
  hasAssessmentHistory: boolean;
  hasPhase2Data: boolean;
  hasPartialQuiz: boolean;
  hasJournalEntries: boolean;
  hasConversations: boolean;
  completionPercentage: number;
  answersCount: number;
}

export const getUserProgress = (userPrefs: UserPreferences | null): UserProgress => {
  if (!userPrefs) {
    return {
      hasCompletedQuiz: false,
      hasAssessmentHistory: false,
      hasPhase2Data: false,
      hasPartialQuiz: false,
      hasJournalEntries: false,
      hasConversations: false,
      completionPercentage: 0,
      answersCount: 0
    };
  }

  const answersCount = userPrefs.currentQuizProgress?.answers ? 
    Object.keys(userPrefs.currentQuizProgress.answers).length : 0;
  
  const hasAssessmentHistory = userPrefs.assessmentHistory && userPrefs.assessmentHistory.length > 0;
  const hasCompletedQuiz = answersCount >= 4 || hasAssessmentHistory; // Completed if either in-progress quiz has 4+ answers OR has assessment history
  const hasPhase2Data = !!getStorageItem(StorageKeys.PHASE2_DATA);
  const hasPartialQuiz = answersCount > 0 && !hasCompletedQuiz;
  
  const journalEntries = getStorageItem<any[]>(StorageKeys.JOURNAL_ENTRIES);
  const hasJournalEntries = Array.isArray(journalEntries) && journalEntries.length > 0;
  
  const conversations = getStorageItem<any[]>(StorageKeys.CONVERSATIONS);
  const hasConversations = Array.isArray(conversations) && conversations.length > 0;

  // Calculate completion percentage
  let completionScore = 0;
  if (hasCompletedQuiz) completionScore += 40;
  if (hasPhase2Data) completionScore += 30;
  if (hasJournalEntries) completionScore += 15;
  if (hasConversations) completionScore += 15;

  return {
    hasCompletedQuiz,
    hasAssessmentHistory,
    hasPhase2Data,
    hasPartialQuiz,
    hasJournalEntries,
    hasConversations,
    completionPercentage: completionScore,
    answersCount
  };
};

export type NavigationDestination = 'results' | 'quiz' | 'intro' | 'progress';

export const getRecommendedDestination = (userPrefs: UserPreferences | null): NavigationDestination => {
  const progress = getUserProgress(userPrefs);
  
  // Priority logic for Continue Journey
  if (progress.hasPhase2Data || progress.hasCompletedQuiz || progress.hasAssessmentHistory) {
    return 'results';
  }
  
  if (progress.hasPartialQuiz) {
    return 'quiz';
  }
  
  return 'intro';
};

export const getBasicProgressSteps = (userPrefs: UserPreferences | null, conversations: any[]): { current: number; total: number } => {
  if (!userPrefs) return { current: 0, total: 3 };
  
  const progress = getUserProgress(userPrefs);
  let current = 0;
  
  if (progress.hasCompletedQuiz) current++;
  if (progress.hasJournalEntries) current++;
  if (conversations.length > 0) current++;
  
  return { current, total: 3 };
};