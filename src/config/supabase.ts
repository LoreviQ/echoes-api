import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Set Config
export const SUPABASE_CONFIG = {
    URL: process.env.SUPABASE_URL || '',
    KEY: process.env.SUPABASE_ADMIN_KEY || '',
    AVATAR_BUCKET: "character-avatars",
    BANNER_BUCKET: "character-banners",
}



if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.KEY) {
    console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY);

type DatabaseChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Subscribe to changes on a specific table
 * @param {string} tableName - The name of the table to subscribe to
 * @param {DatabaseChangeEvent} event - The event to listen for ('INSERT', 'UPDATE', 'DELETE', or '*')
 * @param {Function} callback - The callback function to execute when an event occurs
 * @returns {RealtimeChannel} - The subscription channel
 */
export const subscribeToTable = (
    tableName: string,
    event: DatabaseChangeEvent,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
): RealtimeChannel => {
    return supabase
        .channel(`${tableName}-changes`)
        .on(
            'postgres_changes' as any, // Type assertion any due to current type limitations
            {
                event,
                schema: 'public',
                table: tableName
            },
            callback
        )
        .subscribe();
};

export default supabase; 