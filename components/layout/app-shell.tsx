import type { ReactNode } from "react";
import { Github } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="fingraph-bg min-h-screen">
      <div className="min-h-screen">
        <TopNav />
        <div className="mx-auto w-full max-w-[1840px] px-4 pb-8 pt-4 sm:px-5 lg:px-6">
          {children}
          <footer className="mt-8 border-t border-line/70 pt-5">
            <a
              href="https://github.com/gintmr/FinGraph"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel/75 px-3 py-2 text-sm font-medium text-muted transition hover:border-blue/35 hover:bg-blue/10 hover:text-blue"
            >
              <Github className="h-4 w-4" aria-hidden />
              GitHub: gintmr/FinGraph
            </a>
          </footer>
        </div>
      </div>
    </main>
  );
}
