import { NextRequest, NextResponse } from 'next/server';

export interface ShadowProfile {
  archetype: string;
  traits: string[];
  intensity: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const { question, shadowProfile }: { question: string; shadowProfile: ShadowProfile } = await request.json();

    // For now, we'll use the fallback system since the user hasn't provided Claude API keys
    // In a production environment, you would integrate with Claude's API here
    const response = getDemoInsight(question, shadowProfile);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in Claude API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Enhanced fallback function with more nuanced responses
function getDemoInsight(question: string, shadowProfile: ShadowProfile): string {
  const questionLower = question.toLowerCase();
  
  // Pattern-based response generation for more dynamic responses
  const responsePatterns = {
    relationship: [
      'relationship', 'love', 'partner', 'dating', 'marriage', 'connection', 'intimacy'
    ],
    work: [
      'work', 'job', 'career', 'boss', 'colleague', 'professional', 'workplace'
    ],
    family: [
      'family', 'parent', 'mother', 'father', 'sibling', 'child', 'childhood'
    ],
    self: [
      'myself', 'self', 'identity', 'personality', 'confidence', 'worth'
    ],
    fear: [
      'afraid', 'fear', 'scared', 'anxiety', 'worry', 'panic', 'terrified'
    ],
    anger: [
      'angry', 'rage', 'furious', 'hate', 'resentment', 'bitter', 'mad'
    ]
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
      
      family: `Family dynamics often created The Self-Destroyer's inner voice. Perhaps criticism or conditional love taught you to be cruel to yourself first. Understanding this pattern is liberation. You can choose to break the cycle. The way your family spoke to you doesn't have to become your inner dialogue. Practice speaking to yourself as the loving parent you needed.`,
      
      self: `Your question reveals The Self-Destroyer's core wound: you've internalized criticism so deeply it feels like truth. But self-hatred isn't your authentic nature - it's a learned response to pain. Begin healing by noticing when you speak cruelly to yourself. Don't fight the voice; simply acknowledge it and choose kindness instead. "I see you, inner critic, but today I choose compassion."`,
      
      default: `Your question illuminates The Self-Destroyer's central challenge: you've become your own worst enemy. This shadow developed to protect you - if you attack yourself first, perhaps others can't hurt you as deeply. But this armor has become a prison. Your healing begins with treating yourself as you would treat someone you love unconditionally. Start with one moment of self-kindness today.`
    },

    'The Void Walker': {
      relationship: `As The Void Walker, you may feel emotionally numb in relationships, wondering if you're capable of genuine connection. This emptiness isn't who you are - it's how you've protected yourself from overwhelming pain. Your capacity for feeling hasn't disappeared; it's buried under layers of protective numbness. In relationships, start small: notice one moment of genuine feeling, however brief. Connection can return gradually.`,
      
      work: `The Void Walker often feels disconnected from work, going through motions without meaning. This detachment can actually be a strength - you see clearly without emotional interference. But if you're seeking more engagement, focus on small moments of purpose. What tiny aspect of your work serves something beyond yourself? Meaning doesn't have to be grand; it can be found in helping one person or solving one problem.`,
      
      default: `Your question touches The Void Walker's core experience: moving through life carrying an emptiness that feels endless. This void isn't your identity - it's your psyche's way of managing unbearable pain. When we can't process trauma, sometimes numbness feels safer than feeling. But beneath that protective emptiness lies tremendous capacity for depth. Start with small connections to sensation, beauty, or meaning. Feeling can return gradually, safely.`
    },

    'The Invisible One': {
      relationship: `The Invisible One's deepest fear in relationships is being truly seen and found wanting. You may exhaust yourself trying to earn love through constant giving or perfect behavior. But love isn't a transaction you must win. Your worth exists independent of what you do or provide. Practice being authentically yourself in small moments. Start with sharing one genuine opinion or preference without justifying it.`,
      
      work: `At work, The Invisible One often overperforms and undervalues their contributions. You may struggle to advocate for yourself because you don't believe you deserve recognition. But your worth isn't determined by constant achievement. Practice stating your accomplishments without minimizing them. Your presence and contributions have value beyond your ability to prove it.`,
      
      default: `Your question reflects The Invisible One's core wound: the belief that you must earn your right to exist. Someone taught you that love and acceptance were conditional on performance, but they were wrong. You don't need to justify your existence through constant achievement or self-sacrifice. Practice taking up space without apology. You belong here simply because you exist.`
    },

    'The Hidden Sadist': {
      relationship: `The Hidden Sadist's question about relationships reveals complex dynamics around power and pain. Perhaps you sometimes enjoy your partner's discomfort or feel a dark satisfaction when they struggle. This doesn't make you evil - it often comes from feeling powerless for too long. Your intensity and understanding of pain can become fierce compassion when channeled constructively. Use your insight into suffering to protect, not harm.`,
      
      anger: `Your anger as The Hidden Sadist likely carries a desire to make others feel your pain. This shadow understands suffering intimately and sometimes wants to share that knowledge. But your pain doesn't deserve to create more pain. Channel that intensity into justice, advocacy, or protection of the vulnerable. Your deep understanding of hurt can become a gift when used to prevent others' suffering.`,
      
      default: `Your question reveals The Hidden Sadist's complex relationship with power and pain. That part of you that sometimes enjoys others' suffering isn't pure evil - it's often wounded power seeking expression. When we feel helpless for too long, causing pain can feel like reclaiming control. Your healing involves channeling this intensity constructively: become a fierce protector rather than a source of harm. Your understanding of pain can serve justice, not vengeance.`
    },

    'The Master of Masks': {
      relationship: `The Master of Masks exhausts themselves being who others need them to be, losing track of their authentic self in relationships. You've become so skilled at adaptation that you fear there's nothing genuine underneath. But your true self isn't gone - it's been protected behind masks for so long you've forgotten it exists. Start revealing small, authentic pieces of yourself. Your real personality is worth knowing and loving.`,
      
      work: `At work, The Master of Masks may feel like they're constantly performing, never sure which version of themselves is "real" or appropriate. This adaptability is actually a strength, but chronic performance is exhausting. Practice moments of authenticity: share one genuine reaction or opinion. Your professional relationships can handle more honesty than you think.`,
      
      self: `Your question about self-identity strikes at The Master of Masks' core struggle: you've been so many people for so long that you're not sure who you actually are. This isn't a sign that you're empty - it's evidence of your incredible adaptability and empathy. Your authentic self exists; it's been carefully protected behind all those masks. Start uncovering it gradually, one genuine moment at a time.`,
      
      default: `As The Master of Masks, your question touches the exhaustion of constant performance. You've perfected being whoever others need, but lost connection to your authentic self. This skill developed to keep you safe and loved, but it's become a prison. Your real self isn't as terrible or boring as you fear - it's simply been protected for so long you've forgotten its voice. Begin listening for your genuine reactions and honoring them, even in small ways.`
    },

    'The Eternally Forsaken': {
      relationship: `The Eternally Forsaken's question about relationships reveals the painful irony of your shadow: fearing abandonment so intensely that you create it. You may push people away before they can leave, or cling so tightly you suffocate connection. Your fear is understandable - someone important taught you that leaving was inevitable. But not everyone will abandon you. Practice staying present in relationships even when every instinct screams to flee or cling.`,
      
      fear: `Your fear as The Eternally Forsaken is the deep terror of being left alone. This fear may control many of your choices, causing you to contort yourself to keep people close or to reject them before they can reject you. But fear of abandonment often creates abandonment. Practice tolerating the uncertainty of relationships. Not everyone who gets close will leave, and you can't control their choices - only your responses.`,
      
      family: `Family dynamics likely created The Eternally Forsaken's abandonment fears. Perhaps someone central to your world left physically or emotionally, teaching you that connection is temporary and conditional. But that early experience doesn't determine all relationships. Some people stay. Some people are safe. Healing involves learning to distinguish between past wounds and present realities.`,
      
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