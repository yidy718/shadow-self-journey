'use client';

export interface UserPreferences {
  id: string;
  name?: string;
  isAnonymous: boolean;
  intensityLevel?: 'gentle' | 'moderate' | 'deep' | 'intense';
  assessmentHistory: AssessmentResult[];
  createdAt: Date;
  lastUsed: Date;
  currentQuizProgress?: {
    currentQuestion: number;
    answers: Record<number, any>;
    conversations: Array<{question: string, response: string, timestamp: number}>;
  };
}

export interface AssessmentResult {
  id: string;
  date: Date;
  archetype: string;
  intensity: string;
  dominantTraits: string[];
  totalDarkness: number;
}

const STORAGE_KEY = 'shadowSelfUserPrefs';

export const getUserPreferences = (): UserPreferences | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      lastUsed: new Date(parsed.lastUsed),
      assessmentHistory: parsed.assessmentHistory.map((assessment: any) => ({
        ...assessment,
        date: new Date(assessment.date)
      }))
    };
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
};

export const saveUserPreferences = (prefs: UserPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...prefs,
      lastUsed: new Date()
    }));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

export const createNewUser = (name?: string): UserPreferences => {
  const now = new Date();
  const newUser: UserPreferences = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name?.trim() || undefined,
    isAnonymous: !name?.trim(),
    assessmentHistory: [],
    createdAt: now,
    lastUsed: now
  };
  
  saveUserPreferences(newUser);
  return newUser;
};

export const addAssessmentResult = (result: Omit<AssessmentResult, 'id' | 'date'>): void => {
  const prefs = getUserPreferences();
  if (!prefs) return;
  
  const newResult: AssessmentResult = {
    ...result,
    id: Date.now().toString(),
    date: new Date()
  };
  
  // Keep only last 10 assessments
  const updatedHistory = [newResult, ...prefs.assessmentHistory].slice(0, 10);
  
  saveUserPreferences({
    ...prefs,
    assessmentHistory: updatedHistory
  });
};

export const updateUserName = (name: string): void => {
  const prefs = getUserPreferences();
  if (!prefs) return;
  
  saveUserPreferences({
    ...prefs,
    name: name.trim() || undefined,
    isAnonymous: !name.trim()
  });
};

export const clearUserData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  // Also clear all shadow work data
  localStorage.removeItem('shadowJournalEntries');
  localStorage.removeItem('shadowExerciseProgress');
  localStorage.removeItem('shadowConversations');
};

export const exportUserData = () => {
  const prefs = getUserPreferences();
  const journalEntries = localStorage.getItem('shadowJournalEntries');
  const exerciseProgress = localStorage.getItem('shadowExerciseProgress');
  
  return {
    userPreferences: prefs,
    journalEntries: journalEntries ? JSON.parse(journalEntries) : null,
    exerciseProgress: exerciseProgress ? JSON.parse(exerciseProgress) : null,
    exportDate: new Date().toISOString()
  };
};

export const saveQuizProgress = (
  currentQuestion: number, 
  answers: Record<number, any>, 
  conversations: Array<{question: string, response: string, timestamp: number}>
): void => {
  const prefs = getUserPreferences();
  if (!prefs) return;

  const updatedPrefs: UserPreferences = {
    ...prefs,
    currentQuizProgress: {
      currentQuestion,
      answers,
      conversations
    },
    lastUsed: new Date()
  };

  saveUserPreferences(updatedPrefs);
};

export const clearQuizProgress = (): void => {
  const prefs = getUserPreferences();
  if (!prefs) return;

  const updatedPrefs: UserPreferences = {
    ...prefs,
    currentQuizProgress: undefined,
    lastUsed: new Date()
  };

  saveUserPreferences(updatedPrefs);
};