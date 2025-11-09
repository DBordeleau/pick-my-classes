"use client";

import { TimetableBuilder } from "@/components/TimetableBuilder";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TimetableBuilder />
      </div>
    </div>
  );
}