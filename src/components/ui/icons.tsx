import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const BoltIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Base>
);

export const ScaleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v18M7 21h10M5 7h14l-3 7a4 4 0 0 1-8 0L5 7Z" />
    <path d="m9 7 3-4 3 4" />
  </Base>
);

export const GridIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Base>
);

export const SunIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </Base>
);

export const TentIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4 3 20h18L12 4Z" />
    <path d="M12 4v16M12 12l-5 8M12 12l5 8" />
  </Base>
);

export const RvIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7h13a4 4 0 0 1 4 4v6H3V7Z" />
    <circle cx="8" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M3 12h6V7" />
  </Base>
);

export const FridgeIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <path d="M6 10h12M9 5v2M9 13v3" />
  </Base>
);

export const LampIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4h12l-2.5 6h-7L6 4Z" />
    <path d="M12 10v8M8 22h8" />
    <path d="M9 18h6" />
  </Base>
);

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 11 12 3l9 8" />
    <path d="M5 10v10h14V10" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m20 6-11 11-5-5" />
  </Base>
);

export const XIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
);

export const InfoIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 18 6-6-6-6" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M9 7V4h6v3" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const CalculatorIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h4" />
  </Base>
);

export const LaptopIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="16" height="11" rx="1.5" />
    <path d="M2 19h20l-1.5-3h-17L2 19Z" />
  </Base>
);

export const TvIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="12" rx="1.5" />
    <path d="M9 21h6M12 17v4" />
  </Base>
);

export const CpapIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v3H4v-3Z" />
    <path d="M17 13h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-3M8 19v-4M13 19v-4" />
  </Base>
);

export const RouterIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
    <path d="M8 8v6M12 5v9M16 8v6" />
    <path d="M7 17h.01M11 17h.01" />
  </Base>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </Base>
);

export const FanIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 10.5c0-3 1.5-6 4-6.5s3 2 1.5 4.5-4 2-5.5 2Z" />
    <path d="M12 13.5c0 3-1.5 6-4 6.5s-3-2-1.5-4.5 4-2 5.5-2Z" />
    <path d="M10.5 12c-3 0-6-1.5-6.5-4s2-3 4.5-1.5 2 4 2 5.5Z" />
    <path d="M13.5 12c3 0 6 1.5 6.5 4s-2 3-4.5 1.5-2-4-2-5.5Z" />
  </Base>
);

export const MonitorIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M9 20h6M12 16v4" />
  </Base>
);

export const CoolerIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M3 12h18M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Base>
);

export const LanternIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 8h6l-1 10H10L9 8Z" />
    <path d="M10 8V6h4v2M11 4h2M9 18h6" />
  </Base>
);

export const BatteryIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <path d="M22 10v4" />
    <path d="M6 10v4M10 10v4M14 10v4" />
  </Base>
);
