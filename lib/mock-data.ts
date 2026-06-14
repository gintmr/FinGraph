import { layers } from "@/lib/config/layers";
import { sourceRegistry } from "@/lib/config/sources";
import type {
  DailyBriefing,
  DashboardPayload,
  FinGraphEvent,
  GraphEdge,
  GraphNode,
  LayerHealth,
  MarketIndicator
} from "@/lib/types";

const now = "2026-06-14T10:30:00Z";

export const seedBriefing: DailyBriefing = {
  date: "2026-06-14",
  sentence:
    "Demo regime: macro conditions are risk-neutral with rate pressure still relevant, AI earnings support intact, and energy/geopolitical links worth monitoring.",
  regime: "risk_neutral",
  bullets: [
    "央行层仍是估值的主导变量：通胀、就业和实际利率决定科技股久期压力。",
    "企业层的 AI 盈利兑现能力，是抵消高利率压力的关键支撑。",
    "财政层与长期美债收益率相互反馈，决定 QQQ 和 TLT 的中期风险边界。",
    "地缘层主要通过能源、芯片供应链和风险溢价影响市场层。"
  ],
  watchpoints: ["10Y 美债收益率", "核心 PCE", "AI 资本开支回报", "美元指数", "原油库存与油价"]
};

export const seedLayerHealth: LayerHealth[] = [
  { layer: "currency", score: 68, status: "neutral_strong", trend: "flat", note: "美元体系仍稳，但强美元会压制全球流动性。" },
  { layer: "central_bank", score: 72, status: "neutral_strong", trend: "down", note: "降息路径受通胀粘性约束，估值仍受实际利率影响。" },
  { layer: "fiscal", score: 55, status: "neutral", trend: "down", note: "赤字与利息支出是长期利率风险来源。" },
  { layer: "industry", score: 63, status: "neutral_strong", trend: "up", note: "AI 基建与再工业化提供生产率上行期权。" },
  { layer: "corporate", score: 71, status: "neutral_strong", trend: "up", note: "科技巨头盈利质量较强，但估值容错率有限。" },
  { layer: "geopolitical", score: 48, status: "weak", trend: "down", note: "能源通道、出口管制和制裁风险压低稳定性。" },
  { layer: "social", score: 51, status: "neutral", trend: "flat", note: "消费韧性与住房负担之间存在拉扯。" },
  { layer: "market", score: 60, status: "neutral_strong", trend: "flat", note: "风险资产趋势尚可，但估值与集中度值得警惕。" }
];

export const seedEvents: FinGraphEvent[] = [
  {
    id: "evt_seed_fed_001",
    time: now,
    title: "Federal Reserve policy communications remain the key input for rate expectations",
    url: "https://www.federalreserve.gov/monetarypolicy.htm",
    source_type: "official_rss",
    related_layers: ["central_bank", "market", "corporate"],
    related_nodes: ["Fed reaction function", "real yields", "Nasdaq valuation"],
    description:
      "美联储政策沟通会改变市场对降息时间和实际利率路径的判断。若降息预期后移，成长股估值通常承压；若通胀同步回落且就业稳定，风险资产会更容易获得支撑。",
    direction: "mixed",
    strength: 4,
    horizon: "medium",
    assets: ["QQQ", "NASDAQ", "SPY", "TLT", "DXY"],
    confidence: 0.78,
    included_in_export: true
  },
  {
    id: "evt_seed_sec_001",
    time: "2026-06-14T09:45:00Z",
    title: "SEC EDGAR filings provide the authoritative source for technology company fundamentals",
    url: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces",
    source_type: "company_filing",
    related_layers: ["corporate", "industry", "market"],
    related_nodes: ["earnings quality", "AI capex", "free cash flow"],
    description:
      "企业层判断不能只依赖新闻摘要，应回到 10-K、10-Q、8-K 与 XBRL 财务数据。FinGraph 会把公司披露映射到收入、利润率、自由现金流、AI 投资和估值承载能力。",
    direction: "positive",
    strength: 3,
    horizon: "long",
    assets: ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "QQQ"],
    confidence: 0.86,
    included_in_export: true
  },
  {
    id: "evt_seed_eia_001",
    time: "2026-06-14T08:30:00Z",
    title: "Energy data are monitored as an inflation and geopolitical transmission channel",
    url: "https://www.eia.gov/opendata/",
    source_type: "official_api",
    related_layers: ["industry", "central_bank", "geopolitical", "market"],
    related_nodes: ["oil inventories", "headline inflation", "energy risk premium"],
    description:
      "原油与能源库存变化会通过通胀预期影响央行层，也会通过企业成本和消费者支出影响市场层。若能源冲击来自地缘事件，其影响强度和期限通常更高。",
    direction: "mixed",
    strength: 3,
    horizon: "short",
    assets: ["WTI", "XLE", "SPY", "QQQ", "Gold"],
    confidence: 0.74,
    included_in_export: true
  },
  {
    id: "evt_seed_gdelt_001",
    time: "2026-06-14T07:20:00Z",
    title: "GDELT is used to discover global geopolitical and supply-chain event clusters",
    url: "https://www.gdeltproject.org/data.html",
    source_type: "public_database",
    related_layers: ["geopolitical", "industry", "currency", "market"],
    related_nodes: ["sanctions", "shipping routes", "supply-chain fragmentation"],
    description:
      "GDELT 适合发现全球新闻事件簇，但不应单独作为最终事实依据。FinGraph 会将其作为地缘风险雷达，再用官方公告、公司披露或多个可靠报道交叉验证。",
    direction: "uncertain",
    strength: 2,
    horizon: "medium",
    assets: ["Oil", "DXY", "SOXX", "QQQ"],
    confidence: 0.55,
    included_in_export: true
  },
  {
    id: "evt_seed_treasury_001",
    time: "2026-06-13T21:15:00Z",
    title: "Treasury fiscal datasets anchor the fiscal layer and long-yield risk map",
    url: "https://fiscaldata.treasury.gov/api-documentation/",
    source_type: "official_api",
    related_layers: ["fiscal", "central_bank", "currency", "market"],
    related_nodes: ["Treasury supply", "interest expense", "term premium", "10Y yield"],
    description:
      "财政赤字、债务利息和国债供给会影响长期收益率。若债券供给增加而需求走弱，期限溢价上升可能压制 QQQ，并改变 TLT 的风险收益特征。",
    direction: "negative",
    strength: 4,
    horizon: "long",
    assets: ["TLT", "IEF", "QQQ", "SPY", "DXY"],
    confidence: 0.8,
    included_in_export: true
  }
];

export const seedIndicators: MarketIndicator[] = [
  {
    id: "ind_seed_ffr",
    name: "联邦基金利率",
    value: "5.50",
    unit: "%",
    change: "趋势不变",
    direction: "flat",
    layer: "central_bank",
    url: "https://fred.stlouisfed.org/series/FEDFUNDS",
    source_type: "official_api",
    updated_at: now,
    sparkline: [5.0, 5.1, 5.2, 5.25, 5.35, 5.45, 5.5, 5.5],
    note: "短端政策利率决定流动性和估值折现基准。"
  },
  {
    id: "ind_seed_cpi",
    name: "CPI 同比",
    value: "3.4",
    unit: "%",
    change: "低于前期",
    direction: "down",
    layer: "central_bank",
    url: "https://www.bls.gov/cpi/",
    source_type: "official_api",
    updated_at: now,
    sparkline: [4.6, 4.2, 3.9, 3.7, 3.5, 3.4, 3.4, 3.3],
    note: "通胀回落支持降息，但服务通胀粘性仍需观察。"
  },
  {
    id: "ind_seed_10y",
    name: "10Y 美债收益率",
    value: "4.48",
    unit: "%",
    change: "+0.06%",
    direction: "up",
    layer: "market",
    url: "https://fred.stlouisfed.org/series/DGS10",
    source_type: "official_api",
    updated_at: now,
    sparkline: [4.12, 4.19, 4.25, 4.38, 4.31, 4.4, 4.44, 4.48],
    note: "长期利率上行会提高成长股折现率。"
  },
  {
    id: "ind_seed_dxy",
    name: "美元指数代理",
    value: "104.25",
    change: "+0.32%",
    direction: "up",
    layer: "currency",
    url: "https://fred.stlouisfed.org/series/DTWEXBGS",
    source_type: "official_api",
    updated_at: now,
    sparkline: [101.9, 102.8, 103.1, 103.6, 104.1, 104.0, 104.3, 104.25],
    note: "强美元通常收紧全球金融条件。"
  },
  {
    id: "ind_seed_wti",
    name: "WTI 原油",
    value: "77.85",
    unit: "USD",
    change: "-1.23%",
    direction: "down",
    layer: "industry",
    url: "https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm",
    source_type: "official_api",
    updated_at: now,
    sparkline: [73, 74.5, 78, 82, 80, 79, 78.5, 77.85],
    note: "能源价格会影响通胀、企业成本和地缘风险溢价。"
  },
  {
    id: "ind_seed_vix",
    name: "VIX 恐慌指数",
    value: "14.62",
    change: "+3.21%",
    direction: "up",
    layer: "market",
    url: "https://www.cboe.com/tradable_products/vix/",
    source_type: "market_data",
    updated_at: now,
    sparkline: [12.7, 13.4, 12.9, 13.1, 13.8, 14.0, 14.2, 14.62],
    note: "低波动不等于低风险，尤其在地缘不确定性上升时。"
  }
];

export const seedGraphNodes: GraphNode[] = [
  { id: "usd_system", label: "美元体系", layer: "currency", score: 68, x: 50, y: 50 },
  { id: "fed_policy", label: "央行政策", layer: "central_bank", score: 72, x: 50, y: 18 },
  { id: "treasury_supply", label: "财政债务", layer: "fiscal", score: 55, x: 78, y: 28 },
  { id: "industry_capacity", label: "产业结构", layer: "industry", score: 63, x: 82, y: 55 },
  { id: "corp_earnings", label: "企业盈利", layer: "corporate", score: 71, x: 21, y: 45 },
  { id: "geopolitical_risk", label: "地缘政治", layer: "geopolitical", score: 48, x: 28, y: 75 },
  { id: "social_structure", label: "社会结构", layer: "social", score: 51, x: 50, y: 82 },
  { id: "market_sentiment", label: "市场情绪", layer: "market", score: 60, x: 76, y: 74 },
  { id: "capital_flow", label: "资本流动", layer: "currency", score: 62, x: 25, y: 25 }
];

export const seedGraphEdges: GraphEdge[] = [
  { id: "edge_fed_usd", source: "fed_policy", target: "usd_system", direction: "mixed", strength: "strong", channel: "利差与实际利率" },
  { id: "edge_fed_market", source: "fed_policy", target: "market_sentiment", direction: "negative", strength: "strong", channel: "折现率" },
  { id: "edge_fiscal_yield", source: "treasury_supply", target: "fed_policy", direction: "negative", strength: "medium", channel: "长期收益率" },
  { id: "edge_fiscal_usd", source: "treasury_supply", target: "usd_system", direction: "mixed", strength: "medium", channel: "储备信心" },
  { id: "edge_geo_energy", source: "geopolitical_risk", target: "industry_capacity", direction: "negative", strength: "medium", channel: "能源与供应链" },
  { id: "edge_ind_corp", source: "industry_capacity", target: "corp_earnings", direction: "positive", strength: "medium", channel: "生产率" },
  { id: "edge_corp_market", source: "corp_earnings", target: "market_sentiment", direction: "positive", strength: "strong", channel: "盈利预期" },
  { id: "edge_social_fiscal", source: "social_structure", target: "treasury_supply", direction: "mixed", strength: "medium", channel: "政策压力" },
  { id: "edge_capital_usd", source: "capital_flow", target: "usd_system", direction: "mixed", strength: "medium", channel: "避险需求" },
  { id: "edge_geo_market", source: "geopolitical_risk", target: "market_sentiment", direction: "negative", strength: "medium", channel: "风险溢价" }
];

export function getSeedDashboard(): DashboardPayload {
  return {
    briefing: seedBriefing,
    layerHealth: seedLayerHealth,
    events: seedEvents,
    indicators: seedIndicators,
    graphNodes: seedGraphNodes,
    graphEdges: seedGraphEdges,
    sources: sourceRegistry,
    generatedAt: new Date().toISOString(),
    mode: "seed"
  };
}

export const layerMatrixRows = [
  "央行政策偏鹰",
  "AI 盈利兑现",
  "财政供给压力",
  "能源价格冲击",
  "美元走强",
  "消费信用压力"
] as const;

export const layerMatrixValues: Record<string, Record<string, "high" | "medium" | "low" | "none">> = {
  央行政策偏鹰: {
    currency: "medium",
    central_bank: "high",
    fiscal: "medium",
    industry: "low",
    corporate: "high",
    geopolitical: "none",
    social: "medium",
    market: "high"
  },
  "AI 盈利兑现": {
    currency: "none",
    central_bank: "low",
    fiscal: "low",
    industry: "high",
    corporate: "high",
    geopolitical: "low",
    social: "medium",
    market: "high"
  },
  财政供给压力: {
    currency: "medium",
    central_bank: "medium",
    fiscal: "high",
    industry: "low",
    corporate: "medium",
    geopolitical: "none",
    social: "medium",
    market: "high"
  },
  能源价格冲击: {
    currency: "low",
    central_bank: "high",
    fiscal: "low",
    industry: "high",
    corporate: "medium",
    geopolitical: "high",
    social: "medium",
    market: "high"
  },
  美元走强: {
    currency: "high",
    central_bank: "medium",
    fiscal: "low",
    industry: "medium",
    corporate: "medium",
    geopolitical: "low",
    social: "low",
    market: "medium"
  },
  消费信用压力: {
    currency: "low",
    central_bank: "medium",
    fiscal: "medium",
    industry: "low",
    corporate: "medium",
    geopolitical: "none",
    social: "high",
    market: "medium"
  }
};

export const demoTrendSeries = [
  { month: "2025-09", fed: 5.5, cpi: 3.7, pce: 3.0 },
  { month: "2025-10", fed: 5.5, cpi: 3.6, pce: 2.9 },
  { month: "2025-11", fed: 5.5, cpi: 3.4, pce: 2.8 },
  { month: "2025-12", fed: 5.5, cpi: 3.2, pce: 2.8 },
  { month: "2026-01", fed: 5.5, cpi: 3.3, pce: 2.9 },
  { month: "2026-02", fed: 5.5, cpi: 3.4, pce: 2.8 },
  { month: "2026-03", fed: 5.5, cpi: 3.3, pce: 2.7 },
  { month: "2026-04", fed: 5.5, cpi: 3.5, pce: 2.9 },
  { month: "2026-05", fed: 5.5, cpi: 3.4, pce: 2.8 }
];

export const demoDashboardPayload = getSeedDashboard();

