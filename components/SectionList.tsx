import React, { useState } from 'react';
import { CourseSection } from '../lib/types/course';
import { SectionCard } from './SectionCard';

interface Props {
    courseName: string;
    sections: CourseSection[];
    onAddSection: () => void;
    onUpdateSection: (sectionId: string, section: CourseSection) => void;
    onDeleteSection: (sectionId: string) => void;
    lastAddedSectionId: string | null;
}

export function SectionList({ courseName, sections, onAddSection, onUpdateSection, onDeleteSection, lastAddedSectionId }: Props) {
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
                    autoFocus={section.id === lastAddedSectionId}
                />
            ))}
        </div>
    );
}