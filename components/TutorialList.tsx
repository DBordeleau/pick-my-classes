import React, { useEffect, useRef } from 'react';
import { TutorialSection } from '../lib/types/course';
import { TimeslotEditor } from './TimeslotEditor';

interface Props {
    parentName: string;
    tutorials: TutorialSection[];
    onAddTutorial: () => void;
    onUpdateTutorial: (tutorialId: string, tutorial: TutorialSection) => void;
    onDeleteTutorial: (tutorialId: string) => void;
    lastAddedTutorialId: string | null;
}

export function TutorialList({ parentName, tutorials, onAddTutorial, onUpdateTutorial, onDeleteTutorial, lastAddedTutorialId }: Props) {
    return (
        <div className="tutorial-list">
            <button onClick={onAddTutorial} className="add-btn-small">+ Add Tutorial</button>

            {tutorials.map((tutorial, index) => {
                const defaultName = `${parentName} Tutorial`;
                return (
                    <TutorialCard
                        key={tutorial.id}
                        tutorial={tutorial}
                        defaultName={defaultName}
                        index={index}
                        onUpdate={updated => onUpdateTutorial(tutorial.id, updated)}
                        onDelete={() => onDeleteTutorial(tutorial.id)}
                        autoFocus={tutorial.id === lastAddedTutorialId}
                    />
                );
            })}
        </div>
    );
}

interface TutorialCardProps {
    tutorial: TutorialSection;
    defaultName: string;
    index: number;
    onUpdate: (tutorial: TutorialSection) => void;
    onDelete: () => void;
    autoFocus?: boolean;
}

function TutorialCard({ tutorial, defaultName, index, onUpdate, onDelete, autoFocus = false }: TutorialCardProps) {
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [autoFocus]);

    return (
        <div className="tutorial-card">
            <div className="tutorial-header">
                <input
                    ref={nameInputRef}
                    aria-label={`Tutorial ${index + 1} name`}
                    value={tutorial.name ?? defaultName}
                    onChange={e => onUpdate({ ...tutorial, name: e.target.value })}
                    style={{
                        fontWeight: 600,
                        color: 'black',
                        fontSize: '0.95rem',
                        textAlign: 'center',
                        background: 'transparent',
                        border: '1px solid black',
                        borderRadius: 4,
                        padding: '2px 4px',
                    }}
                />
                <button onClick={onDelete} className="delete-btn-small">×</button>
            </div>
            <TimeslotEditor
                timeslot={tutorial.times}
                onChange={times => onUpdate({ ...tutorial, times })}
                label=""
            />
        </div>
    );
}