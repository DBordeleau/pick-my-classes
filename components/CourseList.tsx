import React from 'react';
import { CourseShape } from '../lib/types/course';
import { CourseCard } from './CourseCard';

interface Props {
    courses: CourseShape[];
    onAddCourse: () => void;
    onUpdateCourse: (courseId: string, course: CourseShape) => void;
    onDeleteCourse: (courseId: string) => void;
}

export function CourseList({ courses, onAddCourse, onUpdateCourse, onDeleteCourse }: Props) {
    return (
        <div className="course-list">
            <button onClick={onAddCourse} className="add-btn">+ Add Course</button>

            {courses.map(course => (
                <CourseCard
                    key={course.id}
                    course={course}
                    onUpdate={updated => onUpdateCourse(course.id, updated)}
                    onDelete={() => onDeleteCourse(course.id)}
                />
            ))}
        </div>
    );
}