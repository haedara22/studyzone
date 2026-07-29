import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full",
        "bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary",
        className
      )}
    >
      {children}
    </span>
  );
};