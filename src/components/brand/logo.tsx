import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: number;
}

/** Stylized "V" badge — navy shield with a green leaf accent, echoing the Veltrix Group identity. */
export function LogoMark({ className, size = 36 }: LogoMarkProps) {
  // Multiple marks can render on one page (header, sidebar, mobile sheet) — gradient
  // ids must be unique per instance, or a hidden copy can hijack a visible one's paint.
  const uid = useId();
  const navyId = `${uid}-navy`;
  const greenId = `${uid}-green`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-sm", className)}
      role="img"
      aria-label="Veltrix Group"
    >
      <defs>
        <linearGradient id={navyId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#13294f" />
          <stop offset="1" stopColor="#081226" />
        </linearGradient>
        <linearGradient id={greenId} x1="22" y1="2" x2="38" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5fc46a" />
          <stop offset="1" stopColor="#1f8a4c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${navyId})`} />
      <path
        d="M10 11 L22 33 L24.5 28 L15 11 Z M38 11 L26 33 L23.5 28 L33 11 Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M24 18 C20.5 18 18 15.6 18 11.6 C18 9 19.3 6.6 22 5 C23 8 27 8.4 28.5 11.4 C30 14.4 28 18 24 18 Z"
        fill={`url(#${greenId})`}
      />
      <path
        d="M22.2 6.5 C22.6 9.4 24.6 12.6 27.6 14.6"
        stroke="#0c3d22"
        strokeOpacity="0.35"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markSize?: number;
  /** Render light wordmark text for use on dark backgrounds */
  inverted?: boolean;
  /** Show the "Moving Today. Powering Tomorrow." tagline below the wordmark */
  tagline?: boolean;
}

/** Full lockup: mark + "VELTRIX / GROUP" wordmark, optionally with tagline. */
export function Logo({ className, markSize = 40, inverted = false, tagline = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark size={markSize} />
      <div className="leading-tight">
        <div
          className={cn(
            "font-heading font-black tracking-tight",
            markSize >= 40 ? "text-2xl" : "text-lg",
            inverted ? "text-white" : "text-[#0B1F4D]"
          )}
        >
          VELTRIX
        </div>
        <div className="flex items-center gap-1.5 -mt-0.5">
          <span className={cn("h-px w-3", inverted ? "bg-emerald-400/70" : "bg-[#1f8a4c]/60")} />
          <span
            className={cn(
              "font-heading font-bold uppercase tracking-[0.25em]",
              markSize >= 40 ? "text-[11px]" : "text-[9px]",
              inverted ? "text-emerald-300" : "text-[#1f8a4c]"
            )}
          >
            Group
          </span>
          <span className={cn("h-px w-3", inverted ? "bg-emerald-400/70" : "bg-[#1f8a4c]/60")} />
        </div>
        {tagline && (
          <p className={cn("text-[11px] font-medium mt-1.5", inverted ? "text-slate-300" : "text-slate-500")}>
            Moving Today. <span className={inverted ? "text-emerald-300" : "text-[#1f8a4c]"}>Powering Tomorrow.</span>
          </p>
        )}
      </div>
    </div>
  );
}
