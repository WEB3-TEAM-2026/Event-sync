/**
 * Breadcrumb — navigation fil d'Ariane
 * Affiche le chemin courant avec liens cliquables et séparateurs.
 */

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <Link
        href="/"
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-0.5 rounded"
        aria-label="Accueil"
      >
        <Home size={14} />
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={13} className="text-[var(--text-tertiary)]" />
            {isLast || !item.href ? (
              <span
                className={cn(
                  "px-1 py-0.5 rounded",
                  isLast
                    ? "text-[var(--text-primary)] font-medium truncate max-w-[200px]"
                    : "text-[var(--text-tertiary)]"
                )}
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="px-1 py-0.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors truncate max-w-[200px]"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}