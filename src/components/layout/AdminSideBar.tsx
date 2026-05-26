"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { 
  LayoutDashboard, 
  Calendar, 
  Mic2, 
  MapPin, 
  MessageSquare, 
  LogOut, 
  ChevronLeft,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Événements", href: "/admin/events", icon: Calendar },
  { name: "Sessions", href: "/admin/sessions", icon: Mic2 },
  { name: "Intervenants", href: "/admin/speakers", icon: MapPin },
  { name: "Salles", href: "/admin/rooms", icon: MapPin },
  { name: "Questions", href: "/admin/questions", icon: MessageSquare },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col sticky top-0",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!isCollapsed && <span className="font-bold text-xl text-blue-400">AdminSync</span>}
        <Button 
          variant="ghost" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white hover:bg-gray-800 ml-auto"
        >
          <ChevronLeft className={cn("transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {adminNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/" target="_blank">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-white px-3">
            <ExternalLink size={20} />
            {!isCollapsed && <span>Voir le site</span>}
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </aside>
  );
};