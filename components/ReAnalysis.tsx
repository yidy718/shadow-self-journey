'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Brain, FileText, MessageCircle, Eye, Target, Sparkles } from 'lucide-react';
import { askClaude, type ShadowProfile } from '../lib/claudeApi';
import { getStorageItem, setStorageItem, StorageKeys } from '../lib/storageUtils';
import { type UserPreferences } from '../lib/userPreferences';
import toast from 'react-hot-toast';

interface ReAnalysisProps {
  onClose: () => void;
  shadowProfile?: ShadowProfile;
}

interface UserData {
  archetype?: ShadowProfile;
  journalEntries: Array<{
    id: string;
    date: string;
    reflection: string;
    insights: string;
    integration: string;
    mood: number;
  }>;
  conversations: Array<{
    question: string;
    response: string;
    timestamp: number;
  }>;
  previousAnalyses: string[];
}

export const ReAnalysis = ({ onClose, shadowProfile }: ReAnalysisProps) => {
  const [currentPhase, setCurrentPhase] = useState<'loading' | 'options' | 'analyzing' | 'results' | 'questions'>('loading');
  const [analysisType, setAnalysisType] = useState<'evolution' | 'deeper' | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [analysisResults, setAnalysisResults] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // For interactive questions
  const [deeperQuestions, setDeeperQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionResponses, setQuestionResponses] = useState<Record<number, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');

  useEffect(() => {
    // Aggregate all user data
    const loadUserData = async () => {
      const data: UserData = {
        archetype: shadowProfile,
        journalEntries: [],
        conversations: [],
        previousAnalyses: []
      };

      // Load journal entries
      const entries = getStorageItem<any[]>(StorageKeys.JOURNAL_ENTRIES);
      if (entries) {
        data.journalEntries = entries.map((entry: any) => ({
          id: entry.id,
          date: new Date(entry.date).toLocaleDateString(),
          reflection: entry.reflection || '',
          insights: entry.insights || '',
          integration: entry.integration || '',
          mood: entry.mood || 3
        }));
      }

      // Load conversation history from multiple sources
      const conversationData = getStorageItem<any[]>(StorageKeys.CONVERSATIONS);
      if (conversationData) {
        data.conversations = conversationData;
      }
      
      // Also check user preferences for conversations (backup/alternative source)
      const prefs = getStorageItem<UserPreferences>(StorageKeys.USER_PREFERENCES);
      if (prefs) {
        if (prefs.currentQuizProgress?.conversations && prefs.currentQuizProgress.conversations.length > 0) {
          // Merge with existing conversations, avoiding duplicates
          const existingIds = new Set(data.conversations.map(c => c.timestamp));
          const prefsConversations = prefs.currentQuizProgress.conversations.filter(c => !existingIds.has(c.timestamp));
          data.conversations = [...data.conversations, ...prefsConversations];
        }
      }

      // Extract previous analyses from journal entries
      data.previousAnalyses = data.journalEntries
        .filter(entry => entry.id.includes('analysis-') || entry.reflection.includes('Analysis Results'))
        .map(entry => entry.reflection + '\n' + entry.insights + '\n' + entry.integration);

      setUserData(data);
      setCurrentPhase('options');
    };

    loadUserData();
  }, [shadowProfile]);

  const handleAnalysisChoice = async (type: 'evolution' | 'deeper') => {
    setAnalysisType(type);
    setCurrentPhase('analyzing');
    setIsGenerating(true);

    if (!userData) return;

    try {
      if (type === 'evolution') {
        // Evolution analysis goes straight to results
        const prompt = createEvolutionPrompt(userData);
        const response = await askClaude(prompt, shadowProfile || {
          archetype: 'Evolutionary Analysis',
          traits: ['growth-tracking', 'pattern-recognition'],
          intensity: 'deep',
          description: 'Comprehensive re-analysis of accumulated shadow work data'
        }, undefined, undefined, undefined, undefined, 'reanalysis');
        setAnalysisResults(response);
        setCurrentPhase('results');
      } else {
        // Deeper questions become interactive
        const prompt = createDeeperPrompt(userData);
        const response = await askClaude(prompt, shadowProfile || {
          archetype: 'Deeper Questions',
          traits: ['inquiry', 'exploration'],
          intensity: 'deep',
          description: 'Generating deeper shadow work questions'
        }, undefined, undefined, undefined, undefined, 'reanalysis');
        
        // Parse questions from response
        const questions = parseQuestions(response);
        setDeeperQuestions(questions);
        setCurrentPhase('questions');
      }
    } catch (error) {
      console.error('Re-analysis error:', error);
      setAnalysisResults('Unable to generate analysis at this time. Please try again later.');
      setCurrentPhase('results');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseQuestions = (response: string): string[] => {
    // First try to extract numbered questions that actually end with question marks
    let questions = response.split('\n')
      .filter(line => line.match(/^\d+\./)) // Numbered items
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0 && q.includes('?')) // Must contain question mark
      .filter(q => q.endsWith('?')); // Must end with question mark

    // Fallback: extract sentences that are clearly questions
    if (questions.length === 0) {
      questions = response.split(/[.!]+/) // Split on periods and exclamations, not question marks
        .filter(s => s.includes('?'))
        .map(s => s.trim())
        .filter(s => s.length > 20 && s.endsWith('?'))
        .slice(0, 5);
    }

    // Enhanced fallback: Look for question words
    if (questions.length === 0) {
      const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who'];
      questions = response.split(/[.!]+/)
        .filter(s => {
          const lower = s.toLowerCase().trim();
          return questionWords.some(word => lower.startsWith(word)) && s.includes('?');
        })
        .map(s => s.trim())
        .filter(s => s.endsWith('?'))
        .slice(0, 5);
    }

    // Final fallback with curated questions
    if (questions.length === 0) {
      questions = [
        "What pattern in your shadow work keeps recurring despite your awareness of it?",
        "What would you need to feel in order to fully embrace the parts of yourself you've been rejecting?",
        "How might your current struggles be serving you in ways you haven't acknowledged?"
      ];
    }

    // Ensure all questions end with question marks
    return questions.slice(0, 5).map(q => q.endsWith('?') ? q : q + '?');
  };

  const handleQuestionResponse = () => {
    if (!currentResponse.trim()) return;
    
    setQuestionResponses({
      ...questionResponses,
      [currentQuestionIndex]: currentResponse
    });
    setCurrentResponse('');

    if (currentQuestionIndex < deeperQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, generate final analysis
      generateFinalDeeperAnalysis();
    }
  };

  const generateFinalDeeperAnalysis = async () => {
    setCurrentPhase('analyzing');
    setIsGenerating(true);

    try {
      const analysisPrompt = `Based on these deeper questions and responses, provide comprehensive insights:

QUESTIONS & RESPONSES:
${deeperQuestions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${questionResponses[i] || 'No response'}`).join('\n\n')}

ORIGINAL DATA CONTEXT:
- Archetype: ${shadowProfile?.archetype || 'Not determined'}
- Journal entries: ${userData?.journalEntries.length || 0}
- Previous conversations: ${userData?.conversations.length || 0}

Provide insights in this format:

**BREAKTHROUGH INSIGHTS:**
[What these responses reveal about their deeper patterns]

**HIDDEN PATTERNS:**
[Unconscious dynamics they're now ready to see]

**INTEGRATION GUIDANCE:**
[Specific steps for working with these new awarenesses]

**NEXT LEVEL WORK:**
[Where their shadow work journey goes from here]

Be direct, use their exact words, and focus on practical integration.`;

      const response = await askClaude(analysisPrompt, shadowProfile || {
        archetype: 'Deep Integration Analysis',
        traits: ['insight', 'integration'],
        intensity: 'deep',
        description: 'Analysis of deeper question responses'
      }, undefined, undefined, undefined, undefined, 'reanalysis');

      setAnalysisResults(response);
      setCurrentPhase('results');
    } catch (error) {
      console.error('Final analysis error:', error);
      setAnalysisResults('Unable to complete analysis. Your responses have been saved.');
      setCurrentPhase('results');
    } finally {
      setIsGenerating(false);
    }
  };

  const createEvolutionPrompt = (data: UserData): string => {
    return `You are Sage conducting a comprehensive evolutionary analysis. Analyze this user's shadow work journey over time to identify growth patterns, recurring themes, and areas of evolution or stagnation.

USER'S SHADOW WORK HISTORY:

CURRENT ARCHETYPE: ${data.archetype?.archetype || 'Not yet determined'}

JOURNAL ENTRIES (${data.journalEntries.length} total):
${data.journalEntries.slice(0, 10).map((entry, i) => `
Entry ${i + 1} (${entry.date}):
Reflection: ${entry.reflection.slice(0, 200)}...
Insights: ${entry.insights.slice(0, 200)}...
Integration: ${entry.integration.slice(0, 200)}...
Mood: ${entry.mood}/5
`).join('')}

CONVERSATIONS WITH SAGE (${data.conversations.length} total):
${data.conversations.slice(-5).map((conv, i) => `
Q${i + 1}: ${conv.question.slice(0, 150)}...
A${i + 1}: ${conv.response.slice(0, 300)}...
`).join('')}

PREVIOUS ANALYSES:
${data.previousAnalyses.slice(0, 2).join('\n\n---\n\n')}

EVOLUTIONARY ANALYSIS REQUEST:
1. How has their shadow work evolved since they began?
2. What patterns keep recurring vs. what has shifted?
3. Where are they growing and where might they be stuck?
4. What new insights emerge from seeing their journey as a whole?
5. What's their next growth edge based on this evolution?

Provide specific, personalized insights using their exact words and examples. Focus on growth, patterns, and evolution rather than diagnosis.`;
  };

  const createDeeperPrompt = (data: UserData): string => {
    return `You are Sage conducting a deeper dive analysis. Based on all accumulated data, generate 3-5 penetrating questions that this user isn't yet asking themselves but needs to explore.

IMPORTANT: Generate ONLY actual questions that end with question marks. Do NOT provide statements, assessments, or observations. Each item must be a direct question the user can answer.

USER'S ACCUMULATED WISDOM:

ARCHETYPE: ${data.archetype?.archetype || 'Not yet determined'}

KEY THEMES FROM JOURNALS:
${data.journalEntries.slice(0, 8).map(entry => `- ${entry.insights}`).join('\n')}

CONVERSATION PATTERNS:
${data.conversations.slice(-6).map(conv => `Q: ${conv.question}\nTheme: ${conv.response.slice(0, 200)}...`).join('\n\n')}

ANALYSIS HISTORY:
${data.previousAnalyses.slice(0, 1).join('')}

DEEPER DIVE REQUEST:
Based on everything they've revealed, generate 3-5 powerful questions that:
1. Address blind spots they haven't noticed
2. Challenge assumptions they keep making
3. Explore areas they're avoiding or minimizing
4. Go deeper than their current level of self-inquiry
5. Connect patterns across different life areas

Format EXACTLY as:
**DEEPER QUESTIONS FOR YOUR CONTINUED JOURNEY:**

1. What [specific challenging question based on their patterns]?
2. How [question about what they're not seeing]?
3. Why [question that connects multiple themes]?
4. What [question about their avoidance patterns]?
5. How [question about their next growth edge]?

**WHAT THESE QUESTIONS REVEAL:**
[Brief insight about why these questions matter for their growth]

CRITICAL: Every numbered item must be a complete question ending with a question mark. Use their exact words and themes. Be direct but compassionate.`;
  };

  const renderLoadingPhase = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-8 text-center"
    >
      <div className="bg-black/40 rounded-3xl p-12 glass">
        <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-4">Gathering Your Journey Data</h2>
        <p className="text-gray-300">
          Sage is collecting your journal entries, conversations, and previous analyses...
        </p>
      </div>
    </motion.div>
  );

  const renderOptionsPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8"
    >
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-6"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Re-Analysis with Sage</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Sage will analyze your accumulated shadow work data to provide evolved insights.
        </p>
      </div>

      {userData && (
        <div className="bg-black/30 rounded-3xl p-6 mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Your Journey So Far</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userData.journalEntries.length}</div>
              <div className="text-gray-400">Journal Entries</div>
            </div>
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userData.conversations.length}</div>
              <div className="text-gray-400">Conversations</div>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userData.previousAnalyses.length}</div>
              <div className="text-gray-400">Previous Analyses</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.button
          onClick={() => handleAnalysisChoice('evolution')}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-3xl p-8 text-left transition-all duration-300 group"
        >
          <Sparkles className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-semibold text-white mb-4">Evolution Analysis</h3>
          <p className="text-blue-100 leading-relaxed">
            See how your patterns have shifted over time. Compare your current insights with previous analyses 
            to identify areas of growth and recurring themes that need attention.
          </p>
        </motion.button>

        <motion.button
          onClick={() => handleAnalysisChoice('deeper')}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-3xl p-8 text-left transition-all duration-300 group"
        >
          <Eye className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-semibold text-white mb-4">Deeper Questions</h3>
          <p className="text-orange-100 leading-relaxed">
            Get 3-5 powerful questions you're not yet asking yourself. Based on all your data, 
            Sage will identify blind spots and areas ready for deeper exploration.
          </p>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderQuestionsPhase = () => {
    if (deeperQuestions.length === 0) return null;
    
    const currentQuestion = deeperQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / deeperQuestions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Deeper Questions</h2>
            <span className="text-orange-400 font-medium">
              {currentQuestionIndex + 1} of {deeperQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-black/40 rounded-3xl p-8 glass">
          <div className="flex items-start space-x-3 mb-6">
            <Eye className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-200 mb-2">Deep Inquiry</h3>
              <p className="text-gray-300 text-sm">Based on your accumulated shadow work journey</p>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-6">
            {currentQuestion}
          </h3>
          
          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Take your time to explore this deeply..."
            className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
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
              onClick={handleQuestionResponse}
              disabled={!currentResponse.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 text-white rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <span>{currentQuestionIndex === deeperQuestions.length - 1 ? 'Generate Insights' : 'Next Question'}</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAnalyzingPhase = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-8 text-center"
    >
      <div className="bg-black/40 rounded-3xl p-12 glass">
        <Loader className="w-12 h-12 animate-spin text-orange-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-4">
          {analysisType === 'evolution' ? 'Analyzing Your Growth Journey' : 'Generating Deeper Questions'}
        </h2>
        <p className="text-gray-300">
          {analysisType === 'evolution' 
            ? 'Sage is comparing your current patterns with your journey history to identify evolution and growth opportunities...'
            : 'Sage is reviewing all your data to identify powerful questions for your next level of shadow work...'}
        </p>
      </div>
    </motion.div>
  );

  const renderResultsPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {analysisType === 'evolution' ? 'Your Evolution Analysis' : 'Deeper Questions'}
        </h1>
        <p className="text-gray-300">
          {analysisType === 'evolution' ? 'Growth patterns and evolution insights' : 'Questions to guide your next level of work'}
        </p>
      </div>

      <div className="bg-black/40 rounded-3xl p-8 glass mb-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-100 leading-relaxed whitespace-pre-line">
            {analysisResults}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            // Save re-analysis to journal
            const reAnalysisEntry = {
              id: `reanalysis-${Date.now()}`,
              date: new Date(),
              archetype: analysisType === 'evolution' ? 'Evolution Analysis' : 'Deeper Questions',
              reflection: `${analysisType === 'evolution' ? 'Growth Evolution' : 'Deeper Questions'} - ${new Date().toLocaleDateString()}`,
              mood: 4,
              insights: analysisResults,
              integration: analysisType === 'evolution' 
                ? 'Integrating insights about my growth patterns and evolution' 
                : 'Exploring deeper questions to expand my shadow work'
            };
            
            const entries = getStorageItem<any[]>(StorageKeys.JOURNAL_ENTRIES) || [];
            entries.unshift(reAnalysisEntry);
            setStorageItem(StorageKeys.JOURNAL_ENTRIES, entries);
            
            toast.success('Re-analysis saved to your journal!', {
              duration: 4000,
              position: 'top-center',
              style: {
                background: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #6b7280',
              },
            });
          }}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Save to Journal</span>
        </button>
        
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
        >
          Back to Results
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-orange-900/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black/50 to-black"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 text-white hover:text-orange-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="relative z-10 pb-20">
        <AnimatePresence mode="wait">
          {currentPhase === 'loading' && renderLoadingPhase()}
          {currentPhase === 'options' && renderOptionsPhase()}
          {currentPhase === 'questions' && renderQuestionsPhase()}
          {currentPhase === 'analyzing' && renderAnalyzingPhase()}
          {currentPhase === 'results' && renderResultsPhase()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReAnalysis;