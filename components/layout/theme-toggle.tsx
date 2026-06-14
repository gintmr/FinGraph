"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("fingraph-theme") as Theme | null) ?? "dark";
    setTheme(stored);
    document.documentElement.dataset.theme = stored;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("fingraph-theme", next);
  }

  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-panel2 text-muted transition hover:text-text"
      title={theme === "dark" ? "切换到 Light 模式" : "切换到 Dark 模式"}
      aria-label={theme === "dark" ? "切换到 Light 模式" : "切换到 Dark 模式"}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
