import { Card, CardContent } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorClass?: string;
  description?: string;
}

export const StatCard = ({ title, value, icon: Icon, colorClass, description }: StatCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className={cn("p-3 rounded-xl", colorClass)}>
          <Icon size={24} />
        </div>
      </div>
    </CardContent>
  </Card>
);