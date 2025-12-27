import React, { useState } from 'react';
import { CourseShape } from '../lib/types/course';
import { CourseCard } from './CourseCard';

interface Props {
    courses: CourseShape[];
    onAddCourse: () => void;
    onUpdateCourse: (courseId: string, course: CourseShape) => void;
    onDeleteCourse: (courseId: string) => void;
    lastAddedCourseId: string | null;
}

// Check if a course is valid (has at least one valid section)
function isCourseValid(course: CourseShape): { valid: boolean; error?: string } {
    if (!course.name || course.name.trim() === '') {
        return { valid: false, error: 'Please enter a course name.' };
    }
    if (!course.sections || course.sections.length === 0) {
        return { valid: false, error: 'Please add at least one section to this course.' };
    }
    return { valid: true };
}

export function CourseList({ courses, onAddCourse, onUpdateCourse, onDeleteCourse, lastAddedCourseId }: Props) {
    // Track which course is currently expanded (accordion behavior)
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    // Track the lastAddedCourseId we've already handled (so new additions auto-expand)
    const [handledLastAddedId, setHandledLastAddedId] = useState<string | null>(null);

    // Determine which course should be expanded:
    // 1. If there's a new lastAddedCourseId we haven't handled yet, expand it
    // 2. Otherwise, use the user's explicit selection (expandedCourseId)
    const hasNewCourse = lastAddedCourseId && lastAddedCourseId !== handledLastAddedId && courses.some(c => c.id === lastAddedCourseId);
    const effectiveExpandedId = hasNewCourse ? lastAddedCourseId : expandedCourseId;

    // Get the currently expanded course
    const currentExpandedCourse = courses.find(c => c.id === effectiveExpandedId);

    const handleUpdateCourse = (courseId: string, updated: CourseShape) => {
        // If trying to expand a different course, validate the current one first
        if (!updated.isCollapsed && courseId !== effectiveExpandedId && currentExpandedCourse) {
            const validation = isCourseValid(currentExpandedCourse);
            if (!validation.valid) {
                setValidationError(validation.error || 'Please complete the current course before editing another.');
                return;
            }
        }

        // If trying to collapse (save) the current course, validate it first
        if (updated.isCollapsed && courseId === effectiveExpandedId) {
            const validation = isCourseValid(updated);
            if (!validation.valid) {
                setValidationError(validation.error || 'Please complete this course before saving.');
                return;
            }
        }

        // Clear any validation error when making valid changes
        setValidationError(null);

        // If course is being collapsed, clear expanded state and mark lastAddedCourseId as handled
        if (updated.isCollapsed && effectiveExpandedId === courseId) {
            setExpandedCourseId(null);
            if (lastAddedCourseId === courseId) {
                setHandledLastAddedId(lastAddedCourseId);
            }
        }
        // If course is being expanded, set it as the only expanded one and mark lastAddedCourseId as handled
        if (!updated.isCollapsed) {
            setExpandedCourseId(courseId);
            if (lastAddedCourseId) {
                setHandledLastAddedId(lastAddedCourseId);
            }
        }
        onUpdateCourse(courseId, updated);
    };

    return (
        <div className="course-list">
            {validationError && (
                <div className="validation-error">
                    <span className="validation-error-icon">⚠</span>
                    <span>{validationError}</span>
                    <button
                        className="validation-error-dismiss"
                        onClick={() => setValidationError(null)}
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
            )}
            {courses.map(course => {
                // Determine if this course should be shown as collapsed
                const isExpanded = effectiveExpandedId === course.id;
                const effectiveCourse = {
                    ...course,
                    isCollapsed: !isExpanded
                };

                return (
                    <CourseCard
                        key={course.id}
                        course={effectiveCourse}
                        onUpdate={updated => handleUpdateCourse(course.id, updated)}
                        onDelete={() => onDeleteCourse(course.id)}
                        autoFocus={course.id === lastAddedCourseId}
                    />
                );
            })}

            <button onClick={onAddCourse} className="add-btn">+ Add Course</button>
        </div>
    );
}