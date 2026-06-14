import { AppShell } from "@/components/layout/app-shell";
import { ExportControls } from "@/components/dashboard/export-controls";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getDashboardPayload } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function ExportsPage() {
  const payload = await getDashboardPayload();

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted">Portable Intelligence Package</p>
          <h1 className="mt-1 text-3xl font-semibold text-text">导出 FinGraph Skill Pack</h1>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr]">
          <Card>
            <CardHeader title="立即导出" subtitle="默认导出最近 14 天的可追溯证据。" />
            <CardBody>
              <p className="text-sm leading-6 text-muted">
                当前可导出 {payload.events.length} 条事件、{payload.indicators.length} 个指标和 {payload.graphEdges.length} 条传导关系。
              </p>
              <div className="mt-5">
                <ExportControls days={14} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="导出包内容" subtitle="目标是让任意大模型读取后都能形成完整报告。" />
            <CardBody>
              <div className="grid gap-3 text-sm text-muted md:grid-cols-2">
                {[
                  "SKILL.md：模型角色、证据规则、报告流程",
                  "prompt.md：ZIP 模式下的最终用户 Prompt",
                  "nine_layer_knowledge_base.md：零基础九层金融知识库",
                  "relation_topology.md：层级关系、因果链和传导路径",
                  "events.jsonl：近期事件、链接、层级和节点映射",
                  "indicators.csv：宏观和市场指标快照",
                  "sources.csv：数据源与可靠性注册表",
                  "relation_map.json：机器可读图谱节点和边",
                  "manifest.json：导出元数据和文件清单",
                  "TXT 模式：把以上内容合并成一个可直接下载、复制或上传给 AI 的单文件"
                ].map((item) => (
                  <div key={item} className="rounded-lg border border-line bg-panel2 p-3">
                    {item}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
