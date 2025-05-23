import supabase from '@/config/supabase';
import { wrapInCodeBlock } from '@/utils/string';
import { Provider } from '@/ai_generation/context_builder';
import { type MessageSchema } from 'echoes-shared';
import { database } from '@/config/cachedDatabase';
/**
 * Fetches the message history from the database and converts it to a JSON string.
 * @param thread_id - The ID of the thread to fetch.
 * @returns A promise containing the message history as a JSON string and any error that occurred.
 */
export function messageHistoryProvider(threadId: string): Provider {
    return {
        title: 'Message History',
        type: 'prompt',
        execute: async () => {
            // Fetch the thread from the database
            const { thread, error: threadError } = await database.getThread(threadId, supabase);
            if (threadError || !thread) {
                console.error('Error fetching thread:', threadError);
                return undefined;
            }

            // Fetch the message history from the database
            const { messages, error: messageError } = await database.getMessages(thread.id, supabase);
            if (messageError || !messages) {
                console.error('Error fetching message history:', messageError);
                return undefined;
            }

            // Get user email from auth.users
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(thread.user_id);
            if (userError || !userData || !userData.user || !userData.user.email) {
                console.error('Error fetching user:', userError);
                return undefined;
            }

            // Get character name
            const { character, error: characterError } = await database.getCharacter(thread.character_id, supabase);
            if (characterError || !character) {
                console.error('Error fetching character:', characterError);
                return undefined;
            }

            // Convert the message history to a JSON string and wrap in code block
            const formattedMessages = formatMessageHistory(messages, userData.user.email, character.name);
            const messageHistory = wrapInCodeBlock(JSON.stringify(formattedMessages, null, 2));
            return messageHistory;
        }
    };
}

function formatMessageHistory(messages: MessageSchema[], username: string, character_name: string) {
    return messages.map(message => ({
        from: message.sender_type === 'user' ? username : character_name,
        content: message.content,
        sent_at: new Date(message.created_at).toISOString().replace('T', ' ').replace(/\.\d+Z$/, '')
    }));
}