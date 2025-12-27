import { NextResponse } from 'next/server';
import { incrementGenerationCount } from '@/lib/counter';

// Increments the timetable generation count
export async function POST() {
    try {
        const count = await incrementGenerationCount();
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error incrementing generation count:', error);
        // Don't fail the request if tracking fails - it's not critical
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }
}
