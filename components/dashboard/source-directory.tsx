import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { connectorStatusLabel, connectorStatusVariant, reliabilityLabel, sourceTypeLabel } from "@/components/dashboard/labels";
import { externalPlatformLinks } from "@/lib/config/external-platforms";
import type { SourceDefinition } from "@/lib/types";

const platformCategoryLabels = {
  widget: "嵌入组件",
  news: "新闻快讯",
  calendar: "经济日历",
  market: "市场终端"
};

export function SourceDirectory({ sources }: { sources: SourceDefinition[] }) {
  return (
    <Card>
      <CardHeader title="信息源总览" subtitle="FinGraph 当前使用和展示的外部平台、官方 API、RSS、市场数据与开放数据库。" />
      <CardBody className="space-y-5">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">嵌入平台与网页入口</h3>
            <Badge variant="blue">{externalPlatformLinks.length} 个平台</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {externalPlatformLinks.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-line bg-panel2/70 p-3 transition hover:border-blue/40 hover:bg-blue/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold text-text">{source.name}</div>
                  <Badge variant={source.category === "news" ? "amber" : source.category === "calendar" ? "blue" : "green"}>
                    {platformCategoryLabels[source.category]}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{source.note}</p>
              </a>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">API / RSS / 数据库来源</h3>
            <Badge variant="green">{sources.length} 个来源</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {sources.map((source) => (
              <a
                key={source.id}
                href={source.docs_url || source.base_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-line bg-panel2/70 p-3 transition hover:border-blue/40 hover:bg-blue/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-text">{source.name}</div>
                    <div className="mt-1 text-xs text-muted">{sourceTypeLabel(source.type)}</div>
                  </div>
                  <Badge variant={connectorStatusVariant(source.connector_status)}>
                    {connectorStatusLabel(source.connector_status)}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant={source.reliability === "very_high" || source.reliability === "high" ? "green" : "amber"}>
                    可靠性 {reliabilityLabel(source.reliability)}
                  </Badge>
                  <Badge variant="slate">{source.cadence}</Badge>
                  {source.api_key_required ? <Badge variant="amber">需 Key</Badge> : <Badge variant="blue">免 Key</Badge>}
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{source.notes}</p>
              </a>
            ))}
          </div>
        </section>
      </CardBody>
    </Card>
  );
}
