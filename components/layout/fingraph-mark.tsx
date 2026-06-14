"use client";

import { cn } from "@/lib/utils/cn";

export function FinGraphMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="FinGraph"
      className={cn("h-10 w-10 shrink-0", className)}
    >
      <defs>
        <linearGradient id="fg-blue" x1="10" x2="38" y1="12" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7bb5ff" />
          <stop offset="1" stopColor="#2f6df6" />
        </linearGradient>
        <linearGradient id="fg-amber" x1="12" x2="36" y1="11" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd56b" />
          <stop offset="1" stopColor="#f2a232" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="rgb(var(--color-panel2))" />
      <rect x="4.75" y="4.75" width="38.5" height="38.5" rx="11.25" fill="none" stroke="rgb(var(--color-line))" strokeWidth="1.5" />
      <path d="M12 16.6 20.5 12l7.4 4 8.1-4.4" fill="none" stroke="url(#fg-blue)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.4" />
      <path d="M12 24 20.5 19.4l7.4 4 8.1-4.4" fill="none" stroke="url(#fg-amber)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.4" />
      <path d="M12 31.4 20.5 26.8l7.4 4 8.1-4.4" fill="none" stroke="url(#fg-blue)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.4" />
      <circle cx="20.5" cy="12" r="2.1" fill="#9cc8ff" />
      <circle cx="27.9" cy="23.4" r="2.1" fill="#ffd56b" />
      <circle cx="36" cy="26.4" r="2.1" fill="#5c91ff" />
    </svg>
  );
}
