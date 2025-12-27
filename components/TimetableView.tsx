import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { TimetableConfiguration } from '../lib/timetable_generator';
import { Day } from '../lib/types/course';

interface Props {
    timetables: TimetableConfiguration[];
}

interface TimetableBlock {
    courseId: string;
    courseName: string;
    courseDisplayName: string;
    sectionId: string;
    type: 'lecture' | 'tutorial';
    day: Day;
    startTime: number;
    endTime: number;
}

export function TimetableView({ timetables }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timetableRef = useRef<HTMLDivElement>(null);

    const handleSaveAsPNG = async () => {
        if (!timetableRef.current) return;

        try {
            const canvas = await html2canvas(timetableRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher resolution
            });

            const link = document.createElement('a');
            link.download = `timetable-${currentIndex + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to save timetable as PNG:', error);
        }
    };

    if (!timetables || timetables.length === 0) return null;

    // Sort timetables by number of selected courses so the user sees the most complete tables first
    const sortedTimetables = [...timetables].sort((a, b) => {
        const countA = Array.from(a.courses.values()).filter(c => c !== null).length;
        const countB = Array.from(b.courses.values()).filter(c => c !== null).length;
        return countB - countA; // Descending order
    });

    const currentTimetable = sortedTimetables[currentIndex];

    if (!currentTimetable || !currentTimetable.courses) return null;

    // Extract all blocks (lectures and tutorials) from the current timetable
    const blocks: TimetableBlock[] = [];

    currentTimetable.courses.forEach((selectedCourse) => {
        if (!selectedCourse) return;

        const courseName = selectedCourse.courseName || selectedCourse.courseId;
        const suffix = selectedCourse.sectionSuffix || 'A';
        const courseDisplayName = `${courseName}-${suffix}`;

        // Add lecture blocks
        selectedCourse.sectionTime.days.forEach(day => {
            blocks.push({
                courseId: selectedCourse.courseId,
                courseName: courseName,
                courseDisplayName: courseDisplayName,
                sectionId: selectedCourse.sectionId,
                type: 'lecture',
                day,
                startTime: selectedCourse.sectionTime.startTime,
                endTime: selectedCourse.sectionTime.endTime
            });
        });

        // Add tutorial blocks if present
        if (selectedCourse.tutorialTime) {
            selectedCourse.tutorialTime.days.forEach(day => {
                blocks.push({
                    courseId: selectedCourse.courseId,
                    courseName: courseName,
                    courseDisplayName: courseDisplayName,
                    sectionId: selectedCourse.tutorialId || '',
                    type: 'tutorial',
                    day,
                    startTime: selectedCourse.tutorialTime!.startTime,
                    endTime: selectedCourse.tutorialTime!.endTime
                });
            });
        }
    });

    const days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    // Calculate the latest end time from all blocks
    const latestEndTime = blocks.reduce((max, block) => Math.max(max, block.endTime), 8 * 60);
    // Convert to hour and add 1 hour buffer, minimum 8 AM start, cap at 9 PM
    const latestHour = Math.min(Math.ceil(latestEndTime / 60) + 1, 21);
    // Also find earliest start time
    const earliestStartTime = blocks.length > 0
        ? blocks.reduce((min, block) => Math.min(min, block.startTime), 24 * 60)
        : 8 * 60;
    const earliestHour = Math.max(Math.floor(earliestStartTime / 60), 8);

    const hours = Array.from({ length: latestHour - earliestHour }, (_, i) => i + earliestHour);

    const formatTime = (hour: number): string => {
        if (hour === 12) return '12 PM';
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
    };

    const formatMinutesToTime = (minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
    };

    const getBlockForCell = (day: Day, hour: number): TimetableBlock | null => {
        const hourStart = hour * 60;
        const hourEnd = (hour + 1) * 60;

        return blocks.find(block =>
            block.day === day &&
            block.startTime < hourEnd &&
            block.endTime > hourStart
        ) || null;
    };

    const isBlockStart = (block: TimetableBlock, hour: number): boolean => {
        const hourStart = hour * 60;
        return block.startTime >= hourStart && block.startTime < hourStart + 60;
    };

    const handlePrevious = () => {
        setCurrentIndex(prev => (prev - 1 + sortedTimetables.length) % sortedTimetables.length);
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % sortedTimetables.length);
    };

    return (
        <div className="timetable-view">
            <div className="timetable-header">
                <button
                    onClick={handlePrevious}
                    className="nav-btn"
                    disabled={sortedTimetables.length <= 1}
                >
                    ← Previous
                </button>
                <h2>
                    Timetable {currentIndex + 1} of {sortedTimetables.length}
                </h2>
                <button
                    onClick={handleNext}
                    className="nav-btn"
                    disabled={sortedTimetables.length <= 1}
                >
                    Next →
                </button>
            </div>

            <button onClick={handleSaveAsPNG} className="save-png-btn">
                Save as .PNG
            </button>

            <div className="timetable-grid-container" ref={timetableRef}>
                <div className="timetable-grid">
                    {/* Header row with days */}
                    <div className="time-column-header"></div>
                    {days.map(day => (
                        <div key={day} className="day-header">
                            {day}
                        </div>
                    ))}

                    {/* Time rows */}
                    {hours.map(hour => (
                        <React.Fragment key={hour}>
                            <div className="time-label">
                                {formatTime(hour)}
                            </div>
                            {days.map(day => {
                                const block = getBlockForCell(day, hour);
                                const showContent = block && isBlockStart(block, hour);

                                return (
                                    <div key={`${day}-${hour}`} className="time-cell">
                                        {showContent && (
                                            <div
                                                className={`course-block ${block.type}`}
                                                style={{
                                                    height: `${((block.endTime - block.startTime) / 60) * 60}px`
                                                }}
                                                title={`${block.courseDisplayName} - ${block.type === 'tutorial' ? 'Tutorial' : 'Lecture'}\n${formatMinutesToTime(block.startTime)} - ${formatMinutesToTime(block.endTime)}`}
                                            >
                                                <div className="course-name">{block.courseDisplayName}</div>
                                                <div className="course-time">
                                                    {formatMinutesToTime(block.startTime)} - {formatMinutesToTime(block.endTime)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="course-list">
                <h3>Selected Sections ({Array.from(currentTimetable.courses.values()).filter(c => c !== null).length})</h3>
                <ul>
                    {Array.from(currentTimetable.courses.values())
                        .filter(c => c !== null)
                        .map(course => {
                            const suffix = course!.sectionSuffix || 'A';
                            const displayName = `${course!.courseName || course!.courseId}-${suffix}`;
                            return (
                                <li key={course!.courseId}>
                                    <strong>{displayName}</strong>
                                    {course!.tutorialId && ' • with tutorial'}
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
}