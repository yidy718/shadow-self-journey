import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export interface ShadowProfile {
  archetype: string;
  traits: string[];
  intensity: string;
  description: string;
}

export interface EnhancedContext {
  journalEntries?: Array<{
    date: string;
    reflection: string;
    insights: string;
    integration: string;
    mood: number;
  }>;
  recentAnalyses?: string[];
  moodTrends?: number[];
  intensityLevel?: 'gentle' | 'moderate' | 'deep' | 'intense';
  phase2Analysis?: {
    behavioral_patterns?: Array<{
      pattern: string;
      description: string;
      frequency: string;
      impact_areas: string[];
    }>;
    shadow_elements?: Array<{
      element: string;
      manifestation: string;
      projection: string;
    }>;
    root_analysis?: {
      primary_wound: string;
      secondary_wound?: string;
      core_fear: string;
      defense_mechanism: string;
    };
    integration_plan?: {
      immediate_actions: Array<{
        action: string;
        timeline: string;
        difficulty: string;
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
    integration_exercises?: Array<{
      exercise: string;
      description: string;
      frequency: string;
      purpose: string;
    }>;
    overall_assessment?: {
      growth_readiness: string;
      resistance_level: string;
      support_needed: string;
      timeline_estimate: string;
    };
  };
  completedActions?: string[];
  completedExercises?: string[];
}

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, shadowProfile, userId, conversationHistory, enhancedContext, userName, context }: { 
      question: string; 
      shadowProfile: ShadowProfile; 
      userId?: string;
      conversationHistory?: Array<{question: string, response: string}>;
      enhancedContext?: EnhancedContext;
      userName?: string;
      context?: string;
    } = await request.json();

    // Validate input
    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!shadowProfile?.archetype) {
      return NextResponse.json(
        { error: 'Shadow profile is required' },
        { status: 400 }
      );
    }

    // Server-side rate limiting (IP-based)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `rate_limit_${ip}`;
    
    // Simple in-memory rate limiting (resets on server restart)
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limit = 10; // 10 requests per hour per IP
    
    // Note: In production, use Redis or database for persistent rate limiting
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const current = global.rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: now + windowMs };
    
    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + windowMs;
    }
    
    if (current.count >= limit) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: current.resetTime
        },
        { status: 429 }
      );
    }
    
    current.count++;
    global.rateLimitStore.set(rateLimitKey, current);

    // Check if Claude API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('❌ No ANTHROPIC_API_KEY found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('ANTHROPIC')));
      const fallbackResponse = getDemoInsight(question, shadowProfile);
      return NextResponse.json({ 
        response: fallbackResponse,
        source: 'fallback-no-key' 
      });
    }

    try {
      
      // Call Claude API with latest Claude 4.1 Opus model
      const claudeResponse = await anthropic.messages.create({
        model: 'claude-opus-4-1-20250805', // Claude Opus 4.1 - most capable model for complex psychological analysis
        max_tokens: 4000, // Increased significantly for Phase 2 Deep Analysis comprehensive JSON responses
        temperature: 0.8, // Optimal for creative, nuanced psychological insights
        system: createShadowWorkSystemPrompt(shadowProfile.archetype, shadowProfile.intensity, context || 'chat', enhancedContext?.intensityLevel),
        messages: [
          {
            role: 'user',
            content: createUserPrompt(question, shadowProfile, conversationHistory, enhancedContext, userName)
          }
        ]
      });


      const responseText = claudeResponse.content[0].type === 'text' 
        ? claudeResponse.content[0].text 
        : 'Unable to generate response';

      return NextResponse.json({ 
        response: responseText,
        source: 'claude-api' 
      });

    } catch (claudeError) {
      console.error('❌ Claude API error:', claudeError);
      
      // More specific error logging
      if (claudeError instanceof Error) {
        console.error('Error message:', claudeError.message);
        console.error('Error name:', claudeError.name);
      }
      
      // Fallback to demo insights if Claude API fails
      const fallbackResponse = getDemoInsight(question, shadowProfile);
      return NextResponse.json({ 
        response: fallbackResponse,
        source: 'fallback-after-error',
        error: claudeError instanceof Error ? claudeError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Error in Claude API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getIntensityGuidance(intensityLevel: 'gentle' | 'moderate' | 'deep' | 'intense'): string {
  const intensityMap = {
    gentle: `INTENSITY LEVEL: GENTLE
- User prefers soft self-reflection with supportive guidance
- Focus on gentle exploration and compassionate insights
- Avoid confrontational language or harsh truths
- Emphasize self-acceptance and gradual growth
- Use encouraging, nurturing tone throughout
- Frame challenges as opportunities for gentle self-discovery`,
    
    moderate: `INTENSITY LEVEL: MODERATE
- User wants balanced introspection with gentle challenges
- Mix supportive guidance with mild confrontation when helpful
- Can handle moderate psychological depth and insights
- Encourage stepping slightly outside comfort zone
- Balance comfort with growth-oriented perspectives
- Use direct but caring communication style`,
    
    deep: `INTENSITY LEVEL: DEEP
- User seeks profound psychological exploration
- Can handle deep truths and challenging insights
- Comfortable with intense self-examination
- Push boundaries while maintaining safety
- Address core wounds and shadow elements directly
- Use penetrating but compassionate analysis`,
    
    intense: `INTENSITY LEVEL: INTENSE
- User wants maximum depth confrontational shadow work
- Can handle harsh psychological truths and direct confrontation
- Seeks transformational breakthroughs through intensity
- Don't hold back on difficult insights or challenging perspectives
- Address deepest fears, wounds, and shadow aspects directly
- Use powerful, direct language while maintaining care
- WARNING: Monitor for overwhelm and suggest professional support when needed`
  };
  
  return intensityMap[intensityLevel];
}

function createShadowWorkSystemPrompt(archetype: string, intensity: string, context: string = 'chat', intensityLevel?: 'gentle' | 'moderate' | 'deep' | 'intense'): string {
  const intensityGuidance = intensityLevel ? getIntensityGuidance(intensityLevel) : '';
  
  const basePrompt = `You are Sage - a wise friend and psychological analyst who understands shadow work deeply. You've done your own inner work and genuinely care about helping people grow.

YOUR CORE IDENTITY:
- Experienced in psychology, Jung, trauma therapy, neuroscience - but explain it in accessible ways
- Direct but compassionate - no clinical jargon or formal therapy speak
- Address people by name when provided - creates connection and trust
- Use their exact words and examples back to them when possible

ARCHETYPE CONTEXT:
- Client archetype: ${archetype}
- Shadow intensity: ${intensity}
- Understand their specific patterns and core wounds

${intensityGuidance}`;

  // Add context-specific style instructions
  if (context === 'chat') {
    return basePrompt + `

CHAT CONVERSATION STYLE:
- Keep responses SHORT (2-3 sentences usually)
- Pick up on what they JUST said and respond to that specifically  
- Talk like texting with a wise friend - casual, warm, genuine
- Build on their previous message, don't give generic responses
- Stay curious about their specific experience
- Use their name NATURALLY and SPARINGLY (maybe 1 in 4-5 messages, like real friends)

RESPONSE ENDINGS (mix these up naturally):
- Sometimes ask a follow-up question
- Sometimes offer a suggestion: "Maybe try..." or "Next time, what if you..."
- Sometimes just validate/reflect: "That sounds really tough" or "Makes total sense"
- Sometimes give a micro-insight without asking anything
- Let the conversation flow naturally - not every message needs a question

ULTRA-SPECIFIC EXERCISE CREATION:
- ONLY create micro-exercises when they mention a SPECIFIC real-world scenario (barista, meeting, family dinner, etc.)
- DO NOT create exercises for vague responses like "yes", "maybe", "I think so"
- Use their Core Fear, Primary Wound, and Defense Mechanism to tailor the exercise
- Reference their completed/uncompleted actions to avoid repetition
- Format as: "Next time you [their exact scenario], try this: 1) Before... 2) During... 3) After..."
- Connect it back to their behavioral patterns and what they're trying to heal
- Make it feel doable and specific to their exact scenario
- If they give a short/vague response, ask for more context instead of creating an exercise

AVOID in chat:
- Long paragraphs or lists
- Multiple questions at once
- Formal structure or presentations
- Generic advice that could apply to anyone`;
  } else {
    return basePrompt + `

ASSESSMENT/ANALYSIS STYLE:
- Provide comprehensive, detailed insights
- Analyze patterns thoroughly with structured responses
- Include specific actionable steps and integration guidance
- Use professional depth while remaining accessible
- Generate complete assessments with multiple insights
- Address their full psychological landscape

INCLUDE in assessments:
- Deep pattern recognition and analysis
- Structured insights with clear sections
- Comprehensive integration recommendations
- Multiple perspectives and approaches`;
  }
}


function createUserPrompt(
  question: string, 
  shadowProfile: ShadowProfile, 
  conversationHistory?: Array<{question: string, response: string}>,
  enhancedContext?: EnhancedContext,
  userName?: string
): string {
  let prompt = `${userName ? `My name is ${userName}. ` : ''}I've been identified as "${shadowProfile.archetype}" with ${shadowProfile.intensity} intensity. My dominant shadow traits are: ${shadowProfile.traits.join(', ')}.`;

  // Add enhanced context (journal entries and analyses)
  if (enhancedContext) {
    if (enhancedContext.journalEntries && enhancedContext.journalEntries.length > 0) {
      prompt += `\n\nMY RECENT JOURNAL WORK:\n`;
      enhancedContext.journalEntries.slice(-5).forEach((entry, index) => {
        prompt += `\nEntry ${index + 1} (${entry.date}):\n`;
        prompt += `- Reflection: ${entry.reflection.substring(0, 150)}...\n`;
        prompt += `- Key Insight: ${entry.insights.substring(0, 150)}...\n`;
        prompt += `- Mood: ${entry.mood}/5\n`;
      });
    }

    if (enhancedContext.recentAnalyses && enhancedContext.recentAnalyses.length > 0) {
      prompt += `\n\nMY RECENT ANALYSIS INSIGHTS:\n`;
      enhancedContext.recentAnalyses.slice(-2).forEach((analysis, index) => {
        prompt += `\nAnalysis ${index + 1}: ${analysis.substring(0, 200)}...\n`;
      });
    }

    if (enhancedContext.moodTrends && enhancedContext.moodTrends.length > 0) {
      const avgMood = enhancedContext.moodTrends.reduce((a, b) => a + b, 0) / enhancedContext.moodTrends.length;
      prompt += `\n\nMOOD PATTERN: Recent average ${avgMood.toFixed(1)}/5 over ${enhancedContext.moodTrends.length} entries\n`;
    }
    
    if (enhancedContext.intensityLevel) {
      const intensityDescriptions = {
        gentle: 'soft self-reflection with supportive guidance',
        moderate: 'balanced introspection with gentle challenges',  
        deep: 'profound psychological exploration',
        intense: 'maximum depth confrontational shadow work'
      };
      prompt += `\n\nMY CHOSEN INTENSITY LEVEL: ${enhancedContext.intensityLevel.toUpperCase()} - I prefer ${intensityDescriptions[enhancedContext.intensityLevel]}`;
    }

    // Add Phase 2 analysis data for ultra-specific exercise generation
    if (enhancedContext.phase2Analysis) {
      const analysis = enhancedContext.phase2Analysis;
      prompt += `\n\nMY DEEP BEHAVIORAL ANALYSIS (For Ultra-Specific Exercise Creation):\n`;
      
      if (analysis.behavioral_patterns && analysis.behavioral_patterns.length > 0) {
        prompt += `\nBEHAVIORAL PATTERNS:\n`;
        analysis.behavioral_patterns.slice(0, 2).forEach((pattern, i) => {
          prompt += `${i + 1}. ${pattern.pattern} (${pattern.frequency} frequency)\n`;
          prompt += `   - ${pattern.description.substring(0, 150)}...\n`;
          prompt += `   - Impact areas: ${pattern.impact_areas.join(', ')}\n`;
        });
      }

      if (analysis.root_analysis) {
        const root = analysis.root_analysis;
        prompt += `\nROOT ANALYSIS:\n`;
        prompt += `- Core Fear: ${root.core_fear}\n`;
        prompt += `- Primary Wound: ${root.primary_wound}\n`;
        prompt += `- Defense Mechanism: ${root.defense_mechanism}\n`;
      }

      if (analysis.integration_plan && analysis.integration_plan.immediate_actions) {
        const completedActions = enhancedContext.completedActions || [];
        const uncompletedActions = analysis.integration_plan.immediate_actions
          .filter(action => !completedActions.includes(action.action));
        
        if (uncompletedActions.length > 0) {
          prompt += `\nUNCOMPLETED ACTIONS (for reference in creating new exercises):\n`;
          uncompletedActions.slice(0, 3).forEach((action, i) => {
            prompt += `${i + 1}. ${action.action} (${action.difficulty}, ${action.timeline})\n`;
          });
        }
      }

      if (analysis.integration_exercises) {
        const completedExercises = enhancedContext.completedExercises || [];
        const uncompletedExercises = analysis.integration_exercises
          .filter(exercise => !completedExercises.includes(exercise.exercise));
        
        if (uncompletedExercises.length > 0) {
          prompt += `\nUNCOMPLETED EXERCISES (avoid duplicating these):\n`;
          uncompletedExercises.slice(0, 2).forEach((exercise, i) => {
            prompt += `${i + 1}. ${exercise.exercise} (${exercise.frequency}) - Purpose: ${exercise.purpose}\n`;
          });
        }
      }
    }
  }

  // Add conversation history if it exists
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `\n\nOUR RECENT CONVERSATION:\n`;
    conversationHistory.slice(-3).forEach((conv, index) => {
      prompt += `\nMe: "${conv.question}"\n`;
      prompt += `You: "${conv.response.substring(0, 400)}${conv.response.length > 400 ? '...' : ''}"\n`;
    });
    prompt += `\nCONTINUING OUR CONVERSATION:\n`;
  }

  prompt += `\nMy current question: "${question}"

Talk to me like a real friend who gets psychology and shadow work. No formal therapy speak, no roleplay actions like "*adjusts glasses*", just straight talk. Address my actual question directly. Give me insight that's genuinely helpful, not textbook stuff. What would you honestly tell a close friend asking this same thing?

IMPORTANT CONTEXT AWARENESS:
- Look at our recent conversation above to understand what I'm responding to
- If I give a short answer like "yes" or "maybe", reference what I'm agreeing with
- Build naturally on what we were just discussing
- Don't create exercises for vague responses - ask for more details instead

Given my journal work, previous analyses, and conversation history, what patterns do you see that I might be missing?${userName ? ` (My name is ${userName} if you want to use it occasionally, but don't feel like you have to.)` : ''}`;

  return prompt;
}

// Enhanced fallback function with more nuanced responses
function getDemoInsight(question: string, shadowProfile: ShadowProfile): string {
  const questionLower = question.toLowerCase();
  
  // Pattern-based response generation for more dynamic responses
  const responsePatterns = {
    relationship: ['relationship', 'love', 'partner', 'dating', 'marriage', 'connection', 'intimacy'],
    work: ['work', 'job', 'career', 'boss', 'colleague', 'professional', 'workplace'],
    family: ['family', 'parent', 'mother', 'father', 'sibling', 'child', 'childhood'],
    self: ['myself', 'self', 'identity', 'personality', 'confidence', 'worth'],
    fear: ['afraid', 'fear', 'scared', 'anxiety', 'worry', 'panic', 'terrified'],
    anger: ['angry', 'rage', 'furious', 'hate', 'resentment', 'bitter', 'mad']
  };

  const matchedCategory = Object.keys(responsePatterns).find(category =>
    responsePatterns[category as keyof typeof responsePatterns].some(keyword =>
      questionLower.includes(keyword)
    )
  );

  const archeypeInsights = {
    'The Self-Destroyer': {
      relationship: `Your question about relationships touches the heart of The Self-Destroyer's struggle. You may find yourself sabotaging connections because deep down, you don't believe you deserve love. This isn't your truth - it's learned behavior from wounds that taught you to attack yourself first. In relationships, practice radical self-compassion. When the inner critic whispers that you're unworthy, respond with the same kindness you'd show a beloved friend.`,
      work: `The Self-Destroyer often struggles in work environments because your inner critic is louder than any external feedback. You may find yourself paralyzed by perfectionism or convinced you're fraudulent. Remember: your harshest critic lives inside your head, not in your workplace. Start small - celebrate one accomplishment daily, even if it feels insignificant. Your professional worth isn't determined by the cruelest voice in your mind.`,
      default: `Your question illuminates The Self-Destroyer's central challenge: you've become your own worst enemy. This shadow developed to protect you - if you attack yourself first, perhaps others can't hurt you as deeply. But this armor has become a prison. Your healing begins with treating yourself as you would treat someone you love unconditionally. Start with one moment of self-kindness today.`
    },
    'The Void Walker': {
      relationship: `As The Void Walker, you may feel emotionally numb in relationships, wondering if you're capable of genuine connection. This emptiness isn't who you are - it's how you've protected yourself from overwhelming pain. Your capacity for feeling hasn't disappeared; it's buried under layers of protective numbness. In relationships, start small: notice one moment of genuine feeling, however brief. Connection can return gradually.`,
      default: `Your question touches The Void Walker's core experience: moving through life carrying an emptiness that feels endless. This void isn't your identity - it's your psyche's way of managing unbearable pain. When we can't process trauma, sometimes numbness feels safer than feeling. But beneath that protective emptiness lies tremendous capacity for depth. Start with small connections to sensation, beauty, or meaning. Feeling can return gradually, safely.`
    },
    'The Invisible One': {
      default: `Your question reflects The Invisible One's core wound: the belief that you must earn your right to exist. Someone taught you that love and acceptance were conditional on performance, but they were wrong. You don't need to justify your existence through constant achievement or self-sacrifice. Practice taking up space without apology. You belong here simply because you exist.`
    },
    'The Hidden Sadist': {
      default: `Your question reveals The Hidden Sadist's complex relationship with power and pain. That part of you that sometimes enjoys others' suffering isn't pure evil - it's often wounded power seeking expression. When we feel helpless for too long, causing pain can feel like reclaiming control. Your healing involves channeling this intensity constructively: become a fierce protector rather than a source of harm. Your understanding of pain can serve justice, not vengeance.`
    },
    'The Master of Masks': {
      default: `As The Master of Masks, your question touches the exhaustion of constant performance. You've perfected being whoever others need, but lost connection to your authentic self. This skill developed to keep you safe and loved, but it's become a prison. Your real self isn't as terrible or boring as you fear - it's simply been protected for so long you've forgotten its voice. Begin listening for your genuine reactions and honoring them, even in small ways.`
    },
    'The Eternally Forsaken': {
      default: `Your question touches The Eternally Forsaken's deepest terror: being left alone. This fear may drive you to either cling desperately to relationships or to reject people before they can abandon you. Both strategies often create the very outcome you're trying to avoid. Your healing involves learning to tolerate the uncertainty inherent in all relationships. Not everyone will leave, and you deserve connections that feel secure and lasting.`
    }
  };

  const archetypeKey = shadowProfile.archetype as keyof typeof archeypeInsights;
  const archeType = archeypeInsights[archetypeKey] || archeypeInsights['The Self-Destroyer'];
  
  if (matchedCategory && archeType[matchedCategory as keyof typeof archeType]) {
    return archeType[matchedCategory as keyof typeof archeType] as string;
  }
  
  return archeType.default;
}