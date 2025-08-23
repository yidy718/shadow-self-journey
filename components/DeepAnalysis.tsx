'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader, Brain, FileText, Plus, Lightbulb, Target } from 'lucide-react';
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
}

interface AnalysisQuestion {
  id: string;
  question: string;
  category: 'relationship' | 'self-worth' | 'conflict' | 'patterns' | 'triggers' | 'projection' | 'general';
}

const CORE_BEHAVIORAL_QUESTIONS: AnalysisQuestion[] = [
  {
    id: '1',
    question: 'Describe your last 3 relationship endings - what happened and what role did you play?',
    category: 'relationship'
  },
  {
    id: '2', 
    question: 'What do people consistently criticize or complain about regarding your behavior?',
    category: 'patterns'
  },
  {
    id: '3',
    question: 'When do you feel most misunderstood? What do others "get wrong" about you?',
    category: 'projection'
  },
  {
    id: '4',
    question: 'What patterns do you notice in your dating/romantic life that frustrate you?',
    category: 'relationship'
  },
  {
    id: '5',
    question: 'Describe a recent conflict or disagreement. What was your role and how did you handle it?',
    category: 'conflict'
  },
  {
    id: '6',
    question: 'What traits in other people irritate you most? Give specific examples.',
    category: 'projection'
  },
  {
    id: '7',
    question: 'When do you feel most anxious or defensive in relationships?',
    category: 'triggers'
  }
];

export const DeepAnalysis = ({ onClose, shadowProfile, journalEntries }: DeepAnalysisProps) => {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'questions' | 'followup' | 'analysis'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [followUpResponses, setFollowUpResponses] = useState<Record<string, string>>({});
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);

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
      const analysisPrompt = `You are Sage, analyzing behavioral patterns. Based on these responses, generate exactly 3 targeted follow-up questions that dig deeper into patterns and contradictions.

RESPONSES:
${CORE_BEHAVIORAL_QUESTIONS.map(q => `Q: ${q.question}\nA: ${allResponses[q.id] || 'No response'}`).join('\n\n')}

${shadowProfile ? `ARCHETYPE CONTEXT: ${shadowProfile.archetype}` : ''}
${journalEntries?.length ? `JOURNAL CONTEXT: User has ${journalEntries.length} previous journal entries` : ''}

Generate follow-up questions that:
- Explore contradictions between what they say vs. behavior patterns
- Dig deeper into emotional triggers they mentioned  
- Challenge their self-perception where appropriate
- Investigate behaviors they might not fully own

IMPORTANT: Return ONLY 3 questions in this exact format:
1. [Complete question here]
2. [Complete question here] 
3. [Complete question here]

No other text, no explanations, just the numbered questions.`;

      const followUpResponse = await askClaude(analysisPrompt, shadowProfile || {
        archetype: 'General Analysis',
        traits: ['self-reflection'],
        intensity: 'moderate',
        description: 'Behavioral pattern analysis'
      });

      // Parse the follow-up questions with improved logic
      console.log('Raw follow-up response:', followUpResponse);
      
      // First try numbered format (1. 2. 3.)
      let questions = followUpResponse.split('\n')
        .filter(line => line.match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(q => q.length > 0 && q.includes('?')) // Must be actual questions
        .slice(0, 3);

      // Second try: look for question marks in the response
      if (questions.length === 0) {
        const sentences = followUpResponse.split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 20 && s.includes('?') || s.toLowerCase().includes('what') || s.toLowerCase().includes('how') || s.toLowerCase().includes('why'))
          .slice(0, 3);
        
        questions = sentences.map(s => s.endsWith('?') ? s : s + '?');
      }

      // If response is advice (not questions), use targeted follow-ups based on the advice topic
      if (questions.length === 0) {
        const responseText = followUpResponse.toLowerCase();
        if (responseText.includes('relationship') || responseText.includes('connection')) {
          questions = [
            "What specific relationship pattern mentioned resonates most with you, and where else do you see it showing up?",
            "When you feel that urge to sabotage connections, what exactly goes through your mind in that moment?",
            "How do you think your closest relationships would describe the way you handle conflict or intimacy?"
          ];
        } else if (responseText.includes('self-worth') || responseText.includes('confidence')) {
          questions = [
            "What would you say to a friend who talked about themselves the way you talk about yourself?",
            "In what specific situations do you notice your self-criticism becoming loudest?",
            "What evidence exists that contradicts the harsh stories you tell yourself about your worth?"
          ];
        } else {
          // Generic but personalized fallback
          questions = [
            "What specific pattern from your responses feels most uncomfortable to acknowledge?",
            "When you're defensive or triggered, what are you usually trying to protect?",
            "What would someone who knows you well say you avoid dealing with consistently?"
          ];
        }
      }

      console.log('Parsed follow-up questions:', questions);
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

    try {
      const analysisPrompt = `Conduct comprehensive shadow work analysis using this structured framework:

CORE RESPONSES:
${CORE_BEHAVIORAL_QUESTIONS.map(q => `${q.question}\n→ ${coreResponses[q.id] || 'No response'}`).join('\n\n')}

FOLLOW-UP RESPONSES:
${followUpQuestions.map((q, i) => `${q}\n→ ${followUpResponses[i] || 'No response'}`).join('\n\n')}

${shadowProfile ? `ARCHETYPE CONTEXT: ${shadowProfile.archetype} - ${shadowProfile.description}` : ''}
${journalEntries?.length ? `JOURNAL CONTEXT: Analyze patterns from ${journalEntries.length} journal entries` : ''}

Provide comprehensive analysis in this structure:

**BEHAVIORAL PATTERNS IDENTIFIED:**
[3-4 specific patterns with examples from their responses]

**SHADOW ELEMENTS:**
[What they're not seeing about themselves - the disowned parts]

**ROOT ANALYSIS:**
[The 1-2 core issues driving everything - their deepest fears/wounds]

**INTEGRATION PLAN:**
- **Immediate Actions:** [3 specific things they can do this week]
- **Ongoing Awareness:** [How to catch these patterns in real-time]  
- **Boundary/Communication Shifts:** [How they need to show up differently]
- **Core Mindset Shift:** [The one perspective change that could transform everything]

**INTEGRATION EXERCISES:**
[2-3 specific practices to work with their shadow elements]

Use their exact words and examples. Be direct but compassionate. Focus on patterns, not isolated incidents. Frame as growth opportunities.`;

      const analysis = await askClaude(analysisPrompt, shadowProfile || {
        archetype: 'Comprehensive Analysis',
        traits: ['pattern-recognition', 'integration'],
        intensity: 'deep',
        description: 'Complete behavioral shadow analysis'
      });

      setFinalAnalysis(analysis);
    } catch (error) {
      console.error('Error generating final analysis:', error);
      setFinalAnalysis('Unable to generate analysis at this time. Please try again later.');
    } finally {
      setIsGeneratingAnalysis(false);
    }
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

          <div className="flex justify-between mt-6">
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

          <div className="flex justify-between mt-6">
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

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Shadow Analysis</h1>
          <p className="text-gray-300">Comprehensive insights based on your behavioral patterns</p>
        </div>

        <div className="bg-black/40 rounded-3xl p-8 glass">
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-100 leading-relaxed whitespace-pre-line">
              {finalAnalysis}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => {
              // Parse the analysis into different sections
              const parseAnalysis = (analysis: string) => {
                const sections = {
                  patterns: '',
                  shadow: '',
                  root: '',
                  integration: '',
                  exercises: ''
                };

                // Try to extract different sections from the analysis
                const patternMatch = analysis.match(/\*\*BEHAVIORAL PATTERNS[^*]*:\*\*\s*([^*]+)/i);
                const shadowMatch = analysis.match(/\*\*SHADOW ELEMENTS[^*]*:\*\*\s*([^*]+)/i);
                const rootMatch = analysis.match(/\*\*ROOT ANALYSIS[^*]*:\*\*\s*([^*]+)/i);
                const integrationMatch = analysis.match(/\*\*INTEGRATION PLAN[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i);
                const exercisesMatch = analysis.match(/\*\*INTEGRATION EXERCISES[^*]*:\*\*\s*([^*]+)/i);

                sections.patterns = patternMatch ? patternMatch[1].trim() : '';
                sections.shadow = shadowMatch ? shadowMatch[1].trim() : '';
                sections.root = rootMatch ? rootMatch[1].trim() : '';
                sections.integration = integrationMatch ? integrationMatch[1].trim() : '';
                sections.exercises = exercisesMatch ? exercisesMatch[1].trim() : '';

                return sections;
              };

              const parsed = parseAnalysis(finalAnalysis);

              // Save analysis to journal with proper sections
              const analysisEntry = {
                id: `analysis-${Date.now()}`,
                date: new Date(),
                archetype: shadowProfile?.archetype || 'Deep Analysis',
                reflection: parsed.patterns || `Key patterns identified from behavioral analysis:\n\n${finalAnalysis.slice(0, 300)}...`,
                mood: 4,
                insights: parsed.shadow || parsed.root || 'Deep behavioral pattern analysis revealing unconscious dynamics and core wounds driving surface behaviors.',
                integration: parsed.integration || parsed.exercises || 'Working through identified shadow elements with specific action steps for conscious integration and growth.'
              };
              
              const existingEntries = localStorage.getItem('shadowJournalEntries');
              const entries = existingEntries ? JSON.parse(existingEntries) : [];
              entries.unshift(analysisEntry);
              localStorage.setItem('shadowJournalEntries', JSON.stringify(entries));
              
              alert('Analysis saved to your journal!');
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Save to Journal</span>
          </button>

          <button
            onClick={() => {
              // Parse and save first, then close
              const parseAnalysis = (analysis: string) => {
                const sections = {
                  patterns: '',
                  shadow: '',
                  root: '',
                  integration: '',
                  exercises: ''
                };

                const patternMatch = analysis.match(/\*\*BEHAVIORAL PATTERNS[^*]*:\*\*\s*([^*]+)/i);
                const shadowMatch = analysis.match(/\*\*SHADOW ELEMENTS[^*]*:\*\*\s*([^*]+)/i);
                const rootMatch = analysis.match(/\*\*ROOT ANALYSIS[^*]*:\*\*\s*([^*]+)/i);
                const integrationMatch = analysis.match(/\*\*INTEGRATION PLAN[^*]*:\*\*\s*([^*]+?)(?=\*\*|$)/i);
                const exercisesMatch = analysis.match(/\*\*INTEGRATION EXERCISES[^*]*:\*\*\s*([^*]+)/i);

                sections.patterns = patternMatch ? patternMatch[1].trim() : '';
                sections.shadow = shadowMatch ? shadowMatch[1].trim() : '';
                sections.root = rootMatch ? rootMatch[1].trim() : '';
                sections.integration = integrationMatch ? integrationMatch[1].trim() : '';
                sections.exercises = exercisesMatch ? exercisesMatch[1].trim() : '';

                return sections;
              };

              const parsed = parseAnalysis(finalAnalysis);

              const analysisEntry = {
                id: `analysis-${Date.now()}`,
                date: new Date(),
                archetype: shadowProfile?.archetype || 'Deep Analysis',
                reflection: parsed.patterns || `Key patterns identified from behavioral analysis:\n\n${finalAnalysis.slice(0, 300)}...`,
                mood: 4,
                insights: parsed.shadow || parsed.root || 'Deep behavioral pattern analysis revealing unconscious dynamics and core wounds driving surface behaviors.',
                integration: parsed.integration || parsed.exercises || 'Working through identified shadow elements with specific action steps for conscious integration and growth.'
              };
              
              const existingEntries = localStorage.getItem('shadowJournalEntries');
              const entries = existingEntries ? JSON.parse(existingEntries) : [];
              entries.unshift(analysisEntry);
              localStorage.setItem('shadowJournalEntries', JSON.stringify(entries));
              
              onClose();
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300"
          >
            Save & Continue
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
          >
            Skip Save
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 relative overflow-hidden">
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