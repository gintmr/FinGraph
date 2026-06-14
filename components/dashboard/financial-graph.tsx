import { ArrowRight, FileText } from "lucide-react";
import { LayerIcon } from "@/components/dashboard/layer-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { layerById } from "@/lib/config/layers";
import type { FinLayerId, GraphEdge, GraphNode } from "@/lib/types";

type StructureLevel = {
  index: number;
  title: string;
  layer?: FinLayerId;
  group: string;
  role: string;
  output: string;
};

const structureLevels: StructureLevel[] = [
  {
    index: 1,
    title: "地缘层",
    layer: "geopolitical",
    group: "外部冲击",
    role: "战争、制裁、关税、出口管制、能源通道。",
    output: "风险溢价 / 供应链压力"
  },
  {
    index: 2,
    title: "社会层",
    layer: "social",
    group: "内部约束",
    role: "就业、工资、住房、消费、贫富分化和政治压力。",
    output: "政策反馈 / 消费韧性"
  },
  {
    index: 3,
    title: "财政层",
    layer: "fiscal",
    group: "国家资产负债表",
    role: "赤字、债务、国债供给、利息支出和财政可信度。",
    output: "期限溢价 / 长端利率"
  },
  {
    index: 4,
    title: "央行层",
    layer: "central_bank",
    group: "政策反应",
    role: "通胀、就业、实际利率、QE/QT 和政策沟通。",
    output: "折现率 / 流动性"
  },
  {
    index: 5,
    title: "货币层",
    layer: "currency",
    group: "全球结算体系",
    role: "美元指数、储备货币、离岸美元和全球资本流。",
    output: "美元流动性 / 汇率压力"
  },
  {
    index: 6,
    title: "产业层",
    layer: "industry",
    group: "真实经济能力",
    role: "AI 基建、芯片、能源、制造业、供应链和生产率。",
    output: "成本曲线 / 生产率"
  },
  {
    index: 7,
    title: "企业层",
    layer: "corporate",
    group: "盈利兑现",
    role: "收入、利润率、现金流、估值、AI 资本开支回报。",
    output: "盈利预期 / 估值承载"
  },
  {
    index: 8,
    title: "市场层",
    layer: "market",
    group: "价格发现",
    role: "估值、波动率、信用利差、仓位、广度和情绪。",
    output: "资产价格 / 风险偏好"
  },
  {
    index: 9,
    title: "资产决策层",
    group: "用户输出",
    role: "把前八层证据转换为 QQQ、SPY、TLT、DXY、黄金、原油等资产视角。",
    output: "Skill Pack / 投资假设"
  }
];

function scoreForLayer(nodes: GraphNode[], layer?: FinLayerId) {
  if (!layer) {
    return null;
  }
  const node = nodes.find((item) => item.layer === layer && typeof item.score === "number");
  return node?.score ?? null;
}

function LevelCard({ level, nodes }: { level: StructureLevel; nodes: GraphNode[] }) {
  const layer = level.layer ? layerById[level.layer] : null;
  const score = scoreForLayer(nodes, level.layer);
  const color = layer?.color ?? "rgb(var(--color-blue))";

  return (
    <div className="relative min-h-[154px] rounded-lg border border-line bg-panel2/70 p-3">
      <div className="flex items-start gap-2">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
          style={{ borderColor: `${color}66`, background: `${color}18`, color }}
        >
          {level.layer ? <LayerIcon layer={level.layer} className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted">Layer {level.index}</span>
            {score === null ? <Badge variant="blue">输出</Badge> : <Badge variant="slate">{score}/100</Badge>}
          </div>
          <h3 className="mt-1 text-sm font-semibold text-text">{level.title}</h3>
          <p className="mt-1 text-xs text-muted">{level.group}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{level.role}</p>
      <div className="mt-3 truncate rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-text">{level.output}</div>
    </div>
  );
}

export function FinancialGraph({
  nodes,
  actionHref = "/graph",
  actionLabel = "查看结构关系"
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="min-h-[420px] overflow-hidden">
      <CardHeader
        title="九层结构图"
        subtitle="用稳定层级替代草率节点网：从系统冲击到资产决策。"
        action={
          <a href={actionHref} className="inline-flex items-center gap-1 text-xs font-medium text-blue transition hover:text-text">
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        }
      />
      <CardBody>
        <div className="grid gap-3 sm:grid-cols-3">
          {structureLevels.map((level) => (
            <LevelCard key={level.index} level={level} nodes={nodes} />
          ))}
        </div>
        <div className="mt-4 grid gap-2 text-xs text-muted md:grid-cols-3">
          <span className="rounded-md border border-line bg-panel2 px-3 py-2">外部冲击 → 政策反应 → 资产定价</span>
          <span className="rounded-md border border-line bg-panel2 px-3 py-2">财政/央行/美元共同决定折现率</span>
          <span className="rounded-md border border-line bg-panel2 px-3 py-2">产业/企业决定长期盈利兑现</span>
        </div>
      </CardBody>
    </Card>
  );
}
