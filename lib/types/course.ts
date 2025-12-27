export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// Each TimeSlot represents a single recurring time block on specific days
export interface TimeSlot {
    days: Day[]; // e.g, ["Tue", "Thu"]
    startTime: number; // in minutes from 00:00
    endTime: number; // in minutes from 00:00

}

export interface TutorialSection {
    id: string;
    times: TimeSlot;
    name?: string;
}

export interface CourseSection {
    id: string;            // unique ID like "COMP3000-B"
    times: TimeSlot;
    hasTutorial: boolean;  // if true, student MUST pick one tutorial
    tutorials: TutorialSection[];  // empty if hasTutorial is false
    suffix?: string;
    isCollapsed?: boolean; // UI state: whether section is collapsed
}

export interface CourseGroup {
    id: string;            // e.g., "math-electives"
    name?: string;         // e.g., "Math Electives"
    courses: CourseShape[];
    minSelect?: number;    // choose at least N courses from this group
    maxSelect?: number;    // choose at most N courses from this group
}

export type BlockedTimeslotType = "before" | "between" | "after";

export interface BlockedTimeslot {
    id: string;
    type: BlockedTimeslotType;
    days: Day[]; // can include special "Any" value handled separately
    startTime?: number; // used for "between" and "after"
    endTime?: number; // used for "before" and "between"
}

// Global constraints across all groups
export interface GlobalConstraints {
    minCourses?: number;
    maxCourses?: number;
    blockedTimeslots?: BlockedTimeslot[];
}

export interface CourseShape {
    id: string;            // e.g., "MATH101"
    name?: string;         // e.g., "Calculus I"
    sections: CourseSection[];  // List of all available sections for this course
    required: boolean;    // if true, this course MUST be selected
    isCollapsed?: boolean; // UI state: whether course is collapsed
}

// The complete input for timetable generation
export interface TimetableInput {
    groups: CourseGroup[];
    globalConstraints?: GlobalConstraints;
}

export class Course implements CourseShape {
    readonly id: string;
    readonly name?: string;
    readonly sections: CourseSection[];
    readonly required: boolean;

    constructor(shape: CourseShape) {
        this.id = shape.id;
        this.name = shape.name;
        this.sections = shape.sections.map(s => ({
            ...s,
            times: { ...s.times },
            tutorials: s.tutorials.map(t => ({
                ...t,
                times: { ...t.times }
            }))
        }));
        this.required = shape.required;
        this.validate();
    }

    /**
     * Checks if this course is properly selected in the given timetable configuration.
     * A course is considered selected if at least one of its sections is in the selectedIds set,
     * and if that section requires a tutorial, at least one tutorial must also be selected.
     * 
     * @param selectedIds - Set of all selected section and tutorial IDs in the timetable
     * @returns true if the course has a valid section (with tutorial if needed) selected, false otherwise
     */
    isSelected(selectedIds: Set<string>): boolean {
        for (const sec of this.sections) {
            if (!selectedIds.has(sec.id)) continue;

            if (sec.hasTutorial) {
                const hasSelectedTutorial = sec.tutorials.some(tut => selectedIds.has(tut.id));
                if (!hasSelectedTutorial) continue;
            }

            return true;
        }
        return false;
    }

    /**
     * Counts how many courses from the given list are selected in the timetable.
     * Uses the isSelected method to determine if each course is selected.
     * 
     * @param courses - Array of courses to check
     * @param selectedIds - Set of all selected section and tutorial IDs in the timetable
     * @returns The number of courses that have at least one valid section selected
     */
    static countSelected(courses: Course[], selectedIds: Set<string>): number {
        return courses.filter(c => c.isSelected(selectedIds)).length;
    }

    /**
     * Checks if two timeslots have a scheduling conflict.
     * Timeslots conflict if they share at least one day and their time ranges overlap.
     * 
     * @param a - First timeslot to compare
     * @param b - Second timeslot to compare
     * @returns true if the timeslots conflict, false otherwise
     */
    static timeSlotsConflict(a: TimeSlot, b: TimeSlot): boolean {
        const sharedDays = a.days.filter(day => b.days.includes(day));
        if (sharedDays.length === 0) return false;

        return a.startTime < b.endTime && b.startTime < a.endTime;
    }

    /**
     * Checks if a timeslot conflicts with a blocked timeslot constraint.
     * Blocked timeslots represent user preferences to avoid classes at certain times and are part of global constraints.
     * 
     * Three types of blocked timeslots:
     * - "before": Blocks all times before a specified endTime
     * - "after": Blocks all times after a specified startTime  
     * - "between": Blocks a specific time range
     * 
     * If blocked.days is empty, the block applies to all days.
     * 
     * @param slot - The timeslot to check (e.g., a course section's time)
     * @param blocked - The blocked timeslot constraint to check against
     * @returns true if the slot violates the blocked constraint, false otherwise
     */
    static timeslotConflictsWithBlocked(slot: TimeSlot, blocked: BlockedTimeslot): boolean {
        // Check if any day in the slot matches the blocked days (or if blocked applies to "any" day)
        const blockedDays = blocked.days.length === 0 ? slot.days : blocked.days;
        const sharedDays = slot.days.filter(day => blockedDays.includes(day));
        if (sharedDays.length === 0) return false;

        // Check time overlap based on blocked type
        switch (blocked.type) {
            case "before":
                // Conflict if slot starts before the blocked end time
                return slot.startTime < (blocked.endTime ?? 0);

            case "after":
                // Conflict if slot ends after the blocked start time
                return slot.endTime > (blocked.startTime ?? 1440);

            case "between":
                // Conflict if slot overlaps with the blocked time range
                return slot.startTime < (blocked.endTime ?? 1440) &&
                    slot.endTime > (blocked.startTime ?? 0);

            default:
                return false;
        }
    }

    /**
     * Validates the course data structure to ensure all required fields are present
     * and data is consistent. Throws an error if validation fails.
     * 
     * Validation checks:
     * - Course has an id
     * - All sections have ids and valid timeslots (end > start, at least one day)
     * - Sections requiring tutorials have at least one tutorial defined
     * - All tutorials have ids and valid timeslots
     * 
     * @throws Error if any validation check fails
     */
    private validate() {
        if (!this.id) throw new Error('Course must have an id');

        for (const sec of this.sections) {
            if (!sec.id) throw new Error(`Section missing id in course ${this.id}`);

            const t = sec.times;
            if (t.endTime <= t.startTime) {
                throw new Error(`Invalid timeslot in ${this.id}/${sec.id}`);
            }
            if (t.days.length === 0) {
                throw new Error(`Timeslot must have at least one day in ${this.id}/${sec.id}`);
            }

            if (sec.hasTutorial && sec.tutorials.length === 0) {
                throw new Error(`Section ${sec.id} in course ${this.id} requires tutorial but none provided`);
            }

            for (const tut of sec.tutorials) {
                if (!tut.id) throw new Error(`Tutorial missing id in ${this.id}/${sec.id}`);
                const tt = tut.times;
                if (tt.endTime <= tt.startTime) {
                    throw new Error(`Invalid timeslot in tutorial ${this.id}/${sec.id}/${tut.id}`);
                }
                if (tt.days.length === 0) {
                    throw new Error(`Tutorial timeslot must have at least one day`);
                }
            }
        }
    }
}