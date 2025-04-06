export type Thread = {
    id: string;
    user_id: string;
    character_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export type ThreadIDs = Pick<Thread, 'id' | 'character_id' | 'user_id'>;

export type Message = {
    id: string;
    thread_id: string;
    sender_type: 'user' | 'character';
    content: string;
    created_at: Date;
}

/**
 * Converts a message to a simplified JSON format.
 * @param message The message to convert
 * @param username The username of the user
 * @param character_name The name of the character
 * @returns A simplified JSON representation of the message
 */
export function convertMessageToJSON(
    message: Message,
    username: string,
    character_name: string
) {
    // Format the date - handle both string and Date types
    const formattedDate = typeof message.created_at === 'string'
        ? message.created_at
        : message.created_at instanceof Date
            ? message.created_at.toISOString()
            : new Date(message.created_at).toISOString();

    return {
        sender: message.sender_type === 'user' ? username : character_name,
        content: message.content,
        timestamp: formattedDate
    };
} 