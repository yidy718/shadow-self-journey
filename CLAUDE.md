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

## Development Notes

- Application uses client-side rendering ('use client' directives)
- No backend database - all data processing happens client-side
- Comprehensive localStorage-based data persistence system
- Psychological content is mature/intense - designed for adult users with appropriate warnings
- Built-in responsive design for mobile and desktop
- Animation-heavy UI requiring performance considerations
- Enhanced error handling and graceful degradation throughout