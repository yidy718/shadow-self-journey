import { Eye, Skull, Moon, Shield, Flame, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ShadowArchetype {
  name: string;
  description: string;
  deepTruth: string;
  integration: string;
  color: string;
  icon: LucideIcon;
  intensity?: string;
  dominantTraits?: [string, number][];
}

export const shadowArchetypes: Record<string, ShadowArchetype> = {
  'self_hatred': {
    name: 'The Self-Destroyer',
    description: `You are your own worst enemy, wielding cruelty against yourself that you would never inflict on another. Your shadow has turned inward, creating a hell of your own making where you are both executioner and victim. The voice in your head speaks with the venom of your deepest wounds, convinced that you deserve every lash of its tongue.`,
    deepTruth: `Your self-hatred is not your truth - it is the internalized voice of every wound you've ever received. The cruelty you show yourself is learned behavior, not innate nature.`,
    integration: `Begin by speaking to yourself as you would to a beloved friend. Your inner critic has protected you by attacking first, but you no longer need this armor.`,
    color: 'from-black via-red-900 to-black',
    icon: Skull
  },
  'despair': {
    name: 'The Void Walker',
    description: `You walk through life carrying an emptiness so profound it threatens to swallow everything around you. Your shadow is the abyss itself - not evil, but absence. You have gazed so long into meaninglessness that it has become your identity, and you fear that without your pain, you would simply disappear.`,
    deepTruth: `Your despair is not who you are - it is what you've been through. You mistake your wounds for your identity because they feel more real than hope ever has.`,
    integration: `Start with the smallest possible acts of self-care. You don't have to believe in meaning to act as if it exists. Sometimes faith follows action.`,
    color: 'from-gray-900 via-black to-blue-900',
    icon: Moon
  },
  'worthlessness': {
    name: 'The Invisible One',
    description: `Your shadow whispers that you are fundamentally defective, a mistake that somehow slipped through the cracks of creation. You move through the world convinced that your very existence is an imposition, that love is charity, and that acceptance is temporary tolerance waiting to be revoked.`,
    deepTruth: `Your sense of worthlessness is a trauma response, not a fact. Someone taught you that you had to earn the right to exist, but they were wrong.`,
    integration: `Practice existing without justification. You don't have to achieve, perform, or please to deserve space in this world.`,
    color: 'from-gray-800 via-slate-700 to-gray-900',
    icon: Shield
  },
  'cruelty': {
    name: 'The Hidden Sadist',
    description: `There is a part of you that finds satisfaction in others' pain, that feels a dark thrill when someone gets what you believe they deserve. Your shadow has learned that power can come through causing hurt, and sometimes the only way you feel strong is when others feel weak.`,
    deepTruth: `Your cruelty is often pain turned outward. The part of you that wants to hurt others is usually the same part that has been hurt beyond measure.`,
    integration: `Channel your intensity into justice, not vengeance. Use your understanding of pain to prevent it in others, not to inflict it.`,
    color: 'from-red-800 via-black to-red-900',
    icon: Flame
  },
  'facade': {
    name: 'The Master of Masks',
    description: `You have perfected the art of being whoever others need you to be, but in the process, you've lost track of who you actually are. Your shadow is the exhaustion of constant performance, the fear that if you stop acting, there will be nothing underneath the mask but emptiness.`,
    deepTruth: `Your masks began as protection but became your prison. The person you're hiding is not as terrible as you fear - you're just afraid they're not enough.`,
    integration: `Start revealing small, authentic pieces of yourself. You don't have to tear off all masks at once - begin with one genuine moment at a time.`,
    color: 'from-purple-800 via-indigo-900 to-black',
    icon: Eye
  },
  'abandonment': {
    name: 'The Eternally Forsaken',
    description: `Your deepest terror is being left alone, yet your shadow ensures this fate by pushing away anyone who gets too close. You create the very abandonment you fear, convinced that rejection is inevitable, so you might as well control when it happens.`,
    deepTruth: `Your fear of abandonment often creates the abandonment you fear. Your shadow pushes people away to protect you from the pain of being left, but isolation hurts too.`,
    integration: `Practice staying present in relationships even when the urge to flee feels overwhelming. Not everyone who gets close will leave.`,
    color: 'from-blue-900 via-black to-indigo-900',
    icon: Heart
  }
};

export const getShadowArchetype = (dominantTraits: [string, number][], totalDarkness: number): ShadowArchetype => {
  // Safety check for undefined/empty parameters
  if (!dominantTraits || dominantTraits.length === 0) {
    return {
      ...shadowArchetypes.facade,
      intensity: 'mild',
      dominantTraits: []
    };
  }
  
  const [primary] = dominantTraits;
  const intensity = totalDarkness > 45 ? 'extreme' : totalDarkness > 35 ? 'severe' : totalDarkness > 25 ? 'moderate' : 'mild';
  
  const archetype = shadowArchetypes[primary[0]] || shadowArchetypes.facade;
  return { 
    ...archetype, 
    intensity, 
    dominantTraits 
  };
};