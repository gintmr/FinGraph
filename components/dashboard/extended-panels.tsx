"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SourceLink } from "@/components/ui/source-link";
import { layerById } from "@/lib/config/layers";
import type { FinGraphEvent, FinLayerId, MarketIndicator } from "@/lib/types";

const layerLabels: Record<FinLayerId, string> = {
  currency: "货币层",
  central_bank: "央行层",
  fiscal: "财政层",
  industry: "产业层",
  corporate: "企业层",
  geopolitical: "地缘层",
  social: "社会层",
  market: "市场层"
};

const sourceTypeLabels: Record<FinGraphEvent["source_type"], string> = {
  official_api: "官方 API",
  official_rss: "官方 RSS",
  public_database: "开放数据库",
  company_filing: "公司披露",
  market_data: "市场数据",
  search_result: "搜索来源",
  user_link: "用户链接"
};

const fallbackHotspots = [
  {
    id: "fallback-gdelt",
    time: "数据源",
    title: "GDELT can be used as the discovery layer for geopolitical and supply-chain reports",
    url: "https://www.gdeltproject.org/data.html",
    sourceType: "public_database" as const,
    relatedLayers: ["geopolitical", "industry", "market"] as FinLayerId[],
    description: "GDELT 提供全球新闻事件发现能力，适合先找到事件簇，再回到官方公告、公司披露或可信报道交叉验证。",
    assets: ["Oil", "DXY", "SOXX"]
  },
  {
    id: "fallback-eia",
    time: "数据源",
    title: "EIA energy data help verify whether geopolitical reports have translated into oil and inventory pressure",
    url: "https://www.eia.gov/opendata/",
    sourceType: "official_api" as const,
    relatedLayers: ["industry", "geopolitical", "central_bank", "market"] as FinLayerId[],
    description: "能源库存、原油价格和供需变化可以验证地缘事件是否正在传导到通胀、企业成本和市场风险偏好。",
    assets: ["WTI", "XLE", "SPY"]
  }
];

const assetHeatmap = [
  { name: "标普500", symbol: "SPY", d1: 0.42, w1: 1.35, m1: 2.12, m3: 3.66, ytd: 8.41 },
  { name: "纳斯达克100", symbol: "QQQ", d1: 0.32, w1: 2.21, m1: 3.88, m3: 5.93, ytd: 9.18 },
  { name: "道琼斯", symbol: "DIA", d1: 0.18, w1: 0.3, m1: 0.8, m3: 0.89, ytd: 0.08 },
  { name: "10Y 美债", symbol: "TLT", d1: 0.43, w1: 0.8, m1: 0.33, m3: 0.1, ytd: 0.09 },
  { name: "美元指数", symbol: "DXY", d1: -0.2, w1: -0.9, m1: -0.81, m3: -0.39, ytd: -0.9 },
  { name: "黄金", symbol: "GLD", d1: -0.3, w1: -0.8, m1: -0.6, m3: -0.8, ytd: -0.8 },
  { name: "原油", symbol: "WTI", d1: -0.3, w1: 0.1, m1: -0.3, m3: -0.2, ytd: 0.2 }
];

const capitalFlows = [
  { name: "美国科技股", value: 8.42 },
  { name: "AI/半导体", value: 6.12 },
  { name: "美国国债", value: -4.21 },
  { name: "黄金", value: 3.68 },
  { name: "能源板块", value: -2.35 },
  { name: "医疗健康", value: 1.75 },
  { name: "新兴市场股票", value: -1.42 },
  { name: "工业金属", value: 0.95 }
];

const yieldCurve = [
  { tenor: "1M", current: 3.35, previous: 3.28 },
  { tenor: "3M", current: 3.72, previous: 3.64 },
  { tenor: "6M", current: 3.78, previous: 3.7 },
  { tenor: "1Y", current: 3.91, previous: 3.82 },
  { tenor: "2Y", current: 3.96, previous: 3.88 },
  { tenor: "5Y", current: 4.28, previous: 4.16 },
  { tenor: "10Y", current: 4.48, previous: 4.36 },
  { tenor: "30Y", current: 4.42, previous: 4.31 }
];

const inflationComponents = [
  { month: "2026-01", cpi: 6.1, core: 5.8, shelter: 10.1, energy: 7.8, food: 4.2 },
  { month: "2026-02", cpi: 6.0, core: 5.8, shelter: 9.8, energy: 8.4, food: 4.1 },
  { month: "2026-03", cpi: 5.7, core: 5.6, shelter: 10.0, energy: 8.6, food: 3.8 },
  { month: "2026-04", cpi: 4.9, core: 5.3, shelter: 10.1, energy: 7.4, food: 2.6 },
  { month: "2026-05", cpi: 3.2, core: 3.3, shelter: 9.6, energy: 6.0, food: -0.2 },
  { month: "2026-06", cpi: 2.3, core: 2.8, shelter: 9.2, energy: 5.7, food: 0.4 }
];

const fedWatchRows = [
  { date: "2026-07-29", hold: "82%", cut25: "18%", cut50: "0%", cut75: "0%" },
  { date: "2026-09-17", hold: "56%", cut25: "36%", cut50: "7%", cut75: "1%" },
  { date: "2026-10-29", hold: "34%", cut25: "42%", cut50: "20%", cut75: "4%" },
  { date: "2026-12-10", hold: "22%", cut25: "38%", cut50: "28%", cut75: "12%" }
];

const calendarRows = [
  { date: "06-17", time: "20:30", name: "美国零售销售（月率）", level: "重要" },
  { date: "06-18", time: "02:00", name: "美联储利率决议", level: "极高" },
  { date: "06-18", time: "02:30", name: "鲍威尔新闻发布会", level: "极高" },
  { date: "06-19", time: "20:30", name: "首次申请失业救济人数", level: "重要" },
  { date: "06-20", time: "20:30", name: "美国 PMI 初值", level: "中" }
];

const sectorRadar = [
  { sector: "科技", value: 72 },
  { sector: "通信服务", value: 88 },
  { sector: "消费必需品", value: 64 },
  { sector: "医疗健康", value: 48 },
  { sector: "金融", value: 36 },
  { sector: "工业", value: 62 },
  { sector: "原材料", value: 58 },
  { sector: "可选消费", value: 70 },
  { sector: "公用事业", value: 52 }
];

const aiThemes = [
  { name: "GPU 需求指数", value: "78.5", change: "+4.2%", data: [24, 28, 26, 34, 42, 38, 49, 58] },
  { name: "云服务支出指数", value: "142.3", change: "+2.8%", data: [90, 94, 101, 98, 111, 124, 119, 132] },
  { name: "AI 招聘热度", value: "185.7", change: "+6.1%", data: [70, 76, 80, 91, 99, 112, 128, 143] },
  { name: "AI 相关专利数", value: "3,245", change: "+3.7%", data: [24, 28, 29, 35, 41, 49, 53, 61] },
  { name: "AI 融资金额", value: "56.4", change: "-1.2%", data: [72, 68, 66, 62, 59, 63, 65, 67], negative: true },
  { name: "AI 相关新闻热度", value: "112.8", change: "+5.3%", data: [42, 44, 48, 52, 55, 61, 68, 72] }
];

const earningsRows = [
  { date: "06-16", company: "微软 (MSFT)", sector: "科技", stars: "★★★" },
  { date: "06-17", company: "苹果 (AAPL)", sector: "科技", stars: "★★★" },
  { date: "06-18", company: "美光科技 (MU)", sector: "半导体", stars: "★★" },
  { date: "06-19", company: "耐克 (NKE)", sector: "可选消费", stars: "★" },
  { date: "06-20", company: "埃克森 (XOM)", sector: "能源", stars: "★★" }
];

function PanelFooter({ source, updated, href }: { source: string; updated: string; href: string }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3 text-xs text-muted">
      <span>数据来源：{source}</span>
      <span>更新：{updated}</span>
      <SourceLink url={href} label="来源" />
    </div>
  );
}

function EmptyRealData({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-4 text-sm leading-6 text-muted">
      {message}
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function isInflationIndicator(indicator: MarketIndicator) {
  return /cpi|ppi|inflation|通胀|价格|wti|原油/i.test(`${indicator.id} ${indicator.name}`);
}

function isRateIndicator(indicator: MarketIndicator) {
  return /fedfunds|federal|10y|dgs|利率|收益率/i.test(`${indicator.id} ${indicator.name}`);
}

function isMarketLikeIndicator(indicator: MarketIndicator) {
  return indicator.source_type === "market_data" || ["market", "currency", "industry"].includes(indicator.layer);
}

function IndicatorList({ indicators, limit = 6 }: { indicators: MarketIndicator[]; limit?: number }) {
  if (!indicators.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {indicators.slice(0, limit).map((indicator) => (
        <div key={indicator.id} className="rounded-lg border border-line bg-panel2/70 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium text-text">{indicator.name}</div>
              <div className="mt-1 text-xs text-muted">
                {layerById[indicator.layer].zh} · 更新 {formatDateTime(indicator.updated_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-semibold text-text">
                {indicator.value}
                {indicator.unit ? <span className="ml-1 text-xs text-muted">{indicator.unit}</span> : null}
              </div>
              <div className={indicator.direction === "up" ? "text-xs font-semibold text-green" : indicator.direction === "down" ? "text-xs font-semibold text-red" : "text-xs font-semibold text-muted"}>
                {indicator.change}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SourceLink url={indicator.url} label="原始链接" />
            <span className="text-xs leading-5 text-muted">{indicator.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventList({ events, limit = 5 }: { events: FinGraphEvent[]; limit?: number }) {
  if (!events.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {events.slice(0, limit).map((event) => (
        <div key={event.id} className="rounded-lg border border-line bg-panel2/70 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{formatDateTime(event.time)}</span>
            <Badge variant={sourceVariant(event.source_type)}>{sourceTypeLabels[event.source_type]}</Badge>
            <Badge variant={event.strength >= 4 ? "red" : event.strength >= 3 ? "amber" : "slate"}>强度 {event.strength}/5</Badge>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-6 text-text">{event.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{event.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SourceLink url={event.url} label="原始链接" />
            {event.related_layers.slice(0, 4).map((layer) => (
              <Badge key={layer} variant={layer === "geopolitical" ? "red" : layer === "industry" ? "amber" : "slate"}>
                {layerLabels[layer]}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HeatCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <td className={`rounded-md px-2 py-1.5 text-right text-xs font-semibold ${positive ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </td>
  );
}

function SparkMini({ data, negative = false }: { data: number[]; negative?: boolean }) {
  const points = data.map((value, index) => ({ index, value }));
  return (
    <ResponsiveContainer width="100%" height={34}>
      <LineChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey="value" stroke={negative ? "rgb(var(--color-red))" : "rgb(var(--color-blue))"} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Gauge({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" | "red" }) {
  const toneClass = tone === "green" ? "text-green border-green/25 bg-green/10" : tone === "amber" ? "text-amber border-amber/25 bg-amber/10" : "text-red border-red/25 bg-red/10";
  return (
    <div className="rounded-lg border border-line bg-panel2/70 p-3 text-center">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={`mx-auto mt-3 grid h-20 w-20 place-items-center rounded-full border-4 ${toneClass}`}>
        <span className="text-base font-semibold text-text">{value}</span>
      </div>
      <div className={`mt-2 text-xs font-semibold ${toneClass.split(" ")[0]}`}>{tone === "green" ? "低" : tone === "amber" ? "中性" : "偏高"}</div>
    </div>
  );
}

export function AssetHeatmapPanel({ indicators }: { indicators: MarketIndicator[] }) {
  const rows = indicators.filter(isMarketLikeIndicator);

  return (
    <Card>
      <CardHeader title="全球资产热力图" subtitle="来自真实 API 的市场、美元、能源与利率代理指标。" />
      <CardBody>
        {rows.length ? (
          <IndicatorList indicators={rows} limit={8} />
        ) : (
          <EmptyRealData message="暂无真实市场代理指标。Stooq 在当前网络下可能不可达；可后续接入 Alpha Vantage、Twelve Data 或 Polygon 的免费额度作为替代。" />
        )}
        <PanelFooter source="FRED / EIA / Stooq" updated={new Date().toISOString().slice(0, 10)} href="https://fred.stlouisfed.org/" />
      </CardBody>
    </Card>
  );
}

export function CapitalFlowPanel({ events, indicators }: { events: FinGraphEvent[]; indicators: MarketIndicator[] }) {
  const layerRows = Object.entries(layerLabels)
    .map(([layer, label]) => ({
      name: label,
      value:
        events.filter((event) => event.related_layers.includes(layer as FinLayerId)).length +
        indicators.filter((indicator) => indicator.layer === layer).length
    }))
    .filter((row) => row.value > 0);

  return (
    <Card>
      <CardHeader title="资金流向概览" subtitle="当前免费源尚未提供真实资金流；这里展示真实证据在各层的分布。" />
      <CardBody>
        {layerRows.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={layerRows} layout="vertical" margin={{ left: 20, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={92} tick={{ fill: "rgb(var(--color-muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgb(var(--color-panel))", border: "1px solid rgb(var(--color-line))", color: "rgb(var(--color-text))" }} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} fill="rgb(var(--color-green))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyRealData message="暂无真实证据分布。运行采集任务后，这里会显示各层证据密度；真实 ETF 资金流可后续接入 ETFDB、FRED fund flow 或付费数据源。" />
        )}
        <PanelFooter source="真实证据分布" updated={new Date().toISOString().slice(0, 10)} href="https://fred.stlouisfed.org/" />
      </CardBody>
    </Card>
  );
}

export function CftcPositioningPanel({ indicators }: { indicators: MarketIndicator[] }) {
  const rows = indicators.filter((indicator) => indicator.id.startsWith("cftc_cot_"));

  return (
    <Card>
      <CardHeader title="期货仓位 / COT" subtitle="CFTC 官方周度报告里的杠杆资金净持仓；这是仓位结构，不是实时资金流。" />
      <CardBody>
        {rows.length ? (
          <IndicatorList indicators={rows} limit={8} />
        ) : (
          <EmptyRealData message="暂无 CFTC COT 仓位数据。重新运行采集任务后，这里会显示 S&P 500、Nasdaq-100、10Y 美债、澳元等期货的杠杆资金净持仓。" />
        )}
        <PanelFooter source="CFTC Public Reporting" updated={new Date().toISOString().slice(0, 10)} href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" />
      </CardBody>
    </Card>
  );
}

export function YieldCurvePanel({ indicators }: { indicators: MarketIndicator[] }) {
  const rows = indicators.filter(isRateIndicator);

  return (
    <Card>
      <CardHeader title="收益率曲线" subtitle="当前展示已接入的真实利率指标；完整期限结构可后续扩展更多 FRED 序列。" />
      <CardBody>
        {rows.length ? <IndicatorList indicators={rows} /> : <EmptyRealData message="暂无真实利率指标。确认 FRED_API_KEY 后重新运行采集任务。" />}
        <PanelFooter source="FRED" updated={new Date().toISOString().slice(0, 10)} href="https://fred.stlouisfed.org/categories/115" />
      </CardBody>
    </Card>
  );
}

export function RiskGaugePanel({ events, indicators }: { events: FinGraphEvent[]; indicators: MarketIndicator[] }) {
  const riskEvents = events.filter((event) => event.direction === "negative" || event.direction === "mixed" || event.strength >= 4);
  const riskIndicators = indicators.filter((indicator) => /cpi|通胀|wti|原油|10y|收益率|debt|债务|unemployment|失业/i.test(`${indicator.id} ${indicator.name}`));

  return (
    <Card>
      <CardHeader title="风险仪表盘" subtitle="由真实事件和风险敏感指标自动生成。" />
      <CardBody>
        {riskIndicators.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {riskIndicators.slice(0, 6).map((indicator) => (
              <div key={indicator.id} className="rounded-lg border border-line bg-panel2/70 p-3">
                <div className="text-xs font-medium text-muted">{indicator.name}</div>
                <div className="mt-2 text-xl font-semibold text-text">
                  {indicator.value}
                  {indicator.unit ? <span className="ml-1 text-xs text-muted">{indicator.unit}</span> : null}
                </div>
                <div className={indicator.direction === "up" ? "mt-1 text-xs font-semibold text-amber" : "mt-1 text-xs font-semibold text-green"}>{indicator.change}</div>
                <div className="mt-3">
                  <SourceLink url={indicator.url} label="原始链接" />
                </div>
              </div>
            ))}
          </div>
        ) : riskEvents.length ? (
          <EventList events={riskEvents} limit={4} />
        ) : (
          <EmptyRealData message="暂无真实风险预警。运行采集任务后，负面/混合事件及通胀、利率、能源、债务指标会在这里显示。" />
        )}
        <PanelFooter source="BLS / FRED / EIA / Treasury / SEC" updated={new Date().toISOString().slice(0, 10)} href="https://fred.stlouisfed.org/" />
      </CardBody>
    </Card>
  );
}

export function InflationComponentsPanel({ indicators }: { indicators: MarketIndicator[] }) {
  const rows = indicators.filter(isInflationIndicator);

  return (
    <Card>
      <CardHeader title="通胀分项监测" subtitle="来自 BLS、World Bank、EIA 的真实通胀与能源相关指标。" />
      <CardBody>
        {rows.length ? <IndicatorList indicators={rows} /> : <EmptyRealData message="暂无真实通胀分项。确认 BLS_API_KEY/EIA_API_KEY 后重新运行采集任务。" />}
        <PanelFooter source="BLS / EIA / World Bank" updated={new Date().toISOString().slice(0, 10)} href="https://www.bls.gov/cpi/" />
      </CardBody>
    </Card>
  );
}

export function FedWatchPanel({ events, indicators }: { events: FinGraphEvent[]; indicators: MarketIndicator[] }) {
  const fedIndicators = indicators.filter(isRateIndicator);
  const fedEvents = events.filter((event) => event.related_layers.includes("central_bank") || event.source_type === "official_rss");

  return (
    <Card>
      <CardHeader title="政策预期与央行证据" subtitle="不使用伪造概率；展示真实利率指标与美联储官方事件。" />
      <CardBody>
        {fedIndicators.length ? <IndicatorList indicators={fedIndicators} limit={3} /> : null}
        {fedEvents.length ? <div className="mt-3"><EventList events={fedEvents} limit={3} /></div> : null}
        {!fedIndicators.length && !fedEvents.length ? <EmptyRealData message="暂无真实央行证据。运行采集任务后，FRED 利率指标和 Federal Reserve RSS 会显示在这里。" /> : null}
        <PanelFooter source="FRED / Federal Reserve" updated={new Date().toISOString().slice(0, 10)} href="https://www.federalreserve.gov/feeds/feeds.htm" />
      </CardBody>
    </Card>
  );
}

export function EconomicCalendarPanel({ events }: { events: FinGraphEvent[] }) {
  const rows = events.filter((event) => event.source_type === "official_api" || event.source_type === "official_rss").slice(0, 6);

  return (
    <Card>
      <CardHeader title="经济事件流" subtitle="当前展示真实已采集官方事件；未来日历可后续接入专门 calendar API。" />
      <CardBody>
        {rows.length ? <EventList events={rows} limit={6} /> : <EmptyRealData message="暂无真实官方事件。运行采集任务后，Fed、BLS、Treasury 等来源会显示在这里。" />}
        <PanelFooter source="官方 API / RSS" updated={new Date().toISOString().slice(0, 10)} href="https://www.federalreserve.gov/feeds/feeds.htm" />
      </CardBody>
    </Card>
  );
}

function formatEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function sourceVariant(sourceType: FinGraphEvent["source_type"]): "blue" | "amber" | "green" | "red" | "slate" {
  if (sourceType === "official_api" || sourceType === "official_rss") {
    return "green";
  }
  if (sourceType === "public_database" || sourceType === "company_filing") {
    return "blue";
  }
  if (sourceType === "search_result") {
    return "amber";
  }
  return "slate";
}

export function GlobalHotspotsPanel({ events = [] }: { events?: FinGraphEvent[] }) {
  const hotspotEvents = events
    .filter(isGeopoliticalHotspot)
    .sort((a, b) => b.strength - a.strength || b.confidence - a.confidence || Date.parse(b.time) - Date.parse(a.time))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader title="地缘热点事件源" subtitle="不画示意地图，只展示 GDELT、能源与供应链相关的可点击来源。" />
      <CardBody>
        {!hotspotEvents.length ? (
          <EmptyRealData message="暂无真实地缘热点事件。运行采集任务后，GDELT 的冲突/制裁/航运报道和 GDACS 的人道冲击告警会显示在这里；不会用公司披露或普通产业新闻凑数。" />
        ) : null}
        <div className="space-y-3">
          {hotspotEvents.map((item) => (
            <div key={item.id} className="rounded-lg border border-line bg-panel2/70 p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{formatEventTime(item.time)}</span>
                <Badge variant={sourceVariant(item.source_type)}>
                  {sourceTypeLabels[item.source_type]}
                </Badge>
                <Badge variant={item.strength >= 4 ? "red" : item.strength >= 3 ? "amber" : "slate"}>强度 {item.strength}/5</Badge>
              </div>
              <h3 className="mt-2 text-sm font-semibold leading-6 text-text">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.related_layers.map((layer) => (
                  <Badge key={layer} variant={layer === "geopolitical" ? "red" : layer === "industry" ? "amber" : "slate"}>
                    {layerLabels[layer]}
                  </Badge>
                ))}
                {item.assets.slice(0, 4).map((asset) => (
                  <span key={asset} className="rounded-full border border-line bg-panel px-2.5 py-1 text-xs font-medium text-muted">
                    {asset}
                  </span>
                ))}
              </div>
              <div className="mt-3">
                <SourceLink url={item.url} label="原始链接" />
              </div>
            </div>
          ))}
        </div>
        <PanelFooter source="GDELT / GDACS" updated={new Date().toISOString().slice(0, 10)} href="https://www.gdeltproject.org/data.html" />
      </CardBody>
    </Card>
  );
}

function isGeopoliticalHotspot(event: FinGraphEvent) {
  const text = `${event.id} ${event.title} ${event.description} ${event.related_nodes.join(" ")} ${event.assets.join(" ")}`.toLowerCase();
  const explicitGeo = event.related_layers.includes("geopolitical");
  const knownGeoSource = event.id.startsWith("gdelt_") || event.id.startsWith("gdacs_");
  const geoTerms =
    /war|conflict|military|missile|airstrike|sanction|export control|red sea|taiwan strait|south china sea|shipping|humanitarian|disaster|drought|flood|earthquake|wildfire|cyclone|geopolitical|地缘|制裁|冲突|战争|航运|人道|灾害|能源安全/.test(text);

  return explicitGeo && (knownGeoSource || geoTerms);
}

export function SectorRadarPanel({ events }: { events: FinGraphEvent[] }) {
  const rows = Object.entries(layerLabels)
    .map(([layer, label]) => ({ sector: label, value: events.filter((event) => event.related_layers.includes(layer as FinLayerId)).length }))
    .filter((row) => row.value > 0);

  return (
    <Card>
      <CardHeader title="板块轮动雷达" subtitle="基于真实事件层级分布的证据雷达，不使用模拟相对强弱。" />
      <CardBody>
        {rows.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={rows}>
                <PolarGrid stroke="rgb(var(--color-line))" />
                <PolarAngleAxis dataKey="sector" tick={{ fill: "rgb(var(--color-muted))", fontSize: 11 }} />
                <Radar dataKey="value" stroke="rgb(var(--color-blue))" fill="rgb(var(--color-blue))" fillOpacity={0.18} />
                <Tooltip contentStyle={{ background: "rgb(var(--color-panel))", border: "1px solid rgb(var(--color-line))", color: "rgb(var(--color-text))" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyRealData message="暂无真实事件可生成雷达。运行采集任务后，这里会显示各层证据密度。" />
        )}
        <PanelFooter source="真实事件层级分布" updated={new Date().toISOString().slice(0, 10)} href="https://www.sec.gov/search-filings" />
      </CardBody>
    </Card>
  );
}

export function AiThemeMonitorPanel({ events }: { events: FinGraphEvent[] }) {
  const aiEvents = events.filter((event) =>
    /ai|artificial intelligence|nvidia|nvda|microsoft|msft|google|googl|semiconductor|chip/i.test(
      `${event.title} ${event.description} ${event.assets.join(" ")}`
    )
  );

  return (
    <Card>
      <CardHeader title="AI 主题监测" subtitle="来自真实披露/事件的 AI 相关证据。" />
      <CardBody>
        {aiEvents.length ? <EventList events={aiEvents} limit={6} /> : <EmptyRealData message="暂无真实 AI 主题事件。当前不会展示模拟 GPU/云支出指数；后续可接入 SEC companyfacts、招聘数据或新闻源。" />}
        <PanelFooter source="SEC / 官方事件" updated={new Date().toISOString().slice(0, 10)} href="https://www.sec.gov/search-filings" />
      </CardBody>
    </Card>
  );
}

export function EarningsCalendarPanel({ events }: { events: FinGraphEvent[] }) {
  const filingEvents = events.filter((event) => event.source_type === "company_filing");

  return (
    <Card>
      <CardHeader title="企业披露事件" subtitle="来自 SEC EDGAR 的真实公司披露链接。" />
      <CardBody>
        {filingEvents.length ? <EventList events={filingEvents} limit={7} /> : <EmptyRealData message="暂无真实公司披露。确认 SEC_USER_AGENT 后重新运行采集任务。" />}
        <PanelFooter source="SEC EDGAR" updated={new Date().toISOString().slice(0, 10)} href="https://www.sec.gov/edgar/search/" />
      </CardBody>
    </Card>
  );
}

export function FiscalSocialPanel({ events, indicators }: { events: FinGraphEvent[]; indicators: MarketIndicator[] }) {
  const rows = indicators.filter((indicator) => indicator.layer === "fiscal" || indicator.layer === "social");
  const relatedEvents = events.filter((event) => event.related_layers.includes("fiscal") || event.related_layers.includes("social"));

  return (
    <Card>
      <CardHeader title="财政与社会压力" subtitle="集中展示财政、消费、就业、工资和政府支出相关的官方证据。" />
      <CardBody>
        {rows.length ? <IndicatorList indicators={rows} limit={8} /> : null}
        {relatedEvents.length ? (
          <div className="mt-3">
            <EventList events={relatedEvents} limit={3} />
          </div>
        ) : null}
        {!rows.length && !relatedEvents.length ? (
          <EmptyRealData message="暂无财政/社会层真实证据。配置并运行 BEA、BLS、Treasury、World Bank 采集后，这里会显示消费、就业、工资、GDP 与政府支出证据。" />
        ) : null}
        <PanelFooter source="BEA / BLS / Treasury / World Bank" updated={new Date().toISOString().slice(0, 10)} href="https://apps.bea.gov/api/signup/" />
      </CardBody>
    </Card>
  );
}

export function ChartLinksPanel({ indicators }: { indicators: MarketIndicator[] }) {
  const marketSymbols = tradingViewSymbols;
  const dataLinks = [
    { label: "FRED", href: "https://fred.stlouisfed.org/", note: "利率、美元、信用利差、就业和宏观序列" },
    { label: "BEA NIPA", href: "https://apps.bea.gov/iTable/?ReqID=19&step=2&isuri=1&categories=survey", note: "GDP、消费、投资、政府支出" },
    { label: "Treasury Fiscal Data", href: "https://fiscaldata.treasury.gov/", note: "债务、赤字、拍卖和财政数据" },
    { label: "BLS", href: "https://data.bls.gov/timeseries/home.htm", note: "CPI、PPI、就业、工资和失业率" },
    { label: "SEC EDGAR", href: "https://www.sec.gov/edgar/search/", note: "公司披露、10-Q、10-K、8-K" }
  ];
  const liveChartLinks = indicators
    .filter((indicator) => indicator.url.includes("tradingview.com"))
    .slice(0, 4)
    .map((indicator) => ({ label: indicator.name.replace(/^(Alpha Vantage|Twelve Data)\s+/, ""), href: indicator.url, note: indicator.note }));
  const [activeSymbol, setActiveSymbol] = useState(marketSymbols[0]);

  return (
    <Card>
      <CardHeader title="TradingView 图表入口" subtitle="把真实市场代理指标、宏观数据源和 TradingView 图表集中放在一个可点击面板里。" />
      <CardBody>
        <div className="overflow-hidden rounded-lg border border-line bg-panel2/70">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
            {marketSymbols.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setActiveSymbol(item)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                  activeSymbol.symbol === item.symbol
                    ? "border-blue/40 bg-blue/15 text-blue"
                    : "border-line bg-panel text-muted hover:text-text"
                }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href={activeSymbol.href}
              target="_blank"
              rel="noreferrer"
              className="ml-auto rounded-md border border-blue/30 bg-blue/10 px-2.5 py-1.5 text-xs font-semibold text-blue transition hover:bg-blue/15"
            >
              打开大图
            </a>
          </div>
          <TradingViewChart symbol={activeSymbol.symbol} />
          <div className="border-t border-line px-3 py-2 text-xs leading-5 text-muted">
            {activeSymbol.note}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {liveChartLinks.map((item, index) => (
            <a
              key={`${item.label}-${item.href}-${index}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-line bg-panel2/70 p-3 transition hover:border-blue/40 hover:bg-blue/10"
            >
              <div className="font-semibold text-text">{item.label}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.note}</div>
            </a>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          {dataLinks.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-panel2/70 p-3">
              <div className="min-w-0">
                <div className="font-semibold text-text">{item.label}</div>
                <div className="mt-1 truncate text-xs text-muted">{item.note}</div>
              </div>
              <SourceLink url={item.href} label="打开" />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

const tradingViewSymbols = [
  { label: "SPY", symbol: "AMEX:SPY", href: "https://www.tradingview.com/chart/?symbol=AMEX:SPY", note: "美股大盘风险偏好" },
  { label: "QQQ", symbol: "NASDAQ:QQQ", href: "https://www.tradingview.com/chart/?symbol=NASDAQ:QQQ", note: "科技成长与 AI 叙事" },
  { label: "TLT", symbol: "NASDAQ:TLT", href: "https://www.tradingview.com/chart/?symbol=NASDAQ:TLT", note: "长端利率与期限溢价" },
  { label: "GLD", symbol: "AMEX:GLD", href: "https://www.tradingview.com/chart/?symbol=AMEX:GLD", note: "黄金、实际利率与避险" },
  { label: "USO", symbol: "AMEX:USO", href: "https://www.tradingview.com/chart/?symbol=AMEX:USO", note: "原油与能源风险" },
  { label: "DXY", symbol: "TVC:DXY", href: "https://www.tradingview.com/chart/?symbol=TVC:DXY", note: "美元流动性与汇率压力" },
  { label: "US10Y", symbol: "TVC:US10Y", href: "https://www.tradingview.com/chart/?symbol=TVC:US10Y", note: "10Y 美债收益率" }
];

function TradingViewChart({ symbol }: { symbol: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const updateTheme = () => setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  const src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=F1F3F6&studies=[]&theme=${theme}&style=1&timezone=America%2FNew_York&withdateranges=1&hideideas=1&locale=zh_CN`;

  return (
    <div className="h-[360px] w-full bg-panel">
      <iframe
        key={`${symbol}-${theme}`}
        title={`TradingView ${symbol}`}
        src={src}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="origin"
        allowFullScreen
      />
    </div>
  );
}
