export interface ShadowTrait {
  [key: string]: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  shadow: ShadowTrait;
}

export interface Question {
  id: number;
  text: string;
  reflection: string;
  options: QuestionOption[];
}

export interface IntensityQuestion {
  id: number;
  gentle: {
    text: string;
    reflection: string;
  };
  moderate: {
    text: string;
    reflection: string;
  };
  deep: {
    text: string;
    reflection: string;
  };
  intense: {
    text: string;
    reflection: string;
  };
  options: QuestionOption[];
}

export type IntensityLevel = 'gentle' | 'moderate' | 'deep' | 'intense';

export const questions: Question[] = [
  {
    id: 1,
    text: "When you look in the mirror late at night, what truth about yourself do you refuse to acknowledge?",
    reflection: "What specifically do you see that makes you look away?",
    options: [
      { 
        id: 'a', 
        text: "I see someone who pretends to care but is fundamentally selfish", 
        shadow: { selfishness: 3, facade: 2, guilt: 2 } 
      },
      { 
        id: 'b', 
        text: "I see someone weak who lets others walk all over them", 
        shadow: { weakness: 3, victimhood: 2, self_hatred: 2 } 
      },
      { 
        id: 'c', 
        text: "I see someone who destroys everything they touch", 
        shadow: { destruction: 3, self_sabotage: 2, worthlessness: 2 } 
      },
      { 
        id: 'd', 
        text: "I see someone who will never be enough for anyone", 
        shadow: { inadequacy: 3, abandonment: 2, despair: 2 } 
      }
    ]
  },
  {
    id: 2,
    text: "Complete this sentence: 'If people knew the real me, they would...'",
    reflection: "What specifically would horrify them about you?",
    options: [
      { 
        id: 'a', 
        text: "Run away because I'm fundamentally broken and toxic", 
        shadow: { toxicity: 3, brokenness: 2, isolation: 2 } 
      },
      { 
        id: 'b', 
        text: "See how pathetic and desperate I really am inside", 
        shadow: { desperation: 3, shame: 2, neediness: 2 } 
      },
      { 
        id: 'c', 
        text: "Realize I've been lying and manipulating them all along", 
        shadow: { deception: 3, manipulation: 2, guilt: 2 } 
      },
      { 
        id: 'd', 
        text: "Understand why I hate myself so much", 
        shadow: { self_hatred: 3, darkness: 2, despair: 2 } 
      }
    ]
  },
  {
    id: 3,
    text: "What do you do with emotions so dark you can't even name them?",
    reflection: "Describe the texture and weight of these unnamed feelings.",
    options: [
      { 
        id: 'a', 
        text: "I turn them inward until I want to disappear completely", 
        shadow: { self_destruction: 3, despair: 2, withdrawal: 2 } 
      },
      { 
        id: 'b', 
        text: "I fantasize about making others feel my pain", 
        shadow: { cruelty: 3, projection: 2, vengeance: 2 } 
      },
      { 
        id: 'c', 
        text: "I numb them with anything that will make them stop", 
        shadow: { addiction: 3, avoidance: 2, self_harm: 1 } 
      },
      { 
        id: 'd', 
        text: "I pretend they don't exist and smile harder", 
        shadow: { dissociation: 3, facade: 2, splitting: 2 } 
      }
    ]
  },
  {
    id: 4,
    text: "What would you do if you could hurt someone who hurt you with zero consequences?",
    reflection: "Be specific about the revenge that lives in your fantasies.",
    options: [
      { 
        id: 'a', 
        text: "I would destroy them emotionally the way they destroyed me", 
        shadow: { vengeance: 3, cruelty: 2, trauma: 2 } 
      },
      { 
        id: 'b', 
        text: "I would make them feel invisible and worthless", 
        shadow: { cruelty: 2, projection: 3, abandonment: 2 } 
      },
      { 
        id: 'c', 
        text: "I would expose their secrets and watch them crumble", 
        shadow: { vindictiveness: 3, power: 2, satisfaction: 2 } 
      },
      { 
        id: 'd', 
        text: "I would take away everything that makes them feel secure", 
        shadow: { destruction: 3, envy: 2, control: 2 } 
      }
    ]
  },
  {
    id: 5,
    text: "What part of your sexuality do you find most disturbing about yourself?",
    reflection: "What desires or fantasies bring you the most shame?",
    options: [
      { 
        id: 'a', 
        text: "How much I crave being completely dominated/controlling", 
        shadow: { power_dynamics: 3, shame: 2, compulsion: 2 } 
      },
      { 
        id: 'b', 
        text: "How I sexualize inappropriate people or situations", 
        shadow: { transgression: 3, guilt: 2, compulsion: 2 } 
      },
      { 
        id: 'c', 
        text: "How empty and mechanical it feels, like I'm just performing", 
        shadow: { dissociation: 3, emptiness: 2, performance: 2 } 
      },
      { 
        id: 'd', 
        text: "How much I hate my own body and desires", 
        shadow: { self_hatred: 3, shame: 3, rejection: 2 } 
      }
    ]
  },
  {
    id: 6,
    text: "If you could erase one memory of yourself that reveals who you really are, what would it be?",
    reflection: "What did this moment show you about your true nature?",
    options: [
      { 
        id: 'a', 
        text: "When I abandoned someone who needed me because it was inconvenient", 
        shadow: { selfishness: 3, cowardice: 2, guilt: 3 } 
      },
      { 
        id: 'b', 
        text: "When I enjoyed watching someone else's pain or failure", 
        shadow: { sadism: 3, darkness: 2, shame: 2 } 
      },
      { 
        id: 'c', 
        text: "When I lied so convincingly that I believed it myself", 
        shadow: { deception: 3, dissociation: 2, self_delusion: 2 } 
      },
      { 
        id: 'd', 
        text: "When I realized I felt nothing at someone's death or suffering", 
        shadow: { emptiness: 3, disconnection: 3, numbness: 2 } 
      }
    ]
  },
  {
    id: 7,
    text: "What would your closest relationships look like if you stopped pretending?",
    reflection: "How would they change if you showed your complete, unfiltered self?",
    options: [
      { 
        id: 'a', 
        text: "They would see how needy and clingy I really am", 
        shadow: { neediness: 3, desperation: 2, abandonment: 3 } 
      },
      { 
        id: 'b', 
        text: "They would realize I don't actually care as much as I pretend to", 
        shadow: { emotional_unavailability: 3, facade: 2, selfishness: 2 } 
      },
      { 
        id: 'c', 
        text: "They would be horrified by how much I resent and judge them", 
        shadow: { resentment: 3, judgment: 2, hatred: 2 } 
      },
      { 
        id: 'd', 
        text: "They would end because I'm too damaged to love or be loved", 
        shadow: { brokenness: 3, self_hatred: 3, unworthiness: 2 } 
      }
    ]
  },
  {
    id: 8,
    text: "What's the cruelest thought you've ever had about yourself?",
    reflection: "What words do you use when you truly want to wound yourself?",
    options: [
      { 
        id: 'a', 
        text: "'Everyone would be better off if I had never been born'", 
        shadow: { self_annihilation: 3, worthlessness: 3, despair: 3 } 
      },
      { 
        id: 'b', 
        text: "'I deserve every bad thing that happens to me'", 
        shadow: { self_punishment: 3, guilt: 3, masochism: 2 } 
      },
      { 
        id: 'c', 
        text: "'I'm a waste of space and resources'", 
        shadow: { worthlessness: 3, shame: 3, self_hatred: 2 } 
      },
      { 
        id: 'd', 
        text: "'I'm fundamentally unlovable and always will be'", 
        shadow: { unlovability: 3, despair: 3, abandonment: 3 } 
      }
    ]
  }
];

export const intensityQuestions: IntensityQuestion[] = [
  {
    id: 1,
    gentle: {
      text: "When you're alone with your thoughts, what do you sometimes wish was different about yourself?",
      reflection: "What small changes would make you feel more at peace?"
    },
    moderate: {
      text: "What aspects of yourself do you tend to hide when meeting new people?",
      reflection: "What do you worry they might discover about you?"
    },
    deep: {
      text: "When you look in the mirror late at night, what truth about yourself do you refuse to acknowledge?",
      reflection: "What specifically do you see that makes you look away?"
    },
    intense: {
      text: "What reality about who you really are would shatter your entire self-image if you fully accepted it?",
      reflection: "What truth are you desperately running from?"
    },
    options: [
      { 
        id: 'a', 
        text: "I see someone who pretends to care but is fundamentally selfish", 
        shadow: { selfishness: 3, facade: 2, guilt: 2 } 
      },
      { 
        id: 'b', 
        text: "I see someone weak who lets others walk all over them", 
        shadow: { weakness: 3, victimhood: 2, self_hatred: 2 } 
      },
      { 
        id: 'c', 
        text: "I see someone who destroys everything they touch", 
        shadow: { destruction: 3, self_sabotage: 2, worthlessness: 2 } 
      },
      { 
        id: 'd', 
        text: "I see someone who will never be enough for anyone", 
        shadow: { inadequacy: 3, abandonment: 2, despair: 2 } 
      }
    ]
  },
  {
    id: 2,
    gentle: {
      text: "If people knew you better, what might they be surprised to discover?",
      reflection: "What sides of yourself do you rarely show others?"
    },
    moderate: {
      text: "Complete this sentence: 'If people really knew me, they might...'",
      reflection: "What would change in how they see you?"
    },
    deep: {
      text: "Complete this sentence: 'If people knew the real me, they would...'",
      reflection: "What specifically would horrify them about you?"
    },
    intense: {
      text: "What about your inner world is so dark that exposing it would destroy every relationship you have?",
      reflection: "What thoughts or desires would make people flee from you in disgust?"
    },
    options: [
      { 
        id: 'a', 
        text: "Run away because I'm too much to handle", 
        shadow: { intensity: 2, abandonment: 3, overwhelming: 2 } 
      },
      { 
        id: 'b', 
        text: "Lose respect for me because I'm weaker than I appear", 
        shadow: { weakness: 3, facade: 3, shame: 2 } 
      },
      { 
        id: 'c', 
        text: "Be disgusted by how selfish and manipulative I actually am", 
        shadow: { selfishness: 3, manipulation: 3, guilt: 2 } 
      },
      { 
        id: 'd', 
        text: "Pity me because I'm more broken than they realized", 
        shadow: { brokenness: 3, self_hatred: 2, victimhood: 2 } 
      }
    ]
  },
  {
    id: 3,
    gentle: {
      text: "What situations make you feel uncomfortable or defensive?",
      reflection: "When do you find yourself putting up walls?"
    },
    moderate: {
      text: "What triggers your strongest emotional reactions, even when you try to stay calm?",
      reflection: "What pushes your buttons despite your best efforts?"
    },
    deep: {
      text: "What makes you so angry that you scare yourself with the intensity of your rage?",
      reflection: "What could you do if you stopped controlling that fury?"
    },
    intense: {
      text: "What would you destroy if you ever let your full hatred and rage loose on the world?",
      reflection: "Who or what would bear the brunt of your unfiltered vengeance?"
    },
    options: [
      { 
        id: 'a', 
        text: "People who remind me of my own failures and weaknesses", 
        shadow: { projection: 3, self_hatred: 2, anger: 3 } 
      },
      { 
        id: 'b', 
        text: "Anyone who has what I want but can't have", 
        shadow: { envy: 3, bitterness: 2, inadequacy: 2 } 
      },
      { 
        id: 'c', 
        text: "People who see through my act and call me out", 
        shadow: { facade: 3, shame: 3, defensiveness: 2 } 
      },
      { 
        id: 'd', 
        text: "Those who abandoned or betrayed me", 
        shadow: { abandonment: 3, revenge: 3, hatred: 2 } 
      }
    ]
  },
  {
    id: 4,
    gentle: {
      text: "What do you sometimes worry people think about you?",
      reflection: "What judgments are you most afraid of?"
    },
    moderate: {
      text: "What's your deepest fear about how others perceive you?",
      reflection: "What would devastate you if people believed it?"
    },
    deep: {
      text: "What's the most shameful thing about yourself that you desperately hope no one ever discovers?",
      reflection: "What would make you want to disappear forever if exposed?"
    },
    intense: {
      text: "What secret about yourself is so vile and repulsive that discovering it would justify others' hatred of you?",
      reflection: "What makes you deserve to be despised and rejected?"
    },
    options: [
      { 
        id: 'a', 
        text: "I'm a fraud who doesn't deserve anything I have", 
        shadow: { imposter: 3, unworthiness: 3, guilt: 2 } 
      },
      { 
        id: 'b', 
        text: "I'm so damaged that I contaminate everything I touch", 
        shadow: { toxicity: 3, self_hatred: 2, contamination: 3 } 
      },
      { 
        id: 'c', 
        text: "I'm fundamentally evil despite my good person act", 
        shadow: { evil: 3, facade: 3, dark_nature: 2 } 
      },
      { 
        id: 'd', 
        text: "I'm so worthless that caring about me is a waste of time", 
        shadow: { worthlessness: 3, self_rejection: 3, hopelessness: 2 } 
      }
    ]
  }
];

// Helper function to get questions based on intensity level
export const getQuestionsByIntensity = (intensity: IntensityLevel): Question[] => {
  return intensityQuestions.map(iq => ({
    id: iq.id,
    text: iq[intensity].text,
    reflection: iq[intensity].reflection,
    options: iq.options
  }));
};