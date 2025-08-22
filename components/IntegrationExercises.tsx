'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, ArrowLeft, CheckCircle, Circle, Calendar, 
  Heart, Brain, Lightbulb, User, Shield, Eye,
  Clock, Star, Zap, Flame
} from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Gentle' | 'Moderate' | 'Deep' | 'Intense';
  category: 'Daily Practice' | 'Reflection' | 'Action' | 'Meditation' | 'Journaling';
  instructions: string[];
  archetype: string;
  completed: boolean;
  dateCompleted?: Date;
}

interface IntegrationExercisesProps {
  archetype: string;
  onClose: () => void;
}

export const IntegrationExercises = ({ archetype, onClose }: IntegrationExercisesProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    // Load completed exercises from localStorage
    const savedProgress = localStorage.getItem('shadowExerciseProgress');
    const completedExercises = savedProgress ? JSON.parse(savedProgress) : {};

    // Generate exercises based on archetype
    const archetypeExercises = generateExercises(archetype, completedExercises);
    setExercises(archetypeExercises);
  }, [archetype]);

  const generateExercises = (archetype: string, completedData: any): Exercise[] => {
    const baseExercises: Omit<Exercise, 'id' | 'completed' | 'dateCompleted' | 'archetype'>[] = [];

    // Universal exercises for all archetypes
    baseExercises.push(
      {
        title: 'Shadow Dialogue',
        description: 'Have a conversation with your shadow self',
        duration: '15-20 minutes',
        difficulty: 'Moderate',
        category: 'Journaling',
        instructions: [
          'Find a quiet space and sit comfortably',
          'Write a letter to your shadow self, acknowledging its presence',
          'Then respond as your shadow - what does it want to tell you?',
          'Continue this dialogue for at least 3 exchanges',
          'End by thanking your shadow for its protection and wisdom'
        ]
      },
      {
        title: 'Compassionate Self-Talk Reset',
        description: 'Transform your inner critic into an inner ally',
        duration: '10 minutes, 3x daily',
        difficulty: 'Gentle',
        category: 'Daily Practice',
        instructions: [
          'Notice when your inner critic speaks harshly',
          'Pause and take three deep breaths',
          'Ask: "Would I speak to a dear friend this way?"',
          'Reframe the criticism with compassion and understanding',
          'Practice this reset every time you notice harsh self-talk'
        ]
      },
      {
        title: 'Shadow Meditation',
        description: 'Sit with your darkness without judgment',
        duration: '20 minutes',
        difficulty: 'Deep',
        category: 'Meditation',
        instructions: [
          'Sit in comfortable meditation posture',
          'Breathe naturally and center yourself',
          'Invite your shadow aspects into awareness',
          'Observe them without trying to change or fix anything',
          'Send loving-kindness to all parts of yourself',
          'Close by setting intention for integration'
        ]
      }
    );

    // Archetype-specific exercises
    if (archetype === 'The Self-Destroyer') {
      baseExercises.push(
        {
          title: 'Inner Parent Practice',
          description: 'Develop the loving parent voice you needed',
          duration: '15 minutes daily',
          difficulty: 'Moderate',
          category: 'Daily Practice',
          instructions: [
            'Each morning, look in the mirror',
            'Speak to yourself as a loving parent would',
            '"Good morning, beautiful soul. You are worthy of love."',
            'Throughout the day, check in with yourself kindly',
            'Before bed, offer yourself encouragement for tomorrow'
          ]
        },
        {
          title: 'Self-Destruction Pattern Mapping',
          description: 'Identify and interrupt destructive cycles',
          duration: '30 minutes',
          difficulty: 'Intense',
          category: 'Reflection',
          instructions: [
            'Map out your self-destructive patterns',
            'Identify triggers that activate self-attack',
            'Notice the feelings underneath the destruction',
            'Develop alternative responses to triggers',
            'Create a "circuit breaker" phrase to interrupt the pattern'
          ]
        }
      );
    }

    if (archetype === 'The Void Walker') {
      baseExercises.push(
        {
          title: 'Sensation Anchoring',
          description: 'Reconnect with your body and feelings',
          duration: '10 minutes, 3x daily',
          difficulty: 'Gentle',
          category: 'Daily Practice',
          instructions: [
            'Set 3 alarms throughout your day',
            'When they ring, pause and scan your body',
            'Notice any physical sensations without judgment',
            'Name one thing you can see, hear, smell, taste, or touch',
            'Rate your emotional state from 1-10',
            'Thank yourself for checking in'
          ]
        },
        {
          title: 'Meaning Archaeology',
          description: 'Uncover small moments of purpose',
          duration: '20 minutes',
          difficulty: 'Moderate',
          category: 'Reflection',
          instructions: [
            'Reflect on your last 24 hours',
            'Find one moment where you helped someone, even minimally',
            'Find one moment of beauty you noticed',
            'Find one problem you solved, however small',
            'Write down these moments and how they felt',
            'Commit to noticing more tomorrow'
          ]
        }
      );
    }

    if (archetype === 'The Hidden Sadist') {
      baseExercises.push(
        {
          title: 'Power Transformation Ritual',
          description: 'Channel destructive power into protective force',
          duration: '25 minutes',
          difficulty: 'Intense',
          category: 'Action',
          instructions: [
            'Write down someone who has hurt you',
            'Allow yourself to feel the desire for revenge fully',
            'Now write down someone who is suffering and needs protection',
            'Visualize using your intensity to defend them instead',
            'Take one real action to help someone vulnerable today',
            'Burn the revenge list, keep the protection intention'
          ]
        },
        {
          title: 'Fierce Compassion Practice',
          description: 'Transform cruelty into protective love',
          duration: '15 minutes daily',
          difficulty: 'Deep',
          category: 'Daily Practice',
          instructions: [
            'When you feel cruel impulses, pause',
            'Ask: "What am I trying to protect?"',
            'Identify the vulnerable part of you that\'s afraid',
            'Channel that fierce energy into protecting your inner child',
            'Take one action that serves justice, not vengeance'
          ]
        }
      );
    }

    if (archetype === 'The Master of Masks') {
      baseExercises.push(
        {
          title: 'Authentic Moment Challenge',
          description: 'Practice revealing your true self',
          duration: 'Throughout the day',
          difficulty: 'Moderate',
          category: 'Action',
          instructions: [
            'Choose one low-stakes interaction daily',
            'Share one genuine opinion or preference',
            'Don\'t qualify or apologize for it',
            'Notice the urge to adapt or perform',
            'Breathe through the discomfort of being real',
            'Celebrate each authentic moment, however small'
          ]
        },
        {
          title: 'Mask Inventory',
          description: 'Map your different personas and find your core',
          duration: '45 minutes',
          difficulty: 'Deep',
          category: 'Reflection',
          instructions: [
            'List the different "characters" you become',
            'For each, note: when you use it, why it developed',
            'Identify which masks serve you vs. exhaust you',
            'Find the common thread - what\'s consistent across all masks?',
            'This consistency is closer to your authentic self'
          ]
        }
      );
    }

    // Generate IDs and set completion status
    return baseExercises.map((exercise, index) => {
      const id = `${archetype}-${index}`;
      const completed = completedData[id] !== undefined;
      return {
        ...exercise,
        id,
        archetype,
        completed,
        dateCompleted: completed ? new Date(completedData[id]) : undefined
      };
    });
  };

  const toggleExerciseComplete = (exerciseId: string) => {
    const updatedExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        const completed = !ex.completed;
        return {
          ...ex,
          completed,
          dateCompleted: completed ? new Date() : undefined
        };
      }
      return ex;
    });

    setExercises(updatedExercises);

    // Save to localStorage
    const completedData = JSON.parse(localStorage.getItem('shadowExerciseProgress') || '{}');
    const exercise = updatedExercises.find(ex => ex.id === exerciseId);
    
    if (exercise?.completed) {
      completedData[exerciseId] = new Date().toISOString();
    } else {
      delete completedData[exerciseId];
    }
    
    localStorage.setItem('shadowExerciseProgress', JSON.stringify(completedData));
  };

  const filteredExercises = exercises.filter(exercise => {
    if (filter === 'completed') return exercise.completed;
    if (filter === 'pending') return !exercise.completed;
    return true;
  });

  const completedCount = exercises.filter(ex => ex.completed).length;
  const totalCount = exercises.length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Gentle': return 'text-green-400 bg-green-900/20';
      case 'Moderate': return 'text-yellow-400 bg-yellow-900/20';
      case 'Deep': return 'text-orange-400 bg-orange-900/20';
      case 'Intense': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Daily Practice': return Heart;
      case 'Reflection': return Brain;
      case 'Action': return Zap;
      case 'Meditation': return Eye;
      case 'Journaling': return Lightbulb;
      default: return Target;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900/20 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <button 
              onClick={onClose}
              className="mr-4 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
              aria-label="Close exercises"
            >
              <ArrowLeft className="w-6 h-6 text-gray-300" />
            </button>
            <Target className="w-8 h-8 text-indigo-400 mr-3" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Integration Exercises</h1>
              <p className="text-indigo-200 font-medium">{archetype}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white mb-1">{completedCount}/{totalCount}</div>
            <div className="text-indigo-300 text-sm">Completed</div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="w-full bg-gray-800 rounded-full h-3 mb-8"
        >
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {(['all', 'pending', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-full font-medium transition-colors capitalize ${
                filter === filterType
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise, index) => {
            const IconComponent = getCategoryIcon(exercise.category);
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-900/60 backdrop-blur-sm border rounded-3xl p-6 cursor-pointer transition-all hover:scale-105 ${
                  exercise.completed 
                    ? 'border-green-500/40 bg-green-900/10' 
                    : 'border-indigo-500/20 hover:border-indigo-400/40'
                }`}
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="flex items-start justify-between mb-4">
                  <IconComponent className="w-6 h-6 text-indigo-400" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExerciseComplete(exercise.id);
                    }}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {exercise.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-indigo-400" />
                    )}
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{exercise.title}</h3>
                <p className="text-gray-300 mb-4 line-clamp-2">{exercise.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {exercise.duration}
                  </div>
                </div>

                {exercise.completed && exercise.dateCompleted && (
                  <div className="mt-3 flex items-center text-green-400 text-sm">
                    <Star className="w-4 h-4 mr-1" />
                    Completed {exercise.dateCompleted.toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Exercise Detail Modal */}
        <AnimatePresence>
          {selectedExercise && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedExercise(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-indigo-500/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedExercise.title}</h2>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedExercise.difficulty)}`}>
                        {selectedExercise.difficulty}
                      </span>
                      <span className="text-indigo-300">{selectedExercise.category}</span>
                      <span className="text-gray-400">{selectedExercise.duration}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExerciseComplete(selectedExercise.id);
                    }}
                    className="text-3xl hover:scale-110 transition-transform"
                  >
                    {selectedExercise.completed ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <Circle className="w-8 h-8 text-gray-400 hover:text-indigo-400" />
                    )}
                  </button>
                </div>

                <p className="text-xl text-gray-200 mb-8 leading-relaxed">{selectedExercise.description}</p>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-indigo-200 mb-4">Instructions:</h3>
                  {selectedExercise.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-gray-200 leading-relaxed">{instruction}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => {
                      toggleExerciseComplete(selectedExercise.id);
                      setSelectedExercise(null);
                    }}
                    className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      selectedExercise.completed
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:scale-105'
                    }`}
                  >
                    {selectedExercise.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntegrationExercises;