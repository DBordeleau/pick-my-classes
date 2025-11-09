import React from 'react';
import { CourseGroup, CourseShape } from '../lib/types/course';
import { CourseList } from './CourseList';
import { Tooltip } from './Tooltip';

interface Props {
    group: CourseGroup;
    onUpdate: (group: CourseGroup) => void;
    onDelete: () => void;
    globalMaxCourses?: number;
}

export function GroupCard({ group, onUpdate, onDelete, globalMaxCourses = 5 }: Props) {
    const handleAddCourse = () => {
        const newCourse: CourseShape = {
            id: `course-${Date.now()}`,
            name: `Course ${group.courses.length + 1}`,
            sections: [],
            required: false
        };
        onUpdate({ ...group, courses: [...group.courses, newCourse] });
    };

    const handleUpdateCourse = (courseId: string, updated: CourseShape) => {
        onUpdate({
            ...group,
            courses: group.courses.map(c => c.id === courseId ? updated : c)
        });
    };

    const handleDeleteCourse = (courseId: string) => {
        onUpdate({
            ...group,
            courses: group.courses.filter(c => c.id !== courseId)
        });
    };

    return (
        <div className="group-card">
            <div className="group-header">
                <input
                    type="text"
                    value={group.name || ''}
                    onChange={e => onUpdate({ ...group, name: e.target.value })}
                    placeholder="Group name"
                    className="group-name-input"
                />
                <button onClick={onDelete} className="delete-btn">Delete Group</button>
            </div>

            <div className="group-constraints">
                <label>
                    <Tooltip text="Select at least this many courses from this group." />Minimum:
                    <input
                        type="number"
                        min="0"
                        max={globalMaxCourses}
                        placeholder="0"
                        value={group.minSelect ?? ''}
                        onChange={e => onUpdate({ ...group, minSelect: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                </label>
                <label>
                    <Tooltip text="Select at most this many courses from this group." />Maximum:
                    <input
                        type="number"
                        min="0"
                        max={globalMaxCourses}
                        placeholder={globalMaxCourses.toString()}
                        value={group.maxSelect ?? ''}
                        onChange={e => onUpdate({ ...group, maxSelect: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                </label>
            </div>

            <CourseList
                courses={group.courses}
                onAddCourse={handleAddCourse}
                onUpdateCourse={handleUpdateCourse}
                onDeleteCourse={handleDeleteCourse}
            />
        </div>
    );
}