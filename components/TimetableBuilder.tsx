import React, { useState, useEffect } from 'react';
import { TimetableInput, CourseGroup, GlobalConstraints } from '../lib/types/course';
import { GlobalConstraintsPanel } from './GlobalConstraintsPanel';
import { GroupList } from './GroupList';
import { generateTimetables, TimetableConfiguration } from '../lib/timetable_generator';
import { TimetableView } from './TimetableView';

const STORAGE_KEY = 'timetable-builder-config';

export function TimetableBuilder() {
    // Initialize with defaults - load from localStorage after hydration
    const [groups, setGroups] = useState<CourseGroup[]>([]);
    const [globalConstraints, setGlobalConstraints] = useState<GlobalConstraints>({
        minCourses: 1,
        maxCourses: 5,
        blockedTimeslots: []
    });
    const [isHydrated, setIsHydrated] = useState(false);

    const [results, setResults] = useState<TimetableConfiguration[]>([]);
    const [lastAddedGroupId, setLastAddedGroupId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Load from localStorage AFTER hydration to avoid mismatch
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.groups) setGroups(parsed.groups);
                if (parsed.globalConstraints) setGlobalConstraints(parsed.globalConstraints);
            } catch (e) {
                console.error('Error loading saved config:', e);
            }
        }
        setIsHydrated(true);
    }, []);

    // Save to localStorage whenever groups or globalConstraints change (but only after hydration)
    useEffect(() => {
        if (!isHydrated) return;
        const config = {
            groups,
            globalConstraints
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }, [groups, globalConstraints, isHydrated]);

    const handleAddGroup = () => {
        const newGroup: CourseGroup = {
            id: `group-${Date.now()}`,
            name: '',
            courses: [],
            minSelect: undefined,
            maxSelect: undefined
        };
        setGroups([...groups, newGroup]);
        setLastAddedGroupId(newGroup.id);
    };

    const handleUpdateGroup = (groupId: string, updated: CourseGroup) => {
        setGroups(groups.map(g => g.id === groupId ? updated : g));
    };

    const handleDeleteGroup = (groupId: string) => {
        setGroups(groups.filter(g => g.id !== groupId));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setHasGenerated(false);

        // Allow UI to update before calling generateTimetables
        setTimeout(async () => {
            try {
                const input: TimetableInput = { groups, globalConstraints };
                const timetables = generateTimetables(input);
                setResults(timetables);

                // Track generation count (fire and forget - don't block on this)
                fetch('/api/track-generation', { method: 'POST' }).catch(() => { });
            } catch (error) {
                console.error('Error generating timetables:', error);
                setResults([]);
            } finally {
                setIsGenerating(false);
                setHasGenerated(true);
            }
        }, 100);
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
                globalMaxCourses={globalConstraints.maxCourses ?? 5}
                lastAddedGroupId={lastAddedGroupId}
            />

            <button
                onClick={handleGenerate}
                className="generate-btn"
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <>
                        <span className="spinner"></span>
                        Generating valid timetables...
                    </>
                ) : (
                    'Generate Timetables'
                )}
            </button>

            {hasGenerated && results.length === 0 && (
                <div className="no-results">
                    <p>Unable to generate any timetables that meet your defined constraints.</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Try adjusting your course selections, time constraints, or blocked timeslots.
                    </p>
                </div>
            )}

            {results.length > 0 && (
                <TimetableView key={results.length} timetables={results} />
            )}
        </div>
    );
}