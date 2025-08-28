'use client';

export interface UserPreferences {
  id: string;
  name?: string;
  isAnonymous: boolean;
  age?: number;
  intensityLevel?: 'gentle' | 'moderate' | 'deep' | 'intense';
  gentleMode?: boolean; // Extra supportive mode with softer language
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
    
    // Ensure assessmentHistory is always an array
    const assessmentHistory = Array.isArray(parsed.assessmentHistory) 
      ? parsed.assessmentHistory.map((assessment: any) => ({
          ...assessment,
          date: new Date(assessment.date)
        }))
      : [];
    
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      lastUsed: new Date(parsed.lastUsed),
      assessmentHistory
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

export const createNewUser = (name?: string, age?: number): UserPreferences => {
  const now = new Date();
  const newUser: UserPreferences = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name?.trim() || undefined,
    isAnonymous: !name?.trim(),
    age: age && age > 0 ? age : undefined,
    assessmentHistory: [],
    createdAt: now,
    lastUsed: now
  };
  
  saveUserPreferences(newUser);
  return newUser;
};

/**
 * Get allowed intensity levels based on user's age
 */
export const getAllowedIntensityLevels = (age?: number): ('gentle' | 'moderate' | 'deep' | 'intense')[] => {
  if (!age) {
    // If age is not provided, allow all levels but suggest starting gentle
    return ['gentle', 'moderate', 'deep', 'intense'];
  }
  
  if (age < 16) {
    // Under 16: Only gentle mode for safety
    return ['gentle'];
  }
  
  if (age < 21) {
    // Ages 16-20: Gentle and moderate only
    return ['gentle', 'moderate'];
  }
  
  // 21 and over: All levels available
  return ['gentle', 'moderate', 'deep', 'intense'];
};

/**
 * Get recommended intensity level based on user's age
 */
export const getRecommendedIntensity = (age?: number): 'gentle' | 'moderate' | 'deep' | 'intense' => {
  if (!age || age < 18) {
    return 'gentle';
  }
  
  if (age < 25) {
    return 'moderate';
  }
  
  return 'moderate'; // Default to moderate for adults, they can choose deeper
};

/**
 * Check if a specific intensity level is allowed for the user's age
 */
export const isIntensityAllowed = (intensity: string, age?: number): boolean => {
  const allowed = getAllowedIntensityLevels(age);
  return allowed.includes(intensity as any);
};

/**
 * Get age-appropriate warning message for intensity restrictions
 */
export const getAgeRestictionMessage = (age?: number): string | null => {
  if (!age) return null;
  
  if (age < 16) {
    return "For your wellbeing, only gentle intensity is available for users under 16. This ensures a safe, supportive exploration of shadow work concepts.";
  }
  
  if (age < 21) {
    return "Based on your age, we recommend starting with gentle or moderate intensity. Deep shadow work can be intense and is best approached gradually.";
  }
  
  return null;
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