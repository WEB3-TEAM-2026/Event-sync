"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  Home,
  Calendar,
  Users,
  Star,
  Search,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Événements", href: "/events", icon: Calendar },
  { name: "Intervenants", href: "/speakers", icon: Users },
  { name: "Mes Favoris", href: "/favorites", icon: Star },
];

export const PublicSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleOrganizerClick() {
    setIsOpen(false);
    if (!mounted || status === "loading") return;
    if (session?.user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <span className="text-xl font-bold text-blue-600 tracking-tight">
              EventSync
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    size={20}
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 space-y-4 border-t border-gray-100">
            {mounted ? (
              <Button
                variant="secondary"
                className="w-full justify-start gap-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700"
                onClick={handleOrganizerClick}
                disabled={status === "loading"}
              >
                <Settings size={18} className="text-gray-500" />
                {status === "loading" ? "Chargement..." : "Espace Organisateur"}
              </Button>
            ) : (
              <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
            )}

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
