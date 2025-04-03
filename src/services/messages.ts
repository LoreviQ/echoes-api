import { subscribeToTable } from '../config/supabase';
import supabase from '../config/supabase';
import { Message } from '../types/thread';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';
import { MESSAGE_REPLY } from '../prompts/message';
import { generateResponse } from './text_generation';

export class MessageService {
    private messageChannel: RealtimeChannel | null = null;
    private isInitialized: boolean = false;

    /**
     * Initialize the message service
     * This allows for lazy initialization rather than auto-starting
     */
    public init(): void {
        if (this.isInitialized) {
            console.log('Message service already initialized');
            return;
        }

        this.setupMessageSubscription();
        this.isInitialized = true;
    }

    /**
     * Set up subscription to new messages in the database
     */
    private setupMessageSubscription() {
        this.messageChannel = subscribeToTable('messages', 'INSERT', async (payload) => {
            await this.handleNewMessage(payload);
        });

        console.log('Message subscription initialized');
    }

    /**
     * Handle new message events from the subscription
     */
    private async handleNewMessage(payload: RealtimePostgresChangesPayload<any>) {
        // Ensure payload.new exists and convert the timestamptz to a proper Date object
        if (!payload.new) {
            console.error('Received payload with no new data');
            return;
        }

        const payloadData = payload.new as {
            id: string;
            thread_id: string;
            sender_type: 'user' | 'character';
            content: string;
            created_at: string;
        };

        const message: Message = {
            id: payloadData.id,
            thread_id: payloadData.thread_id,
            sender_type: payloadData.sender_type,
            content: payloadData.content,
            created_at: new Date(payloadData.created_at)
        };

        // Only respond to user messages
        if (message.sender_type === 'user') {
            console.log(`New user message received in thread ${message.thread_id}`);
            await this.generateCharacterResponse(message);
        }
    }

    /**
     * Generate and save a character response to a user message
     */
    private async generateCharacterResponse(userMessage: Message) {
        try {
            // Get thread details to know which character should respond
            const { data: thread, error } = await supabase
                .from('threads')
                .select('character_id, user_id')
                .eq('id', userMessage.thread_id)
                .single();

            if (error || !thread) {
                console.error('Error fetching thread:', error);
                return;
            }

            // Get user email from auth.users
            const { data: userData, error: userError } = await supabase.auth
                .admin.getUserById(thread.user_id);

            if (userError || !userData || !userData.user) {
                console.error('Error fetching user:', userError);
                return;
            }

            const userEmail = userData.user.email;

            // Get character details
            const { data: character, error: characterError } = await supabase
                .from('characters')
                .select('name, gender, description, bio, nsfw')
                .eq('id', thread.character_id)
                .single();

            if (characterError || !character) {
                console.error('Error fetching character:', characterError);
                return;
            }

            // Get message history
            const { data: messageHistory, error: messageHistoryError } = await supabase
                .from('messages')
                .select('*')
                .eq('thread_id', userMessage.thread_id);

            if (messageHistoryError || !messageHistory) {
                console.error('Error fetching message history:', messageHistoryError);
                return;
            }

            // Generate character response
            const generatedResponse = await generateResponse(
                MESSAGE_REPLY.PROMPT(character, messageHistory, userEmail),
                "gemini-2.0-flash",
                MESSAGE_REPLY.SYSTEM
            );

            // Create and save the response
            const characterResponse: Omit<Message, 'id' | 'created_at'> = {
                thread_id: userMessage.thread_id,
                sender_type: 'character',
                content: generatedResponse
            };

            // Save the character's response to the database
            const { data, error: insertError } = await supabase
                .from('messages')
                .insert(characterResponse)
                .select();

            if (insertError) {
                console.error('Error inserting character response:', insertError);
                return;
            }

            console.log('Character response created:', data);
        } catch (err) {
            console.error('Error generating character response:', err);
        }
    }

    /**
     * Clean up subscriptions when service is stopped
     */
    public cleanup() {
        if (this.messageChannel) {
            this.messageChannel.unsubscribe();
            this.messageChannel = null;
            this.isInitialized = false;
            console.log('Message subscription terminated');
        }
    }
}

// Singleton instance
export const messageService = new MessageService();
