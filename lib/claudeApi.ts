'use client';

export interface ShadowProfile {
  archetype: string;
  traits: string[];
  intensity: string;
  description: string;
}

export const askClaude = async (question: string, shadowProfile: ShadowProfile, userId?: string): Promise<string> => {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        shadowProfile,
        userId,
      }),
    });

    if (response.status === 429) {
      const errorData = await response.json();
      throw new Error(`Rate limit exceeded. Please try again later. ${errorData.resetTime ? `Reset in ${Math.ceil((errorData.resetTime - Date.now()) / (60 * 1000))} minutes.` : ''}`);
    }

    if (!response.ok) {
      throw new Error('Failed to get response from Claude');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error asking Claude:', error);
    if (error instanceof Error && error.message.includes('Rate limit')) {
      throw error;
    }
    throw new Error('Failed to connect to Claude. Please try again later.');
  }
};

// Fallback function for demo purposes
export const getDemoInsight = (question: string, shadowProfile: ShadowProfile): string => {
  const insights = {
    'The Self-Destroyer': `Your question about "${question.substring(0, 50)}..." reveals the core struggle of The Self-Destroyer. The inner critic that speaks so harshly to you learned to be cruel as protection - if it attacks first, perhaps others won't. But this pattern has become its own prison. Consider this: would you speak to a friend the way you speak to yourself? Your shadow work involves learning to parent yourself with the compassion you never received. Start small - notice when the inner critic speaks, and simply acknowledge it without fighting it. "I see you, inner critic, but today I choose kindness."`,
    
    'The Void Walker': `Your inquiry touches the heart of The Void Walker's experience. The emptiness you carry isn't a flaw - it's a response to overwhelming pain. When we can't process trauma, sometimes the psyche chooses numbness over agony. But beneath that protective void lies tremendous capacity for feeling. Your integration path involves tiny acts of connection - to beauty, to others, to moments of meaning. You don't have to feel everything at once. Begin with noticing a single beautiful thing each day, even if it feels hollow. Sensation can return gradually.`,
    
    'The Invisible One': `Your question reflects The Invisible One's deepest wound - the belief that you must earn your right to exist. This shadow formed when someone important made you feel that love was conditional on performance. But your worth isn't tied to what you do or achieve. You exist, therefore you matter. Your healing involves practicing radical self-acceptance. Try this: each morning, look in the mirror and simply say "I have a right to be here." Not because you're special or accomplished, but because you're human.`,
    
    'The Hidden Sadist': `Your question reveals the complex nature of The Hidden Sadist. That part of you that sometimes enjoys others' pain isn't evil - it's wounded power seeking expression. Often, this shadow emerges when we've felt powerless for too long. The cruelty you sometimes feel is pain turned outward. Your path involves channeling this intensity constructively. Use your deep understanding of pain to become an advocate for justice, not vengeance. Transform your shadow into fierce compassion.`,
    
    'The Master of Masks': `Your question cuts to The Master of Masks' core fear - that authenticity will lead to rejection. You've become so skilled at being what others need that you've lost touch with your genuine self. But the person beneath the masks isn't as terrible as you fear. Your healing involves slowly, carefully revealing authentic pieces of yourself. Start with low-stakes situations. Share a genuine opinion about something small. Your true self deserves to be seen and loved.`,
    
    'The Eternally Forsaken': `Your question speaks to The Eternally Forsaken's central paradox - fearing abandonment while creating it. Your shadow learned that rejection is inevitable, so it tries to control the timing. But not everyone will leave. Your healing involves staying present in relationships even when every instinct screams to run. Practice saying "I'm scared you'll leave" instead of pushing people away. Vulnerability, not walls, creates lasting connection.`
  };

  return insights[shadowProfile.archetype as keyof typeof insights] || 
    "Your shadow work journey is unique and complex. Each question you ask shows your courage to face the hidden aspects of yourself. Remember that shadow integration isn't about eliminating these parts of you, but about understanding and compassion. Your dark aspects, when brought into conscious awareness, can become sources of strength and wisdom.";
};