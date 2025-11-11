import React, { useRef, useEffect, useState } from 'react';
import { CourseShape, CourseSection } from '../lib/types/course';
import { SectionList } from './SectionList';
import { Tooltip } from './Tooltip';

interface Props {
    course: CourseShape;
    onUpdate: (course: CourseShape) => void;
    onDelete: () => void;
    autoFocus?: boolean;
}

// Helper to convert 0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, etc. Used for section suffixes
function numberToLetters(n: number): string {
    let s = '';
    n += 1;
    while (n > 0) {
        const rem = (n - 1) % 26;
        s = String.fromCharCode(65 + rem) + s;
        n = Math.floor((n - 1) / 26);
    }
    return s;
}

// Get the next available suffix based on the length of existing sections
function nextSuffixFromExisting(sections: CourseSection[]): string {
    if (!sections || sections.length === 0) return 'A';
    const indexes = sections
        .map(s => (s.suffix || '').toUpperCase())
        .filter(Boolean)
        .map(suf => {
            let val = 0;
            for (let i = 0; i < suf.length; i++) {
                val = val * 26 + (suf.charCodeAt(i) - 65 + 1);
            }
            return val - 1;
        });
    const max = indexes.length ? Math.max(...indexes) : -1;
    return numberToLetters(max + 1);
}

export function CourseCard({ course, onUpdate, onDelete, autoFocus = false }: Props) {
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [lastAddedSectionId, setLastAddedSectionId] = useState<string | null>(null);

    useEffect(() => {
        if (autoFocus && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [autoFocus]);

    const handleAddSection = () => {
        const suffix = nextSuffixFromExisting(course.sections || []);
        const newSection: CourseSection = {
            id: `section-${Date.now()}`,
            times: { days: [], startTime: 0, endTime: 0 },
            hasTutorial: false,
            tutorials: [],
            suffix
        };
        onUpdate({ ...course, sections: [...(course.sections || []), newSection] });
        setLastAddedSectionId(newSection.id);
    };

    const handleUpdateSection = (sectionId: string, updated: CourseSection) => {
        onUpdate({
            ...course,
            sections: (course.sections || []).map(s => s.id === sectionId ? updated : s)
        });
    };

    const handleDeleteSection = (sectionId: string) => {
        onUpdate({
            ...course,
            sections: (course.sections || []).filter(s => s.id !== sectionId)
        });
    };

    if (course.isCollapsed) {
        return (
            <div className="course-card course-card-collapsed">
                <div className="course-header">
                    <h3 style={{ margin: 0, fontWeight: 600 }}>
                        {course.name || 'Unnamed Course'}
                        {course.required && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>*</span>}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {course.sections?.length || 0} section{course.sections?.length !== 1 ? 's' : ''}
                        </span>
                        <button onClick={() => onUpdate({ ...course, isCollapsed: false })} className="edit-btn">Edit</button>
                        <button onClick={onDelete} className="delete-btn">Delete</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="course-card">
            <div className="course-header">
                <input
                    ref={nameInputRef}
                    type="text"
                    value={course.name || ''}
                    onChange={e => onUpdate({ ...course, name: e.target.value })}
                    placeholder="Course name (e.g., COMP 3000)"
                    className="course-name-input"
                />
                <label className="required-checkbox">
                    <input
                        type="checkbox"
                        checked={!!course.required}
                        onChange={e => onUpdate({ ...course, required: e.target.checked })}
                    />
                    <Tooltip text="Include this course in every timetable." />Required
                </label>
                <button onClick={onDelete} className="delete-btn">Delete</button>
            </div>

            <SectionList
                courseName={course.name || course.id}
                sections={course.sections || []}
                onAddSection={handleAddSection}
                onUpdateSection={handleUpdateSection}
                onDeleteSection={handleDeleteSection}
                lastAddedSectionId={lastAddedSectionId}
            />

            <button onClick={() => onUpdate({ ...course, isCollapsed: true })} className="save-btn">
                Save Course
            </button>
        </div>
    );
}