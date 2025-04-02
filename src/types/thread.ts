export type Thread = {
    id: string;
    user_id: string;
    character_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export type Message = {
    id: string;
    thread_id: string;
    sender_type: 'user' | 'character';
    content: string;
    created_at: string;
} 