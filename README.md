# The Abyss - Shadow Self Journey

A sophisticated psychological assessment platform featuring AI-powered shadow work consultation with Dr. Shadow - an advanced psychological AI agent powered by Claude 4 Sonnet. This application combines Carl Jung's shadow archetype theory with modern neuroscience and trauma-informed therapy approaches.

## ✨ Features

### Core Assessment
- **8 Profound Questions**: Carefully crafted psychological prompts that explore the deepest aspects of the shadow self
- **6 Shadow Archetypes**: Detailed personality profiles including The Self-Destroyer, Void Walker, Hidden Sadist, and more
- **Personalized Results**: Comprehensive analysis with integration guidance and deep psychological insights

### Advanced Tools
- **Shadow Journal**: Personal journaling system to track insights, mood, and integration progress over time
- **Integration Exercises**: Personalized homework and practices based on your specific shadow archetype
- **Dr. Shadow AI Consultation**: Advanced Claude 4 Sonnet AI agent with 25+ years of psychological expertise, combining Jungian analysis with neuroplasticity research and somatic therapy
- **Enhanced Reasoning**: Extended thinking processes for deeper psychological analysis and personalized integration pathways

### User Experience
- **Mobile-First Design**: Optimized for all devices with responsive layouts
- **Elegant Animations**: Smooth, purposeful motion design using Framer Motion
- **User Identity Options**: Choose between anonymous sessions or named journey with progress tracking
- **Assessment History**: Track multiple assessments over time with local storage
- **Accessibility**: Full screen reader support, reduced motion preferences, and keyboard navigation
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 🛠 Technical Stack

- **Next.js 15** with App Router and Turbo
- **React 18** with TypeScript and advanced optimization
- **Tailwind CSS 3.4** with custom design system
- **Framer Motion 11** for animations
- **Claude 4 Sonnet AI** with 1M context window and enhanced reasoning
- **Anthropic SDK** for AI integration and rate limiting
- **Local Storage** for user preferences and assessment history

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

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

### Environment Variables

Create a `.env.local` file in the root directory:

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
```

## 🧠 Psychological Foundation

This tool is based on Carl Jung's analytical psychology enhanced with modern neuroscience:
- **Shadow Integration**: The process of acknowledging and integrating rejected aspects of the self
- **Individuation**: Jung's concept of psychological wholeness through shadow work
- **Archetypal Psychology**: Understanding personality patterns through shadow archetypes
- **Neuroplasticity**: Rewiring protective patterns into adaptive strengths
- **Trauma-Informed Therapy**: Recognizing shadow patterns as intelligent nervous system adaptations
- **Somatic Experiencing**: Addressing how shadow manifests in the body and nervous system

### Dr. Shadow AI Agent
The AI consultant combines:
- **25+ Years Experience**: Depth psychology, neuroplasticity research, and somatic experiencing
- **Extended Reasoning**: Claude 4's enhanced thinking for multilayered psychological analysis
- **Trauma-Informed Approach**: Understanding shadow as protective adaptations, not pathology
- **Integration Timeline**: Realistic progression pathways for transformation

### Content Warning
This application explores deep psychological themes including self-hatred, existential despair, and other intense emotional states. It includes appropriate warnings and recommendations for professional support when needed.

## 🏗 Architecture

### Component Structure
```
components/
├── WelcomeScreen.tsx       # Identity selection and content warnings
├── ShadowQuiz.tsx          # Main application flow with 5 screens
├── ShadowJournal.tsx       # Personal journaling system with mood tracking
├── IntegrationExercises.tsx # Personalized practice assignments
├── ParticleField.tsx       # Atmospheric background effects
└── ProgressBar.tsx         # Visual progress indication
```

### Data Architecture
```
lib/
├── questions.ts            # 8 core assessment questions with shadow trait weighting
├── shadowArchetypes.ts     # 6 detailed shadow personality profiles
├── userPreferences.ts      # User identity and assessment history management
└── claudeApi.ts           # Claude 4 AI integration and fallback insights
```

### API Architecture
```
app/api/
└── claude/
    └── route.ts           # Claude 4 Sonnet API with Dr. Shadow agent
                          # - Rate limiting (5/hour per user, 10/hour per IP)
                          # - Enhanced psychological prompting
                          # - Fallback response system
```

## 📱 Design Principles

- **Mobile-First**: Designed primarily for mobile with desktop enhancements
- **Cohesive Visual Language**: Custom design system without stock AI elements
- **Studio-Quality UX**: Professional interaction patterns and visual hierarchy
- **Emotional Design**: Color, typography, and motion that matches the psychological depth

## 🔒 Privacy & Data

- **Local Storage**: All journal entries and progress stored locally on device
- **Optional Identity**: Choose anonymous sessions or named journey with local tracking
- **No User Accounts**: No server-side user data collection or storage
- **API Privacy**: Only assessment results and questions sent to Claude API for insights
- **Rate Limiting**: Abuse protection with IP-based request limits
- **Secure**: Sensitive psychological data remains on your device

## 🚀 Deployment

Optimized for Vercel deployment:
1. Connect GitHub repository to Vercel
2. Add environment variable: `ANTHROPIC_API_KEY`
3. Enable automatic deployments
4. Add custom domain (e.g., `shadowself.app`, `abyssmirror.com`)

### Cost Estimation
- **Claude API**: ~$0.003 per insight (600 input + 600 output tokens)
- **Rate Limiting**: 5 requests/hour per user, 10/hour per IP
- **Vercel**: Free tier supports personal use

## 📄 License

This project is licensed under CC BY-NC-ND 4.0 - see the LICENSE file for details.

**Commercial Use**: Prohibited for others, creator retains all commercial rights.
**Non-Profit Use**: Permitted with attribution.
**Modifications**: Not permitted without permission.

---

*"He who fights monsters should be careful lest he thereby become a monster. And if you gaze long into an abyss, the abyss also gazes into you."* — Friedrich Nietzsche