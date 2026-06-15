import { FinancialGraph } from "@/components/dashboard/financial-graph";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { layerById } from "@/lib/config/layers";
import { getDashboardPayload } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const payload = await getDashboardPayload();

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted">Relation Structure</p>
          <h1 className="mt-1 text-3xl font-semibold text-text">图谱结构</h1>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <FinancialGraph
            nodes={payload.graphNodes}
            edges={payload.graphEdges}
            actionHref="#relation-channels"
            actionLabel="查看传导通道"
          />
          <Card>
            <CardHeader title="层级清单" subtitle="这些层级与节点会写入导出的 relation_map.json。" />
            <CardBody className="space-y-3">
              {payload.graphNodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-panel2 p-3">
                  <div>
                    <div className="text-sm font-medium text-text">{node.label}</div>
                    <div className="mt-1 text-xs text-muted">{node.id}</div>
                  </div>
                  <Badge variant="slate">{layerById[node.layer].zh}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div id="relation-channels" className="scroll-mt-24">
          <Card>
            <CardHeader title="传导通道" subtitle="每条关系都代表一个金融传导机制，而不是简单视觉连线。" />
            <CardBody>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {payload.graphEdges.map((edge) => (
                  <div key={edge.id} className="rounded-lg border border-line bg-panel2 p-3">
                    <div className="text-sm font-medium text-text">
                      {edge.source} → {edge.target}
                    </div>
                    <div className="mt-2 text-xs leading-5 text-muted">{edge.channel}</div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="blue">{edge.strength}</Badge>
                      <Badge variant="amber">{edge.direction}</Badge>
                    </div>
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
