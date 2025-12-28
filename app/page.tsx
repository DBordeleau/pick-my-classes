"use client";

import { useState } from "react";
import { TimetableBuilder } from "@/components/TimetableBuilder";

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            What does this app do?
          </button>
          {isExpanded && (
            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="mb-2">
                <strong>PickMyClasses</strong> is a timetable generator that helps you quickly
                discover all valid class combinations based on your
                constraints.
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Set how many courses you need to take (e.g., minimum 4,
                  maximum 5)
                </li>
                <li>
                  Block out timeslots when you&apos;re unavailable (work, commute,
                  personal commitments, exclude exceptionally early/late classes, or exclude entire days)
                </li>
                <li>
                  Organize courses into groups with different selection rules
                  (e.g., &quot;take all 3 core courses&quot; and &quot;pick at least 2 from
                  these 5 electives&quot;)
                </li>
                <li>
                  Instantly generate every possible timetable that fits your
                  requirements
                </li>
                <li>
                  Optionally export your chosen schedule to Google Calendar
                </li>
              </ul>
            </div>
          )}
        </div>
        <TimetableBuilder />
      </div>
      <footer className="py-4 text-center text-sm text-gray-400">
        <a href="/privacy" className="hover:text-gray-600 hover:underline">
          Privacy Policy
        </a>
      </footer>
    </div>
  );
}