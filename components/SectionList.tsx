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

// Check if a timeslot has valid time data (start < end)
function isTimeslotValid(times: { days: string[]; startTime: number; endTime: number }): { valid: boolean; error?: string } {
    if (times.days.length === 0) {
        return { valid: false, error: 'Please select at least one day.' };
    }
    if (times.startTime === undefined || times.endTime === undefined) {
        return { valid: false, error: 'Please set both start and end times.' };
    }
    if (times.startTime === times.endTime) {
        return { valid: false, error: 'Start time and end time cannot be the same.' };
    }
    if (times.startTime > times.endTime) {
        return { valid: false, error: 'Start time must be before end time.' };
    }
    return { valid: true };
}

// Check if a section has valid time data
function isSectionValid(section: CourseSection): { valid: boolean; error?: string } {
    const timeslotCheck = isTimeslotValid(section.times);
    if (!timeslotCheck.valid) {
        return timeslotCheck;
    }

    // If has tutorial is checked, must have at least one tutorial
    if (section.hasTutorial && (!section.tutorials || section.tutorials.length === 0)) {
        return { valid: false, error: 'Please add at least one tutorial or uncheck "Has Tutorial/Lab".' };
    }

    // Validate all tutorials have valid timeslots
    if (section.hasTutorial && section.tutorials) {
        for (const tutorial of section.tutorials) {
            const tutorialCheck = isTimeslotValid(tutorial.times);
            if (!tutorialCheck.valid) {
                return { valid: false, error: `Tutorial "${tutorial.name || 'Unnamed'}": ${tutorialCheck.error}` };
            }
        }
    }

    return { valid: true };
}

export function SectionList({ courseName, sections, onAddSection, onUpdateSection, onDeleteSection, lastAddedSectionId }: Props) {
    // Track which section is currently expanded (accordion behavior)
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    // Track the lastAddedSectionId we've already handled (so new additions auto-expand)
    const [handledLastAddedId, setHandledLastAddedId] = useState<string | null>(null);

    // Determine which section should be expanded:
    // 1. If there's a new lastAddedSectionId we haven't handled yet, expand it
    // 2. Otherwise, use the user's explicit selection (expandedSectionId)
    const hasNewSection = lastAddedSectionId && lastAddedSectionId !== handledLastAddedId && sections.some(s => s.id === lastAddedSectionId);
    const effectiveExpandedId = hasNewSection ? lastAddedSectionId : expandedSectionId;

    // Get the currently expanded section
    const currentExpandedSection = sections.find(s => s.id === effectiveExpandedId);

    const handleUpdateSection = (sectionId: string, updated: CourseSection) => {
        // If trying to expand a different section, validate the current one first
        if (!updated.isCollapsed && sectionId !== effectiveExpandedId && currentExpandedSection) {
            const validation = isSectionValid(currentExpandedSection);
            if (!validation.valid) {
                setValidationError(validation.error || 'Please complete the current section before editing another.');
                return;
            }
        }

        // If trying to collapse (save) the current section, validate it first
        if (updated.isCollapsed && sectionId === effectiveExpandedId) {
            const validation = isSectionValid(updated);
            if (!validation.valid) {
                setValidationError(validation.error || 'Please complete this section before saving.');
                return;
            }
        }

        // Clear any validation error when making valid changes
        setValidationError(null);

        // If section is being collapsed, clear expanded state and mark lastAddedSectionId as handled
        if (updated.isCollapsed && effectiveExpandedId === sectionId) {
            setExpandedSectionId(null);
            if (lastAddedSectionId === sectionId) {
                setHandledLastAddedId(lastAddedSectionId);
            }
        }
        // If section is being expanded, set it as the only expanded one and mark lastAddedSectionId as handled
        if (!updated.isCollapsed) {
            setExpandedSectionId(sectionId);
            if (lastAddedSectionId) {
                setHandledLastAddedId(lastAddedSectionId);
            }
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