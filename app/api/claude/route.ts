import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export interface ShadowProfile {
  archetype: string;
  traits: string[];
  intensity: string;
  description: string;
}

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, shadowProfile, userId }: { 
      question: string; 
      shadowProfile: ShadowProfile; 
      userId?: string 
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
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
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
      console.log('No Claude API key found, using fallback insights');
      const fallbackResponse = getDemoInsight(question, shadowProfile);
      return NextResponse.json({ 
        response: fallbackResponse,
        source: 'fallback' 
      });
    }

    try {
      // Call Claude API with sophisticated shadow work prompt
      const claudeResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        temperature: 0.7,
        system: createShadowWorkSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: createUserPrompt(question, shadowProfile)
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
      console.error('Claude API error:', claudeError);
      
      // Fallback to demo insights if Claude API fails
      const fallbackResponse = getDemoInsight(question, shadowProfile);
      return NextResponse.json({ 
        response: fallbackResponse,
        source: 'fallback-after-error' 
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

function createShadowWorkSystemPrompt(): string {
  return `You are a profound psychological guide specializing in Jungian shadow work and depth psychology. Your role is to provide compassionate, insightful responses to people exploring their shadow archetypes.

KEY PRINCIPLES:
- Shadow integration, not elimination - the goal is wholeness, not perfection
- Compassionate but unflinching honesty about difficult psychological truths
- Practical guidance that people can actually implement
- Avoid clinical jargon - speak in accessible, emotionally resonant language
- Frame darkness as wounded parts needing compassion, not evil to be destroyed
- Always include concrete next steps or practices

RESPONSE STYLE:
- 2-3 paragraphs maximum (200-400 words)
- Start by acknowledging the depth of their question/struggle
- Provide psychological insight that reveals deeper patterns
- End with practical integration guidance they can use immediately
- Use language that matches the intensity of shadow work - authentic, direct, sometimes raw
- Avoid generic advice - make it specific to their shadow archetype and question

SHADOW ARCHETYPES TO UNDERSTAND:
- The Self-Destroyer: Extreme self-hatred and inner criticism
- The Void Walker: Existential emptiness and despair  
- The Invisible One: Deep feelings of worthlessness and inadequacy
- The Hidden Sadist: Enjoyment of others' pain, cruelty impulses
- The Master of Masks: Complete inauthenticity, lost true self
- The Eternally Forsaken: Terror of abandonment, self-sabotage in relationships

Remember: This is deep psychological work. People asking these questions are often in genuine pain and seeking real transformation.`;
}

function createUserPrompt(question: string, shadowProfile: ShadowProfile): string {
  return `I've just completed a shadow self assessment and been identified as "${shadowProfile.archetype}" with ${shadowProfile.intensity} intensity. My dominant shadow traits are: ${shadowProfile.traits.join(', ')}.

My question about my shadow work journey is: "${question}"

Please provide insight that acknowledges the specific darkness I carry as ${shadowProfile.archetype}, addresses my question directly, and gives me practical guidance for integration. I'm ready for psychological depth and honest truth about these shadow aspects.`;
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