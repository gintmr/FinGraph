import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { DataStatusBanner } from "@/components/dashboard/data-status-banner";
import { SourceDirectory } from "@/components/dashboard/source-directory";
import { TimeStatusBanner } from "@/components/dashboard/time-status-banner";
import type { DashboardPayload } from "@/lib/types";

const modeLabels: Record<DashboardPayload["mode"], string> = {
  seed: "Seed",
  supabase: "Supabase",
  local_cache: "本地真实缓存"
};

export function Dashboard({ payload }: { payload: DashboardPayload }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Personal Macro Intelligence System</p>
          <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">美股金融分析图谱</h1>
        </div>
        <div className="rounded-lg border border-line bg-panel2 px-3 py-2 text-xs text-muted">
          数据模式：{modeLabels[payload.mode]} · {new Date(payload.generatedAt).toLocaleString("zh-CN")}
        </div>
      </div>

      <TimeStatusBanner />

      <DataStatusBanner payload={payload} />

      <DashboardWorkspace payload={payload} />

      <SourceDirectory sources={payload.sources} />
    </div>
  );
}
