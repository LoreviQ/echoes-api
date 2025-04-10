import { database as databaseActual } from 'echoes-shared';
import { memoizeWithTTL } from '@/utils/memoize';

// Define the cache TTL (Time To Live) in milliseconds
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * A cached version of the database functions from echoes-shared.
 * Results are memoized with a 5-minute TTL.
 */
export const database = {
    getThread: memoizeWithTTL(databaseActual.getThread, CACHE_TTL),
    getMessages: memoizeWithTTL(databaseActual.getMessages, CACHE_TTL),
    getCharacter: memoizeWithTTL(databaseActual.getCharacter, CACHE_TTL),
}
