import { Info } from "lucide-react";
import { LayerIcon } from "@/components/dashboard/layer-icon";
import { statusLabel, trendSymbol } from "@/components/dashboard/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { layerById } from "@/lib/config/layers";
import type { LayerHealth } from "@/lib/types";

export function LayerHealthGrid({ items }: { items: LayerHealth[] }) {
  return (
    <Card className="min-h-[260px]">
      <CardHeader
        title="八个分析层健康度评分"
        subtitle="评分不是投资建议，而是把近期证据映射到结构性状态。"
        action={<Info className="h-4 w-4 text-muted" aria-hidden />}
      />
      <CardBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item) => {
            const layer = layerById[item.layer];
            const variant = item.score >= 68 ? "green" : item.score >= 56 ? "amber" : item.score >= 50 ? "blue" : "red";
            return (
              <div key={item.layer} className="rounded-lg border border-line bg-panel2/70 p-3">
                <div className="flex items-center justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-full border"
                    style={{ borderColor: `${layer.color}55`, background: `${layer.color}18`, color: layer.color }}
                  >
                    <LayerIcon layer={item.layer} className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-muted">{trendSymbol(item.trend)}</span>
                </div>
                <div className="mt-3 whitespace-nowrap text-sm font-semibold text-text">{layer.zh}</div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-2xl font-semibold tracking-normal">{item.score}</span>
                  <span className="pb-1 text-sm text-muted">/100</span>
                </div>
                <div className="mt-3">
                  <Badge variant={variant}>{statusLabel(item.status)}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
