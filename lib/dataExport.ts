'use client';

import { getUserPreferences, type UserPreferences } from './userPreferences';

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
  };
}

/**
 * Aggregates all user data from localStorage for export
 */
export const aggregateUserData = (): ExportData => {
  // Get user preferences and assessment history
  const userPrefs = getUserPreferences();
  
  // Get journal entries
  const journalData = localStorage.getItem('shadowJournalEntries');
  const journalEntries = journalData ? JSON.parse(journalData).map((entry: any) => ({
    ...entry,
    date: new Date(entry.date)
  })) : [];
  
  // Get conversations from user preferences
  const conversations = userPrefs?.currentQuizProgress?.conversations || [];
  
  // Get Deep Analysis data
  const phase1Data = localStorage.getItem('shadowDeepAnalysisPhase1');
  const phase2Data = localStorage.getItem('shadowDeepAnalysisPhase2');
  const coreResponses = localStorage.getItem('shadowDeepAnalysisCoreResponses');
  const followUpResponses = localStorage.getItem('shadowDeepAnalysisFollowUpResponses');
  
  const deepAnalysis = (phase1Data || phase2Data || coreResponses || followUpResponses) ? {
    phase1Data: phase1Data ? JSON.parse(phase1Data) : null,
    phase2Data: phase2Data ? JSON.parse(phase2Data) : null,
    coreResponses: coreResponses ? JSON.parse(coreResponses) : {},
    followUpResponses: followUpResponses ? JSON.parse(followUpResponses) : {}
  } : null;
  
  // Get exercise progress
  const completedActions = localStorage.getItem('shadowAnalysisCompletedActions');
  const completedExercises = localStorage.getItem('shadowAnalysisCompletedExercises');
  
  const exerciseProgress = {
    completedActions: completedActions ? JSON.parse(completedActions) : [],
    completedExercises: completedExercises ? JSON.parse(completedExercises) : []
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
      dataVersion: '1.0'
    }
  };
};

/**
 * Downloads data as JSON file
 */
export const exportAsJSON = (): void => {
  try {
    const data = aggregateUserData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `shadow-work-journey-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    alert('Failed to export data. Please try again.');
  }
};

/**
 * Generates a comprehensive summary for PDF export
 */
export const generateDataSummary = (): string => {
  const data = aggregateUserData();
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
  
  return summary;
};

/**
 * Downloads data as formatted text file (PDF alternative for now)
 */
export const exportAsText = (): void => {
  try {
    const summary = generateDataSummary();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `shadow-work-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting text:', error);
    alert('Failed to export summary. Please try again.');
  }
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