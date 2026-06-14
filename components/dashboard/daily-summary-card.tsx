import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { DailyBriefing } from "@/lib/types";

const regimeLabels: Record<DailyBriefing["regime"], string> = {
  risk_on: "风险偏好改善",
  risk_neutral: "中性观察",
  risk_off: "风险偏好转弱",
  mixed: "信号分化"
};

const regimeVariants: Record<DailyBriefing["regime"], "green" | "amber" | "red" | "blue"> = {
  risk_on: "green",
  risk_neutral: "blue",
  risk_off: "red",
  mixed: "amber"
};

export function DailySummaryCard({ briefing }: { briefing: DailyBriefing }) {
  return (
    <Card className="relative min-h-[260px] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute bottom-0 right-0 h-40 w-64 bg-[radial-gradient(circle_at_center,rgba(245,184,75,0.28),transparent_60%)]" />
        <div className="absolute bottom-0 right-8 h-48 w-72 bg-[radial-gradient(circle_at_center,rgba(91,157,255,0.2),transparent_60%)]" />
      </div>
      <CardHeader
        title="今日一句话总结"
        action={<span className="text-xs text-muted">更新于 10:30</span>}
      />
      <CardBody className="relative">
        <p className="text-balance text-lg font-semibold leading-8 text-text">{briefing.sentence}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">风险偏好</span>
          <Badge variant={regimeVariants[briefing.regime]}>
            <CircleDot className="mr-1.5 h-3.5 w-3.5" />
            {regimeLabels[briefing.regime]}
          </Badge>
        </div>
        <ul className="mt-5 space-y-2 text-sm leading-6 text-muted">
          {briefing.bullets.slice(0, 3).map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/events"
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel2 px-3 text-sm font-medium text-text transition hover:border-blue/35 hover:bg-blue/10"
        >
          查看完整证据
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </CardBody>
    </Card>
  );
}
