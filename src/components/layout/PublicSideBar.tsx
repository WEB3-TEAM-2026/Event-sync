"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  Home,
  Calendar,
  Users,
  Star,
  Menu,
  X,
  Settings,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Événements", href: "/events", icon: Calendar },
  { name: "Intervenants", href: "/speakers", icon: Users },
  { name: "Mes favoris", href: "/favorites", icon: Star },
];

const ADMIN_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:5173")
    : "http://localhost:5173";

type SidebarContentProps = {
  pathname: string | null;
  onClose: () => void;
};

const SidebarContent = ({ pathname, onClose }: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    <div className="h-16 flex items-center gap-2.5 px-5 border-b border-(--border)">
      <div className="w-8 h-8 rounded-xl bg-(--accent) flex items-center justify-center shadow-sm">
        <Zap size={16} className="text-white" />
      </div>
      <span className="text-lg font-bold tracking-tight brand-gradient">
        EventSync
      </span>
    </div>

    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
      <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-(--text-tertiary)">
        Navigation
      </p>
      {navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-(--accent-subtle) text-(--accent-text)"
                : "text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)",
            )}
          >
            <item.icon
              size={17}
              className={
                isActive ? "text-(--accent)" : "text-(--text-tertiary)"
              }
            />
            {item.name}
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-(--accent)" />
            )}
          </Link>
        );
      })}
    </nav>

    <div className="p-3 space-y-1.5 border-t border-(--border)">
      <ThemeToggle />

      {/* Organisateur button*/}
      <a
        href={ADMIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className={cn(
          "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
          "border border-(--border) text-(--text-secondary)",
          "hover:border-(--accent) hover:text-(--accent-text) hover:bg-(--accent-subtle)",
        )}
      >
        <Settings size={16} className="shrink-0" />
        <span>Page organisateur</span>
        <ExternalLink size={13} className="ml-auto opacity-50" />
      </a>
    </div>
  </div>
);

export const PublicSidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-(--surface) border border-(--border) shadow-(--shadow-sm) text-(--text-primary)"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-65",
          "bg-(--surface) border-r border-(--border)",
          "transform transition-transform duration-250 ease-in-out",
          "lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          pathname={pathname}
          onClose={() => setIsOpen(false)}
        />
      </aside>
    </>
  );
};
