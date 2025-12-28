import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PickMyClasses - Student Timetable Generator",
  description: "Generate all possible timetables based on your needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="HqHXavR8qmTc8NSOREruXRLGlBWeKhnoEcgyLrQNtyo" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-linear-to-br from-white via-blue-50 to-blue-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
