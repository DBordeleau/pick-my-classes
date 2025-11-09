import React from 'react';
import { TutorialSection } from '../lib/types/course';
import { TimeslotEditor } from './TimeslotEditor';

interface Props {
    parentName: string;
    tutorials: TutorialSection[];
    onAddTutorial: () => void;
    onUpdateTutorial: (tutorialId: string, tutorial: TutorialSection) => void;
    onDeleteTutorial: (tutorialId: string) => void;
}

export function TutorialList({ parentName, tutorials, onAddTutorial, onUpdateTutorial, onDeleteTutorial }: Props) {
    return (
        <div className="tutorial-list">
            <button onClick={onAddTutorial} className="add-btn-small">+ Add Tutorial</button>

            {tutorials.map((tutorial, index) => {
                const defaultName = `${parentName} Tutorial`;
                return (
                    <div key={tutorial.id} className="tutorial-card">
                        <div className="tutorial-header">
                            <input
                                aria-label={`Tutorial ${index + 1} name`}
                                value={tutorial.name ?? defaultName}
                                onChange={e => onUpdateTutorial(tutorial.id, { ...tutorial, name: e.target.value })}
                                style={{
                                    fontWeight: 600,
                                    color: 'black',
                                    fontSize: '0.95rem',
                                    textAlign: 'center',
                                    background: 'transparent',
                                    border: '1px solid black',
                                    borderRadius: 4,
                                    padding: '2px 4px',
                                    color: '#78350f'
                                }}
                            />
                            <button onClick={() => onDeleteTutorial(tutorial.id)} className="delete-btn-small">×</button>
                        </div>
                        <TimeslotEditor
                            timeslot={tutorial.times}
                            onChange={times => onUpdateTutorial(tutorial.id, { ...tutorial, times })}
                            label=""
                        />
                    </div>
                );
            })}
        </div>
    );
}