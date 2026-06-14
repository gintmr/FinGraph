import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="fingraph-bg min-h-screen">
      <div className="min-h-screen">
        <TopNav />
        <div className="mx-auto w-full max-w-[1840px] px-4 pb-8 pt-4 sm:px-5 lg:px-6">{children}</div>
      </div>
    </main>
  );
}
