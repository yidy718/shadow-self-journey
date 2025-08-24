'use client';

export interface ShadowProfile {
  archetype: string;
  traits: string[];
  intensity: string;
  description: string;
}

export interface EnhancedContext {
  journalEntries?: Array<{
    date: string;
    reflection: string;
    insights: string;
    integration: string;
    mood: number;
  }>;
  recentAnalyses?: string[];
  moodTrends?: number[];
  intensityLevel?: 'gentle' | 'moderate' | 'deep' | 'intense';
  phase2Analysis?: {
    behavioral_patterns?: Array<{
      pattern: string;
      description: string;
      frequency: string;
      impact_areas: string[];
    }>;
    shadow_elements?: Array<{
      element: string;
      manifestation: string;
      projection: string;
    }>;
    root_analysis?: {
      primary_wound: string;
      secondary_wound?: string;
      core_fear: string;
      defense_mechanism: string;
    };
    integration_plan?: {
      immediate_actions: Array<{
        action: string;
        timeline: string;
        difficulty: string;
      }>;
      ongoing_awareness: Array<{
        practice: string;
        trigger_signs: string[];
        intervention: string;
      }>;
      communication_shifts: Array<{
        old_pattern: string;
        new_approach: string;
        practice_area: string;
      }>;
      core_mindset_shift: string;
    };
    integration_exercises?: Array<{
      exercise: string;
      description: string;
      frequency: string;
      purpose: string;
    }>;
    overall_assessment?: {
      growth_readiness: string;
      resistance_level: string;
      support_needed: string;
      timeline_estimate: string;
    };
  };
  completedActions?: string[];
  completedExercises?: string[];
}

export type ConversationContext = 'chat' | 'assessment' | 'analysis' | 'reanalysis';

export const askClaude = async (
  question: string, 
  shadowProfile: ShadowProfile, 
  userId?: string,
  conversationHistory?: Array<{question: string, response: string}>,
  enhancedContext?: EnhancedContext,
  userName?: string,
  context: ConversationContext = 'chat'
): Promise<string> => {
  try {

    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        shadowProfile,
        userId,
        conversationHistory,
        enhancedContext,
        userName,
        context,
      }),
    });

    if (response.status === 429) {
      const errorData = await response.json();
      throw new Error(`Rate limit exceeded. Please try again later. ${errorData.resetTime ? `Reset in ${Math.ceil((errorData.resetTime - Date.now()) / (60 * 1000))} minutes.` : ''}`);
    }

    if (!response.ok) {
      throw new Error('Failed to get response from Claude');
    }

    const data = await response.json();
    console.log('📨 Frontend: Received response:', {
      source: data.source,
      responseLength: data.response?.length || 0,
      responseStart: data.response?.substring(0, 100) + '...'
    });
    return data.response;
  } catch (error) {
    console.error('Error asking Claude:', error);
    if (error instanceof Error && error.message.includes('Rate limit')) {
      throw error;
    }
    throw new Error('Failed to connect to Claude. Please try again later.');
  }
};

// Honest fallback when Sage is unavailable
export const getDemoInsight = (question: string, shadowProfile: ShadowProfile): string => {
  return `**Sage is currently unavailable** 📵

I apologize, but I cannot provide the personalized psychological insight you deserve right now. The Claude AI system that powers Sage appears to be temporarily unavailable or not properly configured.

**Your question was:** "${question}"
**Your archetype:** ${shadowProfile.archetype}

Rather than give you a generic response that doesn't address your specific situation, I believe you deserve authentic, personalized guidance based on your unique shadow work journey.

**What you can do:**
• Try asking again in a few minutes
• Check back later when Sage may be available
• Use the Journal feature to record your thoughts and questions
• Explore the Integration Exercises for your archetype

Your courage in asking deep questions about your shadow deserves real answers, not placeholder text.

*This message indicates that the Claude API is not available. Please check the environment configuration.*`;
};