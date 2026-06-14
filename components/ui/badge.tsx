import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  blue: "border-blue/20 bg-blue/10 text-blue",
  amber: "border-amber/25 bg-amber/10 text-amber",
  green: "border-green/25 bg-green/10 text-green",
  red: "border-red/25 bg-red/10 text-red",
  slate: "border-line bg-panel2 text-muted"
};

export function Badge({
  children,
  variant = "slate",
  className
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
