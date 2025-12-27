/*
    Uses backtracking to generate all valid timetables based on the provided input.
    Each valid timetable is a combination of selected course sections and their associated tutorials.
*/

import { Course, TimetableInput, TimeSlot } from './types/course';

// Represents a complete, valid timetable configuration
export interface TimetableConfiguration {
    selectedSectionIds: Set<string>;  // all section + tutorial IDs in this timetable
    courses: Map<string, SelectedCourse>;  // courseId -> selected section details
}

// Represents a selected course with its specific section and optional tutorial
export interface SelectedCourse {
    courseId: string;
    courseName?: string;
    sectionId: string;
    sectionSuffix?: string;
    tutorialId?: string;
    sectionTime: TimeSlot;
    tutorialTime?: TimeSlot;
}

/**
 * Generates all valid timetable configurations using a backtracking algorithm.
 * 
 * The algorithm works by:
 * 1. Processing courses one at a time in a fixed order
 * 2. For each course, trying all possible sections (and tutorials if needed)
 * 3. Skipping the course if it's not required
 * 4. Backtracking when constraints are violated
 * 5. Collecting all valid complete configurations
 */
export class TimetableGenerator {
    private courses: Course[];
    private input: TimetableInput;

    /**
     * Initializes the timetable generator with the given input.
     * 
     * Flattens all courses from all groups into a single deduplicated list.
     * Deduplication is critical because a course might appear in multiple groups.
     * 
     * @param input - The TimetableInput object containing course groups and global constraints
     */
    constructor(input: TimetableInput) {
        this.input = input;
        // Flatten all courses from all groups into a single list and deduplicate by course ID to prevent duplicate timetables
        const courseMap = new Map<string, Course>();
        for (const group of input.groups) {
            for (const courseShape of group.courses) {
                if (!courseMap.has(courseShape.id)) {
                    courseMap.set(courseShape.id, new Course(courseShape));
                }
            }
        }
        this.courses = Array.from(courseMap.values());
    }

    /**
     * Generates all valid timetable configurations.
     * 
     * Initiates the backtracking algorithm with an empty selection and returns
     * all configurations that satisfy the constraints.
     * 
     * @returns Array of all valid timetable configurations
     */
    generate(): TimetableConfiguration[] {
        const results: TimetableConfiguration[] = [];

        // Start recursive backtracking with empty selection
        this.backtrack(new Set<string>(), new Map<string, SelectedCourse>(), results);

        return results;
    }

    /**
     * Recursive backtracking algorithm to generate all valid timetables.
     * 
     * Algorithm overview:
     * 1. Early pruning: Stop if we've exceeded maxCourses
     * 2. Base case: If all courses are processed, validate and add if valid
     * 3. Recursive case: For the next unprocessed course, try:
     *    a. Skipping it (if not required)
     *    b. Selecting each of its sections (with tutorials if needed)
     * 4. Only recurse if no time conflicts with already selected sections
     * 
     * The algorithm uses immutable state (new Sets/Maps) to enable backtracking.
     * 
     * @param selectedIds - Set of section and tutorial IDs currently selected
     * @param selectedCourses - Map of courseId to selected section details (null = skipped)
     * @param results - Accumulator array for valid configurations
     */
    private backtrack(
        selectedIds: Set<string>,
        selectedCourses: Map<string, SelectedCourse>,
        results: TimetableConfiguration[]
    ) {
        // Early pruning: stop if we've exceeded maxCourses
        const actualSelectedCount = Array.from(selectedCourses.values()).filter(c => c !== null).length;
        const gc = this.input.globalConstraints;
        if (gc?.maxCourses !== undefined && actualSelectedCount > gc.maxCourses) {
            return; // Prune this branch
        }

        // Base case: we've processed every course (either selected or skipped)
        if (selectedCourses.size === this.courses.length) {
            // Validate this configuration based on global and group constraints
            if (this.isValidConfiguration(selectedIds, selectedCourses)) {
                results.push({
                    selectedSectionIds: new Set(selectedIds),
                    courses: new Map(selectedCourses)
                });
            }
            return;
        }

        // Find the next unprocessed course
        const nextCourse = this.courses.find(c => !selectedCourses.has(c.id));
        if (!nextCourse) return;

        // Case 1: Skip this course (only if not required)
        // Mark as processed but not selected by storing null
        if (!nextCourse.required) {
            const newSelectedCourses = new Map(selectedCourses);
            newSelectedCourses.set(nextCourse.id, null as unknown as SelectedCourse);
            this.backtrack(selectedIds, newSelectedCourses, results);
        }

        // Case 2: Try selecting each section of this course
        // Only attempt if we haven't already hit maxCourses
        if (gc?.maxCourses === undefined || actualSelectedCount < gc.maxCourses) {
            for (const section of nextCourse.sections) {
                // Skip section if it has time conflicts
                if (this.hasTimeConflict(section.times, selectedIds)) continue;

                // If section requires a tutorial, try each tutorial option
                if (section.hasTutorial) {
                    for (const tutorial of section.tutorials) {
                        // Skip tutorial if it has time conflicts
                        if (this.hasTimeConflict(tutorial.times, selectedIds)) continue;

                        // Create new state with section + tutorial selected
                        const newSelectedIds = new Set(selectedIds);
                        newSelectedIds.add(section.id);
                        newSelectedIds.add(tutorial.id);

                        const newSelectedCourses = new Map(selectedCourses);
                        newSelectedCourses.set(nextCourse.id, {
                            courseId: nextCourse.id,
                            courseName: nextCourse.name,
                            sectionId: section.id,
                            sectionSuffix: section.suffix,
                            tutorialId: tutorial.id,
                            sectionTime: section.times,
                            tutorialTime: tutorial.times
                        });

                        // Recurse with this selection
                        this.backtrack(newSelectedIds, newSelectedCourses, results);
                    }
                } else {
                    // No tutorial needed, just select the course section
                    const newSelectedIds = new Set(selectedIds);
                    newSelectedIds.add(section.id);

                    const newSelectedCourses = new Map(selectedCourses);
                    newSelectedCourses.set(nextCourse.id, {
                        courseId: nextCourse.id,
                        courseName: nextCourse.name,
                        sectionId: section.id,
                        sectionSuffix: section.suffix,
                        sectionTime: section.times
                    });

                    // Recurse with this selection
                    this.backtrack(newSelectedIds, newSelectedCourses, results);
                }
            }
        }
    }

    /**
     * Checks if a new timeslot conflicts with any already selected sections/tutorials
     * or with blocked timeslots from global constraints.
     * 
     * This is called during backtracking to determine if a section or tutorial can be
     * added to the current selection without creating scheduling conflicts.
     * 
     * @param newSlot - The timeslot of the course/tutorial section to check
     * @param selectedIds - Set of currently selected section and tutorial IDs
     * @returns true if there's a conflict, false otherwise
     */
    private hasTimeConflict(newSlot: TimeSlot, selectedIds: Set<string>): boolean {
        for (const course of this.courses) {
            for (const section of course.sections) {
                if (selectedIds.has(section.id)) {
                    if (Course.timeSlotsConflict(newSlot, section.times)) return true;
                }

                for (const tutorial of section.tutorials) {
                    if (selectedIds.has(tutorial.id)) {
                        if (Course.timeSlotsConflict(newSlot, tutorial.times)) return true;
                    }
                }
            }
        }

        // Check conflicts with blocked timeslots from global constraints
        const blockedTimeslots = this.input.globalConstraints?.blockedTimeslots || [];
        for (const blocked of blockedTimeslots) {
            if (Course.timeslotConflictsWithBlocked(newSlot, blocked)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validates a generated timetable configuration before adding it to result array.
     * 
     * Called when all courses have been processed.
     * Checks three types of constraints:
     * 1. Global constraints (min/max total courses)
     * 2. Required course constraints (all required courses must be selected)
     * 3. Group constraints (min/max courses per group)
     * 
     * Note: Time conflicts are checked during backtracking, no need to check here.
     * 
     * @param selectedIds - Set of selected section and tutorial IDs
     * @param selectedCourses - Map of courseId to selection details
     * @returns true if the configuration satisfies all constraints, false otherwise
     */
    private isValidConfiguration(selectedIds: Set<string>, selectedCourses: Map<string, SelectedCourse>): boolean {
        // Filter out skipped courses when counting
        const actualSelectedCourses = Array.from(selectedCourses.values()).filter(c => c !== null);
        const numSelected = actualSelectedCourses.length;

        // Check global constraints (min/max total courses)
        const gc = this.input.globalConstraints;
        if (gc) {
            if (gc.minCourses !== undefined && numSelected < gc.minCourses) return false; // Too few courses selected
            if (gc.maxCourses !== undefined && numSelected > gc.maxCourses) return false; // Too many courses selected
        }

        // Check that all required courses are selected
        for (const course of this.courses) {
            if (course.required && !course.isSelected(selectedIds)) return false; // Required course not selected
        }

        // Check group constraints (min/max courses per group)
        for (const group of this.input.groups) {
            const groupCourses = group.courses.map(c => new Course(c));
            const numSelectedInGroup = Course.countSelected(groupCourses, selectedIds);

            if (group.minSelect !== undefined && numSelectedInGroup < group.minSelect) return false; // Too few from group
            if (group.maxSelect !== undefined && numSelectedInGroup > group.maxSelect) return false; // Too many from group
        }

        return true;
    }

    private getUnprocessedCourseCount(selectedCourses: Map<string, SelectedCourse>): number {
        return this.courses.filter(c => !selectedCourses.has(c.id)).length;
    }
}

/**
 * API function to generate all valid timetable configurations.
 * Called by TimetableBuilder component.
 * 
 * @param input - The timetable input containing course groups and global constraints
 * @returns Array of all valid timetable configurations to be displayed in front end
 */
export function generateTimetables(input: TimetableInput): TimetableConfiguration[] {
    const generator = new TimetableGenerator(input);
    return generator.generate();
}