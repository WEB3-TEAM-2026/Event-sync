
import { cn } from "@/lib/utils/cn";

type Variant = "pill" | "banner" | "dot";

interface LiveBadgeProps {
  className?: string;
  variant?: Variant;
  count?: number; 
}

export function LiveBadge({ className, variant = "pill", count }: LiveBadgeProps) {
  if (variant === "dot") {
    return (
      <span
        className={cn("relative flex h-2.5 w-2.5", className)}
        aria-label="Session en direct"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold",
          "bg-red-500 text-white shadow-sm shadow-red-500/30",
          className
        )}
        aria-label="Session en direct"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        EN DIRECT
      </span>
    );
  }

  // pill (défaut)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
        "bg-red-500/10 text-red-500 border border-red-500/20",
        "dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25",
        className
      )}
      aria-label={count ? `${count} sessions en direct` : "Session en direct"}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
      </span>
      {count ? `${count} LIVE` : "LIVE"}
    </span>
  );
}