import { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js';

import { type MessageSchema } from 'echoes-shared';

import { subscribeToTable } from '@/config/supabase';
import supabase from '@/config/supabase';
import { generateMessageResponse } from '@/ai_generation/content';

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

        const message: MessageSchema = {
            id: payloadData.id,
            thread_id: payloadData.thread_id,
            sender_type: payloadData.sender_type,
            content: payloadData.content,
            created_at: payloadData.created_at
        };

        // Only respond to user messages
        if (message.sender_type === 'user') {
            console.log(`New user message received in thread ${message.thread_id}`);
            await this.generateAndSaveResponse(message);
        }
    }

    /**
     * Generate and save a character response to a user message
     */
    private async generateAndSaveResponse(userMessage: MessageSchema) {
        try {
            // Use the AI service to generate a response
            const generatedResponse = await generateMessageResponse(userMessage.thread_id);

            if (!generatedResponse) {
                console.error('Failed to generate response');
                return;
            }

            // Create and save the response
            const characterResponse: Omit<MessageSchema, 'id' | 'created_at'> = {
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
