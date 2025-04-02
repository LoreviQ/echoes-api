import { subscribeToTable } from '../config/supabase';
import supabase from '../config/supabase';
import { Message } from '../types/thread';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

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
    private async handleNewMessage(payload: RealtimePostgresChangesPayload<Message>) {
        const message = payload.new as Message;

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
                .select('character_id')
                .eq('id', userMessage.thread_id)
                .single();

            if (error || !thread) {
                console.error('Error fetching thread:', error);
                return;
            }

            // For now, just create a simple response
            // In a real implementation, you would call your AI generation service here
            const characterResponse: Omit<Message, 'id' | 'created_at'> = {
                thread_id: userMessage.thread_id,
                sender_type: 'character',
                content: `Hello! This is an auto-response to: "${userMessage.content}"`
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
