import React from 'react';
import { CourseSection } from '../lib/types/course';
import { SectionCard } from './SectionCard';
import { Tooltip } from './Tooltip';

interface Props {
    sections: CourseSection[];
    onAddSection: () => void;
    onUpdateSection: (sectionId: string, section: CourseSection) => void;
    onDeleteSection: (sectionId: string) => void;
}

export function SectionList({ sections, onAddSection, onUpdateSection, onDeleteSection }: Props) {
    return (
        <div className="section-list">
            <Tooltip text="Add every section you are willing to enroll in for this course. The timetable generator will select only one for each generated timetable." /><button onClick={onAddSection} className="add-btn-small">+ Add Section</button>

            {sections.map((section, index) => (
                <SectionCard
                    key={section.id}
                    section={section}
                    sectionNumber={index + 1}
                    onUpdate={updated => onUpdateSection(section.id, updated)}
                    onDelete={() => onDeleteSection(section.id)}
                />
            ))}
        </div>
    );
}