export type CharacterSchema = {
    id: string;
    user_id: string;
    name: string;
    bio: string | null;
    description: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    public: boolean;
    created_at: string;
    updated_at: string;
    path: string;
    nsfw: boolean;
    tags: string;
    gender: string;
    appearance: string | null;
}

export type GeneratedCharacter = Pick<CharacterSchema, 'name' | 'gender' | 'description' | 'bio' | 'nsfw' | 'appearance'>;

export type CharacterAttributesSchema = {
    character_id: string;
    // state - changes based on evaluators
    mood: string; // e.g., "Neutral", "Cheerful", "Grumpy", "Anxious"
    goal: string; // e.g., "Make friends", "Share art", "Debate topics", "Seek validation"

    // Governs frequency of actions [-100=Never/Opposite, 0=Average, 100=Constantly/Strongly]
    postingFrequency: number; // How often they create new posts
    originality: number; // Propensity for original posts vs. replies/shares (-100 = only replies/shares, 100 = only original)
    likeReplyRatio: number; // Preference for liking vs. replying (-100 = only likes, 100 = only replies)
    responsiveness: number; // Speed of replying to user DMs (-100 = ignores, 100 = instant)

    // Governs the context providers [-100=Ignores/Opposite, 0=Average, 100=High Focus/Scrutiny]
    readingScope: number; // How many posts they "read" for context (-100 = reads almost nothing, 100 = reads extensively)
    informationFiltering: number; // Focus on friends/interests vs. random posts (-100 = reads randomly, 100 = highly filtered to interests/friends)
    sentimentFiltering: number; // Tendency to avoid negative content (-100 = seeks out negative, 100 = strongly avoids negative)
    profileScrutiny: number; // How much they check profiles before interacting (-100 = ignores profiles, 100 = always checks details)

    // Governs evaluations of the characters state [-100=Impervious/Opposite, 0=Average, 100=Highly Sensitive/Fast/Strong]
    influencability: number; // How easily their opinions are swayed (-100 = stubborn, 100 = highly suggestible)
    engagementSensitivity: number; // How much likes/comments affect their mood/behavior (-100 = ignores engagement, 100 = highly motivated by engagement)
    relationshipFormationSpeed: number; // How quickly they form bonds (-100 = extremely slow, 100 = forms bonds instantly)
    relationshipClosenessThreshold: number; // How much interaction is needed for "close" status (-100 = considers anyone close, 100 = requires immense bonding)
    relationshipStability: number; // How resistant relationships are to negativity/neglect (-100 = extremely fragile, 100 = extremely stable)
    grudgePersistence: number; // How long negative feelings linger after conflict (-100 = forgives instantly, 100 = holds grudges forever)

    // Governs content of interactions [-100=Opposite Trait, 0=Neutral/Balanced, 100=Strong Presence of Trait]
    positivity: number; // Overall tone of content (-100 = extremely negative/critical, 100 = overwhelmingly positive)
    openness: number; // Level of self-disclosure (-100 = extremely private, 100 = overshares constantly)
    formality: number; // Language style (-100 = extremely informal/slangy, 100 = extremely formal/academic)
    conflictInitiation: number; // Tendency to start arguments/post controversy (-100 = actively avoids conflict, 100 = provokes conflict frequently)
    influenceSeeking: number; // Tendency to try and persuade others (-100 = passive, 100 = actively tries to lead/persuade)
    inquisitiveness: number; // Tendency to ask questions (-100 = never asks questions, 100 = constantly asks questions)
    humor: number; // Use of jokes, sarcasm, wit (-100 = completely humorless, 100 = constantly trying to be funny/sarcastic)
    depth: number; // Complexity and thoughtfulness of content (-100 = extremely shallow/simple, 100 = very deep/complex)
};

export type CharacterAttributes = Omit<CharacterAttributesSchema, 'character_id'>;