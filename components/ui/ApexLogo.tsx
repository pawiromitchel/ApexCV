import React from "react";

interface ApexLogoProps {
  className?: string;
  size?: number;
}

export function ApexLogo({ className = "w-6 h-6", size }: ApexLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="apex-bg-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="apex-glyph-grad" x1="16" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <filter id="apex-glyph-shadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0c4a6e" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Rounded App Icon Tile */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#apex-bg-grad)" />
      <rect x="2.5" y="2.5" width="59" height="59" rx="15.5" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />

      {/* Apex Chevron / Stylized "A" and CV document elements */}
      <g filter="url(#apex-glyph-shadow)">
        <path d="M32 13L47 43H38.5L32 29.5L25.5 43H17L32 13Z" fill="url(#apex-glyph-grad)" />
        <rect x="25.5" y="34.5" width="13" height="3" rx="1.5" fill="#0369a1" />
        <circle cx="32" cy="22" r="2.5" fill="#0284c7" />
        <rect x="22" y="47.5" width="20" height="2.5" rx="1.25" fill="#ffffff" fillOpacity="0.9" />
      </g>
    </svg>
  );
}
