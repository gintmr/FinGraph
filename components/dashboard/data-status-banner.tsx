import { AlertTriangle, CheckCircle2, Database, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardPayload } from "@/lib/types";

export function DataStatusBanner({ payload }: { payload: DashboardPayload }) {
  const isSeed = payload.mode === "seed";
  const isLocalCache = payload.mode === "local_cache";
  const sourceSummary = payload.sources.reduce(
    (summary, source) => {
      summary.total += 1;
      summary[source.connector_status] += 1;
      return summary;
    },
    { total: 0, implemented: 0, key_required: 0, planned: 0 }
  );

  return (
    <div className="rounded-lg border border-line bg-panel/95 px-4 py-3 shadow-glow">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isSeed ? "bg-amber/15 text-amber" : "bg-green/15 text-green"}`}>
            {isSeed ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-text">
              {isSeed ? "当前为 Seed 演示数据模式" : isLocalCache ? "当前为本地真实采集缓存模式" : "当前为 Supabase 真实数据模式"}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              {isSeed
                ? "页面中的数值和事件是演示样例；链接主要指向官方数据源/文档入口，不代表真实当天事件。配置 Supabase 环境变量并运行采集任务后，Dashboard 会读取真实采集结果。"
                : isLocalCache
                  ? "本地网络暂时无法写入 Supabase，因此 Dashboard 正在读取刚刚从真实 API 采集出的本地缓存。所有事件和指标仍保留原始链接；部署到 Vercel 后会改由 Supabase 持久化。"
                  : "Dashboard 正在读取 Supabase 中的事件、指标和图谱数据。仍建议通过来源链接交叉验证关键结论。"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={isSeed ? "amber" : "green"}>
            <Database className="mr-1.5 h-3.5 w-3.5" />
            {payload.mode}
          </Badge>
          <Badge variant="green">{sourceSummary.implemented} 已接入</Badge>
          <Badge variant="blue">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            {sourceSummary.key_required} 需 Key
          </Badge>
          <Badge variant="slate">{sourceSummary.planned} 待接入</Badge>
        </div>
      </div>
    </div>
  );
}
