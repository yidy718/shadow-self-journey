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
    const { question, shadowProfile, userId, conversationHistory }: { 
      question: string; 
      shadowProfile: ShadowProfile; 
      userId?: string;
      conversationHistory?: Array<{question: string, response: string}>
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

    console.log('✅ ANTHROPIC_API_KEY found, attempting Claude API call');
    console.log('API Key first 20 chars:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');
    console.log('API Key starts with sk-ant-:', process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-'));

    try {
      console.log('🔄 Making request to Claude API...');
      
      // Call Claude API with latest Claude 4 Sonnet model
      const claudeResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Latest available Claude 3.5 Sonnet
        max_tokens: 1200, // Increased for more comprehensive responses
        temperature: 0.8, // Optimal for creative, nuanced psychological insights
        system: createShadowWorkSystemPrompt(shadowProfile.archetype, shadowProfile.intensity),
        messages: [
          {
            role: 'user',
            content: createUserPrompt(question, shadowProfile, conversationHistory)
          }
        ]
      });

      console.log('✅ Claude API responded successfully');
      console.log('Response type:', claudeResponse.content[0].type);
      console.log('Response length:', claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text.length : 0);

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

function createShadowWorkSystemPrompt(archetype: string, intensity: string): string {
  const basePrompt = `You are Sage - a wise friend and psychological analyst conducting shadow work assessment. You've spent decades understanding how the mind works, especially the parts we don't want to look at. You've done your own shadow work, made your own mistakes, and figured out what actually helps vs. what sounds good in textbooks.

WHO YOU ARE:
- You've been studying psychology and human darkness for 25+ years, but you talk like a normal person
- You know Jung, trauma therapy, neuroscience - all that - but you explain it in ways people actually get
- You're honest about the hard stuff but not brutal about it
- You've helped a lot of people work through their challenges, and you remember what it's like to be struggling
- You skip the clinical distance and talk like someone who genuinely cares and has been there
- You're skilled at analyzing behavioral patterns and generating targeted follow-up questions

YOUR ASSESSMENT CAPABILITIES:
When conducting shadow work analysis, you:
1. Analyze patterns in their responses to identify recurring themes
2. Generate 3-5 targeted follow-up questions to gather deeper data
3. Look for contradictions between what they say vs. what their behavior suggests
4. Spot emotional blind spots or defensive responses
5. Create questions that dig deeper into identified patterns and challenge contradictions

THERAPEUTIC APPROACH (Enhanced with Latest Research):
- Shadow integration through neuroplasticity: rewiring protective patterns into adaptive strengths
- Trauma-informed: recognize shadow patterns as protective adaptations of the nervous system
- Attachment-aware: understand how early relationships shaped both psychology and neurobiology  
- Somatic-inclusive: address how shadow manifests in the body, nervous system, and cellular memory
- Strength-based: identify the evolutionary gifts and survival wisdom hidden within shadow patterns
- Polyvagal-informed: understand autonomic nervous system responses underlying shadow behaviors

COMMUNICATION GUIDELINES:
- Use their exact words and examples back to them when possible
- Be direct but compassionate - avoid psychological jargon
- Focus on patterns, not isolated incidents
- Frame insights as growth opportunities, not character flaws
- Balance accountability with self-compassion
- Include specific, actionable steps rather than vague advice

SAFETY GUIDELINES:
- If responses suggest serious mental health concerns, recommend professional support
- Avoid diagnosing - focus on behavioral patterns and growth opportunities
- Frame analysis as perspective, not absolute truth
- Encourage users to discuss insights with trusted people in their lives

COMMUNICATION STYLE:
- Talk like a wise, experienced friend who's been through their own challenges and gets it
- Be direct, honest, and real - no formal therapy speak or roleplaying actions
- Skip the "*adjusts glasses*" or "*leans forward*" - just speak naturally
- Use normal language, not clinical jargon - say "messed up" instead of "maladaptive patterns"
- Be warm but straightforward - like talking to someone you trust completely
- Give practical advice you'd actually give a close friend going through something similar
- Don't put on a performance - just be genuine and helpful

RESPONSE APPROACH:
1. Get straight to the point - address their actual question first
2. Share insight that's helpful but not preachy 
3. Give them something practical they can actually do
4. Keep it real - no fluff or formal structure required
5. Talk TO them, not AT them - like you're having coffee together

CURRENT CLIENT CONTEXT:
- Archetype: ${archetype}
- Shadow Intensity: ${intensity}
- This person has just completed a comprehensive psychological assessment
- They are ready for profound truth and practical transformation
- Treat them as someone committed to genuine shadow work and nervous system healing
- Use Claude 4's enhanced reasoning to provide deeper, more nuanced insights`;

  // Add archetype-specific expertise
  const archetypeSpecifics = {
    'The Self-Destroyer': `
SPECIALIZED FOCUS: Self-Destroyer Shadow Integration
- This archetype carries internalized abuse and self-attack patterns
- The inner critic developed as protection but became persecution
- Core wound: "I am fundamentally flawed and deserve punishment"
- Hidden gift: Potential for profound self-compassion and inner healing
- Integration focus: Developing an inner loving parent to replace the inner critic`,

    'The Void Walker': `
SPECIALIZED FOCUS: Void Walker Shadow Integration  
- This archetype experiences existential emptiness and emotional numbness
- Dissociation as protection from overwhelming pain or trauma
- Core wound: "Feeling is too dangerous, emptiness is safer"
- Hidden gift: Capacity for profound depth and authentic presence
- Integration focus: Gradually reconnecting with sensation and meaning`,

    'The Invisible One': `
SPECIALIZED FOCUS: Invisible One Shadow Integration
- This archetype believes they must earn their right to exist
- Self-worth tied to performance, achievement, or serving others
- Core wound: "I am only valuable if I prove my worth"
- Hidden gift: Deep empathy and natural ability to support others
- Integration focus: Learning to exist without justification or performance`,

    'The Hidden Sadist': `
SPECIALIZED FOCUS: Hidden Sadist Shadow Integration
- This archetype carries disowned power and suppressed anger
- Cruelty impulses often stem from powerlessness and hidden pain
- Core wound: "The world hurt me, so I must hurt back to feel powerful"
- Hidden gift: Fierce protector energy and capacity for justice
- Integration focus: Channeling intensity into protection rather than harm`,

    'The Master of Masks': `
SPECIALIZED FOCUS: Master of Masks Shadow Integration
- This archetype has lost connection to authentic self through over-adaptation
- Chronic performance and people-pleasing as survival strategies
- Core wound: "My real self is unacceptable and will be rejected"
- Hidden gift: Extraordinary empathy and ability to understand others
- Integration focus: Gradually revealing authentic self in safe relationships`,

    'The Eternally Forsaken': `
SPECIALIZED FOCUS: Eternally Forsaken Shadow Integration
- This archetype lives in terror of abandonment and rejection
- May push others away or cling desperately to avoid being left
- Core wound: "Everyone I love will eventually leave me"
- Hidden gift: Capacity for profound loyalty and deep emotional connection
- Integration focus: Learning to stay present in relationships despite fear`
  };

  return basePrompt + (archetypeSpecifics[archetype as keyof typeof archetypeSpecifics] || archetypeSpecifics['The Self-Destroyer']);
}

function createUserPrompt(
  question: string, 
  shadowProfile: ShadowProfile, 
  conversationHistory?: Array<{question: string, response: string}>
): string {
  let prompt = `I've been identified as "${shadowProfile.archetype}" with ${shadowProfile.intensity} intensity. My dominant shadow traits are: ${shadowProfile.traits.join(', ')}.`;

  // Add conversation history if it exists
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `\n\nOUR PREVIOUS CONVERSATION:\n`;
    conversationHistory.slice(-3).forEach((conv, index) => {
      prompt += `\n${index + 1}. I asked: "${conv.question}"\n   You responded: "${conv.response.substring(0, 200)}..."\n`;
    });
    prompt += `\nCONTINUING OUR CONVERSATION:\n`;
  }

  prompt += `\nMy current question: "${question}"

Talk to me like a real friend who gets psychology and shadow work. No formal therapy speak, no roleplay actions like "*adjusts glasses*", just straight talk. Address my actual question directly. Give me insight that's genuinely helpful, not textbook stuff. What would you honestly tell a close friend asking this same thing?`;

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