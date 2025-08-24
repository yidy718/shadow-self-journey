'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Brain, 
  MessageCircle, 
  CheckSquare, 
  BarChart3, 
  Lightbulb, 
  Target, 
  Users, 
  Clock, 
  Star,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface UserGuideProps {
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Getting Started',
      icon: <Star className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">Welcome to Your Shadow Journey</h3>
            <p className="text-gray-300 leading-relaxed">
              This isn't your typical personality test. You're about to embark on a deep psychological exploration 
              using Jungian shadow work principles enhanced by Claude Opus 4.1 AI.
            </p>
          </div>

          <div className="bg-purple-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-purple-200 mb-3">🚀 Recommended Journey Path</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span><strong>Shadow Quiz</strong> - Discover your dominant shadow archetype (8 questions)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span><strong>Deep Analysis</strong> - Get behavioral insights & personalized exercises (10-12 questions)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span><strong>Chat with Sage</strong> - Get ultra-specific guidance for your life situations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <span><strong>Journal & Track</strong> - Record insights and track your progress</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-amber-200 mb-3">⚡ Power User Tips</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Use your real name</strong> - Sage creates stronger connections with named users</li>
              <li>• <strong>Be honest and specific</strong> - The more authentic your responses, the better your insights</li>
              <li>• <strong>Complete in one sitting</strong> - Your psychological state affects consistency</li>
              <li>• <strong>Use mobile or desktop</strong> - Fully responsive, works great on any device</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Core Features',
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">Platform Capabilities</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-900/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-semibold text-blue-200">Shadow Quiz</h4>
              </div>
              <p className="text-gray-300 text-sm">
                8 profound questions exploring your deepest psychological patterns. 
                Identifies your dominant shadow archetype from 6 possible types.
              </p>
            </div>

            <div className="bg-green-900/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-green-400" />
                <h4 className="text-lg font-semibold text-green-200">Deep Analysis</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Hybrid behavioral assessment with structured JSON output. 
                7 core questions + AI-generated follow-ups create comprehensive insights.
              </p>
            </div>

            <div className="bg-orange-900/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="w-6 h-6 text-orange-400" />
                <h4 className="text-lg font-semibold text-orange-200">Sage AI Chat</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Ultra-specific exercise generation using Claude Opus 4.1. 
                Mentions "talking to barista" = get 3-step micro-practice for that exact scenario.
              </p>
            </div>

            <div className="bg-purple-900/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckSquare className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-semibold text-purple-200">Progress Tracking</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Interactive checkboxes for actions and exercises. 
                Visual progress bars and completion tracking with localStorage persistence.
              </p>
            </div>
          </div>

          <div className="bg-red-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-red-200 mb-3">🎯 What Makes This Special</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <strong>• AI Context Awareness:</strong> Sage knows your complete journey - archetype, journal entries, mood patterns, previous analyses
              </div>
              <div>
                <strong>• Structured Data:</strong> JSON output enables filtering by difficulty, frequency, completion status
              </div>
              <div>
                <strong>• Situational Precision:</strong> Not generic advice - specific exercises for your exact life scenarios
              </div>
              <div>
                <strong>• Privacy First:</strong> All data stored locally on your device, nothing sent to servers except analysis requests
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sage',
      title: 'Chatting with Sage',
      icon: <MessageCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">Maximizing Your AI Conversations</h3>
            <p className="text-gray-300">
              Sage is powered by Claude Opus 4.1 and has access to your complete shadow work journey. 
              Here's how to get the most insightful and practical guidance.
            </p>
          </div>

          <div className="bg-green-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-green-200 mb-4">🎯 Best Practices for Ultra-Specific Exercises</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-green-300">✅ DO - Be Specific About Situations:</h5>
                <div className="bg-black/30 rounded-lg p-3 mt-2 text-sm">
                  <p className="text-gray-300"><strong>Good:</strong> "I get anxious when ordering at restaurants"</p>
                  <p className="text-green-400">→ Gets: 3-step micro-practice for restaurant ordering scenario</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-red-300">❌ DON'T - Give Vague Responses:</h5>
                <div className="bg-black/30 rounded-lg p-3 mt-2 text-sm">
                  <p className="text-gray-300"><strong>Avoid:</strong> "Yes", "Maybe", "I think so"</p>
                  <p className="text-red-400">→ Sage will ask for more context instead of creating meaningless exercises</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-blue-200 mb-4">💡 Example Conversations</h4>
            
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-blue-300 font-medium mb-2">Situation-Specific Help:</p>
                <p className="text-gray-300 text-sm mb-1"><strong>You:</strong> "I freeze up in team meetings when my boss asks for ideas"</p>
                <p className="text-gray-300 text-sm"><strong>Sage:</strong> "Next time you're in that meeting, try this: 1) Before it starts, write down one small idea 2) During - when asked, share just that one prepared thought 3) After - celebrate that you contributed, even if it felt scary"</p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-purple-300 font-medium mb-2">Pattern Recognition:</p>
                <p className="text-gray-300 text-sm mb-1"><strong>You:</strong> "I always apologize for everything, even when it's not my fault"</p>
                <p className="text-gray-300 text-sm"><strong>Sage:</strong> "That sounds like your Invisible One pattern - using apologies to avoid taking up space. What if you tried replacing 'sorry' with 'thank you'? Instead of 'sorry I'm late' → 'thanks for waiting'"</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-yellow-200 mb-3">🔍 What Sage Knows About You</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• <strong>Your Shadow Archetype:</strong> Core fears, wounds, and defense mechanisms</li>
              <li>• <strong>Behavioral Patterns:</strong> From Deep Analysis with frequency and impact areas</li>
              <li>• <strong>Progress Tracking:</strong> Which actions/exercises you've completed or struggled with</li>
              <li>• <strong>Journal Entries:</strong> Recent reflections, insights, and mood patterns</li>
              <li>• <strong>Conversation History:</strong> Context from your previous messages (last 3 exchanges)</li>
              <li>• <strong>Integration Plan:</strong> Your personalized immediate actions and ongoing practices</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'optimization',
      title: 'Optimization Tips',
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">Getting Maximum Value</h3>
          </div>

          <div className="bg-emerald-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-emerald-200 mb-4">📈 Progressive Journey Strategy</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-emerald-300">Phase 1: Foundation (Week 1)</h5>
                <ul className="text-gray-300 text-sm space-y-1 mt-2 ml-4">
                  <li>• Complete Shadow Quiz + basic results review</li>
                  <li>• Do Deep Analysis when you have 30-45 minutes of uninterrupted time</li>
                  <li>• Start with 2-3 "easy" difficulty actions from your integration plan</li>
                  <li>• Use journal to record first insights and resistances</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-emerald-300">Phase 2: Active Integration (Weeks 2-4)</h5>
                <ul className="text-gray-300 text-sm space-y-1 mt-2 ml-4">
                  <li>• Chat with Sage about specific daily situations as they arise</li>
                  <li>• Practice micro-exercises in real-world scenarios</li>
                  <li>• Check off completed actions - track your progress visually</li>
                  <li>• Graduate to "moderate" difficulty exercises</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-emerald-300">Phase 3: Mastery (Month 2+)</h5>
                <ul className="text-gray-300 text-sm space-y-1 mt-2 ml-4">
                  <li>• Tackle "challenging" difficulty actions when ready</li>
                  <li>• Use ReAnalysis to see evolution in your patterns</li>
                  <li>• Apply insights to complex relationship and work situations</li>
                  <li>• Consider professional therapy integration if recommended</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-indigo-200 mb-4">🎛️ Advanced Features Usage</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-indigo-300 mb-2">Progress Tracking</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Check off actions as you complete them</li>
                  <li>• Use progress bars to maintain motivation</li>
                  <li>• Filter exercises by frequency (daily/weekly)</li>
                  <li>• Sage knows what you've completed - no duplicates!</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-indigo-300 mb-2">Data Integration</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Journal entries feed into Sage's context</li>
                  <li>• Mood patterns influence recommendations</li>
                  <li>• Assessment history tracks your evolution</li>
                  <li>• All data stays on your device privately</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-900/30 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-red-200 mb-3">⚠️ Important Limitations</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• <strong>Not therapy:</strong> This is self-exploration, not professional treatment</li>
              <li>• <strong>Rate limits:</strong> 5 Sage conversations per hour to prevent AI costs and encourage reflection</li>
              <li>• <strong>Context limits:</strong> Sage sees last 3 exchanges, not entire chat history</li>
              <li>• <strong>Serious concerns:</strong> If you're experiencing thoughts of self-harm, seek professional help immediately</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">Common Issues & Solutions</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-900/30 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-yellow-200 mb-3">🔧 Deep Analysis Not Working</h4>
              <div className="space-y-3 text-gray-300 text-sm">
                <div>
                  <strong>Problem:</strong> Results show plain text instead of interactive checkboxes
                </div>
                <div>
                  <strong>Solution:</strong>
                  <ul className="list-disc ml-6 space-y-1 mt-2">
                    <li>Check browser console (F12) for JSON parsing errors</li>
                    <li>Try refreshing page and completing analysis again</li>
                    <li>Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>Clear browser cache if problems persist</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-blue-200 mb-3">💬 Sage Chat Issues</h4>
              <div className="space-y-3 text-gray-300 text-sm">
                <div>
                  <strong>Rate Limit Error:</strong> "Please try again later"
                  <ul className="list-disc ml-6 space-y-1 mt-2">
                    <li>You've used 5 requests in the past hour - this prevents AI costs</li>
                    <li>Wait for reset or use time for reflection on previous insights</li>
                    <li>Each conversation should be more valuable than rapid-fire questions</li>
                  </ul>
                </div>
                <div>
                  <strong>Generic Responses:</strong> Sage not using your specific data
                  <ul className="list-disc ml-6 space-y-1 mt-2">
                    <li>Ensure you completed Deep Analysis first</li>
                    <li>Check console logs show `phase2Analysis: true`</li>
                    <li>Try specific scenario questions rather than general ones</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-900/30 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-green-200 mb-3">📱 Mobile Experience</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <div><strong>Typing:</strong> Quiz works great on mobile - design is mobile-first</div>
                <div><strong>Navigation:</strong> All buttons are touch-optimized with proper spacing</div>
                <div><strong>Checkboxes:</strong> Progress tracking works perfectly on touchscreens</div>
                <div><strong>Performance:</strong> Lightweight design loads quickly on mobile data</div>
              </div>
            </div>

            <div className="bg-purple-900/30 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-purple-200 mb-3">💾 Data & Privacy</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <div><strong>Local Storage:</strong> All personal data stays on your device</div>
                <div><strong>Reset Option:</strong> "New Identity" button clears ALL data for fresh starts</div>
                <div><strong>Sharing:</strong> Data never leaves your device except for AI analysis requests</div>
                <div><strong>Backup:</strong> No cloud backup - consider screenshotting important insights</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSection = sections.find(section => section.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black/50 to-black"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-gray-300 mb-2"
            >
              User Guide
            </motion.h1>
            <p className="text-lg text-purple-200 font-light">
              Master your shadow work journey
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-full p-3 transition-colors"
          >
            <X className="w-6 h-6 text-red-300" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2 sticky top-8">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                      : 'bg-gray-800/30 hover:bg-gray-800/50 text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                  {activeSection === section.id && (
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-black/40 rounded-3xl p-8 glass min-h-[600px]"
              >
                {currentSection?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Access Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-3">Ready to Begin?</h3>
            <p className="text-gray-300 mb-4">
              Start your shadow work journey with the recommended path above, or jump into any feature that interests you.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
            >
              Start Your Journey
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserGuide;