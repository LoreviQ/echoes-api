import supabase from '../../config/supabase';
import { User } from '@supabase/supabase-js';
import { ContentType } from '../../types/content';

// Fetch posts for the user
// Currently simple, but will be improved later
export const fetchForYou = async (user: User | null | undefined) => {
    // Fetch posts
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, created_at')
        .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    const postsReferences = posts.map((post) => ({
        type: ContentType.POST,
        id: post.id
    }));

    // Fetch characters
    const { data: characters, error: charsError } = await supabase
        .from('characters')
        .select('id, created_at')
        .eq('public', true)
        .order('created_at', { ascending: false });

    if (charsError) throw charsError;
    const charactersReferences = characters.map((character) => ({
        type: ContentType.CHARACTER,
        id: character.id
    }));

    // pick 3 random characters
    const randomCharacters = charactersReferences.sort(() => Math.random() - 0.5).slice(0, 3);

    //display 5 posts, then the 3 characters, then the rest of the posts
    return [...postsReferences.slice(0, 5), ...randomCharacters, ...postsReferences.slice(5)];
}