/*
    Uses backtracking to generate all valid timetables based on the provided input.
    Each valid timetable is a combination of selected course sections and their associated tutorials.
*/

import { Course, TimetableInput, TimeSlot } from './types/course';

export interface TimetableConfiguration {
    selectedSectionIds: Set<string>;  // all section + tutorial IDs in this timetable
    courses: Map<string, SelectedCourse>;  // courseId -> selected section
}

export interface SelectedCourse {
    courseId: string;
    courseName?: string;
    sectionId: string;
    tutorialId?: string; // present if a tutorial was selected
}

export class TimetableGenerator {
    private courses: Course[];
    private input: TimetableInput;

    constructor(input: TimetableInput) {
        this.input = input;
        // Flatten all courses from all groups into a single list
        this.courses = input.groups.flatMap(g =>
            g.courses.map(c => new Course(c))
        );
    }

    // Generates all valid timetables
    generate(): TimetableConfiguration[] {
        const results: TimetableConfiguration[] = [];

        // Start recursive backtracking with empty selection
        this.backtrack(new Set<string>(), new Map<string, SelectedCourse>(), results);

        return results;
    }

    private backtrack(
        selectedIds: Set<string>,
        selectedCourses: Map<string, SelectedCourse>,
        results: TimetableConfiguration[]
    ) {
        // Check if we've processed all courses (base case)
        if (selectedCourses.size + this.getUnprocessedCourseCount(selectedCourses) === this.courses.length) {
            // Validate this configuration based on global and group constraints
            if (this.isValidConfiguration(selectedIds, selectedCourses)) {
                results.push({
                    selectedSectionIds: new Set(selectedIds),
                    courses: new Map(selectedCourses)
                });
            }
            return;
        }

        const nextCourse = this.courses.find(c => !selectedCourses.has(c.id));
        if (!nextCourse) return;

        // Case 1: Skip this course (if not required)
        if (!nextCourse.required) {
            this.backtrack(selectedIds, selectedCourses, results);
        }

        // Case 2: Try each section of this course
        for (const section of nextCourse.sections) {
            // Check if section conflicts with current selection
            if (this.hasTimeConflict(section.times, selectedIds)) continue;

            // If section needs tutorial, try each tutorial
            if (section.hasTutorial) {
                for (const tutorial of section.tutorials) {
                    if (this.hasTimeConflict(tutorial.times, selectedIds)) continue;

                    // Add section + tutorial to selection
                    const newSelectedIds = new Set(selectedIds);
                    newSelectedIds.add(section.id);
                    newSelectedIds.add(tutorial.id);

                    const newSelectedCourses = new Map(selectedCourses);
                    newSelectedCourses.set(nextCourse.id, {
                        courseId: nextCourse.id,
                        courseName: nextCourse.name,
                        sectionId: section.id,
                        tutorialId: tutorial.id
                    });

                    this.backtrack(newSelectedIds, newSelectedCourses, results);
                }
            } else {
                // No tutorial needed, just add section
                const newSelectedIds = new Set(selectedIds);
                newSelectedIds.add(section.id);

                const newSelectedCourses = new Map(selectedCourses);
                newSelectedCourses.set(nextCourse.id, {
                    courseId: nextCourse.id,
                    courseName: nextCourse.name,
                    sectionId: section.id
                });

                this.backtrack(newSelectedIds, newSelectedCourses, results);
            }
        }
    }

    // Helper function to check if a new timeslot conflicts with current selections
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

        const blockedDays = this.input.globalConstraints?.blockedDays || [];
        const hasBlockedDay = newSlot.days.some(day => blockedDays.includes(day));
        if (hasBlockedDay) return true;

        return false;
    }

    // Validates the current configuration against global and group constraints and adds the configuration if valid
    private isValidConfiguration(selectedIds: Set<string>, selectedCourses: Map<string, SelectedCourse>): boolean {
        const numSelected = selectedCourses.size;

        // Check global constraints
        const gc = this.input.globalConstraints;
        if (gc) {
            if (gc.minCourses !== undefined && numSelected < gc.minCourses) return false;
            if (gc.maxCourses !== undefined && numSelected > gc.maxCourses) return false;
        }

        // Check all required courses are selected
        for (const course of this.courses) {
            if (course.required && !course.isSelected(selectedIds)) return false;
        }

        // Check group constraints
        for (const group of this.input.groups) {
            const groupCourses = group.courses.map(c => new Course(c));
            const numSelectedInGroup = Course.countSelected(groupCourses, selectedIds);

            if (group.minSelect !== undefined && numSelectedInGroup < group.minSelect) return false;
            if (group.maxSelect !== undefined && numSelectedInGroup > group.maxSelect) return false;
        }

        return true;
    }

    private getUnprocessedCourseCount(selectedCourses: Map<string, SelectedCourse>): number {
        return this.courses.filter(c => !selectedCourses.has(c.id)).length;
    }
}

// Helper function to use the generator
export function generateTimetables(input: TimetableInput): TimetableConfiguration[] {
    const generator = new TimetableGenerator(input);
    return generator.generate();
}