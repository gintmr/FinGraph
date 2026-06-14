import { NewsInsightList } from "@/components/dashboard/news-insight-list";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getDashboardPayload } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const payload = await getDashboardPayload();
  const sourceLinked = payload.events.filter((event) => Boolean(event.url)).length;

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Evidence Stream</p>
            <h1 className="mt-1 text-3xl font-semibold text-text">事件流与原始链接</h1>
          </div>
          <div className="flex gap-2">
            <Badge variant="green">{sourceLinked} 条有链接</Badge>
            <Badge variant="blue">{payload.events.length} 条事件</Badge>
          </div>
        </div>

        <Card>
          <CardHeader title="筛选逻辑" subtitle="事件会被映射到相关层级、相关节点、方向、强度、期限和资产。" />
          <CardBody>
            <div className="grid gap-3 text-sm text-muted md:grid-cols-4">
              <div className="rounded-lg bg-panel2 p-3">官方 API / RSS 优先级最高</div>
              <div className="rounded-lg bg-panel2 p-3">搜索结果仅作发现和交叉验证</div>
              <div className="rounded-lg bg-panel2 p-3">每条事件必须保留原始 URL</div>
              <div className="rounded-lg bg-panel2 p-3">导出包只收录可追溯证据</div>
            </div>
          </CardBody>
        </Card>

        <NewsInsightList events={payload.events} />
      </div>
    </AppShell>
  );
}
