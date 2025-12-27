/**
 * Test Data Builders for Timetable Generator Tests
 * 
 * These helper functions reduce duplication and make tests more readable.
 */

import {
    CourseShape,
    CourseSection,
    TutorialSection,
    CourseGroup,
    TimeSlot,
    Day,
    BlockedTimeslot,
    GlobalConstraints,
    TimetableInput
} from '../types/course';

// Time Slot Builders
export function createTimeSlot(overrides: Partial<TimeSlot> = {}): TimeSlot {
    return {
        days: ['Mon'] as Day[],
        startTime: 540, // 9:00
        endTime: 630,   // 10:30
        ...overrides
    };
}

// Helper to convert hours:minutes to minutes from midnight
export function toMinutes(hours: number, minutes: number = 0): number {
    return hours * 60 + minutes;
}

// Tutorial Builder
export function createTutorial(overrides: Partial<TutorialSection> = {}): TutorialSection {
    return {
        id: 'tutorial-1',
        times: createTimeSlot({ days: ['Fri'], startTime: 600, endTime: 660 }),
        name: 'Tutorial',
        ...overrides
    };
}

// Section Builder
export function createSection(overrides: Partial<CourseSection> = {}): CourseSection {
    return {
        id: 'section-a',
        suffix: 'A',
        times: createTimeSlot(),
        hasTutorial: false,
        tutorials: [],
        ...overrides
    };
}

// Create a section with a tutorial
export function createSectionWithTutorial(
    sectionOverrides: Partial<CourseSection> = {},
    tutorialOverrides: Partial<TutorialSection> = {}
): CourseSection {
    const tutorial = createTutorial(tutorialOverrides);
    return createSection({
        hasTutorial: true,
        tutorials: [tutorial],
        ...sectionOverrides
    });
}

// Course Builder
export function createCourse(overrides: Partial<CourseShape> = {}): CourseShape {
    return {
        id: 'course-1',
        name: 'Test Course',
        required: false,
        sections: [createSection()],
        ...overrides
    };
}

// Group Builder
export function createGroup(overrides: Partial<CourseGroup> = {}): CourseGroup {
    return {
        id: 'group-1',
        name: 'Test Group',
        courses: [],
        minSelect: 1,
        maxSelect: 1,
        ...overrides
    };
}

// Blocked Timeslot Builders
export function createBlockedTimeslot(overrides: Partial<BlockedTimeslot> = {}): BlockedTimeslot {
    return {
        id: 'blocked-1',
        type: 'between',
        days: ['Mon'] as Day[],
        startTime: 480,
        endTime: 600,
        ...overrides
    };
}

// Block all times before a specific time
export function blockBefore(endTime: number, days: Day[] = []): BlockedTimeslot {
    return {
        id: `blocked-before-${endTime}`,
        type: 'before',
        days,
        endTime
    };
}

// Block all times after a specific time
export function blockAfter(startTime: number, days: Day[] = []): BlockedTimeslot {
    return {
        id: `blocked-after-${startTime}`,
        type: 'after',
        days,
        startTime
    };
}

// Block a specific time range
export function blockBetween(startTime: number, endTime: number, days: Day[] = []): BlockedTimeslot {
    return {
        id: `blocked-between-${startTime}-${endTime}`,
        type: 'between',
        days,
        startTime,
        endTime
    };
}

// Input Builder
export function createInput(
    groups: CourseGroup[],
    globalConstraints?: Partial<GlobalConstraints>
): TimetableInput {
    return {
        groups,
        globalConstraints: {
            minCourses: 1,
            maxCourses: 5,
            blockedTimeslots: [],
            ...globalConstraints
        }
    };
}

// Result Helpers

// Extract course IDs from a timetable result for easy assertion
export function extractCourseIds(result: { courses: Map<string, { courseId: string } | null> }): string[] {
    return Array.from(result.courses.values())
        .filter((c): c is { courseId: string } => c !== null)
        .map(c => c.courseId)
        .sort();
}

// Check if a specific course/section combination exists in results
export function hasSelection(
    result: { courses: Map<string, { courseId: string; sectionId: string; tutorialId?: string } | null> },
    courseId: string,
    sectionId?: string,
    tutorialId?: string
): boolean {
    const selection = result.courses.get(courseId);
    if (!selection) return false;
    if (sectionId && selection.sectionId !== sectionId) return false;
    if (tutorialId && selection.tutorialId !== tutorialId) return false;
    return true;
}
