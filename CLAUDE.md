# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview Update

"The Abyss - Shadow Self Journey" is now a sophisticated psychological assessment platform with integrated AI consultation featuring "Sage" - a wise, friendly psychological AI agent. The platform features hybrid assessment systems, beautiful archetype-style results pages, comprehensive data persistence, and intelligent context management for personalized shadow work guidance.

## Project Overview

"The Abyss - Shadow Self Journey" is a Next.js 14 application that provides a psychological assessment tool based on Jungian shadow work concepts. The application guides users through deep introspective questions to identify their dominant shadow archetypes and provides personalized insights for psychological integration.

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

- **ShadowQuiz**: Main application component handling seven screens (identity, welcome, quiz, results, journal, exercises, chat, deepanalysis, reanalysis)
- **WelcomeScreen**: Smart user identity selection with returning user recognition, assessment count display, and Continue Journey functionality
- **DeepAnalysis**: Hybrid behavioral assessment with 7 core questions + AI-generated follow-ups, featuring beautiful archetype-style results
- **ReAnalysis**: Comprehensive data aggregation and pattern analysis with Evolution Analysis and Interactive Deeper Questions
- **ShadowJournal**: Personal journaling system with mood tracking, insight recording, and analysis integration
- **IntegrationExercises**: Personalized homework assignments based on shadow archetype
- **ParticleField**: Animated background particles for visual atmosphere
- **ProgressBar**: Quiz progression indicator with enhanced visual feedback

### Data Architecture

- **Questions System**: Located in `lib/questions.ts` - contains 8 deep psychological questions with weighted shadow trait responses
- **Shadow Archetypes**: Defined in `lib/shadowArchetypes.ts` - 6 primary archetypes with detailed integration guidance
- **User Preferences**: `lib/userPreferences.ts` - comprehensive local storage system for user identity, assessment history, and data persistence
- **Rate Limiting**: `lib/rateLimiter.ts` - client-side abuse prevention with enhanced protection
- **Claude API Integration**: `lib/claudeApi.ts` - enhanced context management with journal entries, mood trends, and conversation history
- **Scoring Algorithm**: Accumulates shadow traits from quiz responses and determines dominant archetype with proper persistence
- **Data Persistence**: Multi-layered storage system with conversations, journal entries, assessment history, and exercise progress

### Key Libraries & Dependencies

- **Next.js 15** with App Router and Turbo
- **TypeScript** for type safety
- **Tailwind CSS** with custom animations and gradients
- **Framer Motion** for page transitions and animations
- **Lucide React** for icons
- **Anthropic SDK** for Claude 3.5 Sonnet integration

### State Management

Uses React hooks for local state:
- Quiz progression tracking
- Answer accumulation with shadow trait weighting
- Screen transitions (welcome → quiz → results → journal → exercises → deepanalysis)
- User identity management (anonymous/named)
- Assessment history tracking
- Sage AI consultation integration
- Deep Analysis behavioral question flow
- Follow-up question generation and responses

### Styling Approach

Heavy use of:
- Dark gradient themes (black/red/gray/purple color palette)
- Custom Tailwind animations (float, glow, shimmer, pulse-glow, breathe, levitate)
- Glass morphism effects with backdrop-blur
- Mobile-first responsive design patterns
- Accessibility support with reduced motion preferences

### Sage AI Integration

- **AI Agent**: "Sage" - wise, friendly psychological AI specializing in shadow work and behavioral analysis
- **Model**: Claude 4.1 (claude-4-1) - latest and most advanced
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

## Recent Major Enhancements (2024)

### Beautiful User Experience
- **Archetype-Style Deep Analysis Results**: Transform behavioral analysis into stunning visual presentations matching archetype quality
- **Enhanced Welcome Flow**: Smart Continue Journey button that detects completed assessments and navigates appropriately
- **Assessment Count Display**: Accurate assessment counting including both history and completed quiz progress
- **Complete Data Reset**: New Identity button now clears ALL data including journal, conversations, and exercise progress

### Intelligent AI Integration
- **Enhanced Context Management**: Sage now has access to user's complete shadow work journey including journal entries, mood trends, and previous analyses
- **Personalized Communication**: AI addresses users by name when provided, creating stronger connection and trust
- **Interactive Deeper Questions**: ReAnalysis feature generates personalized questions that users can actually answer, not just view
- **Smart Conversation Persistence**: Conversations save to both user preferences and localStorage for proper ReAnalysis access

### Data Architecture Improvements
- **Assessment History Saving**: Fixed critical issue where completed quizzes weren't being saved to assessment history
- **Multi-Layer Storage**: Enhanced data persistence across conversations, journal entries, assessments, and exercise progress
- **Smart Navigation Logic**: Continue Journey now properly detects completed data and navigates to results instead of restart

### Question & Analysis Quality
- **Enhanced Question Parsing**: Improved ReAnalysis to generate only actual questions (ending with ?) instead of statements
- **Robust Fallback Systems**: Multiple parsing methods ensure AI-generated questions are properly formatted
- **Pattern Recognition**: Better extraction of key insights (Deep Truth, Integration Path, Personal Archetype) from AI responses

### Hybrid Shadow Work System (Latest Enhancement)
- **Phase 1 JSON Structure**: Structured follow-up question generation with `initial_pattern_analysis`, categorized questions by purpose, and confidence levels
- **Phase 2 JSON Structure**: Comprehensive analysis format with `behavioral_patterns`, `shadow_elements`, `root_analysis`, `integration_plan`, and `overall_assessment`
- **Smart Progress Tracking**: Interactive checkboxes for immediate actions and integration exercises with localStorage persistence
- **Structured UI Components**: Beautiful visual display of analysis sections with color-coded difficulty levels, frequency indicators, and completion tracking
- **Enhanced Data Utilization**: Easy filtering by difficulty, timeline, frequency - enabling future features like personalized recommendations and progress analytics

## Development Notes

- Application uses client-side rendering ('use client' directives)
- No backend database - all data processing happens client-side
- Comprehensive localStorage-based data persistence system
- Psychological content is mature/intense - designed for adult users with appropriate warnings
- Built-in responsive design for mobile and desktop
- Animation-heavy UI requiring performance considerations
- Enhanced error handling and graceful degradation throughout

## Hybrid Shadow Work JSON Implementation

### Overview
The Deep Analysis system now uses a sophisticated two-phase JSON structure that transforms behavioral analysis into actionable, trackable insights. This implementation follows the hybrid shadow work methodology with structured data output.

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
- **Progress Tracking**: Interactive checkboxes with localStorage persistence
- **Visual Enhancement**: Color-coded difficulty, frequency, and completion indicators
- **Data Utilization**: Easy filtering, sorting, and analytics preparation

### Development Benefits
```javascript
// Easy data manipulation
const easyActions = phase2Data.integration_plan.immediate_actions.filter(a => a.difficulty === 'easy');
const dailyExercises = phase2Data.integration_exercises.filter(ex => ex.frequency === 'daily');
const completionRate = completedActions.size / totalActions.length;

// Future feature enablement
const highResistanceUsers = assessments.filter(a => a.overall_assessment.resistance_level === 'high');
const professionalSupportRecommendations = assessments.filter(a => a.overall_assessment.support_needed === 'professional');
```