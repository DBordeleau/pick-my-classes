import React, { useState, useEffect, useRef } from 'react';
import { CourseSection, TutorialSection, Day } from '../lib/types/course';
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
    const [isCollapsed, setIsCollapsed] = useState(false);

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

    const formatTime = (minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const sortDays = (days: Day[]): Day[] => {
        const dayOrder: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return [...days].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    };

    const formatSectionInfo = (): string => {
        const times = section.times;
        const sortedDays = sortDays(times.days);
        const daysStr = sortedDays.length > 0 ? sortedDays.join('/') : 'No days';
        const timeStr = times.startTime !== undefined && times.endTime !== undefined
            ? `${formatTime(times.startTime)}-${formatTime(times.endTime)}`
            : 'No time';

        let info = `${daysStr} @ ${timeStr}`;

        if (section.hasTutorial && section.tutorials.length > 0) {
            const tutorial = section.tutorials[0];
            const sortedTutDays = sortDays(tutorial.times.days);
            const tutDays = sortedTutDays.length > 0 ? sortedTutDays.join('/') : 'No days';
            const tutTime = tutorial.times.startTime !== undefined
                ? formatTime(tutorial.times.startTime)
                : 'No time';
            info += ` - Tutorial: ${tutDays} @ ${tutTime}`;
        } else {
            info += ' - No tutorial';
        }

        return info;
    };

    const displaySuffix = suffixInput;
    const sectionDisplayName = `${courseName}-${section.suffix ?? displaySuffix}`;

    if (isCollapsed) {
        return (
            <div className="section-card section-card-collapsed">
                <div className="section-header">
                    <div>
                        <h4 style={{ margin: 0, fontWeight: 600, marginBottom: '0.25rem' }}>{sectionDisplayName}</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                            {formatSectionInfo()}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setIsCollapsed(false)} className="edit-btn-small">Edit</button>
                        <button onClick={onDelete} className="delete-btn-small">×</button>
                    </div>
                </div>
            </div>
        );
    }

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

            <button onClick={() => setIsCollapsed(true)} className="save-btn">
                Save Section
            </button>
        </div>
    );
}