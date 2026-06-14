import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "panel-border min-w-0 rounded-lg bg-panel/92 shadow-glow backdrop-blur-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  action,
  subtitle
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-12 items-start justify-between gap-4 border-b border-line/70 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-text">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
