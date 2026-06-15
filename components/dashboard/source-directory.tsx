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

function faviconUrl(url: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
}

function CompactLogo({ url, name }: { url: string; name: string }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-panel">
      <img src={faviconUrl(url)} alt={`${name} logo`} className="h-5 w-5" loading="lazy" />
    </span>
  );
}

export function SourceDirectory({ sources }: { sources: SourceDefinition[] }) {
  return (
    <Card>
      <CardHeader title="信息源总览" subtitle="FinGraph 当前使用和展示的外部平台、官方 API、RSS、市场数据与开放数据库。" />
      <CardBody className="space-y-4">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">嵌入平台与网页入口</h3>
            <Badge variant="blue">{externalPlatformLinks.length} 个平台</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {externalPlatformLinks.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-line bg-panel2/70 p-2.5 transition hover:border-blue/40 hover:bg-blue/10"
              >
                <div className="flex items-start gap-2">
                  <CompactLogo url={source.url} name={source.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold text-text">{source.name}</div>
                      <span className="shrink-0 rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] font-medium text-muted">
                        {platformCategoryLabels[source.category]}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] leading-5 text-muted">{source.note}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">API / RSS / 数据库来源</h3>
            <Badge variant="green">{sources.length} 个来源</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {sources.map((source) => (
              <a
                key={source.id}
                href={source.docs_url || source.base_url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-line bg-panel2/70 p-2.5 transition hover:border-blue/40 hover:bg-blue/10"
              >
                <div className="flex items-start gap-2">
                  <CompactLogo url={source.base_url || source.docs_url} name={source.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold text-text">{source.name}</div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          connectorStatusVariant(source.connector_status) === "green"
                            ? "border-green/25 bg-green/10 text-green"
                            : connectorStatusVariant(source.connector_status) === "amber"
                              ? "border-amber/25 bg-amber/10 text-amber"
                              : "border-line bg-panel text-muted"
                        }`}
                      >
                        {connectorStatusLabel(source.connector_status)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] text-muted">
                        {sourceTypeLabel(source.type)}
                      </span>
                      <span className="rounded-full border border-green/20 bg-green/10 px-2 py-0.5 text-[10px] text-green">
                        {reliabilityLabel(source.reliability)}
                      </span>
                      <span className="rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] text-muted">
                        {source.cadence}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${source.api_key_required ? "border-amber/25 bg-amber/10 text-amber" : "border-blue/25 bg-blue/10 text-blue"}`}>
                        {source.api_key_required ? "需 Key" : "免 Key"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] leading-5 text-muted">{source.notes}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </CardBody>
    </Card>
  );
}
