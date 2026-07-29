import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HeadingProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md";
  center?: boolean;
}

export const Heading = ({
  children,
  className,
  as: Tag = "h2",
  size = "lg",
  center = false,
}: HeadingProps) => {
  const sizes = {
    xl: "text-4xl md:text-6xl font-bold",
    lg: "text-3xl md:text-5xl font-bold",
    md: "text-2xl md:text-3xl font-semibold",
  };

  return (
    <Tag
      className={cn(
        sizes[size],
        "text-foreground",
        center && "text-center",
        className
      )}
    >
      {children}
    </Tag>
  );
};