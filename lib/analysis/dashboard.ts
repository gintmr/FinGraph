import { layers } from "@/lib/config/layers";
import type { DailyBriefing, Direction, FinGraphEvent, FinLayerId, LayerHealth, MarketIndicator, Trend } from "@/lib/types";

const layerIds = layers.map((layer) => layer.id);

function directionScore(direction: Direction, strength: number) {
  if (direction === "positive") {
    return strength * 2;
  }
  if (direction === "negative") {
    return -strength * 2;
  }
  if (direction === "mixed") {
    return -strength;
  }
  if (direction === "uncertain") {
    return -Math.max(1, Math.round(strength / 2));
  }
  return 0;
}

function indicatorScore(indicator: MarketIndicator) {
  const name = indicator.name.toLowerCase();
  const adverseWhenUp = ["cpi", "通胀", "wti", "原油", "10y", "收益率", "债务", "unemployment", "失业"];
  const helpfulWhenUp = ["gdp", "growth", "实际增速", "生产", "盈利"];
  const isAdverseUp = adverseWhenUp.some((item) => name.includes(item));
  const isHelpfulUp = helpfulWhenUp.some((item) => name.includes(item));

  if (indicator.direction === "flat") {
    return 0;
  }
  if (isAdverseUp) {
    return indicator.direction === "up" ? -3 : 3;
  }
  if (isHelpfulUp) {
    return indicator.direction === "up" ? 3 : -3;
  }
  return indicator.direction === "up" ? 1 : -1;
}

function statusFromScore(score: number): LayerHealth["status"] {
  if (score >= 68) {
    return "strong";
  }
  if (score >= 58) {
    return "neutral_strong";
  }
  if (score >= 48) {
    return "neutral";
  }
  return "weak";
}

function trendFromDelta(delta: number): Trend {
  if (delta > 2) {
    return "up";
  }
  if (delta < -2) {
    return "down";
  }
  return "flat";
}

export function buildLiveLayerHealth(events: FinGraphEvent[], indicators: MarketIndicator[]): LayerHealth[] {
  return layerIds.map((layer) => {
    const layerEvents = events.filter((event) => event.related_layers.includes(layer));
    const layerIndicators = indicators.filter((indicator) => indicator.layer === layer);
    const eventDelta = layerEvents.reduce((sum, event) => sum + directionScore(event.direction, event.strength), 0);
    const indicatorDelta = layerIndicators.reduce((sum, indicator) => sum + indicatorScore(indicator), 0);
    const delta = eventDelta + indicatorDelta;
    const score = Math.max(30, Math.min(82, 56 + delta));
    const latestEvidence = layerEvents[0]?.title ?? layerIndicators[0]?.name ?? "暂无足够近期证据";

    return {
      layer,
      score,
      status: statusFromScore(score),
      trend: trendFromDelta(delta),
      note: latestEvidence
    };
  });
}

function regimeFromScores(items: LayerHealth[]): DailyBriefing["regime"] {
  const average = items.reduce((sum, item) => sum + item.score, 0) / Math.max(items.length, 1);
  const weakCount = items.filter((item) => item.score < 48).length;
  const strongCount = items.filter((item) => item.score >= 66).length;

  if (weakCount >= 3 || average < 49) {
    return "risk_off";
  }
  if (strongCount >= 3 && average >= 60) {
    return "risk_on";
  }
  if (weakCount && strongCount) {
    return "mixed";
  }
  return "risk_neutral";
}

function compactText(value: string, maxLength = 118) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

export function buildLiveBriefing(events: FinGraphEvent[], indicators: MarketIndicator[], layerHealth: LayerHealth[]): DailyBriefing {
  const highConfidenceEvents = events.filter((event) => event.confidence >= 0.7);
  const topEvent = highConfidenceEvents[0] ?? events[0];
  const topIndicator = indicators[0];
  const date = new Date().toISOString().slice(0, 10);
  const regime = regimeFromScores(layerHealth);
  const evidenceCount = events.length + indicators.length;

  const sentence = topEvent
    ? `已采集 ${evidenceCount} 条真实证据；最新核心事件是「${compactText(topEvent.title, 58)}」，需结合 ${topEvent.related_layers.join(" / ")} 层观察。`
    : topIndicator
      ? `已采集 ${indicators.length} 个真实指标；当前重点指标是「${topIndicator.name} ${topIndicator.value}${topIndicator.unit ?? ""}」。`
      : "Supabase 已连接，但尚未写入真实采集结果；请先运行采集任务。";

  const eventBullets = highConfidenceEvents.slice(0, 3).map((event) => `${compactText(event.title, 72)}：${compactText(event.description, 96)}`);
  const indicatorBullets = indicators
    .slice(0, 3)
    .map((indicator) => `${indicator.name} 为 ${indicator.value}${indicator.unit ?? ""}，变化 ${indicator.change}，来源可追溯。`);
  const bullets = [...eventBullets, ...indicatorBullets].slice(0, 4);

  const watchpoints = [
    ...events.filter((event) => event.direction === "negative" || event.direction === "mixed").map((event) => compactText(event.title, 72)),
    ...indicators
      .filter((indicator) => ["up", "down"].includes(indicator.direction))
      .map((indicator) => `${indicator.name}: ${indicator.value}${indicator.unit ?? ""}`)
  ].slice(0, 5);

  return {
    date,
    sentence,
    regime,
    bullets: bullets.length ? bullets : ["暂无足够真实证据生成摘要。"],
    watchpoints
  };
}

export function buildLiveDashboardContext(events: FinGraphEvent[], indicators: MarketIndicator[]) {
  const layerHealth = buildLiveLayerHealth(events, indicators);
  return {
    briefing: buildLiveBriefing(events, indicators, layerHealth),
    layerHealth
  };
}
