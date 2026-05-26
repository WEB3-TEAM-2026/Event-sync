"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "light" as const, label: "Clair", icon: Sun },
    { value: "dark"  as const, label: "Sombre", icon: Moon },
    { value: "system" as const, label: "Système", icon: Monitor },
  ];

  const current = options.find((o) => o.value === theme) ?? options[2];
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full",
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
          "hover:bg-[var(--surface-hover)] border border-transparent",
          open && "bg-[var(--surface-hover)] border-[var(--border)]"
        )}
        title="Changer le thème"
      >
        <Icon size={16} />
        <span>{current.label}</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-36 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-lg)] overflow-hidden animate-slide-up z-50">
          {options.map(({ value, label, icon: OptionIcon }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false); }}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors",
                theme === value
                  ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <OptionIcon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}