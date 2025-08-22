'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Calendar, Heart, Save, ArrowLeft, Edit3 } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: Date;
  archetype: string;
  reflection: string;
  mood: number; // 1-5 scale
  insights: string;
  integration: string;
}

interface ShadowJournalProps {
  currentArchetype?: string;
  onClose: () => void;
}

export const ShadowJournal = ({ currentArchetype, onClose }: ShadowJournalProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    reflection: '',
    mood: 3,
    insights: '',
    integration: ''
  });

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('shadowJournalEntries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        setEntries(parsed);
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }
    }
  }, []);

  // Save entries to localStorage
  const saveEntries = (updatedEntries: JournalEntry[]) => {
    try {
      localStorage.setItem('shadowJournalEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  };

  const addEntry = () => {
    if (!newEntry.reflection.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      archetype: currentArchetype || 'Unknown',
      reflection: newEntry.reflection,
      mood: newEntry.mood,
      insights: newEntry.insights,
      integration: newEntry.integration
    };

    const updatedEntries = [entry, ...entries];
    saveEntries(updatedEntries);
    setNewEntry({ reflection: '', mood: 3, insights: '', integration: '' });
    setIsAddingEntry(false);
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
  };

  const moodEmojis = ['😢', '😟', '😐', '🙂', '😊'];
  const moodLabels = ['Very Dark', 'Dark', 'Neutral', 'Light', 'Hopeful'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="mr-4 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
              aria-label="Close journal"
            >
              <ArrowLeft className="w-6 h-6 text-gray-300" />
            </button>
            <BookOpen className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Shadow Journal</h1>
          </div>
          
          <button
            onClick={() => setIsAddingEntry(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Entry
          </button>
        </motion.div>

        {/* Add New Entry Modal */}
        <AnimatePresence>
          {isAddingEntry && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Edit3 className="w-6 h-6 mr-3 text-purple-400" />
                  New Shadow Entry
                </h2>
                
                {currentArchetype && (
                  <div className="mb-6 p-4 bg-purple-900/30 rounded-2xl">
                    <p className="text-purple-200">
                      <strong>Current Archetype:</strong> {currentArchetype}
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-purple-200 mb-2 font-medium">
                      Current Mood
                    </label>
                    <div className="flex items-center justify-between bg-gray-800/50 rounded-2xl p-4">
                      {moodEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => setNewEntry({...newEntry, mood: index + 1})}
                          className={`text-3xl p-2 rounded-full transition-all ${
                            newEntry.mood === index + 1 
                              ? 'bg-purple-600 scale-125' 
                              : 'hover:bg-gray-700/50 hover:scale-110'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-gray-400 mt-2">
                      {moodLabels[newEntry.mood - 1]}
                    </p>
                  </div>

                  <div>
                    <label className="block text-purple-200 mb-2 font-medium">
                      What shadows are you experiencing today?
                    </label>
                    <textarea
                      value={newEntry.reflection}
                      onChange={(e) => setNewEntry({...newEntry, reflection: e.target.value})}
                      className="w-full bg-gray-800/80 text-white p-4 rounded-2xl border border-purple-500/30 focus:border-purple-400/70 transition-colors resize-none"
                      rows={4}
                      placeholder="Describe what you're feeling, what darkness you're confronting..."
                    />
                  </div>

                  <div>
                    <label className="block text-purple-200 mb-2 font-medium">
                      Insights & Realizations
                    </label>
                    <textarea
                      value={newEntry.insights}
                      onChange={(e) => setNewEntry({...newEntry, insights: e.target.value})}
                      className="w-full bg-gray-800/80 text-white p-4 rounded-2xl border border-purple-500/30 focus:border-purple-400/70 transition-colors resize-none"
                      rows={3}
                      placeholder="What are you learning about yourself?"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-200 mb-2 font-medium">
                      Integration Practice
                    </label>
                    <textarea
                      value={newEntry.integration}
                      onChange={(e) => setNewEntry({...newEntry, integration: e.target.value})}
                      className="w-full bg-gray-800/80 text-white p-4 rounded-2xl border border-purple-500/30 focus:border-purple-400/70 transition-colors resize-none"
                      rows={3}
                      placeholder="How will you work with this shadow? What action will you take?"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={addEntry}
                    disabled={!newEntry.reflection.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 disabled:scale-100 transform hover:scale-105 flex items-center justify-center"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Entry
                  </button>
                  
                  <button
                    onClick={() => setIsAddingEntry(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal Entries */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">Your shadow journal awaits</p>
              <p className="text-gray-500 max-w-md mx-auto">
                Begin documenting your journey into the depths. Each entry becomes a step toward integration.
              </p>
            </motion.div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-6 hover:border-purple-400/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{entry.date.toLocaleDateString()}</span>
                    <span className="mx-3">•</span>
                    <span className="text-purple-300 font-medium">{entry.archetype}</span>
                    <span className="ml-4 text-2xl">{moodEmojis[entry.mood - 1]}</span>
                  </div>
                  
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-purple-200 font-medium mb-2">Shadow Reflection</h3>
                    <p className="text-gray-200 leading-relaxed">{entry.reflection}</p>
                  </div>

                  {entry.insights && (
                    <div>
                      <h3 className="text-purple-200 font-medium mb-2">Insights</h3>
                      <p className="text-gray-200 leading-relaxed">{entry.insights}</p>
                    </div>
                  )}

                  {entry.integration && (
                    <div>
                      <h3 className="text-purple-200 font-medium mb-2">Integration Practice</h3>
                      <p className="text-gray-200 leading-relaxed">{entry.integration}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShadowJournal;