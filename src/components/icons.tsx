type IconProps = { className?: string };

const base = (className: string) => ({
  className,
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function SepticIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 8a9 4 0 0 0 18 0a9 4 0 0 0-18 0Z" />
      <path d="M3 8v8a9 4 0 0 0 18 0V8" />
      <path d="M3 12a9 4 0 0 0 18 0" />
    </svg>
  );
}

export function DrainIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function YardDrainIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 17h18M5 17l2-9h10l2 9M9 8V5h6v3" />
      <path d="M8 17v-3M12 17v-3M16 17v-3" />
    </svg>
  );
}

export function PipeIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 7h7a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h3" />
      <path d="M4 4v6M2 7h4M20 14v6M18 17h4" />
    </svg>
  );
}

export function WrenchIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6a1.5 1.5 0 0 0 2.1 2.1l6-6a4 4 0 0 0 5-5.4l-2.5 2.5-2.1-2.1 2.5-2.5Z" />
    </svg>
  );
}

export function CameraIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h5L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  );
}

export function BoltIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function DropletIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 2.7s6 6.3 6 10.3a6 6 0 0 1-12 0c0-4 6-10.3 6-10.3Z" />
    </svg>
  );
}

export function ShieldIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ClockIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function MapPinIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function PhoneIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L19 13l2 5v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function CheckIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}

export function BadgeIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="9" r="6" />
      <path d="m9 14-1.5 7L12 18l4.5 3L15 14" />
    </svg>
  );
}

export function CalendarIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function CashIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9v6M18 9v6" />
    </svg>
  );
}

export function StarIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 0 0 .95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 0 0-.37 1.12l1.07 3.29c.3.92-.75 1.69-1.54 1.12l-2.8-2.03a1 1 0 0 0-1.17 0l-2.8 2.03c-.79.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 0 0-.36-1.12L2.42 9.42c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 0 0 .95-.69L8.5 2.93Z" />
    </svg>
  );
}

export function LeafIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14a6 6 0 0 1-1-1Z" />
      <path d="M9 15c2-3 5-5 8-6" />
    </svg>
  );
}
