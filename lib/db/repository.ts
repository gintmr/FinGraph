import { sourceRegistry } from "@/lib/config/sources";
import { buildLiveDashboardContext } from "@/lib/analysis/dashboard";
import { readLocalLiveCache } from "@/lib/db/local-cache";
import { getSeedDashboard, seedGraphEdges, seedGraphNodes, seedIndicators } from "@/lib/mock-data";
import { getSupabaseAdmin, hasSupabaseAdminEnv } from "@/lib/supabase/server";
import type {
  CollectorResult,
  DashboardPayload,
  FinGraphEvent,
  GraphEdge,
  GraphNode,
  MarketIndicator,
  SourceDefinition
} from "@/lib/types";

type DbMode = "seed" | "supabase";

function asEvents(rows: unknown[]): FinGraphEvent[] {
  return rows.map((row) => row as FinGraphEvent);
}

function asIndicators(rows: unknown[]): MarketIndicator[] {
  return rows.map((row) => row as MarketIndicator);
}

function asGraphNodes(rows: unknown[]): GraphNode[] {
  return rows.map((row) => row as GraphNode);
}

function asGraphEdges(rows: unknown[]): GraphEdge[] {
  return rows.map((row) => row as GraphEdge);
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function sourceRows() {
  return sourceRegistry.map((source) => ({
    id: source.id,
    name: source.name,
    type: source.type,
    reliability: source.reliability,
    docs_url: source.docs_url,
    base_url: source.base_url,
    api_key_required: source.api_key_required,
    api_key_env: source.api_key_env ?? null,
    connector_status: source.connector_status,
    layers: source.layers,
    cadence: source.cadence,
    collector_notes: source.collector_notes,
    notes: source.notes
  }));
}

export function currentDataMode(): DbMode {
  return hasSupabaseAdminEnv() ? "supabase" : "seed";
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const seed = getSeedDashboard();
  const supabase = getSupabaseAdmin();

  async function localLivePayload() {
    const cache = await readLocalLiveCache();
    if (!cache) {
      const context = buildLiveDashboardContext([], []);
      return {
        ...seed,
        ...context,
        events: [],
        indicators: [],
        graphNodes: seed.graphNodes,
        graphEdges: seed.graphEdges,
        sources: sourceRegistry,
        generatedAt: new Date().toISOString(),
        mode: "supabase" as const
      };
    }

    const context = buildLiveDashboardContext(cache.events, cache.indicators);
    return {
      ...seed,
      ...context,
      events: cache.events,
      indicators: cache.indicators,
      graphNodes: seed.graphNodes,
      graphEdges: seed.graphEdges,
      sources: sourceRegistry,
      generatedAt: cache.generatedAt,
      mode: "local_cache" as const
    };
  }

  if (!supabase) {
    return seed;
  }

  try {
    const [events, indicators, graphNodes, graphEdges] = await Promise.all([
      supabase.from("events").select("*").order("time", { ascending: false }).limit(40),
      supabase.from("indicators").select("*").order("updated_at", { ascending: false }).limit(40),
      supabase.from("graph_nodes").select("*").order("id", { ascending: true }),
      supabase.from("graph_edges").select("*").order("id", { ascending: true })
    ]);

    if (events.error || indicators.error || graphNodes.error || graphEdges.error) {
      return localLivePayload();
    }

    const liveEvents = events.data?.length ? asEvents(events.data) : [];
    const liveIndicators = indicators.data?.length ? asIndicators(indicators.data) : [];
    const context = buildLiveDashboardContext(liveEvents, liveIndicators);

    if (!liveEvents.length && !liveIndicators.length) {
      return localLivePayload();
    }

    return {
      ...seed,
      ...context,
      events: liveEvents,
      indicators: liveIndicators,
      graphNodes: graphNodes.data?.length ? asGraphNodes(graphNodes.data) : seed.graphNodes,
      graphEdges: graphEdges.data?.length ? asGraphEdges(graphEdges.data) : seed.graphEdges,
      sources: sourceRegistry,
      generatedAt: new Date().toISOString(),
      mode: "supabase"
    };
  } catch {
    return localLivePayload();
  }
}

export async function getEventsForExport(days = 14): Promise<FinGraphEvent[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return getSeedDashboard().events;
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("time", since)
    .eq("included_in_export", true)
    .order("time", { ascending: false });

  if (error || !data?.length) {
    return getSeedDashboard().events;
  }

  return asEvents(data);
}

export async function getIndicatorsForExport(): Promise<MarketIndicator[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return seedIndicators;
  }

  const { data, error } = await supabase
    .from("indicators")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error || !data?.length) {
    return seedIndicators;
  }

  return asIndicators(data);
}

export async function getGraphForExport(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { nodes: seedGraphNodes, edges: seedGraphEdges };
  }

  const [nodes, edges] = await Promise.all([
    supabase.from("graph_nodes").select("*").order("id", { ascending: true }),
    supabase.from("graph_edges").select("*").order("id", { ascending: true })
  ]);

  return {
    nodes: nodes.data?.length && !nodes.error ? asGraphNodes(nodes.data) : seedGraphNodes,
    edges: edges.data?.length && !edges.error ? asGraphEdges(edges.data) : seedGraphEdges
  };
}

export async function getSources(): Promise<SourceDefinition[]> {
  return sourceRegistry;
}

export async function getIngestionStatus() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      mode: "seed" as const,
      eventCount: 0,
      indicatorCount: 0,
      latestCronRun: null as Record<string, unknown> | null
    };
  }

  const [events, indicators, cronRuns] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("indicators").select("id", { count: "exact", head: true }),
    supabase
      .from("cron_runs")
      .select("created_at, ok, mode, source_count, collected_event_count, collected_indicator_count, persisted_event_count, persisted_indicator_count, errors")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const localCache = await readLocalLiveCache();
  const eventCount = events.count && events.count > 0 ? events.count : localCache?.events.length ?? 0;
  const indicatorCount = indicators.count && indicators.count > 0 ? indicators.count : localCache?.indicators.length ?? 0;
  const hasSupabaseRows = Boolean((events.count && events.count > 0) || (indicators.count && indicators.count > 0));

  return {
    mode: hasSupabaseRows || !localCache ? ("supabase" as const) : ("local_cache" as const),
    eventCount,
    indicatorCount,
    latestCronRun: cronRuns.data && !cronRuns.error ? (cronRuns.data as Record<string, unknown>) : null
  };
}

export async function ensureStaticReferenceData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { mode: "seed" as const, sourceCount: 0, nodeCount: 0, edgeCount: 0, errors: [] as string[] };
  }

  const errors: string[] = [];

  const sources = await supabase.from("sources").upsert(sourceRows(), { onConflict: "id" });
  if (sources.error) {
    errors.push(`sources: ${sources.error.message}`);
  }

  const nodes = await supabase.from("graph_nodes").upsert(seedGraphNodes, { onConflict: "id" });
  if (nodes.error) {
    errors.push(`graph_nodes: ${nodes.error.message}`);
  }

  const edges = await supabase.from("graph_edges").upsert(seedGraphEdges, { onConflict: "id" });
  if (edges.error) {
    errors.push(`graph_edges: ${edges.error.message}`);
  }

  return {
    mode: "supabase" as const,
    sourceCount: sourceRegistry.length,
    nodeCount: seedGraphNodes.length,
    edgeCount: seedGraphEdges.length,
    errors
  };
}

export async function upsertCollectedData(results: CollectorResult[]) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { mode: "seed" as const, eventCount: 0, indicatorCount: 0, errors: [] as string[] };
  }

  const staticData = await ensureStaticReferenceData();
  const errors = [...staticData.errors];
  const events = dedupeById(
    results
      .filter((result) => result.ok)
      .flatMap((result) => result.events)
      .filter((event) => event.id && event.title && event.time && isValidHttpUrl(event.url))
  );
  const indicators = dedupeById(
    results
      .filter((result) => result.ok)
      .flatMap((result) => result.indicators)
      .filter((indicator) => indicator.id && indicator.name && indicator.updated_at && isValidHttpUrl(indicator.url))
  );

  let persistedEventCount = 0;
  let persistedIndicatorCount = 0;

  if (events.length) {
    const { error } = await supabase.from("events").upsert(events, { onConflict: "id" });
    if (error) {
      errors.push(`events: ${error.message}`);
    } else {
      persistedEventCount = events.length;
    }
  }

  if (indicators.length) {
    const { error } = await supabase.from("indicators").upsert(indicators, { onConflict: "id" });
    if (error) {
      errors.push(`indicators: ${error.message}`);
    } else {
      persistedIndicatorCount = indicators.length;
    }
  }

  return { mode: "supabase" as const, eventCount: persistedEventCount, indicatorCount: persistedIndicatorCount, errors };
}

export async function registerExport(manifest: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  await supabase.from("skill_exports").insert({
    file_name: manifest.fileName,
    event_count: manifest.eventCount,
    indicator_count: manifest.indicatorCount,
    manifest
  });
}

export async function logCronRun(payload: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  await supabase.from("cron_runs").insert(payload);
}
