import type { Direction, Horizon, LayerStatus, Reliability, SourceDefinition, SourceType, Trend } from "@/lib/types";

export function directionLabel(direction: Direction) {
  return {
    positive: "利好",
    negative: "利空",
    neutral: "中性",
    mixed: "混合",
    uncertain: "不确定"
  }[direction];
}

export function directionVariant(direction: Direction) {
  return {
    positive: "green",
    negative: "red",
    neutral: "slate",
    mixed: "amber",
    uncertain: "blue"
  }[direction] as "green" | "red" | "slate" | "amber" | "blue";
}

export function horizonLabel(horizon: Horizon) {
  return {
    short: "短期",
    medium: "中期",
    long: "长期",
    structural: "结构性"
  }[horizon];
}

export function statusLabel(status: LayerStatus) {
  return {
    weak: "偏弱",
    neutral: "中性",
    neutral_strong: "中性偏强",
    strong: "偏强"
  }[status];
}

export function trendSymbol(trend: Trend) {
  return trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
}

export function sourceTypeLabel(sourceType: SourceType) {
  return {
    official_api: "官方 API",
    official_rss: "官方 RSS",
    public_database: "开放数据库",
    company_filing: "公司披露",
    market_data: "市场数据",
    search_result: "搜索发现",
    user_link: "用户链接"
  }[sourceType];
}

export function reliabilityLabel(reliability: Reliability) {
  return {
    very_high: "极高",
    high: "高",
    medium: "中",
    low: "低"
  }[reliability];
}

export function connectorStatusLabel(status: SourceDefinition["connector_status"]) {
  return {
    implemented: "已接入",
    key_required: "需配置 Key",
    planned: "待接入"
  }[status];
}

export function connectorStatusVariant(status: SourceDefinition["connector_status"]) {
  return {
    implemented: "green",
    key_required: "amber",
    planned: "slate"
  }[status] as "green" | "amber" | "slate";
}
