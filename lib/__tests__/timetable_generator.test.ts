import { describe, it, expect } from '@jest/globals';
import { generateTimetables } from '../timetable_generator';
import {
    createCourse,
    createSection,
    createSectionWithTutorial,
    createTutorial,
    createGroup,
    createInput,
    createTimeSlot,
    blockBefore,
    blockAfter,
    blockBetween,
    toMinutes,
    extractCourseIds,
    hasSelection
} from './test-helpers-util';

describe('TimetableGenerator', () => {
    describe('multiple groups and constraints', () => {
        it('should generate valid timetables with multiple groups and constraints', () => {
            // Core Class Group (3min, 3max)
            const comp2401 = createCourse({
                id: 'comp2401',
                name: 'COMP 2401',
                sections: [
                    createSection({ id: 'comp2401-a', suffix: 'A', times: createTimeSlot({ days: ['Mon', 'Wed'], startTime: 810, endTime: 900 }) }),
                    createSection({ id: 'comp2401-b', suffix: 'B', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 570, endTime: 660 }) }),
                    createSection({ id: 'comp2401-c', suffix: 'C', times: createTimeSlot({ days: ['Fri'], startTime: 780, endTime: 960 }) })
                ]
            });

            const comp2804 = createCourse({
                id: 'comp2804',
                name: 'COMP 2804',
                sections: [
                    createSectionWithTutorial(
                        { id: 'comp2804-a', suffix: 'A', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 510, endTime: 600 }) },
                        { id: 'comp2804-a-tut', times: createTimeSlot({ days: ['Thu'], startTime: 690, endTime: 750 }), name: 'COMP 2804-A Tutorial' }
                    ),
                    createSectionWithTutorial(
                        { id: 'comp2804-b', suffix: 'B', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 960, endTime: 1050 }) },
                        { id: 'comp2804-b-tut', times: createTimeSlot({ days: ['Fri'], startTime: 510, endTime: 570 }), name: 'COMP 2804-B Tutorial' }
                    ),
                    createSectionWithTutorial(
                        { id: 'comp2804-c', suffix: 'C', times: createTimeSlot({ days: ['Wed', 'Fri'], startTime: 870, endTime: 960 }) },
                        { id: 'comp2804-c-tut', times: createTimeSlot({ days: ['Mon'], startTime: 660, endTime: 720 }), name: 'COMP 2804-C Tutorial' }
                    )
                ]
            });

            const comp3000 = createCourse({
                id: 'comp3000',
                name: 'COMP 3000',
                sections: [
                    createSectionWithTutorial(
                        { id: 'comp3000-a', suffix: 'A', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 1020, endTime: 1110 }) },
                        { id: 'comp3000-a-tut', times: createTimeSlot({ days: ['Tue'], startTime: 510, endTime: 570 }), name: 'COMP 3000-A Tutorial' }
                    ),
                    createSectionWithTutorial(
                        { id: 'comp3000-b', suffix: 'B', times: createTimeSlot({ days: ['Mon', 'Wed'], startTime: 930, endTime: 1020 }) },
                        { id: 'comp3000-b-tut', times: createTimeSlot({ days: ['Thu'], startTime: 810, endTime: 870 }), name: 'COMP 3000-B Tutorial' }
                    )
                ]
            });

            // 3rd Year Requirement Group (1min, 2max)
            const comp3005 = createCourse({
                id: 'comp3005',
                name: 'COMP 3005',
                sections: [
                    createSection({ id: 'comp3005-a', suffix: 'A', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 1080, endTime: 1170 }) }),
                    createSection({ id: 'comp3005-b', suffix: 'B', times: createTimeSlot({ days: ['Wed', 'Fri'], startTime: 600, endTime: 690 }) })
                ]
            });

            const comp3008 = createCourse({
                id: 'comp3008',
                name: 'COMP 3008',
                sections: [
                    createSection({ id: 'comp3008-a', suffix: 'A', times: createTimeSlot({ days: ['Wed'], startTime: 540, endTime: 720 }) }),
                    createSection({ id: 'comp3008-b', suffix: 'B', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 1020, endTime: 1110 }) })
                ]
            });

            const comp3803 = createCourse({
                id: 'comp3803',
                name: 'COMP 3803',
                sections: [
                    createSection({ id: 'comp3803-a', suffix: 'A', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 870, endTime: 960 }) }),
                    createSection({ id: 'comp3803-b', suffix: 'B', times: createTimeSlot({ days: ['Mon', 'Wed'], startTime: 600, endTime: 690 }) })
                ]
            });

            const comp3004 = createCourse({
                id: 'comp3004',
                name: 'COMP 3004',
                sections: [
                    createSectionWithTutorial(
                        { id: 'comp3004-a', suffix: 'A', times: createTimeSlot({ days: ['Mon', 'Wed'], startTime: 720, endTime: 810 }) },
                        { id: 'comp3004-a-tut', times: createTimeSlot({ days: ['Wed'], startTime: 870, endTime: 930 }), name: 'COMP 3004-A Tutorial' }
                    ),
                    createSectionWithTutorial(
                        { id: 'comp3004-b', suffix: 'B', times: createTimeSlot({ days: ['Fri'], startTime: 960, endTime: 1140 }) },
                        { id: 'comp3004-b-tut', times: createTimeSlot({ days: ['Mon'], startTime: 510, endTime: 570 }), name: 'COMP 3004-B Tutorial' }
                    )
                ]
            });

            // 4th Year Group (0min, 1max)
            const comp4001 = createCourse({
                id: 'comp4001',
                name: 'COMP 4001',
                sections: [
                    createSection({ id: 'comp4001-a', suffix: 'A', times: createTimeSlot({ days: ['Wed'], startTime: 600, endTime: 780 }) }),
                    createSection({ id: 'comp4001-b', suffix: 'B', times: createTimeSlot({ days: ['Wed', 'Fri'], startTime: 930, endTime: 1020 }) })
                ]
            });

            const comp4009 = createCourse({
                id: 'comp4009',
                name: 'COMP 4009',
                sections: [
                    createSection({ id: 'comp4009-a', suffix: 'A', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: 1050, endTime: 1140 }) }),
                    createSection({ id: 'comp4009-b', suffix: 'B', times: createTimeSlot({ days: ['Mon', 'Wed'], startTime: 750, endTime: 840 }) })
                ]
            });

            const coreGroup = createGroup({
                id: 'core',
                name: 'Core Class Group',
                courses: [comp2401, comp2804, comp3000],
                minSelect: 3,
                maxSelect: 3
            });

            const thirdYearGroup = createGroup({
                id: '3rd-year',
                name: '3rd Year Requirement Group',
                courses: [comp3005, comp3008, comp3803, comp3004],
                minSelect: 1,
                maxSelect: 2
            });

            const fourthYearGroup = createGroup({
                id: '4th-year',
                name: '4th Year Group',
                courses: [comp4001, comp4009],
                minSelect: 0,
                maxSelect: 1
            });

            const input = createInput([coreGroup, thirdYearGroup, fourthYearGroup], {
                minCourses: 4,
                maxCourses: 5,
                blockedTimeslots: []
            });

            const results = generateTimetables(input);

            // Should generate at least one valid timetable
            expect(results.length).toBeGreaterThan(0);

            // Should not have duplicates
            const uniqueConfigs = new Set(
                results.map(result =>
                    Array.from(result.courses.entries())
                        .filter(([, c]) => c !== null)
                        .map(([courseId, c]) => `${courseId}:${c.sectionId}:${c.tutorialId || 'none'}`)
                        .sort()
                        .join('|')
                )
            );
            expect(uniqueConfigs.size).toBe(results.length);

            // Verify the expected timetable exists
            const expectedTimetable = results.find(result =>
                hasSelection(result, 'comp2401', 'comp2401-a') &&
                hasSelection(result, 'comp2804', 'comp2804-b') &&
                hasSelection(result, 'comp3000', 'comp3000-b') &&
                hasSelection(result, 'comp3005', 'comp3005-a')
            );
            expect(expectedTimetable).toBeDefined();

            // Verify all results meet constraints
            results.forEach(result => {
                const courseIds = extractCourseIds(result);

                // Global constraints
                expect(courseIds.length).toBeGreaterThanOrEqual(4);
                expect(courseIds.length).toBeLessThanOrEqual(5);

                // Core group: exactly 3
                const coreCount = courseIds.filter(id => ['comp2401', 'comp2804', 'comp3000'].includes(id)).length;
                expect(coreCount).toBe(3);

                // 3rd year group: 1-2
                const thirdYearCount = courseIds.filter(id => ['comp3005', 'comp3008', 'comp3803', 'comp3004'].includes(id)).length;
                expect(thirdYearCount).toBeGreaterThanOrEqual(1);
                expect(thirdYearCount).toBeLessThanOrEqual(2);

                // 4th year group: 0-1
                const fourthYearCount = courseIds.filter(id => ['comp4001', 'comp4009'].includes(id)).length;
                expect(fourthYearCount).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('blocked timeslots', () => {
        it('should exclude sections that conflict with blocked timeslots', () => {
            const course = createCourse({
                id: 'course-1',
                sections: [
                    createSection({
                        id: 'section-a',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) })
                    }),
                    createSection({
                        id: 'section-b',
                        times: createTimeSlot({ days: ['Tue'], startTime: toMinutes(14), endTime: toMinutes(15, 30) })
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block Monday mornings (should eliminate section-a and keep section-b)
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [blockBetween(toMinutes(8), toMinutes(12), ['Mon'])]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(hasSelection(results[0], 'course-1', 'section-b')).toBe(true);
        });

        it('should handle "before" blocked timeslots', () => {
            const course = createCourse({
                id: 'course-1',
                sections: [
                    createSection({
                        id: 'early-section',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(8), endTime: toMinutes(9, 30) })
                    }),
                    createSection({
                        id: 'late-section',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(14), endTime: toMinutes(15, 30) })
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block all times before 10:00 on all days (should eliminate early-section and keep late-section)
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [blockBefore(toMinutes(10))]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(hasSelection(results[0], 'course-1', 'late-section')).toBe(true);
        });

        it('should handle "after" blocked timeslots', () => {
            const course = createCourse({
                id: 'course-1',
                sections: [
                    createSection({
                        id: 'morning-section',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) })
                    }),
                    createSection({
                        id: 'evening-section',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(18), endTime: toMinutes(19, 30) })
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block all times after 17:00
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [blockAfter(toMinutes(17))]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(hasSelection(results[0], 'course-1', 'morning-section')).toBe(true);
        });

        it('should return empty when all sections are blocked', () => {
            const course = createCourse({
                id: 'course-1',
                required: true,
                sections: [
                    createSection({
                        id: 'section-a',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) })
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block the only available section (should result in no available sections)
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [blockBetween(toMinutes(8), toMinutes(12), ['Mon'])]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(0);
        });

        it('should handle multiple blocked timeslots', () => {
            const course = createCourse({
                id: 'course-1',
                sections: [
                    createSection({
                        id: 'section-a',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) })
                    }),
                    createSection({
                        id: 'section-b',
                        times: createTimeSlot({ days: ['Wed'], startTime: toMinutes(14), endTime: toMinutes(15, 30) })
                    }),
                    createSection({
                        id: 'section-c',
                        times: createTimeSlot({ days: ['Fri'], startTime: toMinutes(11), endTime: toMinutes(12, 30) })
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block Monday mornings AND Wednesday afternoons (should eliminate section-a and section-b, keep section-c)
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [
                    blockBetween(toMinutes(8), toMinutes(12), ['Mon']),
                    blockBetween(toMinutes(13), toMinutes(17), ['Wed'])
                ]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(hasSelection(results[0], 'course-1', 'section-c')).toBe(true);
        });
    });

    describe('tutorial conflicts', () => {
        it('should skip section when its only tutorial conflicts with blocked timeslot', () => {
            const course = createCourse({
                id: 'course-1',
                sections: [
                    createSectionWithTutorial(
                        {
                            id: 'section-a',
                            times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) })
                        },
                        {
                            id: 'tutorial-a',
                            times: createTimeSlot({ days: ['Wed'], startTime: toMinutes(14), endTime: toMinutes(15) })
                        }
                    ),
                    createSection({
                        id: 'section-b',
                        times: createTimeSlot({ days: ['Tue'], startTime: toMinutes(11), endTime: toMinutes(12, 30) })
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block the tutorial time (should eliminate section-a entirely)
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [blockBetween(toMinutes(13), toMinutes(16), ['Wed'])]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(hasSelection(results[0], 'course-1', 'section-b')).toBe(true);
        });

        it('should try all tutorial options before skipping section', () => {
            const course = createCourse({
                id: 'course-1',
                sections: [
                    createSection({
                        id: 'section-a',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) }),
                        hasTutorial: true,
                        tutorials: [
                            createTutorial({
                                id: 'tutorial-a1',
                                times: createTimeSlot({ days: ['Wed'], startTime: toMinutes(9), endTime: toMinutes(10) })
                            }),
                            createTutorial({
                                id: 'tutorial-a2',
                                times: createTimeSlot({ days: ['Thu'], startTime: toMinutes(14), endTime: toMinutes(15) })
                            })
                        ]
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block first tutorial option (should still allow section-a with second tutorial)
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [blockBetween(toMinutes(8), toMinutes(11), ['Wed'])]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(hasSelection(results[0], 'course-1', 'section-a', 'tutorial-a2')).toBe(true);
        });

        it('should return empty when no valid tutorial exists for required course', () => {
            const course = createCourse({
                id: 'course-1',
                required: true,
                sections: [
                    createSection({
                        id: 'section-a',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) }),
                        hasTutorial: true,
                        tutorials: [
                            createTutorial({
                                id: 'tutorial-a',
                                times: createTimeSlot({ days: ['Wed'], startTime: toMinutes(14), endTime: toMinutes(15) })
                            })
                        ]
                    })
                ]
            });

            const group = createGroup({ courses: [course], minSelect: 1, maxSelect: 1 });

            // Block all tutorial options
            const input = createInput([group], {
                minCourses: 1,
                maxCourses: 1,
                blockedTimeslots: [blockBetween(toMinutes(13), toMinutes(16), ['Wed'])]
            });

            const results = generateTimetables(input);

            expect(results.length).toBe(0);
        });

        it('should handle tutorial conflicting with another course section', () => {
            const course1 = createCourse({
                id: 'course-1',
                sections: [
                    createSectionWithTutorial(
                        {
                            id: 'course1-section',
                            times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(9), endTime: toMinutes(10, 30) })
                        },
                        {
                            id: 'course1-tutorial',
                            times: createTimeSlot({ days: ['Wed'], startTime: toMinutes(14), endTime: toMinutes(15) })
                        }
                    )
                ]
            });

            const course2 = createCourse({
                id: 'course-2',
                sections: [
                    // This section conflicts with course1's tutorial
                    createSection({
                        id: 'course2-section-a',
                        times: createTimeSlot({ days: ['Wed'], startTime: toMinutes(14), endTime: toMinutes(15, 30) })
                    }),
                    // This section does not conflict
                    createSection({
                        id: 'course2-section-b',
                        times: createTimeSlot({ days: ['Tue'], startTime: toMinutes(11), endTime: toMinutes(12, 30) })
                    })
                ]
            });

            const group = createGroup({
                courses: [course1, course2],
                minSelect: 2,
                maxSelect: 2
            });

            const input = createInput([group], { minCourses: 2, maxCourses: 2 });

            const results = generateTimetables(input);

            // Should only have one valid result where course2 uses section-b
            expect(results.length).toBe(1);
            expect(hasSelection(results[0], 'course-1', 'course1-section', 'course1-tutorial')).toBe(true);
            expect(hasSelection(results[0], 'course-2', 'course2-section-b')).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should return empty when minCourses cannot be satisfied', () => {
            const course = createCourse({
                id: 'course-1',
                sections: [createSection({ id: 'section-a' })]
            });

            const group = createGroup({ courses: [course], minSelect: 0, maxSelect: 1 });

            // Require more courses than available
            const input = createInput([group], { minCourses: 5, maxCourses: 5 });

            const results = generateTimetables(input);

            expect(results.length).toBe(0);
        });

        it('should handle empty course groups', () => {
            const group = createGroup({ courses: [], minSelect: 0, maxSelect: 0 });

            const input = createInput([group], { minCourses: 0, maxCourses: 0 });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(extractCourseIds(results[0])).toEqual([]);
        });

        it('should handle course with no sections', () => {
            const course = createCourse({
                id: 'course-1',
                sections: []
            });

            const group = createGroup({ courses: [course], minSelect: 0, maxSelect: 1 });

            const input = createInput([group], { minCourses: 0, maxCourses: 1 });

            const results = generateTimetables(input);

            // Should succeed with 0 courses since minSelect is 0
            expect(results.length).toBe(1);
            expect(extractCourseIds(results[0])).toEqual([]);
        });

        it('should detect all time conflicts between overlapping sections', () => {
            const course1 = createCourse({
                id: 'course-1',
                sections: [
                    createSection({
                        id: 'course1-section',
                        times: createTimeSlot({ days: ['Mon', 'Wed'], startTime: toMinutes(10), endTime: toMinutes(11, 30) })
                    })
                ]
            });

            const course2 = createCourse({
                id: 'course-2',
                sections: [
                    // Overlaps on Monday
                    createSection({
                        id: 'course2-section',
                        times: createTimeSlot({ days: ['Mon'], startTime: toMinutes(11), endTime: toMinutes(12, 30) })
                    })
                ]
            });

            const group = createGroup({
                courses: [course1, course2],
                minSelect: 2,
                maxSelect: 2
            });

            const input = createInput([group], { minCourses: 2, maxCourses: 2 });

            const results = generateTimetables(input);

            expect(results.length).toBe(0);
        });
    });

    describe('tutorial and lecture conflict detection', () => {
        it('should NOT generate timetables where a tutorial conflicts with its own lecture', () => {
            // This test ensures we catch the bug where a tutorial that overlaps
            // with its parent section's lecture time was incorrectly allowed
            const courseWithConflictingTutorial = createCourse({
                id: 'comp2804',
                name: 'COMP 2804',
                sections: [
                    createSectionWithTutorial(
                        // Lecture: Tue/Thu 10:00 AM - 11:30 AM
                        { id: 'comp2804-a', suffix: 'A', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: toMinutes(10), endTime: toMinutes(11, 30) }) },
                        // Tutorial: Tue/Thu 10:30 AM - 11:30 AM (CONFLICTS with lecture!)
                        { id: 'comp2804-a-tut', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: toMinutes(10, 30), endTime: toMinutes(11, 30) }), name: 'COMP 2804-A Tutorial' }
                    )
                ]
            });

            const group = createGroup({
                courses: [courseWithConflictingTutorial],
                minSelect: 1,
                maxSelect: 1
            });

            const input = createInput([group], { minCourses: 1, maxCourses: 1 });

            const results = generateTimetables(input);

            // Should be 0 because the only tutorial conflicts with its lecture
            expect(results.length).toBe(0);
        });

        it('should generate timetables when tutorial does NOT conflict with lecture', () => {
            const courseWithValidTutorial = createCourse({
                id: 'comp2804',
                name: 'COMP 2804',
                sections: [
                    createSectionWithTutorial(
                        // Lecture: Tue/Thu 10:00 AM - 11:30 AM
                        { id: 'comp2804-a', suffix: 'A', times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: toMinutes(10), endTime: toMinutes(11, 30) }) },
                        // Tutorial: Friday 2:00 PM - 3:00 PM (no conflict)
                        { id: 'comp2804-a-tut', times: createTimeSlot({ days: ['Fri'], startTime: toMinutes(14), endTime: toMinutes(15) }), name: 'COMP 2804-A Tutorial' }
                    )
                ]
            });

            const group = createGroup({
                courses: [courseWithValidTutorial],
                minSelect: 1,
                maxSelect: 1
            });

            const input = createInput([group], { minCourses: 1, maxCourses: 1 });

            const results = generateTimetables(input);

            expect(results.length).toBe(1);
            expect(results[0].courses.get('comp2804')?.tutorialId).toBe('comp2804-a-tut');
        });

        it('should allow non-conflicting tutorial when one tutorial conflicts with lecture', () => {
            const course = createCourse({
                id: 'comp2804',
                name: 'COMP 2804',
                sections: [{
                    id: 'comp2804-a',
                    suffix: 'A',
                    times: createTimeSlot({ days: ['Tue', 'Thu'], startTime: toMinutes(10), endTime: toMinutes(11, 30) }),
                    hasTutorial: true,
                    tutorials: [
                        // Tutorial 1: Conflicts with lecture
                        createTutorial({ id: 'comp2804-a-tut1', times: createTimeSlot({ days: ['Tue'], startTime: toMinutes(10, 30), endTime: toMinutes(11, 30) }), name: 'Tutorial 1' }),
                        // Tutorial 2: Does not conflict
                        createTutorial({ id: 'comp2804-a-tut2', times: createTimeSlot({ days: ['Wed'], startTime: toMinutes(14), endTime: toMinutes(15) }), name: 'Tutorial 2' })
                    ]
                }]
            });

            const group = createGroup({
                courses: [course],
                minSelect: 1,
                maxSelect: 1
            });

            const input = createInput([group], { minCourses: 1, maxCourses: 1 });

            const results = generateTimetables(input);

            // Should have exactly 1 result using the non-conflicting tutorial
            expect(results.length).toBe(1);
            expect(results[0].courses.get('comp2804')?.tutorialId).toBe('comp2804-a-tut2');
        });
    });
});
