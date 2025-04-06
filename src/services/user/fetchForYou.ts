import supabase from '../../config/supabase';
import { User } from '@supabase/supabase-js';
import { ContentType, ContentReference } from '../../types/content';

const BATCH_SIZE = 100;
const POSTS_INITIAL = 5;
const CHARACTERS_PER_BATCH = 3;
const POSTS_PER_BATCH = 20;

export const fetchForUser = async (user: User, previouslySeenContent: ContentReference[] = []) => {
    // Create a Set of previously seen IDs for efficient lookup
    const seenIds = new Set(previouslySeenContent.map(content => content.id));

    // Fetch all available posts
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(BATCH_SIZE * 2); // Fetch extra to account for filtering

    if (postsError) throw postsError;

    const availablePosts = posts
        .map((post) => ({
            type: ContentType.POST,
            id: post.id
        }))
        .filter(post => !seenIds.has(post.id));

    // Fetch available characters (not subscribed to and not seen)
    const { data: characters, error: charsError } = await supabase
        .from('characters')
        .select('id, created_at')
        .eq('public', true)
        .order('created_at', { ascending: false });

    if (charsError) throw charsError;

    // If user is logged in, filter out subscribed characters
    let availableCharacters = characters.map(character => ({
        type: ContentType.CHARACTER,
        id: character.id
    }));

    if (user) {
        const { data: subscriptions } = await supabase
            .from('character_subscriptions')
            .select('character_id')
            .eq('user_id', user.id);

        const subscribedCharacterIds = new Set(subscriptions?.map(sub => sub.character_id) || []);
        availableCharacters = availableCharacters.filter(char =>
            !subscribedCharacterIds.has(char.id) && !seenIds.has(char.id)
        );
    } else {
        availableCharacters = availableCharacters.filter(char => !seenIds.has(char.id));
    }

    // Randomize character order for better suggestions
    availableCharacters.sort(() => Math.random() - 0.5);

    // Mix content according to the specified pattern
    const result: ContentReference[] = [];
    let postsIndex = 0;
    let charsIndex = 0;

    // Initial 5 posts
    const initialPosts = availablePosts.slice(postsIndex, POSTS_INITIAL);
    result.push(...initialPosts);
    postsIndex += POSTS_INITIAL;

    // Continue mixing content until we reach BATCH_SIZE or run out of content
    while (result.length < BATCH_SIZE) {
        // Add characters if available
        if (charsIndex < availableCharacters.length) {
            const nextCharacters = availableCharacters.slice(charsIndex, charsIndex + CHARACTERS_PER_BATCH);
            result.push(...nextCharacters);
            charsIndex += CHARACTERS_PER_BATCH;
        }

        // Add posts if available
        if (postsIndex < availablePosts.length) {
            const nextPosts = availablePosts.slice(postsIndex, postsIndex + POSTS_PER_BATCH);
            result.push(...nextPosts);
            postsIndex += POSTS_PER_BATCH;
        }

        // Break if we've run out of both content types
        if (charsIndex >= availableCharacters.length && postsIndex >= availablePosts.length) {
            break;
        }
    }

    return result.slice(0, BATCH_SIZE);
}

export const fetchForPublic = async (previouslySeenContent: ContentReference[] = []) => {
    // Create a Set of previously seen IDs for efficient lookup
    const seenIds = new Set(previouslySeenContent.map(content => content.id));

    // Fetch all available posts
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(BATCH_SIZE * 2); // Fetch extra to account for filtering

    if (postsError) throw postsError;

    const availablePosts = posts
        .map((post) => ({
            type: ContentType.POST,
            id: post.id
        }))
        .filter(post => !seenIds.has(post.id));

    // Fetch available characters (not seen)
    const { data: characters, error: charsError } = await supabase
        .from('characters')
        .select('id, created_at')
        .eq('public', true)
        .order('created_at', { ascending: false });

    if (charsError) throw charsError;

    let availableCharacters = characters
        .map(character => ({
            type: ContentType.CHARACTER,
            id: character.id
        }))
        .filter(char => !seenIds.has(char.id));

    // Randomize character order for better suggestions
    availableCharacters.sort(() => Math.random() - 0.5);

    // Mix content according to the specified pattern
    const result: ContentReference[] = [];
    let postsIndex = 0;
    let charsIndex = 0;

    // Initial 5 posts
    const initialPosts = availablePosts.slice(postsIndex, POSTS_INITIAL);
    result.push(...initialPosts);
    postsIndex += POSTS_INITIAL;

    // Continue mixing content until we reach BATCH_SIZE or run out of content
    while (result.length < BATCH_SIZE) {
        // Add characters if available
        if (charsIndex < availableCharacters.length) {
            const nextCharacters = availableCharacters.slice(charsIndex, charsIndex + CHARACTERS_PER_BATCH);
            result.push(...nextCharacters);
            charsIndex += CHARACTERS_PER_BATCH;
        }

        // Add posts if available
        if (postsIndex < availablePosts.length) {
            const nextPosts = availablePosts.slice(postsIndex, postsIndex + POSTS_PER_BATCH);
            result.push(...nextPosts);
            postsIndex += POSTS_PER_BATCH;
        }

        // Break if we've run out of both content types
        if (charsIndex >= availableCharacters.length && postsIndex >= availablePosts.length) {
            break;
        }
    }

    return result.slice(0, BATCH_SIZE);
}