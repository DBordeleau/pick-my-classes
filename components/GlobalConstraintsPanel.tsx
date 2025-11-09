import { GlobalConstraints, BlockedTimeslot } from '../lib/types/course';
import { Tooltip } from './Tooltip';
import { BlockedTimeslotEditor } from './BlockedTimeslotEditor';

interface Props {
    constraints: GlobalConstraints;
    onChange: (constraints: GlobalConstraints) => void;
}

export function GlobalConstraintsPanel({ constraints, onChange }: Props) {
    const minCourses = constraints.minCourses ?? 1;
    const maxCourses = constraints.maxCourses ?? 5;

    const handleAddBlockedSlot = () => {
        const newBlocked: BlockedTimeslot = {
            id: `blocked-${Date.now()}`,
            type: 'before',
            days: [],
            endTime: 540
        };
        const current = constraints.blockedTimeslots || [];
        onChange({ ...constraints, blockedTimeslots: [...current, newBlocked] });
    };

    const handleUpdateBlockedSlot = (id: string, updated: BlockedTimeslot) => {
        const current = constraints.blockedTimeslots || [];
        onChange({
            ...constraints,
            blockedTimeslots: current.map(b => b.id === id ? updated : b)
        });
    };

    const handleDeleteBlockedSlot = (id: string) => {
        const current = constraints.blockedTimeslots || [];
        onChange({
            ...constraints,
            blockedTimeslots: current.filter(b => b.id !== id)
        });
    };

    return (
        <div className="global-constraints-panel">
            <h2>Global Timetable Constraints</h2>

            <div className="constraint-row">
                <label>
                    <Tooltip text="Only generate timetables with at least this many courses." />
                    Minimum courses:
                </label>
                <input
                    type="number"
                    min="0"
                    value={minCourses}
                    onChange={e => onChange({ ...constraints, minCourses: e.target.value ? parseInt(e.target.value) : 1 })}
                />
            </div>

            <div className="constraint-row">
                <label>
                    <Tooltip text="Only generate timetables with no more than this many courses." />
                    Maximum courses:
                </label>
                <input
                    type="number"
                    min="0"
                    value={maxCourses}
                    onChange={e => onChange({ ...constraints, maxCourses: e.target.value ? parseInt(e.target.value) : 5 })}
                />
            </div>

            <div className="blocked-timeslots-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        <Tooltip text="Block specific times to exclude courses scheduled during these periods" />
                        Blocked Time Slots:
                    </label>
                    <button onClick={handleAddBlockedSlot} className="add-btn-small">
                        + Add Blocked Slot
                    </button>
                </div>

                {(constraints.blockedTimeslots || []).length === 0 && (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                        No blocked timeslots. Add one to exclude specific times from your timetable.
                    </p>
                )}

                {(constraints.blockedTimeslots || []).map(blocked => (
                    <BlockedTimeslotEditor
                        key={blocked.id}
                        blockedSlot={blocked}
                        onChange={updated => handleUpdateBlockedSlot(blocked.id, updated)}
                        onDelete={() => handleDeleteBlockedSlot(blocked.id)}
                    />
                ))}
            </div>
        </div>
    );
}