import { AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import { directionLabel, directionVariant, horizonLabel, sourceTypeLabel } from "@/components/dashboard/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SourceLink } from "@/components/ui/source-link";
import { layerById } from "@/lib/config/layers";
import type { FinGraphEvent } from "@/lib/types";

export function NewsInsightList({ events, compact = false }: { events: FinGraphEvent[]; compact?: boolean }) {
  return (
    <Card className={compact ? "overflow-hidden" : ""}>
      <CardHeader title="今日重要资讯与规则解读" action={<span className="text-xs text-muted">可追溯来源</span>} />
      <CardBody className={compact ? "max-h-[640px] space-y-4 overflow-y-auto pr-3 thin-scrollbar" : "space-y-4"}>
        {!events.length ? (
          <div className="rounded-lg border border-line bg-panel2 p-4 text-sm leading-6 text-muted">
            暂无真实采集事件。运行采集任务后，带原始链接的官方公告、公司披露、公共数据库和搜索发现会出现在这里。
          </div>
        ) : null}
        {events.map((event) => (
          <article key={event.id} className="border-b border-line/70 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-panel2">
                {event.confidence >= 0.7 ? (
                  <CheckCircle2 className="h-4 w-4 text-green" aria-hidden />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted">{event.time.slice(11, 16)}</span>
                  <Badge variant="slate">{sourceTypeLabel(event.source_type)}</Badge>
                  <Badge variant={directionVariant(event.direction)}>{directionLabel(event.direction)}</Badge>
                  <Badge variant="blue">强度 {event.strength}/5</Badge>
                  <Badge variant="amber">{horizonLabel(event.horizon)}</Badge>
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-6 text-text">{event.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{event.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {event.related_layers.map((layer) => (
                    <Badge key={layer} variant="slate">
                      {layerById[layer].zh}
                    </Badge>
                  ))}
                  {event.assets.slice(0, 4).map((asset) => (
                    <span key={asset} className="rounded-md bg-panel2 px-2 py-1 text-xs text-muted">
                      {asset}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <SourceLink url={event.url} label="原始链接" />
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs text-muted">
                    <Link2 className="h-3.5 w-3.5" />
                    {event.related_nodes.slice(0, 2).join(" / ")}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </CardBody>
    </Card>
  );
}
