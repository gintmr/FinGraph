import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { layers } from "@/lib/config/layers";
import type { FinGraphEvent } from "@/lib/types";

const colorMap = {
  high: "bg-blue text-blue border-blue/25",
  medium: "bg-amber text-amber border-amber/25",
  low: "bg-muted/45 text-muted border-line",
  none: "bg-transparent text-muted border-line"
};

function impactLevel(event: FinGraphEvent, layerId: string) {
  if (!event.related_layers.includes(layerId as FinGraphEvent["related_layers"][number])) {
    return "none";
  }
  if (event.strength >= 4) {
    return "high";
  }
  if (event.strength >= 2) {
    return "medium";
  }
  return "low";
}

export function ImpactMatrix({ events = [] }: { events?: FinGraphEvent[] }) {
  const rows = events.slice(0, 7);

  return (
    <Card>
      <CardHeader title="关键影响矩阵（今日）" subtitle="把事件与九层框架连接，帮助判断直接影响、间接影响和资产含义。" />
      <CardBody>
        {!rows.length ? (
          <div className="rounded-lg border border-line bg-panel2 p-4 text-sm leading-6 text-muted">
            暂无真实事件。运行采集任务后，这里会用可追溯事件自动生成影响矩阵。
          </div>
        ) : null}
        <div className="overflow-x-auto thin-scrollbar">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[160px_repeat(8,minmax(64px,1fr))] border-b border-line pb-2 text-xs text-muted">
              <div />
              {layers.map((layer) => (
                <div key={layer.id} className="text-center font-medium">
                  {layer.shortName}
                </div>
              ))}
            </div>
            <div className="space-y-1 pt-2">
              {rows.map((event) => (
                <div key={event.id} className="grid grid-cols-[160px_repeat(8,minmax(64px,1fr))] items-center gap-1 text-sm">
                  <div className="truncate pr-3 text-muted" title={event.title}>
                    {event.title}
                  </div>
                  {layers.map((layer) => {
                    const value = impactLevel(event, layer.id);
                    return (
                      <div key={`${event.id}-${layer.id}`} className="grid place-items-center">
                        <span
                          className={`h-3.5 w-3.5 rounded-full border ${colorMap[value]}`}
                          title={`${event.title} -> ${layer.zh}: ${value}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-end gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-blue" /> 强
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-amber" /> 中
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-muted/45" /> 弱
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
