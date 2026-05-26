import { cn } from "@/lib/utils/cn";

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "w-full px-3.5 py-2.5 rounded-xl text-sm",
      "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]",
      "placeholder:text-[var(--text-tertiary)]",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]",
      "transition-all duration-150",
      className
    )}
    {...props}
  />
);

export const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "w-full px-3.5 py-2.5 rounded-xl text-sm resize-none",
      "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]",
      "placeholder:text-[var(--text-tertiary)]",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]",
      "transition-all duration-150",
      className
    )}
    {...props}
  />
);