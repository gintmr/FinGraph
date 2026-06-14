"use client";

import { Sparkline } from "@/components/ui/sparkline";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SourceLink } from "@/components/ui/source-link";
import type { MarketIndicator } from "@/lib/types";

const preferredNames = ["联邦基金", "CPI", "10Y", "收益率", "通胀", "WTI"];
const colors = ["#5b9dff", "#f5b84b", "#55c985", "#ef645c", "#8a96a3", "#0aa66a"];

function selectedTrendIndicators(indicators: MarketIndicator[]) {
  return indicators
    .filter((indicator) => indicator.sparkline.length >= 2)
    .sort((a, b) => {
      const aRank = preferredNames.findIndex((name) => a.name.includes(name));
      const bRank = preferredNames.findIndex((name) => b.name.includes(name));
      return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
    })
    .slice(0, 6);
}

export function TrendPanel({ indicators }: { indicators: MarketIndicator[] }) {
  const selected = selectedTrendIndicators(indicators);

  return (
    <Card className="min-h-[360px]">
      <CardHeader title="利率与通胀趋势" subtitle="每个指标单独缩放；不同单位不再共用同一坐标轴。" />
      <CardBody>
        {!selected.length ? (
          <div className="rounded-lg border border-line bg-panel2 p-4 text-sm leading-6 text-muted">
            暂无可绘制的真实趋势指标。运行采集任务后，FRED、BLS、EIA 等序列会显示在这里。
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          {selected.map((indicator, index) => (
            <div key={indicator.id} className="rounded-lg border border-line bg-panel2/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-text">{indicator.name}</div>
                  <div className="mt-1 text-xs text-muted">最近 {indicator.sparkline.length} 个样本 · 单独缩放</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-semibold text-text">
                    {indicator.value}
                    {indicator.unit ? <span className="ml-1 text-xs text-muted">{indicator.unit}</span> : null}
                  </div>
                  <div className={indicator.direction === "up" ? "text-xs font-semibold text-green" : indicator.direction === "down" ? "text-xs font-semibold text-red" : "text-xs font-semibold text-muted"}>
                    {indicator.change}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Sparkline values={indicator.sparkline} color={colors[index] ?? "#5b9dff"} className="h-10 w-36" />
                <SourceLink url={indicator.url} label="来源" />
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{indicator.note}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
