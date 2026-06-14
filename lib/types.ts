export type FinLayerId =
  | "currency"
  | "central_bank"
  | "fiscal"
  | "industry"
  | "corporate"
  | "geopolitical"
  | "social"
  | "market";

export type Direction = "positive" | "negative" | "neutral" | "mixed" | "uncertain";

export type Horizon = "short" | "medium" | "long" | "structural";

export type SourceType =
  | "official_api"
  | "official_rss"
  | "public_database"
  | "company_filing"
  | "market_data"
  | "search_result"
  | "user_link";

export type Reliability = "very_high" | "high" | "medium" | "low";

export type LayerStatus = "weak" | "neutral" | "neutral_strong" | "strong";

export type Trend = "up" | "down" | "flat";

export interface LayerDefinition {
  id: FinLayerId;
  zh: string;
  en: string;
  shortName: string;
  color: string;
  accent: string;
  icon: string;
  description: string;
  coreQuestion: string;
}

export interface LayerHealth {
  layer: FinLayerId;
  score: number;
  status: LayerStatus;
  trend: Trend;
  note: string;
}

export interface FinGraphEvent {
  id: string;
  time: string;
  title: string;
  url: string;
  source_type: SourceType;
  related_layers: FinLayerId[];
  related_nodes: string[];
  description: string;
  direction: Direction;
  strength: 1 | 2 | 3 | 4 | 5;
  horizon: Horizon;
  assets: string[];
  confidence: number;
  included_in_export?: boolean;
}

export interface MarketIndicator {
  id: string;
  name: string;
  value: string;
  unit?: string;
  change: string;
  direction: Trend;
  layer: FinLayerId;
  url: string;
  source_type: SourceType;
  updated_at: string;
  sparkline: number[];
  note: string;
}

export interface GraphNode {
  id: string;
  label: string;
  layer: FinLayerId;
  score?: number;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  direction: Direction;
  strength: "weak" | "medium" | "strong";
  channel: string;
}

export interface DailyBriefing {
  date: string;
  sentence: string;
  regime: "risk_on" | "risk_neutral" | "risk_off" | "mixed";
  bullets: string[];
  watchpoints: string[];
}

export interface SourceDefinition {
  id: string;
  name: string;
  type: SourceType;
  reliability: Reliability;
  docs_url: string;
  base_url: string;
  api_key_required: boolean;
  api_key_env?: string;
  connector_status: "implemented" | "key_required" | "planned";
  layers: FinLayerId[];
  cadence: "realtime" | "hourly" | "daily" | "weekly" | "monthly" | "event_driven";
  collector_notes: string;
  notes: string;
}

export interface DashboardPayload {
  briefing: DailyBriefing;
  layerHealth: LayerHealth[];
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  sources: SourceDefinition[];
  generatedAt: string;
  mode: "seed" | "supabase" | "local_cache";
}

export interface CollectorResult {
  sourceId: string;
  ok: boolean;
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
  error?: string;
}
