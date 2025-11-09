import React from 'react';
import { CourseShape, CourseSection } from '../lib/types/course';
import { SectionList } from './SectionList';
import { Tooltip } from './Tooltip';

interface Props {
    course: CourseShape;
    onUpdate: (course: CourseShape) => void;
    onDelete: () => void;
}

export function CourseCard({ course, onUpdate, onDelete }: Props) {
    const handleAddSection = () => {
        const newSection: CourseSection = {
            id: `section-${Date.now()}`,
            times: { days: [], startTime: 0, endTime: 0 },
            hasTutorial: false,
            tutorials: []
        };
        onUpdate({ ...course, sections: [...course.sections, newSection] });
    };

    const handleUpdateSection = (sectionId: string, updated: CourseSection) => {
        onUpdate({
            ...course,
            sections: course.sections.map(s => s.id === sectionId ? updated : s)
        });
    };

    const handleDeleteSection = (sectionId: string) => {
        onUpdate({
            ...course,
            sections: course.sections.filter(s => s.id !== sectionId)
        });
    };

    return (
        <div className="course-card">
            <div className="course-header">
                <input
                    type="text"
                    value={course.name || ''}
                    onChange={e => onUpdate({ ...course, name: e.target.value })}
                    placeholder="Course name (e.g., COMP 3000)"
                    className="course-name-input"
                />
                <label className="required-checkbox">
                    <input
                        type="checkbox"
                        checked={course.required}
                        onChange={e => onUpdate({ ...course, required: e.target.checked })}
                    />
                    <Tooltip text="Include this course in every timetable." />Required
                </label>
                <button onClick={onDelete} className="delete-btn">Delete</button>
            </div>

            <SectionList
                sections={course.sections}
                onAddSection={handleAddSection}
                onUpdateSection={handleUpdateSection}
                onDeleteSection={handleDeleteSection}
            />
        </div>
    );
}