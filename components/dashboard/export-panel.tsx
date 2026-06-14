import Link from "next/link";
import { FileArchive, ShieldCheck } from "lucide-react";
import { ExportControls } from "@/components/dashboard/export-controls";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function ExportPanel({ eventCount, indicatorCount }: { eventCount: number; indicatorCount: number }) {
  return (
    <Card className="min-h-[360px]">
      <CardHeader title="Skill Pack 导出" subtitle="把知识框架、拓扑图、近期事件和指标打包给任意大模型。" />
      <CardBody>
        <div className="grid h-20 w-20 place-items-center rounded-lg border border-blue/25 bg-blue/10 text-blue">
          <FileArchive className="h-9 w-9" aria-hidden />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="green">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            来源链接完整
          </Badge>
          <Badge variant="blue">{eventCount} 条事件</Badge>
          <Badge variant="amber">{indicatorCount} 个指标</Badge>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">
          可导出 ZIP 包或单个 TXT。TXT 会把所有上下文合并成一个文件，末尾附带可直接交给 AI 的 user prompt。
        </p>
        <div className="mt-5">
          <ExportControls compact />
        </div>
        <Link
          href="/exports"
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-line bg-panel2 text-sm font-medium text-text transition hover:bg-panel"
        >
          查看导出说明
        </Link>
      </CardBody>
    </Card>
  );
}
