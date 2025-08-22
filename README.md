# The Abyss - Shadow Self Journey

A profound psychological assessment tool based on Carl Jung's concept of the shadow archetype. This application guides users through deep introspective questions to identify their dominant shadow patterns and provides personalized insights for psychological integration.

## ✨ Features

### Core Assessment
- **8 Profound Questions**: Carefully crafted psychological prompts that explore the deepest aspects of the shadow self
- **6 Shadow Archetypes**: Detailed personality profiles including The Self-Destroyer, Void Walker, Hidden Sadist, and more
- **Personalized Results**: Comprehensive analysis with integration guidance and deep psychological insights

### Advanced Tools
- **Shadow Journal**: Personal journaling system to track insights, mood, and integration progress over time
- **Integration Exercises**: Personalized homework and practices based on your specific shadow archetype
- **Claude AI Integration**: Ask questions about your shadow and receive personalized psychological insights

### User Experience
- **Mobile-First Design**: Optimized for all devices with responsive layouts
- **Elegant Animations**: Smooth, purposeful motion design using Framer Motion
- **Accessibility**: Full screen reader support, reduced motion preferences, and keyboard navigation
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 🛠 Technical Stack

- **Next.js 15** with App Router and Turbo
- **React 18** with TypeScript
- **Tailwind CSS 3.4** with custom design system
- **Framer Motion 11** for animations
- **Claude API Integration** for personalized insights

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server with Turbo
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

Open [http://localhost:3000](http://localhost:3000) to begin your shadow journey.

## 🧠 Psychological Foundation

This tool is based on Carl Jung's analytical psychology, specifically:
- **Shadow Integration**: The process of acknowledging and integrating rejected aspects of the self
- **Individuation**: Jung's concept of psychological wholeness through shadow work
- **Archetypal Psychology**: Understanding personality patterns through shadow archetypes

### Content Warning
This application explores deep psychological themes including self-hatred, existential despair, and other intense emotional states. It includes appropriate warnings and recommendations for professional support when needed.

## 🏗 Architecture

### Component Structure
```
components/
├── ShadowQuiz.tsx          # Main application flow
├── ShadowJournal.tsx       # Personal journaling system
├── IntegrationExercises.tsx # Personalized practice assignments
├── ParticleField.tsx       # Atmospheric background effects
└── ProgressBar.tsx         # Visual progress indication
```

### Data Architecture
```
lib/
├── questions.ts            # 8 core assessment questions with shadow trait weighting
├── shadowArchetypes.ts     # 6 detailed shadow personality profiles
└── claudeApi.ts           # AI integration and fallback insights
```

## 📱 Design Principles

- **Mobile-First**: Designed primarily for mobile with desktop enhancements
- **Cohesive Visual Language**: Custom design system without stock AI elements
- **Studio-Quality UX**: Professional interaction patterns and visual hierarchy
- **Emotional Design**: Color, typography, and motion that matches the psychological depth

## 🔒 Privacy & Data

- **Local Storage**: All journal entries and progress stored locally on device
- **No User Accounts**: Anonymous usage with no personal data collection
- **Secure**: No sensitive psychological data transmitted to servers

## 🚀 Deployment

Optimized for Vercel deployment:
1. Connect GitHub repository to Vercel
2. Enable automatic deployments
3. Add custom domain (e.g., `shadowself.app`, `abyssmirror.com`)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*"He who fights monsters should be careful lest he thereby become a monster. And if you gaze long into an abyss, the abyss also gazes into you."* — Friedrich Nietzsche