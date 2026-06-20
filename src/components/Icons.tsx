import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const Search = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const Heart = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7-4.6-9.2-9C1.5 8.3 2.8 5 6 5c2 0 3.2 1.4 4 2.6C10.8 6.4 12 5 14 5c3.2 0 4.5 3.3 3.2 6-2.2 4.4-9.2 9-9.2 9Z" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m4 12 5 5L20 6" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const Pin = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);

export const Gauge = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="M12 18 16 9" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const Seat = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 4v8h7M6 12l-1 6M13 12l3 6M5 18h14" />
  </svg>
);

export const Bolt = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />
  </svg>
);

export const Cog = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </svg>
);

export const Compass = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-4 1.5L9.5 15l4-1.5L15 9Z" />
  </svg>
);

export const User = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
  </svg>
);

export const Calendar = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 9h17M8 3v4M16 3v4" />
  </svg>
);

export const Plus = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Trash = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </svg>
);

export const Spinner = (p: IconProps) => (
  <svg {...base} {...p} className={`animate-spin ${p.className ?? ""}`}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);
