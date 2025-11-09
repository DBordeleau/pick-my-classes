import { GlobalConstraints, Day } from '../lib/types/course';
import { Tooltip } from './Tooltip';

interface Props {
    constraints: GlobalConstraints;
    onChange: (constraints: GlobalConstraints) => void;
}

export function GlobalConstraintsPanel({ constraints, onChange }: Props) {
    const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const toggleBlockedDay = (day: Day) => {
        const blocked = constraints.blockedDays || [];
        const newBlocked = blocked.includes(day)
            ? blocked.filter(d => d !== day)
            : [...blocked, day];
        onChange({ ...constraints, blockedDays: newBlocked });
    };

    // Use default values if not set
    const minCourses = constraints.minCourses ?? 1;
    const maxCourses = constraints.maxCourses ?? 5;

    return (
        <div className="global-constraints-panel">
            <h2>Global Timetable Constraints</h2>

            <div className="constraint-row">
                <label><Tooltip text="Only generate timetables with at least this many courses." />Minimum courses:</label>
                <input
                    type="number"
                    min="0"
                    value={minCourses}
                    onChange={e => onChange({ ...constraints, minCourses: e.target.value ? parseInt(e.target.value) : 1 })}
                />
            </div>

            <div className="constraint-row">
                <label><Tooltip text="Only generate timetables with no more than this many courses." />Maximum courses:</label>
                <input
                    type="number"
                    min="0"
                    value={maxCourses}
                    onChange={e => onChange({ ...constraints, maxCourses: e.target.value ? parseInt(e.target.value) : 5 })}
                />
            </div>

            <div className="constraint-row">
                <label><Tooltip text="Do not select any classes that are scheduled on these days." />Blocked Days:</label>
                <div className="day-selector">
                    {days.map(day => (
                        <button
                            key={day}
                            className={`day-btn ${constraints.blockedDays?.includes(day) ? 'blocked' : ''}`}
                            onClick={() => toggleBlockedDay(day)}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}