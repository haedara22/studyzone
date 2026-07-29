import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24",
        "relative overflow-hidden",
        className
      )}
    >
      {children}
    </section>
  );
};