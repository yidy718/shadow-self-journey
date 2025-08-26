'use client';

export const StorageKeys = {
  PHASE2_DATA: 'shadowDeepAnalysisPhase2',
  COMPLETED_ACTIONS: 'shadowAnalysisCompletedActions',
  COMPLETED_EXERCISES: 'shadowAnalysisCompletedExercises',
  JOURNAL_ENTRIES: 'shadowJournalEntries',
  CONVERSATIONS: 'shadowConversations',
  USER_PREFERENCES: 'shadowSelfUserPrefs'
} as const;

export const getStorageItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return null;
  }
};

export const setStorageItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
};