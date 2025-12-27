"use client";

import { TimetableBuilder } from "@/components/TimetableBuilder";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
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