# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- **ShadowQuiz**: Main application component handling three screens (welcome, quiz, results)
- **ParticleField**: Animated background particles for visual atmosphere
- **ProgressBar**: Quiz progression indicator

### Data Architecture

- **Questions System**: Located in `lib/questions.ts` - contains 8 deep psychological questions with weighted shadow trait responses
- **Shadow Archetypes**: Defined in `lib/shadowArchetypes.ts` - 6 primary archetypes (Self-Destroyer, Void Walker, Invisible One, Hidden Sadist, Master of Masks, Eternally Forsaken)
- **Scoring Algorithm**: Accumulates shadow traits from quiz responses and determines dominant archetype

### Key Libraries & Dependencies

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom animations and gradients
- **Framer Motion** for page transitions and animations
- **Lucide React** for icons

### State Management

Uses React hooks for local state:
- Quiz progression tracking
- Answer accumulation with shadow trait weighting
- Screen transitions (welcome → quiz → results)
- Claude AI integration for personalized insights

### Styling Approach

Heavy use of:
- Dark gradient themes (black/red/gray color palette)
- Custom Tailwind animations (float, glow, shimmer, pulse-glow)
- Glass morphism effects with backdrop-blur
- Responsive design patterns

### Claude AI Integration

- **Primary API Route**: `/api/claude` (route handler not yet implemented)
- **Fallback System**: Uses `getDemoInsight()` function with pre-written responses for each archetype
- **Shadow Profile Interface**: Passes archetype, traits, intensity, and description to AI for personalized responses

## Development Notes

- Application uses client-side rendering ('use client' directives)
- No backend database - all data processing happens client-side
- Psychological content is mature/intense - designed for adult users with appropriate warnings
- Built-in responsive design for mobile and desktop
- Animation-heavy UI requiring performance considerations