import Link from "next/link";
import { PlusCircle, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const actions = [
  { label: "Événement", href: "/admin/events/new", icon: Calendar, color: "bg-blue-600" },
  { label: "Intervenant", href: "/admin/speakers/new", icon: Users, color: "bg-purple-600" },
  { label: "Session", href: "/admin/sessions/new", icon: PlusCircle, color: "bg-green-600" },
];

export const QuickActions = () => (
  <div className="grid grid-cols-1 gap-3">
    <h3 className="font-semibold text-gray-900 mb-2">Actions rapides</h3>
    {actions.map((action) => (
      <Link key={action.label} href={action.href}>
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group">
          <div className={cn("p-2 rounded-lg text-white", action.color)}>
            <action.icon size={18} />
          </div>
          <span className="font-medium text-sm text-gray-700 group-hover:text-blue-600">
            Ajouter un {action.label}
          </span>
        </div>
      </Link>
    ))}
  </div>
);