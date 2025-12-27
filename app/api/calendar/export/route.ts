import { NextRequest, NextResponse } from 'next/server';

interface CalendarEvent {
    courseName: string;
    type: 'lecture' | 'tutorial';
    day: string; // 'Mon', 'Tue', etc.
    startTime: number; // minutes from midnight
    endTime: number; // minutes from midnight
}

interface ExportRequest {
    accessToken: string;
    events: CalendarEvent[];
    termStart: string; // ISO date string
    termEnd: string; // ISO date string
}

// Map day names to RRULE BYDAY values
const dayToRRule: Record<string, string> = {
    'Mon': 'MO',
    'Tue': 'TU',
    'Wed': 'WE',
    'Thu': 'TH',
    'Fri': 'FR',
    'Sat': 'SA',
    'Sun': 'SU',
};

// Map day names to day offsets (0 = Sunday, 1 = Monday, etc.)
const dayToOffset: Record<string, number> = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6,
};

function minutesToTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

function getFirstOccurrence(termStart: string, day: string): string {
    // Parse the date string manually to avoid timezone issues
    // termStart is in "YYYY-MM-DD" format
    const [year, month, dayOfMonth] = termStart.split('-').map(Number);

    // Create date in local timezone (month is 0-indexed in JS)
    const startDate = new Date(year, month - 1, dayOfMonth);
    const targetDay = dayToOffset[day];
    const currentDay = startDate.getDay();

    // Calculate days until the target day
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) {
        daysUntil += 7;
    }

    const firstOccurrence = new Date(startDate);
    firstOccurrence.setDate(startDate.getDate() + daysUntil);

    // Format as YYYY-MM-DD manually to avoid timezone shifts
    const y = firstOccurrence.getFullYear();
    const m = String(firstOccurrence.getMonth() + 1).padStart(2, '0');
    const d = String(firstOccurrence.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export async function POST(request: NextRequest) {
    try {
        const body: ExportRequest = await request.json();
        const { accessToken, events, termStart, termEnd } = body;

        if (!accessToken || !events || !termStart || !termEnd) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Format term end date for RRULE (YYYYMMDD format)
        const termEndDate = new Date(termEnd);
        const untilDate = termEndDate.toISOString().split('T')[0].replace(/-/g, '');

        const createdEvents: string[] = [];
        const errors: string[] = [];

        for (const event of events) {
            const rRuleDay = dayToRRule[event.day];
            if (!rRuleDay) {
                errors.push(`Invalid day: ${event.day}`);
                continue;
            }

            // Get the first occurrence of this day on or after term start
            const firstDate = getFirstOccurrence(termStart, event.day);

            const eventTitle = `${event.courseName} (${event.type === 'tutorial' ? 'Tutorial' : 'Lecture'})`;

            const calendarEvent = {
                summary: eventTitle,
                start: {
                    dateTime: `${firstDate}T${minutesToTimeString(event.startTime)}`,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                    dateTime: `${firstDate}T${minutesToTimeString(event.endTime)}`,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                recurrence: [
                    `RRULE:FREQ=WEEKLY;BYDAY=${rRuleDay};UNTIL=${untilDate}T235959Z`
                ],
                colorId: event.type === 'tutorial' ? '7' : '9', // Peacock for tutorials, Grape for lectures
            };

            try {
                const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(calendarEvent),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Failed to create event:', errorData);
                    errors.push(`Failed to create ${eventTitle}: ${response.status}`);
                } else {
                    createdEvents.push(eventTitle);
                }
            } catch (err) {
                console.error('Error creating event:', err);
                errors.push(`Error creating ${eventTitle}`);
            }
        }

        return NextResponse.json({
            success: true,
            created: createdEvents.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        console.error('Export error:', err);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
