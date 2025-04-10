// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

/**
 * Memoizes a function with a time-to-live (TTL) cache.
 * @param fn The function to memoize.
 * @param ttl The time-to-live in milliseconds.
 * @returns The memoized function.
 */
export function memoizeWithTTL<T extends AnyFunction>(fn: T, ttl: number): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cache = new Map<string, CacheEntry<any>>();

    return ((...args: Parameters<T>): ReturnType<T> => {
        // Assume the last argument might be a complex object (like a DB client)
        // and exclude it from the cache key. Only use relevant args for key generation.
        const keyArgs = args.length > 1 ? args.slice(0, -1) : args;
        const key = JSON.stringify(keyArgs);
        const now = Date.now();

        if (cache.has(key)) {
            const entry = cache.get(key)!;
            if (now - entry.timestamp < ttl) {
                return entry.value;
            }
        }

        const result = fn(...args);
        // Handle promises - cache the resolved value
        if (result instanceof Promise) {
            return result.then(resolvedValue => {
                cache.set(key, { value: resolvedValue, timestamp: Date.now() });
                return resolvedValue;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any; // Type assertion needed for Promise return type
        } else {
            cache.set(key, { value: result, timestamp: now });
            return result;
        }
    }) as T;
} 