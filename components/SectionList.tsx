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
    // Track which section is currently expanded (accordion behavior)
    // Initialize to lastAddedSectionId if provided
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(lastAddedSectionId);

    // Compute the effective expanded section:
    // - If lastAddedSectionId matches an existing section and it's different from our tracked state,
    //   we should show the newly added section as expanded
    const effectiveExpandedId = lastAddedSectionId && sections.some(s => s.id === lastAddedSectionId)
        ? lastAddedSectionId
        : expandedSectionId;

    const handleUpdateSection = (sectionId: string, updated: CourseSection) => {
        // If section is being collapsed, clear expanded state
        if (updated.isCollapsed && effectiveExpandedId === sectionId) {
            setExpandedSectionId(null);
        }
        // If section is being expanded, set it as the only expanded one
        if (!updated.isCollapsed) {
            setExpandedSectionId(sectionId);
        }
        onUpdateSection(sectionId, updated);
    };

    return (
        <div className="section-list">
            {sections.map((section, index) => {
                // Determine if this section should be shown as collapsed
                // A section is only expanded if it matches the effectiveExpandedId
                const isExpanded = effectiveExpandedId === section.id;
                const effectiveSection = {
                    ...section,
                    isCollapsed: !isExpanded
                };

                return (
                    <SectionCard
                        key={section.id}
                        courseName={courseName}
                        section={effectiveSection}
                        sectionNumber={index + 1}
                        onUpdate={updated => handleUpdateSection(section.id, updated)}
                        onDelete={() => onDeleteSection(section.id)}
                        autoFocus={section.id === lastAddedSectionId}
                    />
                );
            })}

            <button onClick={onAddSection} className="add-btn-small">+ Add Section</button>
        </div>
    );
}