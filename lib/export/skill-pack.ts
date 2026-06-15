import { readFile } from "node:fs/promises";
import { join } from "node:path";
import JSZip from "jszip";
import { sourceRegistry } from "@/lib/config/sources";
import type { FinGraphEvent, GraphEdge, GraphNode, MarketIndicator } from "@/lib/types";

export type ExportPromptLanguage = "zh" | "en";

function csvEscape(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv<T extends Record<string, unknown>>(rows: T[], columns: Array<keyof T>) {
  const header = columns.map(csvEscape).join(",");
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")).join("\n");
  return [header, body].filter(Boolean).join("\n");
}

async function readTemplate(relativePath: string) {
  return readFile(join(process.cwd(), relativePath), "utf8");
}

function buildPrompt(language: ExportPromptLanguage) {
  if (language === "en") {
    return [
      "# User Prompt",
      "",
      "Please read the entire FinGraph context above, including the nine-layer knowledge base, relation topology, recent events, indicators, sources, and relation map.",
      "",
      "Generate a complete U.S.-equity-centered macro-financial analysis report. The report should explain the current macro regime, the evidence behind it, and the implications for U.S. stocks, especially SPY, QQQ, Nasdaq, long-duration growth equities, Treasury-sensitive assets, the dollar, gold, oil, credit, and broad risk appetite.",
      "",
      "Required output:",
      "1. Executive summary and one-sentence regime diagnosis.",
      "2. A layer-by-layer explanation of the FinGraph framework: monetary layer, central-bank layer, fiscal layer, industry layer, corporate layer, geopolitical layer, social layer, market layer, and asset-decision layer. For each layer, explain what the layer means, what current evidence says, which source links support the conclusion, how confident the conclusion is, and how the layer may transmit pressure or support to U.S. equities.",
      "3. A cross-layer relation map in prose or table form. Explain how rates, inflation, dollar liquidity, fiscal supply, energy/geopolitical shocks, corporate earnings, AI/capex expectations, and market sentiment connect to each other.",
      "4. A key-event table with original source links. Separate facts, interpretation, and forecasts. Do not invent links.",
      "5. Asset implications for QQQ/Nasdaq, SPY, TLT, DXY, gold, oil, credit, cash, and major U.S. equity sectors where relevant.",
      "6. Beginner question guide: propose concrete follow-up questions that a beginner can ask the AI from multiple directions, such as rates, inflation, fiscal policy, earnings, AI/capex, geopolitics, market sentiment, risk management, and data verification. Each question should explain why asking it helps the user understand the market better.",
      "7. Final watchlist, uncertainty, and what evidence would change the view.",
      "",
      "Use tables where helpful, cite original source links for factual claims, and keep the explanation educational rather than personalized investment advice."
    ].join("\n");
  }

  return [
    "# User Prompt",
    "",
    "请阅读上方完整的 FinGraph 上下文，包括九层知识库、关系拓扑、近期事件、指标、来源和关系图。",
    "",
    "请用中文生成一份完整的、围绕美股市场的宏观金融分析报告。报告需要解释当前宏观状态、背后的证据，以及它们对美股定价的影响，尤其需要关注 SPY、QQQ、纳斯达克、长久期成长股、利率敏感资产、美元、黄金、原油、信用环境和整体风险偏好。",
    "",
    "必须包含以下内容：",
    "1. 执行摘要与一句话市场状态判断。",
    "2. FinGraph 各层级的详细解释：货币层、央行层、财政层、产业层、企业层、地缘层、社会层、市场层、资产决策层。每一层都要说明这个层级是什么意思、当前证据说明了什么、有哪些原始链接支持、结论置信度如何，以及它如何向美股传导压力或支撑。",
    "3. 跨层级关系图谱说明：用表格或分段文字解释利率、通胀、美元流动性、财政供给、能源/地缘冲击、企业盈利、AI/资本开支预期和市场情绪之间如何相互影响。",
    "4. 关键事件表格：列出事件、时间、来源链接、相关层级、方向、强度、周期和影响资产。事实、解释和预测必须分开，不要编造链接。",
    "5. 资产影响：分别说明对 QQQ/纳斯达克、SPY、TLT、DXY、黄金、原油、信用、现金和主要美股行业板块的可能影响。",
    "6. 初学者提问引导：请从多个方向给出提问者可以继续追问 AI 的问题案例，例如利率、通胀、财政、盈利、AI/资本开支、地缘风险、市场情绪、风险管理和数据验证。每个问题都要说明为什么这个问题能帮助提问者更好地理解市场。",
    "7. 最后给出观察清单、不确定性，以及哪些证据变化会改变当前判断。",
    "",
    "请尽量使用表格；所有事实性判断都要附原始来源链接；请保持教育与分析用途，不要写成个性化投资建议。"
  ].join("\n");
}

function buildManifest(input: {
  date: string;
  now: Date;
  fileName: string;
  days: number;
  eventCount: number;
  indicatorCount: number;
  format: "zip" | "txt";
  promptLanguage: ExportPromptLanguage;
}) {
  return {
    name: "FinGraph Skill Pack",
    version: "0.1.0",
    generatedAt: input.now.toISOString(),
    fileName: input.fileName,
    days: input.days,
    format: input.format,
    promptLanguage: input.promptLanguage,
    eventCount: input.eventCount,
    indicatorCount: input.indicatorCount,
    sourceCount: sourceRegistry.length,
    requiredFiles:
      input.format === "zip"
        ? [
            "SKILL.md",
            "prompt.md",
            "references/nine_layer_knowledge_base.md",
            "references/relation_topology.md",
            "data/events.jsonl",
            "data/indicators.csv",
            "data/sources.csv",
            "data/relation_map.json"
          ]
        : ["fingraph-skill-pack.txt"]
  };
}

async function buildArtifacts(input: {
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  days: number;
  promptLanguage: ExportPromptLanguage;
}) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);

  const [skill, knowledgeBase, topology] = await Promise.all([
    readTemplate("skill-template/SKILL.md"),
    readTemplate("skill-template/references/nine_layer_knowledge_base.md"),
    readTemplate("skill-template/references/relation_topology.md")
  ]);

  const relationMap = {
    generated_at: now.toISOString(),
    nodes: input.graph.nodes,
    edges: input.graph.edges
  };

  const eventsJsonl = input.events.map((event) => JSON.stringify(event)).join("\n");
  const indicatorsCsv = toCsv(
    input.indicators.map((indicator) => ({
      id: indicator.id,
      name: indicator.name,
      value: indicator.value,
      unit: indicator.unit ?? "",
      change: indicator.change,
      direction: indicator.direction,
      layer: indicator.layer,
      url: indicator.url,
      source_type: indicator.source_type,
      updated_at: indicator.updated_at,
      note: indicator.note,
      sparkline: indicator.sparkline.join("|")
    })),
    ["id", "name", "value", "unit", "change", "direction", "layer", "url", "source_type", "updated_at", "note", "sparkline"]
  );
  const sourcesCsv = toCsv(
    sourceRegistry.map((source) => ({
      id: source.id,
      name: source.name,
      type: source.type,
      reliability: source.reliability,
      docs_url: source.docs_url,
      base_url: source.base_url,
      api_key_required: String(source.api_key_required),
      api_key_env: source.api_key_env ?? "",
      connector_status: source.connector_status,
      layers: source.layers.join("|"),
      cadence: source.cadence,
      collector_notes: source.collector_notes,
      notes: source.notes
    })),
    [
      "id",
      "name",
      "type",
      "reliability",
      "docs_url",
      "base_url",
      "api_key_required",
      "api_key_env",
      "connector_status",
      "layers",
      "cadence",
      "collector_notes",
      "notes"
    ]
  );
  const prompt = buildPrompt(input.promptLanguage);

  return { now, date, skill, knowledgeBase, topology, relationMap, eventsJsonl, indicatorsCsv, sourcesCsv, prompt };
}

export async function buildSkillPack(input: {
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  days: number;
  promptLanguage?: ExportPromptLanguage;
}) {
  const zip = new JSZip();
  const promptLanguage = input.promptLanguage ?? "zh";
  const artifacts = await buildArtifacts({ ...input, promptLanguage });
  const fileName = `fingraph-skill-pack-${artifacts.date}.zip`;
  const manifest = buildManifest({
    date: artifacts.date,
    now: artifacts.now,
    fileName,
    days: input.days,
    eventCount: input.events.length,
    indicatorCount: input.indicators.length,
    format: "zip",
    promptLanguage
  });

  zip.file("SKILL.md", artifacts.skill);
  zip.file("prompt.md", artifacts.prompt);
  zip.file("references/nine_layer_knowledge_base.md", artifacts.knowledgeBase);
  zip.file("references/relation_topology.md", artifacts.topology);
  zip.file("data/events.jsonl", artifacts.eventsJsonl);
  zip.file("data/indicators.csv", artifacts.indicatorsCsv);
  zip.file("data/sources.csv", artifacts.sourcesCsv);
  zip.file("data/relation_map.json", JSON.stringify(artifacts.relationMap, null, 2));
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return {
    buffer,
    manifest
  };
}

export async function buildTextSkillPack(input: {
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  days: number;
  promptLanguage?: ExportPromptLanguage;
}) {
  const promptLanguage = input.promptLanguage ?? "zh";
  const artifacts = await buildArtifacts({ ...input, promptLanguage });
  const fileName = `fingraph-skill-pack-${artifacts.date}.txt`;
  const manifest = buildManifest({
    date: artifacts.date,
    now: artifacts.now,
    fileName,
    days: input.days,
    eventCount: input.events.length,
    indicatorCount: input.indicators.length,
    format: "txt",
    promptLanguage
  });

  const text = [
    "# FinGraph Skill Pack TXT",
    "",
    "This single file is designed for direct copy/paste or upload into another AI model.",
    "",
    "## Manifest",
    "```json",
    JSON.stringify(manifest, null, 2),
    "```",
    "",
    "## SKILL.md",
    artifacts.skill,
    "",
    "## references/nine_layer_knowledge_base.md",
    artifacts.knowledgeBase,
    "",
    "## references/relation_topology.md",
    artifacts.topology,
    "",
    "## data/events.jsonl",
    "```jsonl",
    artifacts.eventsJsonl,
    "```",
    "",
    "## data/indicators.csv",
    "```csv",
    artifacts.indicatorsCsv,
    "```",
    "",
    "## data/sources.csv",
    "```csv",
    artifacts.sourcesCsv,
    "```",
    "",
    "## data/relation_map.json",
    "```json",
    JSON.stringify(artifacts.relationMap, null, 2),
    "```",
    "",
    artifacts.prompt
  ].join("\n");

  return { text, manifest };
}
