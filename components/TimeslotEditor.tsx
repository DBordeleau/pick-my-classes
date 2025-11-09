import React from 'react';
import { TimeSlot, Day } from '../lib/types/course';

interface Props {
    timeslot: TimeSlot;
    onChange: (timeslot: TimeSlot) => void;
    label?: string;
}

export function TimeslotEditor({ timeslot, onChange, label }: Props) {
    const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const toggleDay = (day: Day) => {
        const newDays = timeslot.days.includes(day)
            ? timeslot.days.filter(d => d !== day)
            : [...timeslot.days, day];
        onChange({ ...timeslot, days: newDays });
    };

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const parseTime = (timeStr: string): number => {
        const [hours, mins] = timeStr.split(':').map(Number);
        return hours * 60 + mins;
    };

    return (
        <div className="timeslot-editor">
            {label && <label>{label}</label>}

            <div className="day-selector">
                {days.map(day => (
                    <button
                        key={day}
                        className={`day-btn ${timeslot.days.includes(day) ? 'selected' : ''}`}
                        onClick={() => toggleDay(day)}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="time-inputs">
                <label>
                    Start:
                    <input
                        type="time"
                        value={formatTime(timeslot.startTime)}
                        onChange={e => onChange({ ...timeslot, startTime: parseTime(e.target.value) })}
                    />
                </label>
                <label>
                    End:
                    <input
                        type="time"
                        value={formatTime(timeslot.endTime)}
                        onChange={e => onChange({ ...timeslot, endTime: parseTime(e.target.value) })}
                    />
                </label>
            </div>
        </div>
    );
}