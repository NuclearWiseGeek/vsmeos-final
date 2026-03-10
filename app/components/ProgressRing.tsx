// =============================================================================
// FILE: components/ProgressRing.tsx
// PURPOSE: SVG circular progress ring for the buyer dashboard coverage card.
//          Animates from 0 to the target percentage on mount.
//
// PROPS:
//   percent  — 0–100, the coverage value
//   size     — diameter in px (default 120)
//   stroke   — ring thickness (default 10)
// =============================================================================

'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
}

export default function ProgressRing({ percent, size = 120, stroke = 10 }: ProgressRingProps) {
  const [displayed, setDisplayed] = useState(0);

  // Animate on mount
  useEffect(() => {
    const start  = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(Math.round(percent * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [percent]);

  const radius      = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (displayed / 100) * circumference;

  // Colour thresholds matching the CoverageBar logic
  const colour =
    displayed >= 80 ? '#16a34a' :  // green
    displayed >= 50 ? '#2563eb' :  // blue
    displayed >= 25 ? '#d97706' :  // amber
                      '#dc2626';   // red

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s ease' }}
        />
      </svg>

      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-extrabold tracking-tighter leading-none"
          style={{ fontSize: size * 0.22, color: colour }}
        >
          {displayed}%
        </span>
        <span className="text-gray-400 font-medium mt-0.5" style={{ fontSize: size * 0.09 }}>
          COVERAGE
        </span>
      </div>
    </div>
  );
}