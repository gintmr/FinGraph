import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SourceLink } from "@/components/ui/source-link";
import type { FinGraphEvent, MarketIndicator } from "@/lib/types";

function riskIndicator(indicator: MarketIndicator) {
  return /cpi|通胀|wti|原油|10y|收益率|debt|债务|unemployment|失业|fedfunds|利率/i.test(`${indicator.id} ${indicator.name}`);
}

export function RiskPanel({ events, indicators }: { events: FinGraphEvent[]; indicators: MarketIndicator[] }) {
  const riskEvents = events.filter((event) => event.direction === "negative" || event.direction === "mixed" || event.strength >= 4).slice(0, 4);
  const riskIndicators = indicators.filter(riskIndicator).slice(0, Math.max(0, 4 - riskEvents.length));

  return (
    <Card className="min-h-[360px]">
      <CardHeader title="监控预警" subtitle="这些变量会通过多层传导影响风险资产。" />
      <CardBody className="space-y-3">
        {!riskEvents.length && !riskIndicators.length ? (
          <div className="rounded-lg border border-line bg-panel2 p-4 text-sm leading-6 text-muted">
            暂无真实风险预警。运行采集任务后，这里会展示负面/混合事件和风险敏感指标。
          </div>
        ) : null}
        {riskEvents.map((event) => (
          <div key={event.id} className="flex gap-3 rounded-lg border border-line bg-panel2/70 p-3">
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber/10 text-amber">
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-text">{event.title}</p>
                <Badge variant={event.strength >= 4 ? "red" : "amber"}>强度 {event.strength}/5</Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">{event.description}</p>
              <div className="mt-2">
                <SourceLink url={event.url} label="原始链接" />
              </div>
            </div>
          </div>
        ))}
        {riskIndicators.map((indicator) => (
          <div key={indicator.id} className="flex gap-3 rounded-lg border border-line bg-panel2/70 p-3">
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber/10 text-amber">
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-text">{indicator.name}</p>
                <Badge variant={indicator.direction === "up" ? "amber" : "green"}>{indicator.change}</Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">
                当前值 {indicator.value}
                {indicator.unit ?? ""}。{indicator.note}
              </p>
              <div className="mt-2">
                <SourceLink url={indicator.url} label="原始链接" />
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
