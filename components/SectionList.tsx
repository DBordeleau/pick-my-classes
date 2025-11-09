import React from 'react';
import { CourseSection } from '../lib/types/course';
import { SectionCard } from './SectionCard';
import { Tooltip } from './Tooltip';

interface Props {
    courseName: string;
    sections: CourseSection[];
    onAddSection: () => void;
    onUpdateSection: (sectionId: string, section: CourseSection) => void;
    onDeleteSection: (sectionId: string) => void;
}

export function SectionList({ courseName, sections, onAddSection, onUpdateSection, onDeleteSection }: Props) {
    return (
        <div className="section-list">
            <button onClick={onAddSection} className="add-btn-small">+ Add Section</button>

            {sections.map((section, index) => (
                <SectionCard
                    key={section.id}
                    courseName={courseName}
                    section={section}
                    sectionNumber={index + 1}
                    onUpdate={updated => onUpdateSection(section.id, updated)}
                    onDelete={() => onDeleteSection(section.id)}
                />
            ))}
        </div>
    );
}