import { Sparkline } from "@/components/ui/sparkline";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SourceLink } from "@/components/ui/source-link";
import { layerById } from "@/lib/config/layers";
import type { MarketIndicator } from "@/lib/types";

export function MarketOverview({ indicators }: { indicators: MarketIndicator[] }) {
  return (
    <Card className="min-h-[260px]">
      <CardHeader title="市场概览" action={<span className="text-xs text-muted">更多</span>} />
      <CardBody className="space-y-3">
        {!indicators.length ? (
          <div className="rounded-lg border border-line bg-panel2 p-4 text-sm leading-6 text-muted">
            暂无真实指标。配置 Supabase 并运行采集任务后，市场价格、宏观指标和官方数据会显示在这里。
          </div>
        ) : null}
        {indicators.slice(0, 7).map((indicator) => {
          const color =
            indicator.direction === "up" ? "#55c985" : indicator.direction === "down" ? "#ef645c" : layerById[indicator.layer].color;
          return (
            <div key={indicator.id} className="flex items-center gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-text">{indicator.name}</div>
                <div className="mt-0.5 truncate text-xs text-muted">{layerById[indicator.layer].zh}</div>
              </div>
              <Sparkline values={indicator.sparkline} color={color} className="hidden w-20 lg:block" />
              <div className="w-[74px] shrink-0 text-right font-semibold text-text">
                {indicator.value}
                {indicator.unit ? <span className="ml-1 text-xs text-muted">{indicator.unit}</span> : null}
              </div>
              <SourceLink url={indicator.url} label="链接" />
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
