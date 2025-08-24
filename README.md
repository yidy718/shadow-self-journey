# The Abyss - Shadow Self Journey

A sophisticated psychological assessment platform featuring AI-powered shadow work consultation with "Sage" - an advanced psychological AI agent powered by Claude 3.5 Sonnet. This application combines Carl Jung's shadow archetype theory with modern behavioral analysis, featuring hybrid assessment systems, beautiful results presentations, and intelligent context management for personalized guidance.

## ✨ Features

### Core Assessment
- **Intensity-Adaptive Questions**: 4 carefully crafted questions with 4 intensity levels (gentle, moderate, deep, intense) that dynamically adapt to your comfort level
- **Personalized Depth Selection**: Choose your shadow work intensity from supportive gentle exploration to confrontational intense breakthroughs
- **6 Shadow Archetypes**: Detailed personality profiles including The Self-Destroyer, Void Walker, Hidden Sadist, and more
- **Personalized Results**: Comprehensive analysis with integration guidance and deep psychological insights

### Advanced Assessment Systems
- **Deep Analysis**: Hybrid behavioral assessment with structured JSON output featuring 7 core questions + AI-generated follow-ups, interactive progress tracking, and beautiful archetype-style results
- **ReAnalysis**: Comprehensive data aggregation analyzing your complete shadow work journey with Evolution Analysis and Interactive Deeper Questions
- **Shadow Journal**: Personal journaling system to track insights, mood, and integration progress over time with smart section parsing
- **Integration Exercises**: Personalized homework and practices based on your specific shadow archetype with completion tracking

### AI-Powered Guidance
- **Sage AI Consultation**: Advanced Claude 4.1 AI agent with superior reasoning, psychological expertise, and personal connection capabilities
- **Enhanced Context Management**: Sage has access to your complete journey including last 8 journal entries, recent analyses, mood patterns, and conversation history
- **Interactive Deeper Questions**: AI generates personalized questions you can actually answer, not just view
- **Smart Pattern Recognition**: AI extracts key insights like Deep Truth, Integration Path, and Personal Archetype from responses

### User Experience
- **Intensity Personalization**: Beautiful intensity slider with visual indicators, examples, and descriptions to choose your comfort level
- **Adaptive Content**: All questions and AI responses dynamically adapt to your selected intensity level
- **Beautiful Results Pages**: Archetype-style presentation for all assessments with stunning visual design, gradient backgrounds, and elegant typography
- **Smart Navigation**: Continue Journey button intelligently detects completed assessments and navigates appropriately
- **Complete Data Persistence**: Multi-layered storage system preserving conversations, journal entries, assessment history, exercise progress, and intensity preferences
- **User Identity Options**: Choose between anonymous sessions or named journey with progress tracking and personalized AI communication
- **Assessment Count Display**: Accurate counting of both assessment history and completed quiz progress
- **Comprehensive Data Export**: Export your complete journey as JSON or formatted text report with usage statistics
- **Mobile-First Design**: Optimized for all devices with responsive layouts
- **Elegant Animations**: Smooth, purposeful motion design using Framer Motion
- **Complete Data Reset**: New Identity option clears ALL data for fresh starts
- **Accessibility**: Full screen reader support, reduced motion preferences, and keyboard navigation

## 🛠 Technical Stack

- **Next.js 15** with App Router and Turbo
- **React 18** with TypeScript and advanced optimization
- **Tailwind CSS 3.4** with custom design system
- **Framer Motion 11** for animations
- **Claude 4.1 AI** with superior reasoning capabilities and advanced context management
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

## 🌐 Live Application

**The Abyss - Shadow Self Journey** is live at: **https://www.shadowself.app**

Experience the complete intensity-adaptive shadow work platform with AI-powered consultation, crisis support integration, and comprehensive data export capabilities.

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

### Sage AI Agent
The AI consultant features:
- **Advanced Psychology Expertise**: Depth psychology, behavioral analysis, and shadow work specialization
- **Enhanced Context Awareness**: Access to user's complete shadow work journey for personalized guidance
- **Personalized Communication**: Addresses users by name, uses their exact words, creates genuine connection
- **Trauma-Informed Approach**: Understanding shadow as protective adaptations, not pathology
- **Interactive Engagement**: Generates questions users can actually answer for deeper exploration
- **Pattern Recognition**: Extracts key insights and creates personalized shadow archetypes from behavioral analysis

### Content Warning
This application explores deep psychological themes including self-hatred, existential despair, and other intense emotional states. It includes appropriate warnings and recommendations for professional support when needed.

## 🏗 Architecture

### Component Structure
```
components/
├── WelcomeScreen.tsx       # Smart user identity selection with Continue Journey
├── ShadowQuiz.tsx          # Main application flow with 7+ screens
├── DeepAnalysis.tsx        # Hybrid behavioral assessment with beautiful results
├── ReAnalysis.tsx          # Comprehensive data analysis and deeper questions
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
├── userPreferences.ts      # Comprehensive user data and assessment history management
├── claudeApi.ts           # Enhanced Claude AI integration with context management
└── rateLimiter.ts         # Client-side abuse prevention and request limiting
```

### API Architecture
```
app/api/
└── claude/
    └── route.ts           # Claude 4.1 API with Sage agent
                          # - Enhanced context management (journal, mood, history)
                          # - Rate limiting (5/hour per user, 10/hour per IP)
                          # - Personalized prompting with user names
                          # - Robust fallback response system
                          # - Advanced psychological safety guidelines
```

## 🎯 Recent Major Achievements (2024-2025)

### ✨ Beautiful User Experience
- **Archetype-Quality Results**: Deep Analysis now features stunning visual presentations matching traditional archetype quality
- **Smart Navigation Flow**: Continue Journey intelligently detects completed assessments and navigates appropriately  
- **Accurate Data Display**: Assessment counts now properly include both history and completed quiz progress
- **Complete Fresh Starts**: New Identity option clears ALL data including journal, conversations, and exercise progress

### 🤖 Enhanced AI Intelligence  
- **Rich Context Awareness**: Sage AI now accesses complete shadow work journey including journal entries, mood trends, and previous analyses
- **Personal Connection**: AI addresses users by name when provided, creating stronger therapeutic alliance
- **Interactive Engagement**: ReAnalysis generates questions users can actually answer, not just view
- **Smart Conversation Persistence**: Multi-layer storage ensures conversations persist across sessions for proper analysis

### 🔧 Technical Excellence
- **Robust Data Architecture**: Fixed critical assessment history saving and conversation count issues
- **Enhanced Question Generation**: Improved AI question parsing to generate only actual questions (ending with ?) 
- **Pattern Recognition**: Better extraction of key insights like Deep Truth, Integration Path, and Personal Archetype
- **Error Handling**: Comprehensive fallback systems and graceful degradation throughout

### 🚀 Hybrid Shadow Work JSON System (Latest)
- **Structured Phase 1 Analysis**: JSON output with `initial_pattern_analysis`, categorized follow-up questions by purpose, and confidence levels
- **Comprehensive Phase 2 Framework**: Complete behavioral analysis with `behavioral_patterns`, `shadow_elements`, `root_analysis`, `integration_plan`, and `overall_assessment`
- **Interactive Progress Tracking**: Clickable checkboxes for immediate actions and integration exercises with persistent localStorage storage
- **Smart Data Utilization**: Color-coded difficulty levels, frequency indicators, and completion rates enable filtering and personalized recommendations
- **Future-Ready Architecture**: Structured data supports advanced features like progress analytics, adaptive recommendations, and personalized support paths

## 📱 Design Principles

- **Mobile-First**: Designed primarily for mobile with desktop enhancements
- **Archetype-Quality Visuals**: Every assessment result features beautiful, professional presentation  
- **Cohesive Visual Language**: Custom design system without stock AI elements
- **Studio-Quality UX**: Professional interaction patterns and visual hierarchy
- **Emotional Design**: Color, typography, and motion that matches the psychological depth
- **Data Integrity**: Comprehensive persistence systems ensuring no user progress is lost

## 🔒 Privacy & Data

- **Local Storage**: All journal entries and progress stored locally on device
- **Optional Identity**: Choose anonymous sessions or named journey with local tracking
- **No User Accounts**: No server-side user data collection or storage
- **API Privacy**: Only assessment results and questions sent to Claude API for insights
- **Rate Limiting**: Abuse protection with IP-based request limits
- **Secure**: Sensitive psychological data remains on your device

## 🚀 Deployment

**Live at: https://www.shadowself.app** 

Deployed on Vercel with:
1. GitHub repository connected to Vercel
2. Environment variable: `ANTHROPIC_API_KEY` configured
3. Automatic deployments enabled
4. Custom domain: `shadowself.app` connected with SSL

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