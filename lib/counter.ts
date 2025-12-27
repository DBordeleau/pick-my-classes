import { Redis } from '@upstash/redis';

// Initialize Redis client 
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const COUNTER_KEY = 'timetable-generations';

/**
 * Increments the timetable generation counter and returns the new count.
 */
export async function incrementGenerationCount(): Promise<number> {
    return await redis.incr(COUNTER_KEY);
}

/**
 * Gets the current timetable generation count.
 */
export async function getGenerationCount(): Promise<number> {
    return (await redis.get<number>(COUNTER_KEY)) ?? 0;
}
