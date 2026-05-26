import { cn } from "@/lib/utils/cn"; 

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-5", className)}>{children}</div>
);