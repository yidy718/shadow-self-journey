'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader, Brain, FileText, Plus, Lightbulb, Target, Eye, Check, Square } from 'lucide-react';
import { askClaude, type ShadowProfile } from '../lib/claudeApi';

interface DeepAnalysisProps {
  onClose: () => void;
  shadowProfile?: ShadowProfile;
  journalEntries?: Array<{
    id: string;
    date: Date;
    reflection: string;
    insights: string;
    integration: string;
  }>;
  setCurrentScreen?: (screen: 'results' | 'identity' | 'exercises' | 'journal' | 'chat' | 'welcome' | 'quiz' | 'deepanalysis' | 'reanalysis') => void;
  onCreateJournal?: (analysisData: {summary: string, insights: string}) => void;
}

interface AnalysisQuestion {
  id: string;
  question: string;
  category: 'relationship' | 'self-worth' | 'conflict' | 'patterns' | 'triggers' | 'projection' | 'general';
}

interface Phase1Response {
  phase: number;
  initial_pattern_analysis: string;
  follow_up_questions: Array<{
    id: number;
    question: string;
    purpose: 'behavioral_specifics' | 'contradiction_exploration' | 'emotional_excavation' | 'pattern_confirmation' | 'shadow_exploration';
  }>;
  preliminary_observations: string;
  confidence_level: 'high' | 'medium' | 'low';
  recommended_followups: number;
}

interface Phase2Response {
  phase: number;
  behavioral_patterns: Array<{
    pattern: string;
    description: string;
    frequency: 'high' | 'medium' | 'low';
    impact_areas: string[];
  }>;
  shadow_elements: Array<{
    element: string;
    manifestation: string;
    projection: string;
  }>;
  root_analysis: {
    primary_wound: string;
    secondary_wound?: string;
    core_fear: string;
    defense_mechanism: string;
  };
  integration_plan: {
    immediate_actions: Array<{
      action: string;
      timeline: 'this week' | 'daily' | 'ongoing';
      difficulty: 'easy' | 'moderate' | 'challenging';
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
  integration_exercises: Array<{
    exercise: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'as-needed';
    purpose: string;
  }>;
  overall_assessment: {
    growth_readiness: 'high' | 'medium' | 'low';
    resistance_level: 'high' | 'medium' | 'low';
    support_needed: 'professional' | 'peer' | 'self-directed';
    timeline_estimate: 'weeks' | 'months' | 'ongoing';
  };
}

// Question pools - each core question has 2-3 alternatives that accomplish the same analytical goal
const QUESTION_POOLS = {
  relationship_patterns: [
    'Describe your last 3 relationship endings - what happened and what role did you play?',
    'Think about your closest relationships that ended. What patterns do you notice in how they concluded?',
    'Tell me about relationships where you felt disappointed or hurt. What was your part in what happened?'
  ],
  behavioral_feedback: [
    'What do people consistently criticize or complain about regarding your behavior?',
    'What feedback do you hear repeatedly from friends, family, or partners about how you act?',
    'If your closest people were honest, what would they say you need to work on?'
  ],
  misunderstood_feelings: [
    'When do you feel most misunderstood? What do others "get wrong" about you?',
    'Describe times when people completely missed the point about who you are or what you meant.',
    'What do you wish people understood about you that they seem to miss?'
  ],
  romantic_frustrations: [
    'What patterns do you notice in your dating/romantic life that frustrate you?',
    'What keeps happening in your love life that drives you crazy?',
    'Looking at your romantic relationships, what cycles do you find yourself stuck in?'
  ],
  conflict_handling: [
    'Describe a recent conflict or disagreement. What was your role and how did you handle it?',
    'Tell me about a time you argued with someone important to you. How did you show up in that fight?',
    'Think of your last big disagreement - what did you do well and what could you have handled better?'
  ],
  projection_triggers: [
    'What traits in other people irritate you most? Give specific examples.',
    'What behaviors in others instantly get under your skin? Be specific about recent examples.',
    'Describe the types of people who trigger your strongest negative reactions.'
  ],
  defensive_patterns: [
    'When do you feel most anxious or defensive in relationships?',
    'What situations with people make you want to put your guard up or pull away?',
    'In what moments do you feel most threatened or unsafe emotionally with others?'
  ]
};

// Function to generate randomized questions from pools
const generateRandomizedQuestions = (): AnalysisQuestion[] => {
  // Map pool keys to valid category types
  const categoryMapping: Record<keyof typeof QUESTION_POOLS, AnalysisQuestion['category']> = {
    relationship_patterns: 'relationship',
    behavioral_feedback: 'patterns', 
    misunderstood_feelings: 'projection',
    romantic_frustrations: 'relationship',
    conflict_handling: 'conflict',
    projection_triggers: 'projection',
    defensive_patterns: 'triggers'
  };
  
  const poolKeys = Object.keys(QUESTION_POOLS) as (keyof typeof QUESTION_POOLS)[];
  
  return poolKeys.map((poolKey, index) => {
    const questions = QUESTION_POOLS[poolKey];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    return {
      id: (index + 1).toString(),
      question: randomQuestion,
      category: categoryMapping[poolKey]
    };
  });
};

// Generate questions once per component mount to maintain consistency during session
const CORE_BEHAVIORAL_QUESTIONS: AnalysisQuestion[] = generateRandomizedQuestions();

export const DeepAnalysis = ({ onClose, shadowProfile, journalEntries, setCurrentScreen, onCreateJournal }: DeepAnalysisProps) => {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'questions' | 'followup' | 'analysis'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [followUpResponses, setFollowUpResponses] = useState<Record<string, string>>({});
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
  
  // New structured data states
  const [phase1Data, setPhase1Data] = useState<Phase1Response | null>(null);
  const [phase2Data, setPhase2Data] = useState<Phase2Response | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Load progress from localStorage
  useEffect(() => {
    const savedActions = localStorage.getItem('shadowAnalysisCompletedActions');
    const savedExercises = localStorage.getItem('shadowAnalysisCompletedExercises');
    
    if (savedActions) {
      setCompletedActions(new Set(JSON.parse(savedActions)));
    }
    if (savedExercises) {
      setCompletedExercises(new Set(JSON.parse(savedExercises)));
    }
  }, []);

  // Scroll to top when question or phase changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex, currentFollowUpIndex, currentPhase]);

  // Save progress to localStorage
  const saveProgress = () => {
    localStorage.setItem('shadowAnalysisCompletedActions', JSON.stringify([...completedActions]));
    localStorage.setItem('shadowAnalysisCompletedExercises', JSON.stringify([...completedExercises]));
  };

  // Toggle action completion
  const toggleActionCompletion = (actionText: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionText)) {
      newCompleted.delete(actionText);
    } else {
      newCompleted.add(actionText);
    }
    setCompletedActions(newCompleted);
    
    // Save immediately
    localStorage.setItem('shadowAnalysisCompletedActions', JSON.stringify([...newCompleted]));
  };

  // Toggle exercise completion
  const toggleExerciseCompletion = (exerciseName: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseName)) {
      newCompleted.delete(exerciseName);
    } else {
      newCompleted.add(exerciseName);
    }
    setCompletedExercises(newCompleted);
    
    // Save immediately
    localStorage.setItem('shadowAnalysisCompletedExercises', JSON.stringify([...newCompleted]));
  };

  // Enhanced JSON parsing utility with multiple fallback strategies
  const parseJSONResponse = (response: string, expectedPhase: 1 | 2): Phase1Response | Phase2Response | null => {
    try {
      // Strategy 1: Remove markdown and extra text
      let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Strategy 2: Extract JSON from between braces if there's extra text
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      // Strategy 3: Remove text before first { and after last }
      const firstBrace = cleanResponse.indexOf('{');
      const lastBrace = cleanResponse.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanResponse = cleanResponse.slice(firstBrace, lastBrace + 1);
      }
      
      // Try parsing the clean response
      const parsed = JSON.parse(cleanResponse);
      
      // Validate phase
      if (parsed.phase !== expectedPhase) {
        console.warn(`Expected phase ${expectedPhase}, got ${parsed.phase}`);
      }
      
      return parsed;
    } catch (error) {
      console.error('JSON parsing failed:', error);
      console.log('Raw response:', response);
      
      // Try one more aggressive cleanup
      try {
        // Remove everything before first { and after last }
        const braceStart = response.indexOf('{');
        const braceEnd = response.lastIndexOf('}');
        if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
          const jsonOnly = response.slice(braceStart, braceEnd + 1);
          return JSON.parse(jsonOnly);
        }
      } catch (secondError) {
        console.error('Second parsing attempt also failed:', secondError);
      }
      
      return null;
    }
  };

  // Format Phase 2 structured data for display
  const formatPhase2ForDisplay = (data: Phase2Response): string => {
    let display = '';
    
    // Create a personalized archetype name from the first behavioral pattern
    const primaryPattern = data.behavioral_patterns[0];
    if (primaryPattern) {
      display += `**YOUR SHADOW PATTERN:** ${primaryPattern.pattern}\n\n`;
    }
    
    display += `**DEEP TRUTH:**\n${data.root_analysis.core_fear} drives your ${data.root_analysis.defense_mechanism}.\n\n`;
    
    display += `**BEHAVIORAL PATTERNS IDENTIFIED:**\n`;
    data.behavioral_patterns.forEach((pattern, i) => {
      display += `${i + 1}. **${pattern.pattern}** (${pattern.frequency} frequency)\n`;
      display += `   ${pattern.description}\n`;
      display += `   Impact areas: ${pattern.impact_areas.join(', ')}\n\n`;
    });
    
    display += `**SHADOW ELEMENTS:**\n`;
    data.shadow_elements.forEach((element, i) => {
      display += `${i + 1}. **${element.element}**\n`;
      display += `   Manifestation: ${element.manifestation}\n`;
      display += `   Projection: ${element.projection}\n\n`;
    });
    
    display += `**ROOT ANALYSIS:**\n`;
    display += `- **Primary Wound:** ${data.root_analysis.primary_wound}\n`;
    if (data.root_analysis.secondary_wound) {
      display += `- **Secondary Wound:** ${data.root_analysis.secondary_wound}\n`;
    }
    display += `- **Core Fear:** ${data.root_analysis.core_fear}\n`;
    display += `- **Defense Mechanism:** ${data.root_analysis.defense_mechanism}\n\n`;
    
    display += `**INTEGRATION PLAN:**\n`;
    display += `- **Immediate Actions:**\n`;
    data.integration_plan.immediate_actions.forEach((action, i) => {
      display += `  ${i + 1}. ${action.action} (${action.timeline}, ${action.difficulty})\n`;
    });
    
    display += `- **Ongoing Awareness:**\n`;
    data.integration_plan.ongoing_awareness.forEach((awareness, i) => {
      display += `  ${i + 1}. ${awareness.practice}\n`;
      display += `     Triggers: ${awareness.trigger_signs.join(', ')}\n`;
      display += `     Intervention: ${awareness.intervention}\n`;
    });
    
    display += `- **Communication Shifts:**\n`;
    data.integration_plan.communication_shifts.forEach((shift, i) => {
      display += `  ${i + 1}. From: ${shift.old_pattern}\n`;
      display += `     To: ${shift.new_approach}\n`;
      display += `     Practice in: ${shift.practice_area}\n`;
    });
    
    display += `- **Core Mindset Shift:** ${data.integration_plan.core_mindset_shift}\n\n`;
    
    display += `**INTEGRATION EXERCISES:**\n`;
    data.integration_exercises.forEach((exercise, i) => {
      display += `${i + 1}. **${exercise.exercise}** (${exercise.frequency})\n`;
      display += `   ${exercise.description}\n`;
      display += `   Purpose: ${exercise.purpose}\n\n`;
    });
    
    display += `**OVERALL ASSESSMENT:**\n`;
    display += `- Growth Readiness: ${data.overall_assessment.growth_readiness}\n`;
    display += `- Resistance Level: ${data.overall_assessment.resistance_level}\n`;
    display += `- Support Needed: ${data.overall_assessment.support_needed}\n`;
    display += `- Timeline Estimate: ${data.overall_assessment.timeline_estimate}\n`;
    
    return display;
  };

  const handleStartAnalysis = () => {
    setCurrentPhase('questions');
  };

  const handleResponseSubmit = async () => {
    if (!currentResponse.trim()) return;

    const currentQuestion = CORE_BEHAVIORAL_QUESTIONS[currentQuestionIndex];
    const newResponses = {
      ...responses,
      [currentQuestion.id]: currentResponse
    };
    setResponses(newResponses);
    setCurrentResponse('');

    if (currentQuestionIndex < CORE_BEHAVIORAL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All core questions completed, generate follow-up questions
      await generateFollowUpQuestions(newResponses);
    }
  };

  const generateFollowUpQuestions = async (allResponses: Record<string, string>) => {
    setIsGeneratingFollowUp(true);
    
    try {
      const analysisPrompt = `You are a psychological analyst conducting Phase 1 shadow work assessment. Analyze the patterns and generate targeted follow-up questions.

RESPONSES TO CORE QUESTIONS:
${CORE_BEHAVIORAL_QUESTIONS.map(q => `Q: ${q.question}\nA: ${allResponses[q.id] || 'No response'}`).join('\n\n')}

${shadowProfile ? `ARCHETYPE CONTEXT: ${shadowProfile.archetype}` : ''}
${journalEntries?.length ? `JOURNAL CONTEXT: User has ${journalEntries.length} previous journal entries` : ''}

CRITICAL FORMATTING REQUIREMENT: 
- Your response must be ONLY a valid JSON object
- Start immediately with { and end with }
- No explanations, no markdown, no backticks, no additional text
- If you add ANY text outside the JSON, the system will fail
- Example format: {"phase": 2, "behavioral_patterns": [...]}

Analyze their responses for:
- Recurring themes across different relationship contexts
- Where they take responsibility vs. blame others
- Contradictions between what they say vs. what their behavior suggests
- Emotional blind spots or defensive responses

Generate 3-5 specific follow-up questions that:
- Dig deeper into identified patterns
- Challenge contradictions or blind spots
- Explore emotional triggers they mentioned
- Investigate behaviors they might not fully own

{
  "phase": 1,
  "initial_pattern_analysis": "2-3 sentence summary of key patterns observed",
  "follow_up_questions": [
    {
      "id": 1,
      "question": "Targeted question based on their specific responses",
      "purpose": "behavioral_specifics"
    },
    {
      "id": 2,
      "question": "Question exploring contradiction or blind spot",
      "purpose": "contradiction_exploration"
    },
    {
      "id": 3,
      "question": "Question digging into emotional patterns",
      "purpose": "emotional_excavation"
    },
    {
      "id": 4,
      "question": "Question about recurring themes",
      "purpose": "pattern_confirmation"
    },
    {
      "id": 5,
      "question": "Question challenging their self-perception",
      "purpose": "shadow_exploration"
    }
  ],
  "preliminary_observations": "Brief note on potential shadow elements to explore in final analysis",
  "confidence_level": "high",
  "recommended_followups": 3
}`;

      const followUpResponse = await askClaude(analysisPrompt, shadowProfile || {
        archetype: 'General Analysis',
        traits: ['self-reflection'],
        intensity: 'moderate',
        description: 'Behavioral pattern analysis'
      }, undefined, undefined, undefined, undefined, 'analysis');

      // Try to parse as structured JSON first
      const parsedPhase1 = parseJSONResponse(followUpResponse, 1) as Phase1Response;
      
      let questions: string[] = [];
      
      if (parsedPhase1 && parsedPhase1.follow_up_questions) {
        setPhase1Data(parsedPhase1);
        questions = parsedPhase1.follow_up_questions
          .slice(0, parsedPhase1.recommended_followups || 3)
          .map(fq => fq.question);
        console.log('Using structured Phase 1 data:', parsedPhase1);
      } else {
        // Fallback to original parsing logic for backwards compatibility
        console.warn('Failed to parse structured response, using fallback logic');
        
        // First try numbered format (1. 2. 3.)
        questions = followUpResponse.split('\n')
          .filter(line => line.match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(q => q.length > 0 && q.includes('?'))
          .slice(0, 3);

        // Second try: look for question marks in the response
        if (questions.length === 0) {
          const sentences = followUpResponse.split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20 && s.includes('?') || s.toLowerCase().includes('what') || s.toLowerCase().includes('how') || s.toLowerCase().includes('why'))
            .slice(0, 3);
          
          questions = sentences.map(s => s.endsWith('?') ? s : s + '?');
        }

        // Final fallback questions
        if (questions.length === 0) {
          questions = [
            "What specific pattern from your responses feels most uncomfortable to acknowledge?",
            "When you're defensive or triggered, what are you usually trying to protect?",
            "What would someone who knows you well say you avoid dealing with consistently?"
          ];
        }
      }

      console.log('Final follow-up questions:', questions);
      setFollowUpQuestions(questions);
      setCurrentPhase('followup');
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      // Use fallback questions if generation fails
      const fallbackQuestions = [
        "What specific pattern keeps showing up in your relationships that you might be missing?",
        "When you're triggered emotionally, what's the story you tell yourself about what's happening?",
        "How do you think others experience you when you're stressed or defensive?"
      ];
      console.log('Using fallback questions due to error');
      setFollowUpQuestions(fallbackQuestions);
      setCurrentPhase('followup');
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!currentResponse.trim()) return;

    const newFollowUpResponses = {
      ...followUpResponses,
      [currentFollowUpIndex]: currentResponse
    };
    setFollowUpResponses(newFollowUpResponses);
    setCurrentResponse('');

    if (currentFollowUpIndex < followUpQuestions.length - 1) {
      setCurrentFollowUpIndex(currentFollowUpIndex + 1);
    } else {
      // All follow-up questions completed, generate final analysis
      await generateFinalAnalysis(responses, newFollowUpResponses);
    }
  };

  const generateFinalAnalysis = async (coreResponses: Record<string, string>, followUpResponses: Record<string, string>) => {
    setIsGeneratingAnalysis(true);
    setCurrentPhase('analysis');
    setAnalysisError(null);

    try {
      const analysisPrompt = `You are conducting Phase 2 comprehensive shadow work analysis. Analyze all responses and provide structured insights.

CORE BEHAVIORAL QUESTION RESPONSES:
${CORE_BEHAVIORAL_QUESTIONS.map(q => `${q.question}\n→ ${coreResponses[q.id] || 'No response'}`).join('\n\n')}

FOLLOW-UP QUESTION RESPONSES:
${followUpQuestions.map((q, i) => `${q}\n→ ${followUpResponses[i] || 'No response'}`).join('\n\n')}

${phase1Data ? `PHASE 1 ANALYSIS: ${phase1Data.initial_pattern_analysis}\nPRELIMINARY OBSERVATIONS: ${phase1Data.preliminary_observations}\nCONFIDENCE LEVEL: ${phase1Data.confidence_level}` : ''}

${shadowProfile ? `ARCHETYPE CONTEXT: ${shadowProfile.archetype} - ${shadowProfile.description}` : ''}
${journalEntries?.length ? `JOURNAL CONTEXT: Analyze patterns from ${journalEntries.length} journal entries` : ''}

CRITICAL FORMATTING REQUIREMENT: 
- Your response must be ONLY a valid JSON object
- Start immediately with { and end with }
- No explanations, no markdown, no backticks, no additional text
- If you add ANY text outside the JSON, the system will fail
- Example format: {"phase": 2, "behavioral_patterns": [...]}

Analyze for:
- Deep Pattern Recognition: Synthesize all responses to identify 2-3 core behavioral patterns
- Shadow Element Identification: What traits do they reject in others but likely exhibit themselves?
- Root Cause Analysis: Identify 1-2 core wounds or limiting beliefs driving surface behaviors
- Practical Integration: Specific behavioral changes they can implement immediately

{
  "phase": 2,
  "behavioral_patterns": [
    {
      "pattern": "Name of pattern",
      "description": "Detailed explanation with examples from responses",
      "frequency": "high",
      "impact_areas": ["relationships", "work", "self-esteem"]
    }
  ],
  "shadow_elements": [
    {
      "element": "What they're not seeing about themselves",
      "manifestation": "How this shows up in their behavior",
      "projection": "How they might see this in others instead"
    }
  ],
  "root_analysis": {
    "primary_wound": "The main core issue driving behaviors",
    "secondary_wound": "Supporting core issue if applicable",
    "core_fear": "What they're ultimately afraid of",
    "defense_mechanism": "Primary way they protect themselves"
  },
  "integration_plan": {
    "immediate_actions": [
      {
        "action": "Specific thing they can do this week",
        "timeline": "this week",
        "difficulty": "easy"
      }
    ],
    "ongoing_awareness": [
      {
        "practice": "How to catch patterns in real-time",
        "trigger_signs": ["What to watch for"],
        "intervention": "What to do when they notice it"
      }
    ],
    "communication_shifts": [
      {
        "old_pattern": "How they currently communicate",
        "new_approach": "How to show up differently",
        "practice_area": "Where to try this first"
      }
    ],
    "core_mindset_shift": "The one perspective change that could transform everything"
  },
  "integration_exercises": [
    {
      "exercise": "Name of exercise",
      "description": "What to do",
      "frequency": "daily",
      "purpose": "What shadow element this addresses"
    }
  ],
  "overall_assessment": {
    "growth_readiness": "high",
    "resistance_level": "medium",
    "support_needed": "self-directed",
    "timeline_estimate": "months"
  }
}`;

      const analysis = await askClaude(analysisPrompt, shadowProfile || {
        archetype: 'Comprehensive Analysis',
        traits: ['pattern-recognition', 'integration'],
        intensity: 'deep',
        description: 'Complete behavioral shadow analysis'
      }, undefined, undefined, undefined, undefined, 'analysis');

      // Try to parse as structured JSON first
      const parsedPhase2 = parseJSONResponse(analysis, 2) as Phase2Response;
      
      if (parsedPhase2) {
        setPhase2Data(parsedPhase2);
        console.log('Using structured Phase 2 data:', parsedPhase2);
        
        // Save Phase 2 data to localStorage for chat integration
        localStorage.setItem('shadowDeepAnalysisPhase2', JSON.stringify(parsedPhase2));
        
        // Create a formatted display version for backward compatibility
        const formattedAnalysis = formatPhase2ForDisplay(parsedPhase2);
        setFinalAnalysis(formattedAnalysis);
        setRetryAttempts(0); // Reset retry count on success
      } else {
        console.warn('Failed to parse structured Phase 2 response, using raw text');
        setAnalysisError('Failed to parse structured response. The analysis was generated but may not display properly.');
        setFinalAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error generating final analysis:', error);
      setAnalysisError('Unable to generate analysis at this time. Please try the refresh button.');
      setFinalAnalysis('Analysis generation failed. Use the refresh button to try again.');
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Retry function for Phase 2 analysis
  const retryPhase2Analysis = async () => {
    if (retryAttempts >= 3) {
      setAnalysisError('Maximum retry attempts reached. Please start a new analysis.');
      return;
    }
    
    setRetryAttempts(prev => prev + 1);
    await generateFinalAnalysis(responses, followUpResponses);
  };

  // Create journal content from analysis
  const createJournalFromAnalysis = () => {
    if (!onCreateJournal) {
      // Fallback to setCurrentScreen if no onCreateJournal function
      setCurrentScreen?.('journal');
      return;
    }

    let summary = '';
    let insights = '';

    if (phase2Data) {
      // Use structured Phase 2 data
      const primaryPattern = phase2Data.behavioral_patterns[0];
      summary = `Deep Shadow Analysis - ${primaryPattern?.pattern || 'Your Shadow Pattern'}`;
      
      insights = `🎯 **Core Pattern:** ${primaryPattern?.pattern || 'Your behavioral pattern'}\n\n`;
      insights += `💭 **Deep Truth:** ${phase2Data.root_analysis.core_fear} drives your ${phase2Data.root_analysis.defense_mechanism}.\n\n`;
      
      if (phase2Data.integration_plan.immediate_actions.length > 0) {
        insights += `✨ **Key Actions to Take:**\n`;
        phase2Data.integration_plan.immediate_actions.slice(0, 3).forEach((action, i) => {
          insights += `${i + 1}. ${action.action} (${action.timeline})\n`;
        });
        insights += '\n';
      }
      
      if (phase2Data.integration_plan.core_mindset_shift) {
        insights += `🧠 **Mindset Shift:** ${phase2Data.integration_plan.core_mindset_shift}\n\n`;
      }
      
      insights += `📈 **Growth Assessment:** ${phase2Data.overall_assessment.growth_readiness} readiness, ${phase2Data.overall_assessment.timeline_estimate} timeline\n`;
      insights += `🤝 **Support Needed:** ${phase2Data.overall_assessment.support_needed}`;
      
    } else if (finalAnalysis) {
      // Fallback to text analysis
      const insights_match = finalAnalysis.match(/\*\*DEEP TRUTH[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i);
      const pattern_match = finalAnalysis.match(/\*\*YOUR SHADOW PATTERN[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i);
      
      summary = 'Deep Shadow Analysis Results';
      insights = pattern_match ? `🎯 **Your Pattern:** ${pattern_match[1].trim()}\n\n` : '';
      insights += insights_match ? `💭 **Deep Truth:** ${insights_match[1].trim()}\n\n` : '';
      insights += `📝 **Full Analysis:** See complete analysis in Deep Analysis section`;
    }

    onCreateJournal({
      summary: summary || 'Deep Shadow Analysis',
      insights: insights || 'Your deep analysis insights are available in the Deep Analysis section.'
    });
  };

  const renderIntroPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8"
    >
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Deep Shadow Analysis</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Go beyond surface patterns with behavioral analysis based on your real-world experiences.
        </p>
      </div>

      <div className="bg-black/40 rounded-3xl p-8 glass mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6">How This Works</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">1</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Core Behavioral Questions</h3>
              <p className="text-gray-300">Answer 7 fundamental questions about your patterns in relationships, conflicts, and emotional triggers.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">2</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Generated Follow-ups</h3>
              <p className="text-gray-300">Sage analyzes your responses and generates 3-5 targeted questions to explore deeper patterns.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">3</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Analysis</h3>
              <p className="text-gray-300">Receive detailed insights about your shadow patterns, root causes, and specific integration steps.</p>
            </div>
          </div>
        </div>
        
        {journalEntries?.length && (
          <div className="mt-8 p-6 bg-blue-900/30 rounded-2xl border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">Journal Integration</h3>
            </div>
            <p className="text-blue-200">
              Your {journalEntries.length} journal entries will be analyzed alongside your responses for deeper insights into your documented patterns and growth.
            </p>
          </div>
        )}
      </div>

      <div className="text-center">
        <motion.button
          onClick={handleStartAnalysis}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-purple-500/30"
        >
          Begin Deep Analysis
        </motion.button>
      </div>
    </motion.div>
  );

  const renderQuestionsPhase = () => {
    // Show loading state when generating follow-up questions
    if (isGeneratingFollowUp) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto p-8 text-center"
        >
          <div className="bg-black/40 rounded-3xl p-12 glass">
            <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Sage is Thinking... 🧠</h2>
            <p className="text-gray-300">
              Analyzing your responses to generate personalized follow-up questions. This usually takes 10-15 seconds.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              ✨ Creating targeted questions based on your unique patterns
            </div>
          </div>
        </motion.div>
      );
    }

    const currentQuestion = CORE_BEHAVIORAL_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / CORE_BEHAVIORAL_QUESTIONS.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Core Questions</h2>
            <span className="text-purple-400 font-medium">
              {currentQuestionIndex + 1} of {CORE_BEHAVIORAL_QUESTIONS.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-black/40 rounded-3xl p-8 glass">
          <h3 className="text-xl font-semibold text-white mb-6">
            {currentQuestion.question}
          </h3>
          
          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Share your honest experience and observations..."
            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
            rows={6}
          />

          <div className="flex flex-col space-y-4 mt-6">
            <div className="flex justify-between">
              <button
                onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={handleResponseSubmit}
                disabled={!currentResponse.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl transition-all duration-300 flex items-center space-x-2"
              >
                <span>{currentQuestionIndex === CORE_BEHAVIORAL_QUESTIONS.length - 1 ? 'Generate Analysis' : 'Next'}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Skip Question Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setCurrentResponse(''); // Clear current response
                  handleResponseSubmit(); // Submit empty response
                }}
                className="group bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-gray-600/40 hover:border-gray-500/60 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <span className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Skip Question</span>
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Skip if not relevant or too personal
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFollowUpPhase = () => {
    if (isGeneratingFollowUp) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto p-8 text-center"
        >
          <div className="bg-black/40 rounded-3xl p-12 glass">
            <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Analyzing Your Responses</h2>
            <p className="text-gray-300">
              Sage is identifying patterns and generating personalized follow-up questions...
            </p>
          </div>
        </motion.div>
      );
    }

    const currentQuestion = followUpQuestions[currentFollowUpIndex];
    const progress = ((currentFollowUpIndex + 1) / followUpQuestions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Follow-up Questions</h2>
            <span className="text-purple-400 font-medium">
              {currentFollowUpIndex + 1} of {followUpQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-black/40 rounded-3xl p-8 glass">
          <div className="flex items-start space-x-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-200 mb-2">Personalized Question</h3>
              <p className="text-gray-300 text-sm">Based on patterns in your previous responses</p>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-6">
            {currentQuestion}
          </h3>
          
          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Dive deeper into this pattern..."
            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
            rows={6}
          />

          <div className="flex flex-col space-y-4 mt-6">
            <div className="flex justify-between">
              <button
                onClick={() => currentFollowUpIndex > 0 && setCurrentFollowUpIndex(currentFollowUpIndex - 1)}
                disabled={currentFollowUpIndex === 0}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={handleFollowUpSubmit}
                disabled={!currentResponse.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all duration-300 flex items-center space-x-2"
              >
                <span>{currentFollowUpIndex === followUpQuestions.length - 1 ? 'Complete Analysis' : 'Next'}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Skip Follow-up Question Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setCurrentResponse(''); // Clear current response
                  handleFollowUpSubmit(); // Submit empty response
                }}
                className="group bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-gray-600/40 hover:border-gray-500/60 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <span className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Skip Question</span>
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Not relevant or prefer to skip this one
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAnalysisPhase = () => {
    if (isGeneratingAnalysis) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto p-8 text-center"
        >
          <div className="bg-black/40 rounded-3xl p-12 glass">
            <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Generating Deep Analysis</h2>
            <p className="text-gray-300">
              Sage is synthesizing your responses to create comprehensive insights about your shadow patterns...
            </p>
          </div>
        </motion.div>
      );
    }

    // Parse insights from analysis
    const parseInsights = (analysis: string) => {
      const deepTruthMatch = analysis.match(/\*\*DEEP TRUTH[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i) ||
                           analysis.match(/\*\*ROOT TRUTH[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i) ||
                           analysis.match(/truth[^.]*[:]\s*([^.]+\.)/i);
      
      const integrationMatch = analysis.match(/\*\*INTEGRATION PATH[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i) ||
                              analysis.match(/\*\*INTEGRATION[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i) ||
                              analysis.match(/\*\*PATH FORWARD[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i) ||
                              analysis.match(/\*\*HEALING[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i);

      const personalArchetypeMatch = analysis.match(/\*\*YOUR SHADOW PATTERN[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i) ||
                                     analysis.match(/you are[^.]*"([^"]+)"|archetype[^:]*:\s*([^.\n]+)|shadow[^:]*:\s*"([^"]+)"/i);

      return {
        personalArchetype: personalArchetypeMatch ? (personalArchetypeMatch[1] || personalArchetypeMatch[2] || personalArchetypeMatch[3])?.trim() : null,
        deepTruth: deepTruthMatch ? deepTruthMatch[1].trim() : null,
        integration: integrationMatch ? integrationMatch[1].trim() : null
      };
    };

    const insights = parseInsights(finalAnalysis);

    // Show error state with retry option
    if (analysisError && !isGeneratingAnalysis) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto p-8 text-center"
        >
          <div className="bg-red-900/30 rounded-3xl p-8 glass border border-red-500/30">
            <div className="text-red-300 mb-6">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-semibold mb-4">Analysis Processing Issue</h2>
              <p className="text-red-200 mb-6">{analysisError}</p>
              
              <div className="space-y-4">
                <div className="bg-black/40 rounded-2xl p-4">
                  <p className="text-sm text-gray-300 mb-4">
                    This sometimes happens with complex analysis. Your responses are saved - you can retry without losing progress.
                  </p>
                  <p className="text-xs text-gray-400">
                    Retry attempt: {retryAttempts} / 3
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={retryPhase2Analysis}
                    disabled={retryAttempts >= 3 || isGeneratingAnalysis}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isGeneratingAnalysis ? 'Retrying...' : 'Refresh Analysis'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Reset everything to start fresh
                      setCurrentPhase('intro');
                      setCurrentQuestionIndex(0);
                      setResponses({});
                      setFollowUpQuestions([]);
                      setFollowUpResponses({});
                      setCurrentFollowUpIndex(0);
                      setAnalysisError(null);
                      setRetryAttempts(0);
                      setPhase2Data(null);
                      setFinalAnalysis('');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Start Fresh Analysis</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Render structured UI if Phase 2 data is available
    if (phase2Data) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black/50 to-black"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-6xl w-full"
          >
            <div className="text-center mb-16">
              <motion.h1 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-4xl sm:text-5xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-gray-300 mb-6 tracking-tight hover:scale-105 transition-transform duration-300 cursor-default text-center"
              >
                Your Shadow Analysis
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-2xl text-purple-200 font-light text-center"
              >
                Deep behavioral insights revealed
              </motion.p>
            </div>
            
            {/* Progress Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/60 rounded-3xl p-6 mb-8 glass"
            >
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Your Progress</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {completedActions.size} / {phase2Data.integration_plan.immediate_actions.length}
                  </div>
                  <div className="text-sm text-green-300">Actions Completed</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(completedActions.size / phase2Data.integration_plan.immediate_actions.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {completedExercises.size} / {phase2Data.integration_exercises.length}
                  </div>
                  <div className="text-sm text-blue-300">Exercises Started</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(completedExercises.size / phase2Data.integration_exercises.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Structured Analysis Sections */}
            <div className="space-y-8 mb-12">
              {/* Primary Pattern */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-600 to-blue-600 p-1 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-500"
              >
                <div className="bg-black/60 backdrop-blur-sm rounded-3xl p-12 glass">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Brain className="w-24 h-24 text-white mb-10 mx-auto" />
                  </motion.div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-10 text-glow">
                    {phase2Data.behavioral_patterns[0]?.pattern || 'Your Shadow Pattern'}
                  </h2>
                  
                  <div className="bg-white/10 rounded-2xl p-10 glass">
                    <h3 className="text-3xl font-semibold text-white mb-6 text-center">Core Fear & Defense</h3>
                    <p className="text-xl text-white/90 leading-relaxed text-center font-light">
                      {phase2Data.root_analysis.core_fear} drives your {phase2Data.root_analysis.defense_mechanism}.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Behavioral Patterns */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/40 rounded-3xl p-8 glass"
              >
                <h3 className="text-3xl font-semibold text-white mb-6 text-center">Behavioral Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {phase2Data.behavioral_patterns.map((pattern, i) => (
                    <div key={i} className="bg-purple-900/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-white">{pattern.pattern}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          pattern.frequency === 'high' ? 'bg-red-500/30 text-red-200' :
                          pattern.frequency === 'medium' ? 'bg-yellow-500/30 text-yellow-200' :
                          'bg-green-500/30 text-green-200'
                        }`}>
                          {pattern.frequency} frequency
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{pattern.description}</p>
                      <div className="text-xs text-purple-200">
                        Impact: {pattern.impact_areas.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Immediate Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-green-900/30 rounded-3xl p-8 glass"
              >
                <h3 className="text-3xl font-semibold text-green-200 mb-6 text-center">Immediate Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {phase2Data.integration_plan.immediate_actions.map((action, i) => {
                    const isCompleted = completedActions.has(action.action);
                    return (
                      <div 
                        key={i} 
                        onClick={() => toggleActionCompletion(action.action)}
                        className={`bg-black/40 rounded-2xl p-6 hover:bg-black/60 transition-colors cursor-pointer border-2 ${
                          isCompleted ? 'border-green-500/50 bg-green-900/20' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              action.difficulty === 'easy' ? 'bg-green-500/30 text-green-200' :
                              action.difficulty === 'moderate' ? 'bg-yellow-500/30 text-yellow-200' :
                              'bg-red-500/30 text-red-200'
                            }`}>
                              {action.difficulty}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{action.timeline}</span>
                        </div>
                        <p className={`font-medium transition-colors ${
                          isCompleted ? 'text-green-200 line-through' : 'text-white'
                        }`}>
                          {action.action}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Integration Exercises */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-900/30 rounded-3xl p-8 glass"
              >
                <h3 className="text-3xl font-semibold text-blue-200 mb-6 text-center">Integration Exercises</h3>
                <div className="space-y-4">
                  {phase2Data.integration_exercises.map((exercise, i) => {
                    const isCompleted = completedExercises.has(exercise.exercise);
                    return (
                      <div 
                        key={i} 
                        onClick={() => toggleExerciseCompletion(exercise.exercise)}
                        className={`bg-black/40 rounded-2xl p-6 hover:bg-black/60 transition-colors cursor-pointer border-2 ${
                          isCompleted ? 'border-blue-500/50 bg-blue-900/20' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                            <h4 className={`text-lg font-semibold transition-colors ${
                              isCompleted ? 'text-blue-200 line-through' : 'text-white'
                            }`}>
                              {exercise.exercise}
                            </h4>
                          </div>
                          <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                            {exercise.frequency}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 transition-colors ${
                          isCompleted ? 'text-blue-300' : 'text-gray-300'
                        }`}>
                          {exercise.description}
                        </p>
                        <p className="text-xs text-blue-200">Purpose: {exercise.purpose}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Assessment Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-orange-900/30 rounded-3xl p-8 glass"
              >
                <h3 className="text-2xl font-semibold text-orange-200 mb-6 text-center">Your Journey Forward</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Growth Readiness</div>
                    <div className={`text-lg font-semibold ${
                      phase2Data.overall_assessment.growth_readiness === 'high' ? 'text-green-200' :
                      phase2Data.overall_assessment.growth_readiness === 'medium' ? 'text-yellow-200' :
                      'text-red-200'
                    }`}>
                      {phase2Data.overall_assessment.growth_readiness}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Support Needed</div>
                    <div className="text-lg font-semibold text-orange-200">
                      {phase2Data.overall_assessment.support_needed}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Timeline</div>
                    <div className="text-lg font-semibold text-orange-200">
                      {phase2Data.overall_assessment.timeline_estimate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Resistance</div>
                    <div className={`text-lg font-semibold ${
                      phase2Data.overall_assessment.resistance_level === 'low' ? 'text-green-200' :
                      phase2Data.overall_assessment.resistance_level === 'medium' ? 'text-yellow-200' :
                      'text-red-200'
                    }`}>
                      {phase2Data.overall_assessment.resistance_level}
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-purple-900/30 rounded-2xl">
                  <h4 className="text-lg font-semibold text-purple-200 mb-2">Core Mindset Shift</h4>
                  <p className="text-purple-100 text-center font-light italic">
                    {phase2Data.integration_plan.core_mindset_shift}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-purple-500/30 text-xl"
              >
                ← Back to Journey
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={createJournalFromAnalysis}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-green-500/30 text-xl"
              >
                📖 Journal This
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentScreen ? setCurrentScreen('chat') : onClose()}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-orange-500/30 text-xl"
              >
                💬 Chat with Sage
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    // Fallback to original display for non-structured responses
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black/50 to-black"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-6xl w-full"
        >
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl sm:text-5xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-gray-300 mb-6 tracking-tight hover:scale-105 transition-transform duration-300 cursor-default text-center"
            >
              Your Shadow Analysis
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-2xl text-purple-200 font-light text-center"
            >
              Deep behavioral insights revealed
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600 to-blue-600 p-1 rounded-3xl shadow-2xl mb-12 hover:shadow-3xl transition-shadow duration-500"
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-3xl p-12 glass">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Brain className="w-24 h-24 text-white mb-10 mx-auto" />
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-10 text-glow">
                {insights.personalArchetype || 'Your Behavioral Pattern'}
              </h2>
              
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white/10 rounded-2xl p-10 glass">
                  <h3 className="text-3xl font-semibold text-white mb-6 text-center">The Pattern You Live</h3>
                  <p className="text-xl text-white/90 leading-relaxed text-center font-light">
                    {insights.personalArchetype || 'Your comprehensive behavioral analysis reveals the unconscious patterns shaping your daily experience.'}
                  </p>
                </div>
                
                {insights.deepTruth && (
                  <div className="bg-yellow-900/30 rounded-2xl p-10 glass">
                    <h3 className="text-3xl font-semibold text-yellow-200 mb-6 text-center">The Deep Truth</h3>
                    <p className="text-xl text-yellow-100 leading-relaxed text-center italic font-light">
                      {insights.deepTruth}
                    </p>
                  </div>
                )}
                
                {insights.integration && (
                  <div className="bg-green-900/40 rounded-2xl p-10 glass">
                    <h3 className="text-3xl font-semibold text-green-200 mb-6 text-center">Path to Integration</h3>
                    <p className="text-xl text-green-100 leading-relaxed text-center font-light">
                      {insights.integration}
                    </p>
                  </div>
                )}
                
                <div className="bg-purple-900/30 rounded-2xl p-8 glass">
                  <h3 className="text-2xl font-semibold text-purple-200 mb-4 text-center">
                    Your Journey Continues
                  </h3>
                  <p className="text-purple-100 text-center font-light">
                    Remember: Your patterns developed to protect you. Integration, not elimination, is the goal. 
                    Honor the wisdom in your shadow while choosing new ways forward.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Full Analysis Details - Collapsible */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <details className="bg-black/40 rounded-3xl glass">
              <summary className="p-6 cursor-pointer text-xl font-semibold text-white hover:text-purple-200 transition-colors">
                📋 View Complete Analysis Details
              </summary>
              <div className="px-6 pb-6">
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-100 leading-relaxed whitespace-pre-line">
                    {finalAnalysis}
                  </div>
                </div>
              </div>
            </details>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-purple-500/30 text-xl"
            >
              ← Back to Journey
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={createJournalFromAnalysis}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-green-500/30 text-xl"
            >
              📖 Journal This
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen ? setCurrentScreen('chat') : onClose()}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-2xl border border-orange-500/30 text-xl"
            >
              💬 Chat with Sage
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/20 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black/50 to-black"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="relative z-10 pb-20">
        <AnimatePresence mode="wait">
          {currentPhase === 'intro' && renderIntroPhase()}
          {currentPhase === 'questions' && renderQuestionsPhase()}
          {currentPhase === 'followup' && renderFollowUpPhase()}
          {currentPhase === 'analysis' && renderAnalysisPhase()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeepAnalysis;
