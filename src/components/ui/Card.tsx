import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className, hover }: CardProps) => (
  <div
    className={cn(
      "bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden",
      hover && "transition-all duration-200 hover:shadow-[var(--shadow)] hover:border-[var(--border-strong)] hover:-translate-y-0.5",
      className
    )}
  >
    {children}
  </div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-5", className)}>{children}</div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-5 py-4 border-b border-[var(--border)]", className)}>{children}</div>
);