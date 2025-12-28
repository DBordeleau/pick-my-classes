import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { TimetableConfiguration } from '../lib/timetable_generator';
import { Day } from '../lib/types/course';
import { FaGoogle } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";

interface Props {
    timetables: TimetableConfiguration[];
    pendingExport?: boolean;
    onPendingExportHandled?: () => void;
    onBeforeOAuthRedirect?: () => void;
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

interface GoogleTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}

interface InitialAuthState {
    tokens: GoogleTokens | null;
    showModal: boolean;
    error: string | null;
}

// Helper to get initial tokens from URL or sessionStorage (client-side only)
function getInitialTokens(): InitialAuthState {
    if (typeof window === 'undefined') {
        return { tokens: null, showModal: false, error: null };
    }

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const authError = params.get('auth_error');

    if (authError) {
        // Defer URL cleanup to avoid setState during render warning
        setTimeout(() => window.history.replaceState({}, '', window.location.pathname), 0);
        return { tokens: null, showModal: false, error: `Google authentication failed: ${authError}` };
    }

    if (accessToken && expiresIn) {
        const tokens: GoogleTokens = {
            accessToken,
            refreshToken: params.get('refresh_token') || undefined,
            expiresAt: Date.now() + parseInt(expiresIn) * 1000,
        };
        sessionStorage.setItem('google_tokens', JSON.stringify(tokens));
        // Defer URL cleanup to avoid setState during render warning
        setTimeout(() => window.history.replaceState({}, '', window.location.pathname), 0);
        return { tokens, showModal: true, error: null };
    }

    // Try to restore from sessionStorage
    const stored = sessionStorage.getItem('google_tokens');
    if (stored) {
        const tokens = JSON.parse(stored) as GoogleTokens;
        if (tokens.expiresAt > Date.now()) {
            return { tokens, showModal: false, error: null };
        }
        sessionStorage.removeItem('google_tokens');
    }

    return { tokens: null, showModal: false, error: null };
}

// Cache initial state to avoid re-computation
let cachedInitialState: InitialAuthState | null = null;
function getCachedInitialState(): InitialAuthState {
    if (cachedInitialState === null) {
        cachedInitialState = getInitialTokens();
    }
    return cachedInitialState;
}

export function TimetableView({ timetables, pendingExport, onPendingExportHandled, onBeforeOAuthRedirect }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timetableRef = useRef<HTMLDivElement>(null);

    // Use lazy initialization to read initial state only once
    const [googleTokens, setGoogleTokens] = useState<GoogleTokens | null>(() => getCachedInitialState().tokens);
    const [showExportModal, setShowExportModal] = useState(() => getCachedInitialState().showModal);
    const [termStart, setTermStart] = useState('');
    const [termEnd, setTermEnd] = useState('');
    const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>(
        () => getCachedInitialState().error ? 'error' : 'idle'
    );
    const [exportMessage, setExportMessage] = useState(() => getCachedInitialState().error || '');
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle pending export after OAuth redirect
    useEffect(() => {
        if (pendingExport && googleTokens && googleTokens.expiresAt > Date.now()) {
            setShowExportModal(true);
            onPendingExportHandled?.();
        }
    }, [pendingExport, googleTokens, onPendingExportHandled]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowExportDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleGoogleCalendarExport = () => {
        if (!googleTokens || googleTokens.expiresAt < Date.now()) {
            // Save timetables before redirecting to OAuth
            onBeforeOAuthRedirect?.();
            // Need to authenticate first
            window.location.href = '/api/auth/google';
            return;
        }
        setShowExportModal(true);
    };

    const handleExportConfirm = async () => {
        if (!termStart || !termEnd) {
            setExportMessage('Please select both term start and end dates.');
            setExportStatus('error');
            return;
        }

        if (new Date(termEnd) <= new Date(termStart)) {
            setExportMessage('Term end date must be after start date.');
            setExportStatus('error');
            return;
        }

        if (!googleTokens) {
            setExportMessage('Not authenticated with Google.');
            setExportStatus('error');
            return;
        }

        setExportStatus('exporting');
        setExportMessage('Exporting to Google Calendar...');

        try {
            const response = await fetch('/api/calendar/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: googleTokens.accessToken,
                    events: blocks.map(block => ({
                        courseName: block.courseDisplayName,
                        type: block.type,
                        day: block.day,
                        startTime: block.startTime,
                        endTime: block.endTime,
                    })),
                    termStart,
                    termEnd,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setExportStatus('success');
                setExportMessage(`Successfully exported the selected timetable to your Google Calendar!`);
                if (result.errors && result.errors.length > 0) {
                    setExportMessage(prev => prev + ` (${result.errors.length} errors)`);
                }
            } else {
                setExportStatus('error');
                setExportMessage(result.error || 'Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            setExportStatus('error');
            setExportMessage('Failed to export to Google Calendar');
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

        // First, prioritize blocks that START in this cell
        // This fixes the case where block A ends at 11:30 and block B starts at 11:30
        // Without this, block A would be found first and since it doesn't start here, nothing renders
        const startingBlock = blocks.find(block =>
            block.day === day &&
            block.startTime >= hourStart &&
            block.startTime < hourEnd
        );

        if (startingBlock) {
            return startingBlock;
        }

        // If no block starts here, look for a block that spans this cell
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

            <div className="export-dropdown" ref={dropdownRef}>
                <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="export-dropdown-btn"
                >
                    Save/Export Timetable
                    <RiArrowDropDownLine className={`dropdown-arrow ${showExportDropdown ? 'expanded' : ''}`} />
                </button>
                <div className={`export-dropdown-menu ${showExportDropdown ? 'open' : ''}`}>
                    <button
                        onClick={() => { handleSaveAsPNG(); setShowExportDropdown(false); }}
                        className="export-dropdown-item"
                    >
                        Save as .PNG
                    </button>
                    <button
                        onClick={() => { handleGoogleCalendarExport(); setShowExportDropdown(false); }}
                        className="export-dropdown-item"
                    >
                        <FaGoogle style={{ marginRight: '0.5rem' }} /> Export to Google Calendar
                    </button>
                </div>
            </div>

            {/* Google Calendar Export Modal */}
            {showExportModal && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Export to Google Calendar</h3>
                        <p>Select the start and end dates of your school term:</p>

                        <div className="term-date-inputs">
                            <label>
                                Term Start:
                                <input
                                    type="date"
                                    value={termStart}
                                    onChange={e => setTermStart(e.target.value)}
                                />
                            </label>
                            <label>
                                Term End:
                                <input
                                    type="date"
                                    value={termEnd}
                                    onChange={e => setTermEnd(e.target.value)}
                                />
                            </label>
                        </div>

                        {exportMessage && (
                            <div className={`export-message ${exportStatus}`}>
                                {exportMessage}
                            </div>
                        )}

                        <div className="modal-buttons">
                            {exportStatus === 'success' ? (
                                <button
                                    onClick={() => {
                                        setShowExportModal(false);
                                        setExportStatus('idle');
                                        setExportMessage('');
                                    }}
                                    className="modal-confirm-btn"
                                >
                                    Done
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowExportModal(false);
                                            setExportStatus('idle');
                                            setExportMessage('');
                                        }}
                                        className="modal-cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExportConfirm}
                                        className="modal-confirm-btn"
                                        disabled={exportStatus === 'exporting'}
                                    >
                                        {exportStatus === 'exporting' ? 'Exporting...' : 'Export'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

                                // Use consistent scale: 60px per hour (1px per minute)
                                const PIXELS_PER_HOUR = 60;
                                const hourStart = hour * 60;
                                // Calculate the top offset based on how many minutes into the hour the block starts
                                const topOffset = showContent ? ((block.startTime - hourStart) / 60) * PIXELS_PER_HOUR : 0;
                                // Calculate height and subtract pixels to create visible gap between blocks
                                const durationMinutes = showContent ? block.endTime - block.startTime : 0;
                                const blockHeight = showContent ? (durationMinutes / 60) * PIXELS_PER_HOUR - 4 : 0;

                                return (
                                    <div key={`${day}-${hour}`} className="time-cell">
                                        {showContent && (
                                            <div
                                                className={`course-block ${block.type}`}
                                                style={{
                                                    top: `${topOffset}px`,
                                                    height: `${blockHeight}px`
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