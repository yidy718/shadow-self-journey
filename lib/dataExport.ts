'use client';

import { getUserPreferences, type UserPreferences } from './userPreferences';
import { getStorageItem, StorageKeys } from './storageUtils';

export interface ExportData {
  user: UserPreferences | null;
  journalEntries: Array<{
    id: string;
    date: Date;
    archetype: string;
    reflection: string;
    mood: number;
    insights: string;
    integration: string;
  }>;
  conversations: Array<{
    question: string;
    response: string;
    timestamp: number;
  }>;
  deepAnalysis: {
    phase1Data: any;
    phase2Data: any;
    coreResponses: Record<string, string>;
    followUpResponses: Record<string, string>;
  } | null;
  exerciseProgress: {
    completedActions: string[];
    completedExercises: string[];
  };
  exportMeta: {
    exportDate: Date;
    appVersion: string;
    dataVersion: string;
    exportedBy?: string;
    exportType: 'full' | 'filtered' | 'summary';
    totalSize: string;
  };
}

export interface ExportFilters {
  includeJournal: boolean;
  includeConversations: boolean;
  includeDeepAnalysis: boolean;
  includeExerciseProgress: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  archetypeFilter?: string[];
  exportType?: 'full' | 'filtered' | 'summary';
}

/**
 * Aggregates all user data from localStorage for export
 */
export const aggregateUserData = (filters?: ExportFilters): ExportData => {
  // Get user preferences and assessment history
  const userPrefs = getUserPreferences();
  
  // Get journal entries with optional filtering
  let journalEntries = filters?.includeJournal !== false 
    ? (getStorageItem<any[]>(StorageKeys.JOURNAL_ENTRIES) || []).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }))
    : [];
  
  // Apply date range filter if specified
  if (filters?.dateRange && journalEntries.length > 0) {
    journalEntries = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= filters.dateRange!.start && entryDate <= filters.dateRange!.end;
    });
  }
  
  // Apply archetype filter if specified
  if (filters?.archetypeFilter && filters.archetypeFilter.length > 0) {
    journalEntries = journalEntries.filter(entry => 
      filters.archetypeFilter!.includes(entry.archetype)
    );
  }
  
  // Get conversations from user preferences with filtering
  const conversations = (filters?.includeConversations !== false)
    ? (userPrefs?.currentQuizProgress?.conversations || [])
    : [];
  
  // Get Deep Analysis data
  const phase1Data = getStorageItem('shadowDeepAnalysisPhase1');
  const phase2Data = getStorageItem(StorageKeys.PHASE2_DATA);
  const coreResponses = getStorageItem('shadowDeepAnalysisCoreResponses');
  const followUpResponses = getStorageItem('shadowDeepAnalysisFollowUpResponses');
  
  const deepAnalysis = (filters?.includeDeepAnalysis !== false && (phase1Data || phase2Data || coreResponses || followUpResponses)) ? {
    phase1Data: phase1Data,
    phase2Data: phase2Data,
    coreResponses: (coreResponses as Record<string, string>) || {},
    followUpResponses: (followUpResponses as Record<string, string>) || {}
  } : null;
  
  // Get exercise progress
  const completedActions = getStorageItem<string[]>(StorageKeys.COMPLETED_ACTIONS);
  const completedExercises = getStorageItem<string[]>(StorageKeys.COMPLETED_EXERCISES);
  
  const exerciseProgress = (filters?.includeExerciseProgress !== false) ? {
    completedActions: completedActions || [],
    completedExercises: completedExercises || []
  } : {
    completedActions: [],
    completedExercises: []
  };
  
  return {
    user: userPrefs,
    journalEntries,
    conversations,
    deepAnalysis,
    exerciseProgress,
    exportMeta: {
      exportDate: new Date(),
      appVersion: '1.0.0',
      dataVersion: '1.0',
      exportedBy: userPrefs?.name || 'Anonymous',
      exportType: filters ? 'filtered' : 'full',
      totalSize: calculateDataSize({ user: userPrefs, journalEntries, conversations, deepAnalysis, exerciseProgress })
    }
  };
};

/**
 * Downloads data as JSON file with optional filtering
 */
export const exportAsJSON = (filters?: ExportFilters): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const data = aggregateUserData(filters);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const fileName = filters?.exportType === 'filtered' 
        ? `shadow-work-filtered-${new Date().toISOString().split('T')[0]}.json`
        : `shadow-work-journey-${new Date().toISOString().split('T')[0]}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      resolve(true);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      resolve(false);
    }
  });
};

/**
 * Generates a comprehensive summary with optional filtering
 */
export const generateDataSummary = (filters?: ExportFilters): string => {
  const data = aggregateUserData(filters);
  const { user, journalEntries, conversations, deepAnalysis, exerciseProgress } = data;
  
  let summary = `# The Abyss - Shadow Work Journey Export\n\n`;
  summary += `**Export Date:** ${new Date().toLocaleDateString()}\n`;
  summary += `**User:** ${user?.name || 'Anonymous'}\n`;
  summary += `**Member Since:** ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}\n\n`;
  
  // Assessment History
  if (user?.assessmentHistory && user.assessmentHistory.length > 0) {
    summary += `## Assessment History (${user.assessmentHistory.length} assessments)\n\n`;
    user.assessmentHistory.forEach((assessment, index) => {
      summary += `**${index + 1}. ${assessment.archetype}** (${new Date(assessment.date).toLocaleDateString()})\n`;
      summary += `- Intensity: ${assessment.intensity}\n`;
      summary += `- Dominant Traits: ${assessment.dominantTraits.join(', ')}\n`;
      summary += `- Shadow Score: ${assessment.totalDarkness}\n\n`;
    });
  }
  
  // Deep Analysis Summary
  if (deepAnalysis?.phase2Data) {
    const phase2 = deepAnalysis.phase2Data;
    summary += `## Deep Analysis Results\n\n`;
    
    if (phase2.behavioral_patterns) {
      summary += `### Behavioral Patterns\n`;
      phase2.behavioral_patterns.forEach((pattern: any, index: number) => {
        summary += `${index + 1}. **${pattern.pattern}** (${pattern.frequency} frequency)\n`;
        summary += `   ${pattern.description}\n\n`;
      });
    }
    
    if (phase2.root_analysis) {
      summary += `### Root Analysis\n`;
      summary += `- **Primary Wound:** ${phase2.root_analysis.primary_wound}\n`;
      summary += `- **Core Fear:** ${phase2.root_analysis.core_fear}\n`;
      summary += `- **Defense Mechanism:** ${phase2.root_analysis.defense_mechanism}\n\n`;
    }
    
    if (phase2.integration_plan?.immediate_actions) {
      summary += `### Integration Actions\n`;
      phase2.integration_plan.immediate_actions.forEach((action: any, index: number) => {
        const completed = exerciseProgress.completedActions.includes(`action-${index}`);
        summary += `${completed ? '✅' : '⭕'} ${action.action} (${action.timeline})\n`;
      });
      summary += '\n';
    }
  }
  
  // Journal Summary
  if (journalEntries.length > 0) {
    summary += `## Journal Entries (${journalEntries.length} entries)\n\n`;
    journalEntries.slice(0, 5).forEach((entry: any) => {
      summary += `**${new Date(entry.date).toLocaleDateString()}** - ${entry.archetype}\n`;
      summary += `*Mood: ${['😢', '😟', '😐', '🙂', '😊'][entry.mood - 1]} (${entry.mood}/5)*\n`;
      summary += `${entry.reflection.substring(0, 200)}${entry.reflection.length > 200 ? '...' : ''}\n\n`;
    });
    
    if (journalEntries.length > 5) {
      summary += `*... and ${journalEntries.length - 5} more entries*\n\n`;
    }
  }
  
  // Conversations Summary
  if (conversations.length > 0) {
    summary += `## Sage AI Conversations (${conversations.length} interactions)\n\n`;
    conversations.slice(-3).forEach((conv: any) => {
      summary += `**Q:** ${conv.question.substring(0, 100)}${conv.question.length > 100 ? '...' : ''}\n`;
      summary += `**A:** ${conv.response.substring(0, 200)}${conv.response.length > 200 ? '...' : ''}\n\n`;
    });
  }
  
  // Progress Summary
  summary += `## Progress Summary\n\n`;
  summary += `- **Total Assessments:** ${user?.assessmentHistory?.length || 0}\n`;
  summary += `- **Journal Entries:** ${journalEntries.length}\n`;
  summary += `- **AI Conversations:** ${conversations.length}\n`;
  summary += `- **Actions Completed:** ${exerciseProgress.completedActions.length}\n`;
  summary += `- **Exercises Completed:** ${exerciseProgress.completedExercises.length}\n\n`;
  
  summary += `---\n\n`;
  summary += `*This export contains your complete shadow work journey data. Keep it private and secure.*\n`;
  summary += `*Generated by The Abyss - Shadow Self Journey (https://www.shadowself.app)*`;
  
  // Add filter information if filters were applied
  if (filters) {
    summary += `\n## Export Settings\n\n`;
    summary += `- **Export Type:** ${filters.exportType || 'filtered'}\n`;
    if (filters.dateRange) {
      summary += `- **Date Range:** ${filters.dateRange.start.toLocaleDateString()} to ${filters.dateRange.end.toLocaleDateString()}\n`;
    }
    if (filters.archetypeFilter && filters.archetypeFilter.length > 0) {
      summary += `- **Archetype Filter:** ${filters.archetypeFilter.join(', ')}\n`;
    }
    summary += `- **Included Data:** `;
    const includedData = [];
    if (filters.includeJournal !== false) includedData.push('Journal');
    if (filters.includeConversations !== false) includedData.push('Conversations');
    if (filters.includeDeepAnalysis !== false) includedData.push('Deep Analysis');
    if (filters.includeExerciseProgress !== false) includedData.push('Exercise Progress');
    summary += includedData.join(', ') + '\n\n';
  }
  
  return summary;
};

/**
 * Calculate approximate data size for export metadata
 */
const calculateDataSize = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} bytes`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(sizeInBytes / 1024 * 10) / 10} KB`;
    } else {
      return `${Math.round(sizeInBytes / (1024 * 1024) * 10) / 10} MB`;
    }
  } catch {
    return 'Unknown size';
  }
};

/**
 * Export data as CSV format for analytics
 */
export const exportAsCSV = (dataType: 'journal' | 'assessments' | 'conversations', filters?: ExportFilters): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const data = aggregateUserData(filters);
      let csvContent = '';
      let fileName = '';
      
      switch (dataType) {
        case 'journal':
          csvContent = generateJournalCSV(data.journalEntries);
          fileName = `shadow-work-journal-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'assessments':
          csvContent = generateAssessmentsCSV(data.user?.assessmentHistory || []);
          fileName = `shadow-work-assessments-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'conversations':
          csvContent = generateConversationsCSV(data.conversations);
          fileName = `shadow-work-conversations-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          resolve(false);
          return;
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      resolve(true);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      resolve(false);
    }
  });
};

/**
 * Generate CSV content for journal entries
 */
const generateJournalCSV = (journalEntries: any[]): string => {
  const headers = ['Date', 'Archetype', 'Mood', 'Reflection Length', 'Insights Length', 'Integration Length'];
  const csvRows = [headers.join(',')];
  
  journalEntries.forEach(entry => {
    const row = [
      new Date(entry.date).toISOString().split('T')[0],
      `"${entry.archetype}"`,
      entry.mood,
      entry.reflection?.length || 0,
      entry.insights?.length || 0,
      entry.integration?.length || 0
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Generate CSV content for assessments
 */
const generateAssessmentsCSV = (assessments: any[]): string => {
  const headers = ['Date', 'Archetype', 'Intensity', 'Total Darkness Score', 'Dominant Traits'];
  const csvRows = [headers.join(',')];
  
  assessments.forEach(assessment => {
    const row = [
      new Date(assessment.date).toISOString().split('T')[0],
      `"${assessment.archetype}"`,
      `"${assessment.intensity}"`,
      assessment.totalDarkness,
      `"${assessment.dominantTraits.join('; ')}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Generate CSV content for conversations
 */
const generateConversationsCSV = (conversations: any[]): string => {
  const headers = ['Timestamp', 'Question Length', 'Response Length', 'Date'];
  const csvRows = [headers.join(',')];
  
  conversations.forEach(conv => {
    const date = new Date(conv.timestamp);
    const row = [
      conv.timestamp,
      conv.question?.length || 0,
      conv.response?.length || 0,
      date.toISOString().split('T')[0]
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Import and restore user data from JSON export
 */
export const importUserData = (jsonData: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    try {
      const data = JSON.parse(jsonData) as ExportData;
      
      // Validate data structure
      if (!data.exportMeta || !data.exportMeta.appVersion) {
        resolve({ success: false, message: 'Invalid export file format' });
        return;
      }
      
      // Import user preferences
      if (data.user) {
        localStorage.setItem('shadowSelfUserPrefs', JSON.stringify(data.user));
      }
      
      // Import journal entries
      if (data.journalEntries && data.journalEntries.length > 0) {
        localStorage.setItem(StorageKeys.JOURNAL_ENTRIES, JSON.stringify(data.journalEntries));
      }
      
      // Import deep analysis data
      if (data.deepAnalysis) {
        if (data.deepAnalysis.phase1Data) {
          localStorage.setItem('shadowDeepAnalysisPhase1', JSON.stringify(data.deepAnalysis.phase1Data));
        }
        if (data.deepAnalysis.phase2Data) {
          localStorage.setItem(StorageKeys.PHASE2_DATA, JSON.stringify(data.deepAnalysis.phase2Data));
        }
        if (data.deepAnalysis.coreResponses) {
          localStorage.setItem('shadowDeepAnalysisCoreResponses', JSON.stringify(data.deepAnalysis.coreResponses));
        }
        if (data.deepAnalysis.followUpResponses) {
          localStorage.setItem('shadowDeepAnalysisFollowUpResponses', JSON.stringify(data.deepAnalysis.followUpResponses));
        }
      }
      
      // Import exercise progress
      if (data.exerciseProgress) {
        if (data.exerciseProgress.completedActions.length > 0) {
          localStorage.setItem(StorageKeys.COMPLETED_ACTIONS, JSON.stringify(data.exerciseProgress.completedActions));
        }
        if (data.exerciseProgress.completedExercises.length > 0) {
          localStorage.setItem(StorageKeys.COMPLETED_EXERCISES, JSON.stringify(data.exerciseProgress.completedExercises));
        }
      }
      
      resolve({ 
        success: true, 
        message: `Successfully imported data from ${data.exportMeta.exportDate ? new Date(data.exportMeta.exportDate).toLocaleDateString() : 'unknown date'}` 
      });
      
    } catch (error) {
      console.error('Error importing data:', error);
      resolve({ success: false, message: 'Failed to parse import file. Please ensure it\'s a valid JSON export.' });
    }
  });
};

/**
 * Downloads data as formatted text file with optional filtering
 */
export const exportAsText = (filters?: ExportFilters): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const summary = generateDataSummary(filters);
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const fileName = filters?.exportType === 'filtered' 
        ? `shadow-work-filtered-summary-${new Date().toISOString().split('T')[0]}.txt`
        : `shadow-work-summary-${new Date().toISOString().split('T')[0]}.txt`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      resolve(true);
    } catch (error) {
      console.error('Error exporting text:', error);
      resolve(false);
    }
  });
};

/**
 * Gets export statistics for display
 */
export const getExportStats = () => {
  const data = aggregateUserData();
  return {
    assessments: data.user?.assessmentHistory?.length || 0,
    journalEntries: data.journalEntries.length,
    conversations: data.conversations.length,
    hasDeepAnalysis: !!data.deepAnalysis,
    actionsCompleted: data.exerciseProgress.completedActions.length,
    exercisesCompleted: data.exerciseProgress.completedExercises.length,
    memberSince: data.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : null
  };
};