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

// Check if a section has valid time data
function isSectionValid(section: CourseSection): boolean {
    const { times } = section;
    // Must have at least one day and valid start/end times
    return times.days.length > 0 &&
        times.startTime !== undefined &&
        times.endTime !== undefined &&
        times.startTime !== times.endTime;
}

export function SectionList({ courseName, sections, onAddSection, onUpdateSection, onDeleteSection, lastAddedSectionId }: Props) {
    // Track which section is currently expanded (accordion behavior)
    // Initialize to lastAddedSectionId if provided
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(lastAddedSectionId);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Compute the effective expanded section:
    // - If lastAddedSectionId matches an existing section and it's different from our tracked state,
    //   we should show the newly added section as expanded
    const effectiveExpandedId = lastAddedSectionId && sections.some(s => s.id === lastAddedSectionId)
        ? lastAddedSectionId
        : expandedSectionId;

    // Get the currently expanded section
    const currentExpandedSection = sections.find(s => s.id === effectiveExpandedId);

    const handleUpdateSection = (sectionId: string, updated: CourseSection) => {
        // If trying to expand a different section, validate the current one first
        if (!updated.isCollapsed && sectionId !== effectiveExpandedId && currentExpandedSection) {
            if (!isSectionValid(currentExpandedSection)) {
                setValidationError('Please select a valid timeslot for the current section before editing another section.');
                return;
            }
        }

        // If trying to collapse (save) the current section, validate it first
        if (updated.isCollapsed && sectionId === effectiveExpandedId) {
            if (!isSectionValid(updated)) {
                setValidationError('Please select at least one day and set a valid time range before saving this section.');
                return;
            }
        }

        // Clear any validation error when making valid changes
        setValidationError(null);

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