"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "总览" },
  { href: "/graph", label: "深度图谱" },
  { href: "/events", label: "事件流" },
  { href: "/sources", label: "数据源" },
  { href: "/exports", label: "Skill Pack" }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-panel/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1840px] flex-wrap items-center gap-3 px-4 py-3 sm:px-5 lg:flex-nowrap lg:px-6">
        <Link href="/" className="flex min-w-[160px] items-center gap-3">
          <span className="relative block h-5 w-8">
            <span className="absolute left-0 top-0 h-1.5 w-8 rounded-full bg-blue" />
            <span className="absolute left-1 top-2 h-1.5 w-7 rounded-full bg-amber" />
            <span className="absolute left-0 top-4 h-1.5 w-8 rounded-full bg-blue" />
          </span>
          <span className="text-xl font-semibold text-text">FinGraph</span>
        </Link>

        <nav className="order-3 flex w-full min-w-0 items-center gap-1 overflow-x-auto pt-1 thin-scrollbar lg:order-none lg:w-auto lg:flex-1 lg:pt-0">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-blue/15 text-blue" : "text-muted hover:bg-panel2 hover:text-text"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/api/export/skill-pack?format=zip&prompt=zh"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue/30 bg-blue/10 px-3 text-sm font-medium text-blue transition hover:bg-blue/15"
          >
            <Download className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">导出</span>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
