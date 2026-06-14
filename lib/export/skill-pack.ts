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
      "Generate a standard macro-financial intelligence report in English. Use tables where helpful, cite original source links for factual claims, separate facts from interpretation and forecasts, map key events to related layers and nodes, and explain implications for QQQ, Nasdaq, SPY, TLT, DXY, gold, oil, and broad risk appetite. End with key watchpoints and uncertainty."
    ].join("\n");
  }

  return [
    "# User Prompt",
    "",
    "请阅读上方完整的 FinGraph 上下文，包括九层知识库、关系拓扑、近期事件、指标、来源和关系图。",
    "",
    "请用中文生成一份标准宏观金融情报报告。请尽量使用表格，所有事实性判断都要附原始来源链接；请区分事实、解释和预测；请把关键事件映射到相关层级和节点；请解释其对 QQQ、纳斯达克、SPY、TLT、DXY、黄金、原油和整体风险偏好的影响。最后给出需要继续观察的变量和不确定性。"
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
