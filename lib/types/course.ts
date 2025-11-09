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
}

export interface CourseGroup {
    id: string;            // e.g., "math-electives"
    name?: string;         // e.g., "Math Electives"
    courses: CourseShape[];
    minSelect?: number;    // choose at least N courses from this group
    maxSelect?: number;    // choose at most N courses from this group
}

// Global constraints across all groups
export interface GlobalConstraints {
    minCourses?: number;   // e.g., select at least 4 courses total
    maxCourses?: number;   // e.g., select at most 6 courses total
    blockedDays?: Day[];
}

export interface CourseShape {
    id: string;            // e.g., "MATH101"
    name?: string;         // e.g., "Calculus I"
    sections: CourseSection[];  // List of all available sections for this course
    required: boolean;    // if true, this course MUST be selected
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
            times: { ...s.times },  // shallow copy of single timeslot
            tutorials: s.tutorials.map(t => ({
                ...t,
                times: { ...t.times }  // shallow copy of associated tutorial timeslot
            }))
        }));
        this.required = shape.required;
        this.validate();
    }

    // Check if this course is selected (at least one section + required tutorial selected)
    isSelected(selectedIds: Set<string>): boolean {
        for (const sec of this.sections) {
            if (!selectedIds.has(sec.id)) continue;

            // If section requires tutorial, at least one tutorial must be selected
            if (sec.hasTutorial) {
                const hasSelectedTutorial = sec.tutorials.some(tut => selectedIds.has(tut.id));
                if (!hasSelectedTutorial) continue;
            }

            return true; // Found a valid section selection
        }
        return false;
    }

    // Count how many courses are selected
    static countSelected(courses: Course[], selectedIds: Set<string>): number {
        return courses.filter(c => c.isSelected(selectedIds)).length;
    }

    // Check if two timeslots conflict
    static timeSlotsConflict(a: TimeSlot, b: TimeSlot): boolean {
        const sharedDays = a.days.filter(day => b.days.includes(day));
        if (sharedDays.length === 0) return false;

        // Check if times overlap on shared days
        return a.startTime < b.endTime && b.startTime < a.endTime;
    }

    private validate() {
        if (!this.id) throw new Error('Course must have an id');

        for (const sec of this.sections) {
            if (!sec.id) throw new Error(`Section missing id in course ${this.id}`);

            // Validate section timeslot
            const t = sec.times;
            if (t.endTime <= t.startTime) {
                throw new Error(`Invalid timeslot in ${this.id}/${sec.id}`);
            }
            if (t.days.length === 0) {
                throw new Error(`Timeslot must have at least one day in ${this.id}/${sec.id}`);
            }

            // Validate tutorial requirements
            if (sec.hasTutorial && sec.tutorials.length === 0) {
                throw new Error(`Section ${sec.id} in course ${this.id} requires tutorial but none provided`);
            }

            // Validate tutorials
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