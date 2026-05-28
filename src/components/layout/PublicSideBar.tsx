"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  Home, Calendar, Users, Star, Menu, X, Settings, Zap,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

const navigation = [
  { name: "Accueil",      href: "/",          icon: Home },
  { name: "Événements",   href: "/events",     icon: Calendar },
  { name: "Intervenants", href: "/speakers",   icon: Users },
  { name: "Mes favoris",  href: "/favorites",  icon: Star },
];

type SidebarContentProps = {
  pathname: string | null;
  session: Session | null;
  status: "authenticated" | "unauthenticated" | "loading";
  onClose: () => void;
  onOrganizerClick: () => void;
};

const SidebarContent = ({ pathname, session, status, onClose, onOrganizerClick }: SidebarContentProps) => (
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
                : "text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)"
            )}
          >
            <item.icon
              size={17}
              className={isActive ? "text-(--accent)" : "text-(--text-tertiary)"}
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

      <button
        onClick={onOrganizerClick}
        disabled={status === "loading"}
        className={cn(
          "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
          "border border-(--border) text-(--text-secondary)",
          "hover:border-(--accent) hover:text-(--accent-text) hover:bg-(--accent-subtle)",
          "disabled:opacity-50"
        )}
      >
        <Settings size={16} className="shrink-0" />
        {status === "loading" ? "Chargement..." : session?.user ? "Dashboard" : "Espace Organisateur"}
      </button>
    </div>
  </div>
);

export const PublicSidebar = () => {
  const pathname  = usePathname();
  const router    = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  function handleOrganizerClick() {
    setIsOpen(false);
    if (status === "loading") return;
    router.push(session?.user ? "/dashboard" : "/auth/signin");
  }

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
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          pathname={pathname}
          session={session}
          status={status}
          onClose={() => setIsOpen(false)}
          onOrganizerClick={handleOrganizerClick}
        />
      </aside>
    </>
  );
};