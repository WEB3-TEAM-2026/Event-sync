import { cn } from "@/lib/utils/cn";

type BadgeColor = "red" | "green" | "blue" | "gray" | "yellow" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  live?: boolean;
}

export const Badge = ({ children, color = "gray", className, live }: BadgeProps) => {
  const colors: Record<BadgeColor, string> = {
    red:    "bg-[var(--live-subtle)] text-[var(--live)] border-[var(--live-border)]",
    green:  "bg-[var(--success-subtle)] text-[var(--success)] border-green-800/20",
    blue:   "bg-[var(--accent-subtle)] text-[var(--accent-text)] border-[var(--accent)]/20",
    gray:   "bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border)]",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        colors[color],
        className
      )}
    >
      {live && <span className="live-dot" />}
      {children}
    </span>
  );
};