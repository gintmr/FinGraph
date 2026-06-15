"use client";

import type { CSSProperties, DragEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Palette, RotateCcw } from "lucide-react";
import { DailySummaryCard } from "@/components/dashboard/daily-summary-card";
import { ExportPanel } from "@/components/dashboard/export-panel";
import {
  AiThemeMonitorPanel,
  AssetHeatmapPanel,
  CftcPositioningPanel,
  ChartLinksPanel,
  EarningsCalendarPanel,
  EconomicCalendarPanel,
  FedWatchPanel,
  FiscalSocialPanel,
  GlobalHotspotsPanel,
  InflationComponentsPanel,
  RiskGaugePanel,
  SectorRadarPanel,
  YieldCurvePanel
} from "@/components/dashboard/extended-panels";
import { FinancialGraph } from "@/components/dashboard/financial-graph";
import { ImpactMatrix } from "@/components/dashboard/impact-matrix";
import { LayerHealthGrid } from "@/components/dashboard/layer-health-grid";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { NewsInsightList } from "@/components/dashboard/news-insight-list";
import { RiskPanel } from "@/components/dashboard/risk-panel";
import { TrendPanel } from "@/components/dashboard/trend-panel";
import type { DashboardPayload } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type PanelTone = "blue" | "amber" | "green" | "red" | "slate";
type DashboardColumnId = "left" | "center" | "right";

type PanelDefinition = {
  id: string;
  title: string;
  tone: PanelTone;
  render: () => ReactNode;
};

type ColumnPanels = Record<DashboardColumnId, string[]>;

type PanelPreferences = {
  columns: ColumnPanels;
  collapsed: Record<string, boolean>;
  tones: Record<string, PanelTone>;
};

type DragState = {
  panelId: string;
  sourceColumn: DashboardColumnId;
};

type DropTarget = {
  column: DashboardColumnId;
  beforeId: string | null;
  top: number;
};

const storageKey = "fingraph-dashboard-panels-v4";
const dashboardColumns: DashboardColumnId[] = ["left", "center", "right"];
const dropPreviewHeight = 68;
const dropSwitchDeadZone = 18;

const columnLabels: Record<DashboardColumnId, string> = {
  left: "左栏",
  center: "主栏",
  right: "右栏"
};

const defaultColumns: ColumnPanels = {
  left: ["market_overview", "impact_matrix", "trend", "inflation_components", "fed_watch", "economic_calendar", "yield_curve", "fiscal_social"],
  center: ["daily_summary", "news", "financial_graph", "layer_health", "asset_heatmap", "export"],
  right: ["cftc_positioning", "risk_gauge", "global_hotspots", "chart_links", "sector_radar", "ai_theme", "earnings_calendar", "risk"]
};

const toneStyles: Record<
  PanelTone,
  {
    label: string;
    color: string;
    softBg: string;
    className: string;
  }
> = {
  blue: { label: "蓝", color: "rgb(var(--color-blue))", softBg: "rgb(var(--color-blue) / 0.14)", className: "bg-blue" },
  amber: { label: "黄", color: "rgb(var(--color-amber))", softBg: "rgb(var(--color-amber) / 0.16)", className: "bg-amber" },
  green: { label: "绿", color: "rgb(var(--color-green))", softBg: "rgb(var(--color-green) / 0.14)", className: "bg-green" },
  red: { label: "红", color: "rgb(var(--color-red))", softBg: "rgb(var(--color-red) / 0.14)", className: "bg-red" },
  slate: { label: "灰", color: "rgb(var(--color-muted))", softBg: "rgb(var(--color-muted) / 0.14)", className: "bg-muted/60" }
};

function findDefaultColumn(panelId: string): DashboardColumnId {
  return dashboardColumns.find((column) => defaultColumns[column].includes(panelId)) ?? "right";
}

function defaultToneForPanel(panelId: string): PanelTone {
  return findDefaultColumn(panelId) === "center" ? "red" : "slate";
}

function normalizeColumns(input: Partial<Record<DashboardColumnId, string[]>> | undefined, panels: PanelDefinition[]): ColumnPanels {
  const knownIds = new Set(panels.map((panel) => panel.id));
  const nextColumns: ColumnPanels = { left: [], center: [], right: [] };
  const usedIds = new Set<string>();

  for (const column of dashboardColumns) {
    const ids = input?.[column] ?? [];
    for (const id of ids) {
      if (knownIds.has(id) && !usedIds.has(id)) {
        nextColumns[column].push(id);
        usedIds.add(id);
      }
    }
  }

  for (const panel of panels) {
    if (!usedIds.has(panel.id)) {
      nextColumns[findDefaultColumn(panel.id)].push(panel.id);
      usedIds.add(panel.id);
    }
  }

  return nextColumns;
}

function defaultPanelPreferences(panels: PanelDefinition[]): PanelPreferences {
  return {
    columns: normalizeColumns(defaultColumns, panels),
    collapsed: {},
    tones: Object.fromEntries(panels.map((panel) => [panel.id, defaultToneForPanel(panel.id)])) as Record<string, PanelTone>
  };
}

function mergePreferences(saved: PanelPreferences | null, panels: PanelDefinition[]): PanelPreferences {
  const defaults = defaultPanelPreferences(panels);
  if (!saved) {
    return defaults;
  }

  return {
    columns: normalizeColumns(saved.columns ?? defaultColumns, panels),
    collapsed: saved.collapsed ?? {},
    tones: { ...defaults.tones, ...(saved.tones ?? {}) }
  };
}

function DropPreview({ target }: { target: DropTarget | null }) {
  if (!target) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20 px-1 transition-transform duration-100 ease-out"
      style={{ transform: `translateY(${target.top}px)` }}
    >
      <div className="rounded-xl border-2 border-dashed border-blue/80 bg-blue/15 p-2 shadow-glow">
        <div className="grid h-14 place-items-center rounded-lg bg-blue/10 text-xs font-semibold text-blue">
          放置到这里
        </div>
      </div>
    </div>
  );
}

function PanelShell({
  panel,
  column,
  tone,
  collapsed,
  dragging,
  onDragStart,
  onDragEnd,
  onToggle,
  onToneChange
}: {
  panel: PanelDefinition;
  column: DashboardColumnId;
  tone: PanelTone;
  collapsed: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onToggle: () => void;
  onToneChange: (tone: PanelTone) => void;
}) {
  const toneStyle = toneStyles[tone];
  const style = {
    "--panel-accent": toneStyle.color,
    "--panel-accent-soft": toneStyle.softBg
  } as CSSProperties;

  return (
    <div
      draggable
      data-panel-id={panel.id}
      data-column={column}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", panel.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      style={style}
      className={cn(
        "rounded-xl border border-line/80 bg-panel/70 p-2 shadow-glow transition duration-150",
        dragging && "scale-[0.99] opacity-45"
      )}
    >
      <div
        className="mb-2 flex min-h-10 items-center justify-between gap-2 rounded-lg border border-line px-2.5 py-2"
        style={{
          background:
            "linear-gradient(90deg, var(--panel-accent-soft) 0%, rgb(var(--color-panel2) / 0.82) 48%, rgb(var(--color-panel) / 0.74) 100%)"
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-panel hover:text-text"
            title="拖拽排序"
            aria-label={`拖拽排序：${panel.title}`}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
          <span className="h-6 w-1.5 rounded-full" style={{ background: "var(--panel-accent)" }} />
          <div className="min-w-0">
            <span className="block truncate text-xs font-semibold text-text">{panel.title}</span>
            <span className="block text-[10px] font-medium text-muted">{columnLabels[column]}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="hidden items-center gap-1 sm:flex">
            {(Object.keys(toneStyles) as PanelTone[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onToneChange(item)}
                className={cn(
                  "h-4 w-4 rounded-full border border-line transition",
                  toneStyles[item].className,
                  tone === item && "ring-2 ring-blue/50 ring-offset-1 ring-offset-panel"
                )}
                title={`主题色：${toneStyles[item].label}`}
                aria-label={`${panel.title} 主题色：${toneStyles[item].label}`}
              />
            ))}
          </div>
          <Palette className="h-3.5 w-3.5 text-muted sm:hidden" aria-hidden />
          <button
            type="button"
            onClick={onToggle}
            className="grid h-7 w-7 place-items-center rounded-md text-muted transition hover:bg-panel hover:text-text"
            title={collapsed ? "展开" : "折叠"}
            aria-label={`${collapsed ? "展开" : "折叠"}：${panel.title}`}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronUp className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      {collapsed ? (
        <div
          className="rounded-lg border border-line px-4 py-3 text-sm font-medium text-muted"
          style={{ background: "var(--panel-accent-soft)" }}
        >
          已折叠
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border-l-4" style={{ borderLeftColor: "var(--panel-accent)" }}>
          {panel.render()}
        </div>
      )}
    </div>
  );
}

export function DashboardWorkspace({ payload }: { payload: DashboardPayload }) {
  const panels = useMemo<PanelDefinition[]>(
    () => [
      {
        id: "daily_summary",
        title: "今日一句话总结",
        tone: "amber",
        render: () => <DailySummaryCard briefing={payload.briefing} />
      },
      {
        id: "layer_health",
        title: "八个分析层健康度评分",
        tone: "blue",
        render: () => <LayerHealthGrid items={payload.layerHealth} />
      },
      {
        id: "market_overview",
        title: "市场概览",
        tone: "green",
        render: () => <MarketOverview indicators={payload.indicators} />
      },
      {
        id: "asset_heatmap",
        title: "全球资产热力图",
        tone: "green",
        render: () => <AssetHeatmapPanel indicators={payload.indicators} />
      },
      {
        id: "cftc_positioning",
        title: "期货仓位 / COT",
        tone: "green",
        render: () => <CftcPositioningPanel indicators={payload.indicators} />
      },
      {
        id: "yield_curve",
        title: "收益率曲线",
        tone: "blue",
        render: () => <YieldCurvePanel indicators={payload.indicators} />
      },
      {
        id: "risk_gauge",
        title: "风险仪表盘",
        tone: "red",
        render: () => <RiskGaugePanel events={payload.events} indicators={payload.indicators} />
      },
      {
        id: "impact_matrix",
        title: "关键影响矩阵",
        tone: "amber",
        render: () => <ImpactMatrix events={payload.events} />
      },
      {
        id: "financial_graph",
        title: "九层结构图",
        tone: "blue",
        render: () => <FinancialGraph nodes={payload.graphNodes} edges={payload.graphEdges} />
      },
      {
        id: "news",
        title: "今日重要资讯与规则解读",
        tone: "green",
        render: () => <NewsInsightList events={payload.events.slice(0, 5)} compact />
      },
      {
        id: "inflation_components",
        title: "通胀分项监测",
        tone: "amber",
        render: () => <InflationComponentsPanel indicators={payload.indicators} />
      },
      {
        id: "fed_watch",
        title: "政策预期定价",
        tone: "blue",
        render: () => <FedWatchPanel events={payload.events} indicators={payload.indicators} />
      },
      {
        id: "economic_calendar",
        title: "经济日历",
        tone: "amber",
        render: () => <EconomicCalendarPanel events={payload.events} />
      },
      {
        id: "global_hotspots",
        title: "全球热点事件源",
        tone: "red",
        render: () => <GlobalHotspotsPanel events={payload.events} />
      },
      {
        id: "fiscal_social",
        title: "财政与社会压力",
        tone: "amber",
        render: () => <FiscalSocialPanel events={payload.events} indicators={payload.indicators} />
      },
      {
        id: "chart_links",
        title: "外部图表入口",
        tone: "blue",
        render: () => <ChartLinksPanel indicators={payload.indicators} />
      },
      {
        id: "sector_radar",
        title: "板块轮动雷达",
        tone: "blue",
        render: () => <SectorRadarPanel events={payload.events} />
      },
      {
        id: "ai_theme",
        title: "AI 主题监测",
        tone: "green",
        render: () => <AiThemeMonitorPanel events={payload.events} />
      },
      {
        id: "earnings_calendar",
        title: "企业财报日历",
        tone: "amber",
        render: () => <EarningsCalendarPanel events={payload.events} />
      },
      {
        id: "trend",
        title: "利率与通胀趋势",
        tone: "blue",
        render: () => <TrendPanel indicators={payload.indicators} />
      },
      {
        id: "risk",
        title: "监控预警",
        tone: "red",
        render: () => <RiskPanel events={payload.events} indicators={payload.indicators} />
      },
      {
        id: "export",
        title: "Skill Pack 导出",
        tone: "blue",
        render: () => <ExportPanel eventCount={payload.events.length} indicatorCount={payload.indicators.length} />
      }
    ],
    [payload]
  );

  const [preferences, setPreferences] = useState<PanelPreferences>(() => defaultPanelPreferences(panels));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setPreferences(mergePreferences(saved ? (JSON.parse(saved) as PanelPreferences) : null, panels));
    } catch {
      setPreferences(defaultPanelPreferences(panels));
    }
  }, [panels]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences]);

  const panelById = useMemo(() => new Map(panels.map((panel) => [panel.id, panel])), [panels]);

  function updateDropTarget(target: DropTarget) {
    if (!dragState) {
      return;
    }

    setDropTarget((current) => {
      if (current?.column === target.column && current.beforeId === target.beforeId && Math.abs(current.top - target.top) < 4) {
        return current;
      }
      return target;
    });
  }

  function buildDropTarget(
    columnElement: HTMLDivElement,
    column: DashboardColumnId,
    panelElements: HTMLElement[],
    beforeId: string | null
  ): DropTarget {
    const columnRect = columnElement.getBoundingClientRect();

    if (panelElements.length === 0) {
      return { column, beforeId: null, top: 8 };
    }

    if (beforeId) {
      const targetIndex = panelElements.findIndex((element) => element.dataset.panelId === beforeId);
      const targetElement = panelElements[targetIndex] ?? panelElements[0];
      const targetRect = targetElement.getBoundingClientRect();
      const previousElement = targetIndex > 0 ? panelElements[targetIndex - 1] : null;
      const previousRect = previousElement?.getBoundingClientRect();
      const centerY = previousRect ? (previousRect.bottom + targetRect.top) / 2 : targetRect.top - 8;
      return {
        column,
        beforeId,
        top: Math.max(0, centerY - columnRect.top - dropPreviewHeight / 2)
      };
    }

    const lastRect = panelElements[panelElements.length - 1].getBoundingClientRect();
    return {
      column,
      beforeId: null,
      top: Math.max(0, lastRect.bottom - columnRect.top + 8)
    };
  }

  function resolveColumnDropTarget(event: DragEvent<HTMLDivElement>, column: DashboardColumnId): DropTarget | null {
    if (!dragState) {
      return null;
    }

    const columnElement = event.currentTarget;
    const panelElements = Array.from(columnElement.querySelectorAll<HTMLElement>("[data-panel-id]")).filter(
      (element) => element.dataset.panelId !== dragState.panelId
    );

    if (panelElements.length === 0) {
      return buildDropTarget(columnElement, column, panelElements, null);
    }

    let candidateBeforeId: string | null = null;
    let nearestBoundaryDistance = Number.POSITIVE_INFINITY;

    for (const element of panelElements) {
      const rect = element.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      nearestBoundaryDistance = Math.min(nearestBoundaryDistance, Math.abs(event.clientY - midpoint));

      if (event.clientY < midpoint) {
        candidateBeforeId = element.dataset.panelId ?? null;
        break;
      }
    }

    if (
      dropTarget?.column === column &&
      dropTarget.beforeId !== candidateBeforeId &&
      nearestBoundaryDistance < dropSwitchDeadZone
    ) {
      return buildDropTarget(columnElement, column, panelElements, dropTarget.beforeId);
    }

    return buildDropTarget(columnElement, column, panelElements, candidateBeforeId);
  }

  function moveDraggedPanel(target: DropTarget | null) {
    if (!dragState || !target) {
      setDragState(null);
      setDropTarget(null);
      return;
    }

    setPreferences((current) => {
      const nextColumns = Object.fromEntries(
        dashboardColumns.map((column) => [column, current.columns[column].filter((id) => id !== dragState.panelId)])
      ) as ColumnPanels;
      const insertIndex = target.beforeId ? nextColumns[target.column].indexOf(target.beforeId) : nextColumns[target.column].length;
      const safeIndex = insertIndex < 0 ? nextColumns[target.column].length : insertIndex;
      nextColumns[target.column].splice(safeIndex, 0, dragState.panelId);
      return { ...current, columns: nextColumns };
    });

    setDragState(null);
    setDropTarget(null);
  }

  function resetLayout() {
    const next = defaultPanelPreferences(panels);
    setPreferences(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={resetLayout}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel2 px-3 text-xs font-medium text-muted transition hover:text-text"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          重置布局
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.36fr_0.82fr]" data-dashboard-columns>
        {dashboardColumns.map((column) => {
          const panelIds = preferences.columns[column];

          return (
            <div
              key={column}
              data-dashboard-column={column}
              onDragOver={(event) => {
                event.preventDefault();
                const nextTarget = resolveColumnDropTarget(event, column);
                if (nextTarget) {
                  updateDropTarget(nextTarget);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                moveDraggedPanel(dropTarget ?? { column, beforeId: null, top: 0 });
              }}
              className={cn(
                "relative flex min-w-0 flex-col gap-4 rounded-xl transition-colors",
                dragState && dropTarget?.column === column && "bg-blue/5"
              )}
            >
              <DropPreview target={dropTarget?.column === column ? dropTarget : null} />
              {panelIds.map((panelId) => {
                const panel = panelById.get(panelId);
                if (!panel) {
                  return null;
                }

                return (
                  <div key={panel.id}>
                    <PanelShell
                      panel={panel}
                      column={column}
                      tone={preferences.tones[panel.id] ?? panel.tone}
                      collapsed={Boolean(preferences.collapsed[panel.id])}
                      dragging={dragState?.panelId === panel.id}
                      onDragStart={() => {
                        setDragState({ panelId: panel.id, sourceColumn: column });
                        setDropTarget(null);
                      }}
                      onDragEnd={() => {
                        setDragState(null);
                        setDropTarget(null);
                      }}
                      onToggle={() =>
                        setPreferences((current) => ({
                          ...current,
                          collapsed: { ...current.collapsed, [panel.id]: !current.collapsed[panel.id] }
                        }))
                      }
                      onToneChange={(tone) =>
                        setPreferences((current) => ({
                          ...current,
                          tones: { ...current.tones, [panel.id]: tone }
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
