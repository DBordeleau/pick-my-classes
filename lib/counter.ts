import { Redis } from '@upstash/redis';

// Initialize Redis client using Vercel KV environment variables
const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
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
