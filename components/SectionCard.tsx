import React from 'react';
import { CourseSection, TutorialSection, Day } from '../lib/types/course';
import { TimeslotEditor } from './TimeslotEditor';
import { TutorialList } from './TutorialList';

interface Props {
    section: CourseSection;
    sectionNumber: number;
    onUpdate: (section: CourseSection) => void;
    onDelete: () => void;
}

export function SectionCard({ section, sectionNumber, onUpdate, onDelete }: Props) {
    const handleAddTutorial = () => {
        const newTutorial: TutorialSection = {
            id: `tutorial-${Date.now()}`,
            times: { days: [], startTime: 0, endTime: 0 }
        };
        onUpdate({
            ...section,
            hasTutorial: true,
            tutorials: [...section.tutorials, newTutorial]
        });
    };

    return (
        <div className="section-card">
            <div className="section-header">
                <h4>Section {sectionNumber}</h4>
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
                    checked={section.hasTutorial}
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
                    tutorials={section.tutorials}
                    onAddTutorial={handleAddTutorial}
                    onUpdateTutorial={(tutId, updated) => onUpdate({
                        ...section,
                        tutorials: section.tutorials.map(t => t.id === tutId ? updated : t)
                    })}
                    onDeleteTutorial={tutId => onUpdate({
                        ...section,
                        tutorials: section.tutorials.filter(t => t.id !== tutId)
                    })}
                />
            )}
        </div>
    );
}