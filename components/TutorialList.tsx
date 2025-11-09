import React from 'react';
import { TutorialSection } from '../lib/types/course';
import { TimeslotEditor } from './TimeslotEditor';

interface Props {
    tutorials: TutorialSection[];
    onAddTutorial: () => void;
    onUpdateTutorial: (tutorialId: string, tutorial: TutorialSection) => void;
    onDeleteTutorial: (tutorialId: string) => void;
}

export function TutorialList({ tutorials, onAddTutorial, onUpdateTutorial, onDeleteTutorial }: Props) {
    return (
        <div className="tutorial-list">
            <button onClick={onAddTutorial} className="add-btn-small">+ Add Tutorial</button>

            {tutorials.map((tutorial, index) => (
                <div key={tutorial.id} className="tutorial-card">
                    <div className="tutorial-header">
                        <span>Tutorial {index + 1}</span>
                        <button onClick={() => onDeleteTutorial(tutorial.id)} className="delete-btn-small">×</button>
                    </div>
                    <TimeslotEditor
                        timeslot={tutorial.times}
                        onChange={times => onUpdateTutorial(tutorial.id, { ...tutorial, times })}
                        label=""
                    />
                </div>
            ))}
        </div>
    );
}