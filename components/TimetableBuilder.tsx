import React, { useState } from 'react';
import { TimetableInput, CourseGroup, GlobalConstraints } from '../lib/types/course';
import { GlobalConstraintsPanel } from './GlobalConstraintsPanel';
import { GroupList } from './GroupList';
import { generateTimetables, TimetableConfiguration } from '../lib/timetable_generator';

export function TimetableBuilder() {
    const [groups, setGroups] = useState<CourseGroup[]>([]);
    const [globalConstraints, setGlobalConstraints] = useState<GlobalConstraints>({});
    const [results, setResults] = useState<TimetableConfiguration[]>([]);

    const handleAddGroup = () => {
        const newGroup: CourseGroup = {
            id: `group-${Date.now()}`,
            name: `Group ${groups.length + 1}`,
            courses: []
        };
        setGroups([...groups, newGroup]);
    };

    const handleUpdateGroup = (groupId: string, updated: CourseGroup) => {
        setGroups(groups.map(g => g.id === groupId ? updated : g));
    };

    const handleDeleteGroup = (groupId: string) => {
        setGroups(groups.filter(g => g.id !== groupId));
    };

    const handleGenerate = () => {
        const input: TimetableInput = { groups, globalConstraints };
        const timetables = generateTimetables(input);
        setResults(timetables);
    };

    return (
        <div className="timetable-builder">
            <h1>Timetable Generator</h1>

            <GlobalConstraintsPanel
                constraints={globalConstraints}
                onChange={setGlobalConstraints}
            />

            <GroupList
                groups={groups}
                onAddGroup={handleAddGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
            />

            <button onClick={handleGenerate} className="generate-btn">
                Generate Timetables
            </button>

            {results.length > 0 && (
                <div className="results">
                    <h2>Found {results.length} valid timetables</h2>
                    {/* Render results here */}
                </div>
            )}
        </div>
    );
}