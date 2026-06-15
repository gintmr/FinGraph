"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const newYorkTimeZone = "America/New_York";

export function TimeStatusBanner() {
  const [now, setNow] = useState(() => new Date());
  const visitorTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time", []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const localTime = formatTime(now, visitorTimeZone);
  const newYorkTime = formatTime(now, newYorkTimeZone);

  return (
    <div className="rounded-lg border border-line bg-panel/95 px-4 py-3 shadow-glow">
      <div className="flex flex-col gap-2 text-sm text-muted lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 font-medium text-text">
          <Clock3 className="h-4 w-4 text-blue" aria-hidden />
          数据定时抓取：纽约时间每天 12:00 自动运行
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-line bg-panel2 px-2.5 py-1">
            访客时区 {visitorTimeZone}：{localTime}
          </span>
          <span className="rounded-full border border-blue/25 bg-blue/10 px-2.5 py-1 text-blue">
            纽约 {newYorkTimeZone}：{newYorkTime}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}
