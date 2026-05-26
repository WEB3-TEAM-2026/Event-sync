import { cn } from "@/lib/utils/cn"; 

export const Badge = ({ 
  children, 
  color = "gray" 
}: { 
  children: React.ReactNode, 
  color?: "red" | "green" | "blue" | "gray" 
}) => {
  const colors = {
    red: "bg-red-100 text-red-700 border-red-200",
    green: "bg-green-100 text-green-700 border-green-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", colors[color])}>
      {children}
    </span>
  );
};