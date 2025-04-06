import supabase from '../config/supabase';
import { wrapInCodeBlock } from '../utils/string';
import { Message, ThreadIDs } from '../types/thread';
import { convertMessageToJSON } from '../types/thread';

/**
 * Fetches the message history from the database and converts it to a JSON string.
 * @param thread_id - The ID of the thread to fetch.
 * @returns A promise containing the message history as a JSON string and any error that occurred.
 */
export async function messageHistoryProvider(thread: ThreadIDs): Promise<{ messageHistory: string | null, error: any }> {
    // Fetch the message history from the database
    const { data, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id) as { data: Message[] | null, error: any };

    if (messageError || !data) {
        console.error('Error fetching message history:', messageError);
        return { messageHistory: null, error: messageError };
    }

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabase.auth
        .admin.getUserById(thread.user_id);

    if (userError || !userData || !userData.user) {
        console.error('Error fetching user:', userError);
        return { messageHistory: null, error: userError };
    }

    // format messages
    const formattedMessages = data.map(msg =>
        convertMessageToJSON(msg, userData.user.email ?? 'unknown', thread.character_id)
    );
    // Convert the message history to a JSON string and wrap in code block
    const messageHistory = wrapInCodeBlock(JSON.stringify(formattedMessages, null, 2));
    return { messageHistory, error: null };
}
