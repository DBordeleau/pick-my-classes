/*
    Uses backtracking to generate all valid timetables based on the provided input.
    Each valid timetable is a combination of selected course sections and their associated tutorials.
*/

import { Course, TimetableInput, TimeSlot, CourseSection, TutorialSection } from './types/course';

export interface TimetableConfiguration {
    selectedSectionIds: Set<string>;  // all section + tutorial IDs in this timetable
    courses: Map<string, SelectedCourse>;  // courseId -> selected section
}

export interface SelectedCourse {
    courseId: string;
    courseName?: string;
    sectionId: string;
    sectionSuffix?: string;
    tutorialId?: string;
    sectionTime: TimeSlot;
    tutorialTime?: TimeSlot;
}

export class TimetableGenerator {
    private courses: Course[];
    private input: TimetableInput;

    constructor(input: TimetableInput) {
        this.input = input;
        // Flatten all courses from all groups into a single list and deduplicate by course ID (if a course is in multiple groups) to prevent duplicate timetables
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
        // Check if we've exceeded maxCourses
        const actualSelectedCount = Array.from(selectedCourses.values()).filter(c => c !== null).length;
        const gc = this.input.globalConstraints;
        if (gc?.maxCourses !== undefined && actualSelectedCount > gc.maxCourses) {
            return; // Prune this branch
        }

        // Base case: we've processed every course
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

        const nextCourse = this.courses.find(c => !selectedCourses.has(c.id));
        if (!nextCourse) return;

        // Case 1: Skip this course (only if not required)
        if (!nextCourse.required) {
            const newSelectedCourses = new Map(selectedCourses);
            newSelectedCourses.set(nextCourse.id, null as any); // Mark as processed but not selected
            this.backtrack(selectedIds, newSelectedCourses, results);
        }

        // Case 2: Try each section of this course
        // But only if we haven't already hit maxCourses
        if (gc?.maxCourses === undefined || actualSelectedCount < gc.maxCourses) {
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
                            sectionSuffix: section.suffix,
                            tutorialId: tutorial.id,
                            sectionTime: section.times,
                            tutorialTime: tutorial.times
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
                        sectionId: section.id,
                        sectionSuffix: section.suffix,
                        sectionTime: section.times
                    });

                    this.backtrack(newSelectedIds, newSelectedCourses, results);
                }
            }
        }
    }

    // Helper function to check if a new timeslot conflicts with current selections or blocked timeslots
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

        // Check conflicts with blocked timeslots
        const blockedTimeslots = this.input.globalConstraints?.blockedTimeslots || [];
        for (const blocked of blockedTimeslots) {
            if (Course.timeslotConflictsWithBlocked(newSlot, blocked)) {
                return true;
            }
        }

        return false;
    }

    private isValidConfiguration(selectedIds: Set<string>, selectedCourses: Map<string, SelectedCourse>): boolean {
        // Filter out skipped courses (null values) when counting
        const actualSelectedCourses = Array.from(selectedCourses.values()).filter(c => c !== null);
        const numSelected = actualSelectedCourses.length;

        // Check global constraints
        const gc = this.input.globalConstraints;
        if (gc) {
            if (gc.minCourses !== undefined && numSelected < gc.minCourses) return false;
            if (gc.maxCourses !== undefined && numSelected > gc.maxCourses) return false;
        }

        // Check required courses
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

export function generateTimetables(input: TimetableInput): TimetableConfiguration[] {
    const generator = new TimetableGenerator(input);
    return generator.generate();
}