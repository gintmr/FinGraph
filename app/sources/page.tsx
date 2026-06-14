import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SourceLink } from "@/components/ui/source-link";
import { layerById } from "@/lib/config/layers";
import { sourceStatusSummary } from "@/lib/config/sources";
import { getIngestionStatus, getSources } from "@/lib/db/repository";
import { connectorStatusLabel, connectorStatusVariant, reliabilityLabel, sourceTypeLabel } from "@/components/dashboard/labels";

export default async function SourcesPage() {
  const sources = await getSources();
  const summary = sourceStatusSummary();
  const ingestion = await getIngestionStatus();
  const mode = ingestion.mode;
  const modeLabel = mode === "supabase" ? "Supabase 实时库" : mode === "local_cache" ? "本地真实缓存" : "Seed 演示数据";
  const modeDescription =
    mode === "supabase"
      ? "Dashboard 正在读取数据库采集结果。"
      : mode === "local_cache"
        ? "本地网络无法写入 Supabase 时，Dashboard 使用真实 API 采集缓存供预览。"
        : "未配置 Supabase 时不会把采集结果入库，页面显示演示数据。";

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted">Source Registry</p>
          <h1 className="mt-1 text-3xl font-semibold text-text">免费与长期可用数据源</h1>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-line bg-panel/92 p-4">
            <div className="text-xs text-muted">当前数据模式</div>
            <div className="mt-2 text-xl font-semibold text-text">{modeLabel}</div>
            <p className="mt-2 text-xs leading-5 text-muted">
              {modeDescription}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-panel/92 p-4">
            <div className="text-xs text-muted">已接入解析器</div>
            <div className="mt-2 text-xl font-semibold text-green">{summary.implemented}</div>
            <p className="mt-2 text-xs leading-5 text-muted">无 key 或已可直接运行的官方/开放源。</p>
          </div>
          <div className="rounded-lg border border-line bg-panel/92 p-4">
            <div className="text-xs text-muted">需要 API Key</div>
            <div className="mt-2 text-xl font-semibold text-amber">{summary.key_required}</div>
            <p className="mt-2 text-xs leading-5 text-muted">采集器已写好，但缺 key 时会自动跳过。</p>
          </div>
          <div className="rounded-lg border border-line bg-panel/92 p-4">
            <div className="text-xs text-muted">候选待接入</div>
            <div className="mt-2 text-xl font-semibold text-muted">{summary.planned}</div>
            <p className="mt-2 text-xs leading-5 text-muted">已登记来源，但不会产生当前数据。</p>
          </div>
        </div>

        <Card>
          <CardHeader title="数据源注册表" subtitle="只有“已接入”和“需配置 Key”的来源有采集器；“待接入”仅是候选数据源，不会生成当前事件。" />
          <CardBody>
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full min-w-[1220px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2">来源</th>
                    <th className="px-3 py-2">采集状态</th>
                    <th className="px-3 py-2">类型</th>
                    <th className="px-3 py-2">可靠性</th>
                    <th className="px-3 py-2">环境变量</th>
                    <th className="px-3 py-2">层级</th>
                    <th className="px-3 py-2">文档</th>
                    <th className="px-3 py-2">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id} className="rounded-lg bg-panel2">
                      <td className="rounded-l-lg px-3 py-3 font-medium text-text">{source.name}</td>
                      <td className="px-3 py-3">
                        <Badge variant={connectorStatusVariant(source.connector_status)}>
                          {connectorStatusLabel(source.connector_status)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted">{sourceTypeLabel(source.type)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={source.reliability === "very_high" ? "green" : source.reliability === "low" ? "red" : "amber"}>
                          {reliabilityLabel(source.reliability)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted">{source.api_key_env ?? (source.api_key_required ? "需要" : "不需要")}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {source.layers.map((layer) => (
                            <Badge key={layer} variant="slate">
                              {layerById[layer].shortName}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <SourceLink url={source.docs_url} label="文档" />
                      </td>
                      <td className="rounded-r-lg px-3 py-3 text-xs leading-5 text-muted">
                        <div className="font-medium text-text">{source.collector_notes}</div>
                        <div className="mt-1">{source.notes}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
