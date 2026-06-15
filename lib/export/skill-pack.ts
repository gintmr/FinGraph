import { readFile } from "node:fs/promises";
import { join } from "node:path";
import JSZip from "jszip";
import { sourceRegistry } from "@/lib/config/sources";
import type { FinGraphEvent, MarketIndicator } from "@/lib/types";

export type ExportPromptLanguage = "zh" | "en";

async function readTemplate(relativePath: string) {
  return readFile(join(process.cwd(), relativePath), "utf8");
}

function buildPrompt(language: ExportPromptLanguage) {
  if (language === "en") {
    return [
      "# User Prompt",
      "",
      "Please read this FinGraph compact export, including the framework references, compact evidence context, indicator summary, source links, and relation guide. Ignore implementation artifacts and do not ask for raw CSV, JSONL, or relation_map files.",
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
    "请阅读本文这份精简后的 FinGraph 导出内容，包括框架参考、精简证据上下文、指标摘要、来源链接和关系拓扑说明。不要索要或依赖原始 CSV、JSONL、relation_map 等工程文件；只使用本文中已经整理好的框架、证据摘要、指标摘要和原始链接。",
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
      input.format === "zip" ? ["prompt.md", "SKILL.md", "context/compact_context.md", "references/nine_layer_knowledge_base.md", "references/relation_topology.md"] : ["fingraph-skill-pack.txt"]
  };
}

const layerLabels: Record<string, string> = {
  currency: "货币层",
  central_bank: "央行层",
  fiscal: "财政层",
  industry: "产业层",
  corporate: "企业层",
  geopolitical: "地缘层",
  social: "社会层",
  market: "市场层"
};

const sourceTypeLabels: Record<string, string> = {
  official_api: "官方 API",
  official_rss: "官方 RSS",
  public_database: "开放数据库",
  company_filing: "公司披露",
  market_data: "市场数据",
  search_result: "搜索结果",
  user_link: "用户链接"
};

function truncateText(text: string, max = 260) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatLayers(layers: string[]) {
  return layers.map((layer) => layerLabels[layer] ?? layer).join(" / ");
}

function buildCompactContext(input: {
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  days: number;
  now: Date;
  promptLanguage: ExportPromptLanguage;
}) {
  const importantEvents = [...input.events]
    .sort((a, b) => b.strength - a.strength || b.confidence - a.confidence)
    .slice(0, 12);
  const importantIndicators = [...input.indicators]
    .sort((a, b) => {
      const layerRank = a.layer.localeCompare(b.layer);
      return layerRank || a.name.localeCompare(b.name);
    })
    .slice(0, 18);
  const activeSources = sourceRegistry
    .filter((source) => source.connector_status !== "planned")
    .slice(0, 16);

  if (input.promptLanguage === "en") {
    return [
      "# FinGraph Compact Context",
      "",
      `Generated at: ${input.now.toISOString()}`,
      `Evidence window: recent ${input.days} day(s).`,
      "",
      "This file intentionally removes raw CSV, JSONL, and relation_map JSON. Use the curated summaries below, then cite the original URLs.",
      "",
      "## Current Evidence Highlights",
      importantEvents.length
        ? importantEvents
            .map((event, index) =>
              [
                `${index + 1}. ${event.title}`,
                `   - Time: ${event.time}`,
                `   - Source: ${sourceTypeLabels[event.source_type] ?? event.source_type}`,
                `   - Layers: ${formatLayers(event.related_layers)}`,
                `   - Direction / strength / horizon: ${event.direction} / ${event.strength}/5 / ${event.horizon}`,
                `   - Assets: ${event.assets.join(", ") || "N/A"}`,
                `   - Why it matters: ${truncateText(event.description)}`,
                `   - Original link: ${event.url}`
              ].join("\n")
            )
            .join("\n\n")
        : "No recent events were included in the export.",
      "",
      "## Indicator Snapshot",
      importantIndicators.length
        ? importantIndicators
            .map((indicator) => `- ${indicator.name}: ${indicator.value}${indicator.unit ? ` ${indicator.unit}` : ""}; change ${indicator.change}; layer ${layerLabels[indicator.layer] ?? indicator.layer}; note: ${truncateText(indicator.note, 180)}; source: ${indicator.url}`)
            .join("\n")
        : "No indicators were included in the export.",
      "",
      "## Source Links",
      activeSources.map((source) => `- ${source.name}: ${source.docs_url} (${source.notes})`).join("\n"),
      "",
      "## Compact Relation Guide",
      "- Rates and real yields affect equity valuation, especially QQQ/Nasdaq and long-duration growth equities.",
      "- Inflation and wage pressure affect Fed policy, margins, discount rates, and consumer demand.",
      "- Fiscal supply and debt service can affect Treasury yields, dollar liquidity, and risk appetite.",
      "- Energy and geopolitical shocks can affect headline inflation, supply chains, earnings, and safe-haven demand.",
      "- Corporate earnings, AI/capex expectations, and margins decide whether macro pressure is absorbed or amplified.",
      "- Market sentiment, breadth, volatility, positioning, and credit decide how quickly evidence is priced."
    ].join("\n");
  }

  return [
    "# FinGraph 精简上下文",
    "",
    `生成时间：${input.now.toISOString()}`,
    `证据窗口：最近 ${input.days} 天。`,
    "",
    "本文件已刻意删除原始 CSV、JSONL 和 relation_map JSON，避免把工程数据倾倒给模型。请只使用下面已经整理好的证据摘要、指标摘要和原始链接。",
    "",
    "## 当前关键证据摘要",
    importantEvents.length
      ? importantEvents
          .map((event, index) =>
            [
              `${index + 1}. ${event.title}`,
              `   - 时间：${event.time}`,
              `   - 来源类型：${sourceTypeLabels[event.source_type] ?? event.source_type}`,
              `   - 相关层级：${formatLayers(event.related_layers)}`,
              `   - 方向 / 强度 / 周期：${event.direction} / ${event.strength}/5 / ${event.horizon}`,
              `   - 影响资产：${event.assets.join("、") || "无"}`,
              `   - 金融含义：${truncateText(event.description)}`,
              `   - 原始链接：${event.url}`
            ].join("\n")
          )
          .join("\n\n")
      : "本次导出没有包含近期事件。",
    "",
    "## 指标快照",
    importantIndicators.length
      ? importantIndicators
          .map((indicator) => `- ${indicator.name}：${indicator.value}${indicator.unit ? ` ${indicator.unit}` : ""}；变化 ${indicator.change}；层级 ${layerLabels[indicator.layer] ?? indicator.layer}；说明：${truncateText(indicator.note, 180)}；来源：${indicator.url}`)
          .join("\n")
      : "本次导出没有包含指标。",
    "",
    "## 可追溯来源入口",
    activeSources.map((source) => `- ${source.name}：${source.docs_url}`).join("\n"),
    "",
    "## 精简关系拓扑说明",
    "- 利率和实际收益率会影响估值折现，对 QQQ、纳斯达克和长久期成长股尤其重要。",
    "- 通胀、工资和油价会影响美联储路径、企业利润率、消费需求和风险偏好。",
    "- 财政赤字、国债供给和利息支出会影响长期美债收益率、美元流动性和市场风险偏好。",
    "- 能源与地缘冲击会通过通胀、供应链、企业成本和避险需求传导到资产价格。",
    "- 企业盈利、AI/资本开支预期和利润率决定宏观压力会被吸收还是被放大。",
    "- 市场情绪、广度、波动率、仓位和信用环境决定证据被定价的速度。"
  ].join("\n");
}

async function buildArtifacts(input: {
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  graph: unknown;
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

  const prompt = buildPrompt(input.promptLanguage);
  const compactContext = buildCompactContext({ events: input.events, indicators: input.indicators, days: input.days, now, promptLanguage: input.promptLanguage });

  return { now, date, skill, knowledgeBase, topology, compactContext, prompt };
}

export async function buildSkillPack(input: {
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  graph: unknown;
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

  zip.file("prompt.md", artifacts.prompt);
  zip.file("SKILL.md", artifacts.skill);
  zip.file("context/compact_context.md", artifacts.compactContext);
  zip.file("references/nine_layer_knowledge_base.md", artifacts.knowledgeBase);
  zip.file("references/relation_topology.md", artifacts.topology);
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
  graph: unknown;
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
    promptLanguage === "zh"
      ? "这是一个精简 TXT，适合直接复制或上传给 AI。它已经删除 raw CSV、JSONL 和 relation_map JSON，避免无用数据污染模型注意力。"
      : "This is a compact TXT for direct copy/paste or upload into an AI model. Raw CSV, JSONL, and relation_map JSON have been removed to reduce attention pollution.",
    "",
    artifacts.prompt,
    "",
    "## Manifest",
    "```json",
    JSON.stringify(manifest, null, 2),
    "```",
    "",
    "## references/nine_layer_knowledge_base.md",
    artifacts.knowledgeBase,
    "",
    "## references/relation_topology.md",
    artifacts.topology,
    "",
    "## context/compact_context.md",
    artifacts.compactContext,
    "",
    "## SKILL.md",
    artifacts.skill,
    "",
    promptLanguage === "zh" ? "## 最终提醒" : "## Final Reminder",
    promptLanguage === "zh"
      ? "请严格按照本文开头的中文 User Prompt 输出中文报告。不要使用英文问题引导，不要把 raw data 文件当作必要输入。"
      : "Follow the English User Prompt at the top. Do not request raw data files as necessary input.",
    "",
    artifacts.prompt
  ].join("\n");

  return { text, manifest };
}
