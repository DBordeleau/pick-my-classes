import React from 'react';
import { BlockedTimeslot, BlockedTimeslotType, Day } from '../lib/types/course';
import { Tooltip } from './Tooltip';

interface Props {
    blockedSlot: BlockedTimeslot;
    onChange: (blockedSlot: BlockedTimeslot) => void;
    onDelete: () => void;
}

export function BlockedTimeslotEditor({ blockedSlot, onChange, onDelete }: Props) {
    const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const toggleDay = (day: Day) => {
        const current = blockedSlot.days || [];
        const newDays = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day];
        onChange({ ...blockedSlot, days: newDays });
    };

    const setAllDays = () => {
        onChange({ ...blockedSlot, days: [] }); // Empty array means "any day"
    };

    const formatTime = (minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const parseTime = (timeStr: string): number => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const handleTypeChange = (newType: BlockedTimeslotType) => {
        const updated: BlockedTimeslot = { ...blockedSlot, type: newType };

        // Set appropriate default times based on type
        if (newType === 'before') {
            updated.startTime = undefined;
            updated.endTime = 540; // 9:00 AM
        } else if (newType === 'between') {
            updated.startTime = 600; // 10:00 AM
            updated.endTime = 780; // 1:00 PM
        } else if (newType === 'after') {
            updated.startTime = 1080; // 6:00 PM
            updated.endTime = undefined;
        }

        onChange(updated);
    };

    const hasSpecificDays = blockedSlot.days && blockedSlot.days.length > 0;
    const isAnyDay = !hasSpecificDays;

    return (
        <div className="blocked-timeslot-editor">
            <div className="blocked-day-selector">
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                    <Tooltip text="Select specific days or 'Any Day' to block this time on all days" />
                    Days:
                </label>
                <div className="day-selector">
                    <button
                        className={`day-btn ${isAnyDay ? 'selected' : ''}`}
                        onClick={setAllDays}
                    >
                        Any Day
                    </button>
                    {days.map(day => (
                        <button
                            key={day}
                            className={`day-btn ${hasSpecificDays && blockedSlot.days.includes(day) ? 'selected' : ''}`}
                            onClick={() => toggleDay(day)}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            <div className="blocked-timeslot-header">
                <select
                    value={blockedSlot.type}
                    onChange={e => handleTypeChange(e.target.value as BlockedTimeslotType)}
                    className="blocked-type-select"
                >
                    <option value="before">Before</option>
                    <option value="between">Between</option>
                    <option value="after">After</option>
                </select>
                <button onClick={onDelete} className="delete-btn-small">×</button>
            </div>


            <div className="blocked-time-inputs">
                {blockedSlot.type === 'before' && (
                    <label>
                        <span className="font-semibold">
                            <Tooltip text="Block all times before this time" position="right" />
                            Before:
                        </span>
                        <input
                            type="time"
                            value={formatTime(blockedSlot.endTime ?? 540)}
                            onChange={e => onChange({ ...blockedSlot, endTime: parseTime(e.target.value) })}
                        />
                    </label>
                )}

                {blockedSlot.type === 'between' && (
                    <>
                        <label>
                            <span className="font-semibold">
                                <Tooltip text="Block starting from this time" position="right" />
                                Start:
                            </span>
                            <input
                                type="time"
                                value={formatTime(blockedSlot.startTime ?? 600)}
                                onChange={e => onChange({ ...blockedSlot, startTime: parseTime(e.target.value) })}
                            />
                        </label>
                        <label>
                            <span className="font-semibold">
                                <Tooltip text="Block until this time" position="right" />
                                End:
                            </span>
                            <input
                                type="time"
                                value={formatTime(blockedSlot.endTime ?? 780)}
                                onChange={e => onChange({ ...blockedSlot, endTime: parseTime(e.target.value) })}
                            />
                        </label>
                    </>
                )}

                {blockedSlot.type === 'after' && (
                    <label>
                        <span className="font-semibold">
                            <Tooltip text="Block all times after this time" position="right" />
                            After:
                        </span>
                        <input
                            type="time"
                            value={formatTime(blockedSlot.startTime ?? 1080)}
                            onChange={e => onChange({ ...blockedSlot, startTime: parseTime(e.target.value) })}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}