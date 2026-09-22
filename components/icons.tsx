type IconProps = { className?: string };

const svg = (className = "size-4") => ({
  viewBox: "0 0 20 20",
  fill: "none",
  "aria-hidden": true,
  className,
});

export function GlobeIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="10" cy="10" rx="3.25" ry="7.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 10h14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function BoltIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <path
        d="M11 2.5 4.75 11.25H9.5L9 17.5l6.25-8.75H10.5L11 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function UsersIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <circle cx="8" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 16.25c0-2.35 2.24-4.25 5-4.25s5 1.9 5 4.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14 5.6a2.6 2.6 0 0 1 0 5M15.4 12.4c1.6.6 2.6 1.95 2.6 3.85"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <path
        d="m5 10.5 3.25 3.25L15 6.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <path
        d="M10 2.5 11.6 8 17 9.5 11.6 11 10 16.5 8.4 11 3 9.5 8.4 8 10 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DocIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <path
        d="M5 3.25h6.5L15 6.75v10H5v-13.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.5 10.5h5M7.5 13h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LinkIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <path
        d="M8.5 11.5a3 3 0 0 0 4.24 0l2-2a3 3 0 1 0-4.24-4.25l-.9.9M11.5 8.5a3 3 0 0 0-4.24 0l-2 2A3 3 0 1 0 9.5 14.75l.9-.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CardIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <rect x="2.75" y="5" width="14.5" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.75 8.5h14.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ShieldIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <path
        d="M10 2.75 16 5v4.5c0 3.6-2.4 6.5-6 7.75-3.6-1.25-6-4.15-6-7.75V5l6-2.25Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BuildingIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <path d="M4 17V4.5h7V17M11 17V8.5h5V17M2.75 17h14.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.5 7.5h2M6.5 10.5h2M6.5 13.5h2M13 11.5h1M13 14h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function GridIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function LaptopIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <rect x="4" y="4.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 15.5h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CircleTargetIcon({ className = "size-4" }: IconProps) {
  return (
    <svg {...svg(className)}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.75" fill="currentColor" />
    </svg>
  );
}

/** Country / entity code chip — rounded.xs, surface-2, ink-subtle. */
export function CountryTag({ code }: { code: string }) {
  return (
    <span className="inline-grid h-4 min-w-6 shrink-0 place-items-center rounded-xs bg-surface-2 px-1 font-mono text-[0.5625rem] uppercase tracking-wide text-ink-subtle">
      {code}
    </span>
  );
}
