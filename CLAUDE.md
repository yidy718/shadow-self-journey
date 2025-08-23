# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview Update

"The Abyss - Shadow Self Journey" is now a sophisticated psychological assessment platform with integrated AI consultation featuring "Sage" - a wise, friendly psychological AI agent specializing in shadow work and behavioral pattern analysis.

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

- **ShadowQuiz**: Main application component handling six screens (welcome, quiz, results, journal, exercises, deepanalysis)
- **WelcomeScreen**: User identity selection (anonymous vs named) with returning user recognition and Deep Analysis access
- **DeepAnalysis**: Hybrid shadow work assessment with behavioral questions and AI-generated follow-ups
- **ShadowJournal**: Personal journaling system with mood tracking and insight recording
- **IntegrationExercises**: Personalized homework assignments based on shadow archetype
- **ParticleField**: Animated background particles for visual atmosphere
- **ProgressBar**: Quiz progression indicator

### Data Architecture

- **Questions System**: Located in `lib/questions.ts` - contains 8 deep psychological questions with weighted shadow trait responses
- **Shadow Archetypes**: Defined in `lib/shadowArchetypes.ts` - 6 primary archetypes with detailed integration guidance
- **User Preferences**: `lib/userPreferences.ts` - local storage system for user identity and assessment history
- **Rate Limiting**: `lib/rateLimiter.ts` - client-side abuse prevention
- **Scoring Algorithm**: Accumulates shadow traits from quiz responses and determines dominant archetype

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
- **Communication Style**: Direct but compassionate, uses user's exact words, avoids jargon
- **Safety Guidelines**: Professional support recommendations, non-diagnostic approach
- **Dynamic Prompting**: Archetype-specific system prompts for personalized responses
- **API Route**: `/api/claude` with comprehensive rate limiting and abuse protection
- **Fallback System**: Enhanced pattern-based responses when API unavailable
- **Cost Protection**: 5 requests/hour per user, 10/hour per IP, ~$0.003 per insight
- **Deep Analysis**: Hybrid assessment with behavioral questions and AI-generated follow-ups
- **Response Structure**: Recognition → Insight → Integration → Embodiment

## Development Notes

- Application uses client-side rendering ('use client' directives)
- No backend database - all data processing happens client-side
- Psychological content is mature/intense - designed for adult users with appropriate warnings
- Built-in responsive design for mobile and desktop
- Animation-heavy UI requiring performance considerations