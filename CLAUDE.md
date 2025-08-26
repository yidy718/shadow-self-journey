# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview Update

"The Abyss - Shadow Self Journey" is now a sophisticated psychological assessment platform with integrated AI consultation featuring "Sage" - a wise, friendly psychological AI agent. The platform features hybrid assessment systems, beautiful archetype-style results pages, comprehensive data persistence, intelligent context management, and robust centralized storage architecture for personalized shadow work guidance.

## Project Overview

"The Abyss - Shadow Self Journey" is a Next.js 15 application that provides a psychological assessment tool based on Jungian shadow work concepts. The application guides users through deep introspective questions to identify their dominant shadow archetypes and provides personalized insights for psychological integration.

## Development Commands

```bash
# Development server
npm run dev

# Production build  
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture

### Core Components Structure

- **ShadowQuiz**: Main application component (2,100+ lines) handling eleven screens (identity, welcome, quiz, results, journal, exercises, chat, deepanalysis, reanalysis, guide, progress) with dynamic intensity-based question selection and comprehensive progress tracking
- **WelcomeScreen**: Smart user identity selection with intensity slider, returning user recognition, assessment count display, and intelligent Continue Journey functionality  
- **IntensitySlider**: Beautiful intensity selection component with 4 levels (gentle, moderate, deep, intense) and Gentle Mode toggle for accessibility
- **DeepAnalysis**: Hybrid behavioral assessment with 7 core questions + AI-generated follow-ups, featuring beautiful archetype-style results and Phase 1/2 JSON structure
- **ReAnalysis**: Comprehensive data aggregation and pattern analysis with Evolution Analysis and Interactive Deeper Questions
- **ShadowJournal**: Personal journaling system with mood tracking, insight recording, Phase 2 data integration, and analysis integration
- **IntegrationExercises**: Personalized homework assignments based on shadow archetype with progress tracking
- **ParticleField**: Animated background particles for visual atmosphere
- **ProgressBar**: Quiz progression indicator with enhanced visual feedback

### Centralized Data Architecture (Latest 2024)

#### Storage Utilities (`lib/storageUtils.ts`)
```typescript
export const StorageKeys = {
  PHASE2_DATA: 'shadowDeepAnalysisPhase2',
  COMPLETED_ACTIONS: 'shadowAnalysisCompletedActions',
  COMPLETED_EXERCISES: 'shadowAnalysisCompletedExercises',
  JOURNAL_ENTRIES: 'shadowJournalEntries',
  CONVERSATIONS: 'shadowConversations',
  USER_PREFERENCES: 'shadowSelfUserPrefs'
} as const;

export const getStorageItem = <T>(key: string): T | null
export const setStorageItem = (key: string, value: any): void
export const removeStorageItem = (key: string): void
```

#### Progress Utilities (`lib/progressUtils.ts`)
```typescript
export interface UserProgress {
  hasCompletedQuiz: boolean;        // 4+ answers OR has assessmentHistory
  hasAssessmentHistory: boolean;    // Saved completed quizzes
  hasPhase2Data: boolean;          // Deep Analysis completion
  hasPartialQuiz: boolean;         // In-progress quiz
  hasJournalEntries: boolean;      // Journal activity
  hasConversations: boolean;       // AI chat history
  completionPercentage: number;    // Overall progress (0-100)
  answersCount: number;           // Current quiz progress
}

export const getUserProgress = (userPrefs: UserPreferences | null): UserProgress
export const getRecommendedDestination = (userPrefs: UserPreferences | null): NavigationDestination
export const getBasicProgressSteps = (userPrefs: UserPreferences | null, conversations: any[]): { current: number; total: number }
```

#### Key Data Systems
- **Intensity System**: 4-question vs 8-question quiz modes with dynamic completion tracking
- **Questions System**: Located in `lib/questions.ts` - hybrid system with gentle mode alternatives and intensity variations
- **Shadow Archetypes**: Defined in `lib/shadowArchetypes.ts` - 6 primary archetypes with detailed integration guidance
- **User Preferences**: `lib/userPreferences.ts` - comprehensive system with assessment history, intensity preferences, and progress tracking
- **Rate Limiting**: `lib/rateLimiter.ts` - client-side abuse prevention with enhanced protection
- **Claude API Integration**: `lib/claudeApi.ts` - enhanced context management with journal entries, mood trends, and conversation history
- **Data Export**: `lib/dataExport.ts` - comprehensive data export functionality using centralized storage
- **Scoring Algorithm**: Accumulates shadow traits and determines dominant archetype with proper persistence

### Key Libraries & Dependencies

- **Next.js 15** with App Router and Turbo
- **TypeScript** for type safety with strict typing throughout
- **Tailwind CSS** with custom animations and gradients
- **Framer Motion** for page transitions and animations
- **Lucide React** for icons
- **Anthropic SDK** for Claude 3.5 Sonnet integration

### State Management & Navigation Flow

Uses React hooks for local state with sophisticated flow management:
- **Identity → Welcome**: User creation/recognition with intensity selection and Gentle Mode
- **Welcome → Quiz**: Smart Continue Journey logic with proper destination detection
- **Quiz → Results**: 4-question intensity completion or 8-question full completion with assessment history saving
- **Results Screen**: Dynamic progress cards, exercises access, journal integration, and Deep Analysis CTA
- **Deep Analysis**: Phase 1 question generation → Phase 2 comprehensive analysis with JSON structure
- **Progress Dashboard**: Separate screen with basic progress (pre-Phase 2) or comprehensive tracking (post-Phase 2)
- **ReAnalysis**: Evolution analysis and interactive deeper questions with journal integration

### Styling Approach

Heavy use of:
- Dark gradient themes (black/red/gray/purple color palette)
- Custom Tailwind animations (float, glow, shimmer, pulse-glow, breathe, levitate)
- Glass morphism effects with backdrop-blur
- Mobile-first responsive design patterns
- Accessibility support with reduced motion preferences and Gentle Mode

### Sage AI Integration

- **AI Agent**: "Sage" - wise, friendly psychological AI specializing in shadow work and behavioral analysis
- **Model**: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022) - latest and most advanced
- **Communication Style**: Direct but compassionate, addresses users by name for connection, uses exact words, avoids jargon
- **Safety Guidelines**: Professional support recommendations, non-diagnostic approach
- **Enhanced Context Management**: Includes last 8 journal entries, 3 recent analyses, mood patterns, and conversation history
- **Dynamic Prompting**: Archetype-specific system prompts for personalized responses with user name integration
- **API Route**: `/api/claude` with comprehensive rate limiting, abuse protection, and enhanced context passing
- **Fallback System**: Enhanced pattern-based responses when API unavailable
- **Cost Protection**: 5 requests/hour per user, 10/hour per IP, ~$0.003 per insight
- **Deep Analysis**: Hybrid assessment with 7 behavioral questions + AI-generated follow-ups with beautiful results
- **ReAnalysis**: Comprehensive data review with Evolution Analysis and Interactive Deeper Questions
- **Response Structure**: Recognition → Insight → Integration → Embodiment with personalized addressing

## Critical System Architecture (2024)

### Centralized Storage Pattern
All localStorage operations now use centralized utilities:
- **Components Updated**: ShadowQuiz, DeepAnalysis, ReAnalysis, ShadowJournal, IntegrationExercises, dataExport
- **Benefits**: Consistent error handling, type safety, easier debugging, maintenance
- **Type Safety**: Generic `getStorageItem<T>()` with proper TypeScript typing
- **Error Handling**: Centralized try-catch with proper fallbacks

### Progress Tracking Logic
```typescript
// Critical logic for quiz completion
const hasCompletedQuiz = answersCount >= 4 || hasAssessmentHistory;
// This ensures 4-question intensity quizzes are properly recognized as completed

// Navigation logic
if (hasQuizAnswers || hasAssessmentHistory) {
  setCurrentScreen('results');  // Show results for completed users
} else if (hasPhase2Data) {
  setCurrentScreen('results');  // Deep Analysis only users
} else {
  setCurrentScreen('welcome');  // New users
}
```

### Exercise & Progress Sync
- **Exercise Completion**: Uses `StorageKeys.COMPLETED_EXERCISES` across all components
- **Action Completion**: Uses `StorageKeys.COMPLETED_ACTIONS` for Phase 2 actions
- **Progress Dashboard**: Shows basic progress (pre-Phase 2) or comprehensive progress (post-Phase 2)
- **No Duplicate Cards**: Removed redundant progress buttons on results page

## Recent Major Fixes & Enhancements (December 2024)

### Critical UX Flow Fixes
- **4-Question Quiz Completion**: Fixed logic to properly recognize intensity quiz completion through assessment history
- **Progress Tracking**: Enhanced `getUserProgress()` to check both current progress AND assessment history
- **Exercise Sync**: Applied centralized storage utilities to eliminate sync issues between exercise page and progress dashboard
- **Duplicate Progress Cards**: Removed redundant "always available" progress button to eliminate navigation confusion
- **Continue Journey Logic**: Smart detection of user state with proper navigation to results vs. restart

### System Cleanup & Maintenance
- **localStorage Centralization**: Applied storage utilities across ALL components (ShadowQuiz, DeepAnalysis, ReAnalysis, ShadowJournal, IntegrationExercises, dataExport)
- **TypeScript Safety**: Added proper typing throughout with `UserPreferences` interfaces
- **Error Handling**: Centralized error handling in storage operations
- **Code Deduplication**: Eliminated 15+ localStorage.getItem calls and redundant JSON parsing
- **Build Stability**: Fixed all TypeScript compilation errors

### Enhanced Accessibility & UX
- **Gentle Mode**: Comprehensive accessibility feature with softer language alternatives
- **Professional Polish**: Removed excessive emojis and generic AI references
- **Navigation Clarity**: Clear, single-purpose navigation without duplicates
- **Progress Visibility**: Proper progress tracking that updates immediately after actions

## Development Notes

- Application uses client-side rendering ('use client' directives)
- No backend database - all data processing happens client-side
- **IMPORTANT**: ALL localStorage operations MUST use centralized utilities from `lib/storageUtils.ts`
- Psychological content is mature/intense - designed for adult users with appropriate warnings
- Built-in responsive design for mobile and desktop
- Animation-heavy UI with performance considerations using `shouldReduceMotion`
- Enhanced error handling and graceful degradation throughout
- TypeScript strict typing enforced across all components

## Hybrid Shadow Work JSON Implementation

### Overview
The Deep Analysis system uses a sophisticated two-phase JSON structure that transforms behavioral analysis into actionable, trackable insights. This implementation follows the hybrid shadow work methodology with structured data output.

### Phase 1: Follow-up Question Generation
```typescript
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
```

### Phase 2: Comprehensive Analysis
```typescript
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
```

### Key Implementation Features
- **Robust JSON Parsing**: Multiple fallback strategies for malformed responses
- **Backward Compatibility**: Graceful degradation to text-based display  
- **Progress Tracking**: Interactive checkboxes with localStorage persistence using centralized storage
- **Visual Enhancement**: Color-coded difficulty, frequency, and completion indicators
- **Data Utilization**: Easy filtering, sorting, and analytics preparation

## Troubleshooting Guide

### Common Issues & Solutions

1. **Quiz Not Marking as Completed (4-question)**
   - Check: `hasCompletedQuiz` logic in `lib/progressUtils.ts`
   - Fix: Ensure both `answersCount >= 4` AND `hasAssessmentHistory` are checked

2. **Exercise Progress Not Syncing**
   - Check: All components use `StorageKeys.COMPLETED_EXERCISES`
   - Fix: Apply centralized storage utilities (`getStorageItem`/`setStorageItem`)

3. **TypeScript Errors**
   - Check: Proper typing with `UserPreferences` interface
   - Fix: Use `getStorageItem<UserPreferences>()` with proper generic typing

4. **localStorage Issues**
   - Check: All components use centralized storage utilities
   - Fix: Import from `lib/storageUtils.ts` and use `StorageKeys`

5. **Navigation Flow Problems**
   - Check: `getRecommendedDestination()` logic in `lib/progressUtils.ts`
   - Fix: Review Continue Journey logic and user state detection

## Future Development Guidelines

1. **ALWAYS use centralized storage utilities** - Never use `localStorage` directly
2. **Maintain TypeScript typing** - Use proper interfaces throughout
3. **Follow established patterns** - Use existing utility functions and conventions
4. **Test across intensity modes** - Verify 4-question and 8-question flows
5. **Consider performance** - ShadowQuiz.tsx is large, consider component breakdown
6. **Maintain accessibility** - Support Gentle Mode and reduced motion preferences

## Development Benefits
```javascript
// Easy data manipulation with centralized utilities
const progress = getUserProgress(userPrefs);
const destination = getRecommendedDestination(userPrefs);
const basicSteps = getBasicProgressSteps(userPrefs, conversations);

// Consistent storage operations
const phase2Data = getStorageItem(StorageKeys.PHASE2_DATA);
const completedActions = getStorageItem<string[]>(StorageKeys.COMPLETED_ACTIONS);
setStorageItem(StorageKeys.CONVERSATIONS, conversations);

// Future feature enablement
const easyActions = phase2Data.integration_plan.immediate_actions.filter(a => a.difficulty === 'easy');
const dailyExercises = phase2Data.integration_exercises.filter(ex => ex.frequency === 'daily');
```