import React, { useState, useEffect, useRef } from 'react';
import { CourseSection, TutorialSection } from '../lib/types/course';
import { TimeslotEditor } from './TimeslotEditor';
import { TutorialList } from './TutorialList';

interface Props {
    courseName: string;
    section: CourseSection;
    sectionNumber: number;
    onUpdate: (section: CourseSection) => void;
    onDelete: () => void;
    autoFocus?: boolean;
}

export function SectionCard({ courseName, section, onUpdate, onDelete, autoFocus = false }: Props) {
    const suffixInputRef = useRef<HTMLInputElement>(null);
    const [lastAddedTutorialId, setLastAddedTutorialId] = useState<string | null>(null);

    const handleAddTutorial = () => {
        const sectionSuffix = section.suffix ?? '';
        const displaySuffix = sectionSuffix || 'A';
        const sectionDisplayName = `${courseName}-${displaySuffix}`;
        const newTutorial: TutorialSection = {
            id: `tutorial-${Date.now()}`,
            times: { days: [], startTime: 0, endTime: 0 },
            name: `${sectionDisplayName} Tutorial`
        };
        onUpdate({
            ...section,
            hasTutorial: true,
            tutorials: [...(section.tutorials || []), newTutorial]
        });
        setLastAddedTutorialId(newTutorial.id);
    };

    // Local input state so the user can clear/backspace
    const [suffixInput, setSuffixInput] = useState<string>(section.suffix ?? '');

    useEffect(() => {
        setSuffixInput(section.suffix ?? '');
    }, [section.suffix, section.id]);

    useEffect(() => {
        if (autoFocus && suffixInputRef.current) {
            suffixInputRef.current.focus();
            suffixInputRef.current.select();
        }
    }, [autoFocus]);

    // Allow empty string; sanitize letters only and uppercase, limit length
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
        setSuffixInput(cleaned);
    };

    const commitSuffix = () => {
        const newSuffix = suffixInput === '' ? undefined : suffixInput;
        onUpdate({ ...section, suffix: newSuffix });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
        if (e.key === 'Escape') {
            setSuffixInput(section.suffix ?? '');
            (e.target as HTMLInputElement).blur();
        }
    };

    const displaySuffix = suffixInput; // local state drives the input

    return (
        <div className="section-card">
            <div className="section-header">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 0, margin: 0 }}>
                        <span>{courseName}-</span>
                        <input
                            ref={suffixInputRef}
                            aria-label="Section suffix"
                            value={displaySuffix}
                            onChange={handleInputChange}
                            onBlur={commitSuffix}
                            onKeyDown={handleKeyDown}
                            style={{
                                width: 40,
                                textTransform: 'uppercase',
                                textAlign: 'center',
                                fontWeight: 600,
                                borderRadius: 4,
                                border: '1px solid #d1d5db',
                                background: 'white'
                            }}
                        />
                    </h4>
                </div>
                <button onClick={onDelete} className="delete-btn-small">×</button>
            </div>

            <TimeslotEditor
                timeslot={section.times}
                onChange={times => onUpdate({ ...section, times })}
                label="Section Time"
            />

            <label className="tutorial-checkbox">
                <input
                    type="checkbox"
                    checked={!!section.hasTutorial}
                    onChange={e => onUpdate({
                        ...section,
                        hasTutorial: e.target.checked,
                        tutorials: e.target.checked ? section.tutorials : []
                    })}
                />
                Has Tutorial/Lab
            </label>

            {section.hasTutorial && (
                <TutorialList
                    parentName={`${courseName}-${section.suffix ?? 'A'}`}
                    tutorials={section.tutorials || []}
                    onAddTutorial={handleAddTutorial}
                    onUpdateTutorial={(tutId, updated) => onUpdate({
                        ...section,
                        tutorials: (section.tutorials || []).map(t => t.id === tutId ? updated : t)
                    })}
                    onDeleteTutorial={tutId => onUpdate({
                        ...section,
                        tutorials: (section.tutorials || []).filter(t => t.id !== tutId)
                    })}
                    lastAddedTutorialId={lastAddedTutorialId}
                />
            )}
        </div>
    );
}