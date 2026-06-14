import type { FinLayerId, LayerDefinition } from "@/lib/types";

export const layers: LayerDefinition[] = [
  {
    id: "currency",
    zh: "货币层",
    en: "Currency Layer",
    shortName: "货币",
    color: "#5b9dff",
    accent: "blue",
    icon: "Landmark",
    description: "美元体系、全球储备、汇率、离岸美元流动性与安全资产需求。",
    coreQuestion: "美元体系是否仍稳定，并且是否支持全球风险资产？"
  },
  {
    id: "central_bank",
    zh: "央行层",
    en: "Central Bank Layer",
    shortName: "央行",
    color: "#6ba8ff",
    accent: "blue",
    icon: "University",
    description: "美联储与主要央行政策、通胀、就业、实际利率和流动性。",
    coreQuestion: "货币政策是在支持风险资产，还是在压制估值？"
  },
  {
    id: "fiscal",
    zh: "财政层",
    en: "Fiscal Layer",
    shortName: "财政",
    color: "#f5b84b",
    accent: "amber",
    icon: "BadgeDollarSign",
    description: "财政赤字、债务、利息支出、国债供给和财政可持续性。",
    coreQuestion: "美国财政和债务路径是否推高长期利率或削弱信心？"
  },
  {
    id: "industry",
    zh: "产业层",
    en: "Industry Layer",
    shortName: "产业",
    color: "#55c985",
    accent: "green",
    icon: "Factory",
    description: "制造业、AI基础设施、能源、供应链和长期生产率。",
    coreQuestion: "真实产业能力是否支撑长期盈利和低通胀增长？"
  },
  {
    id: "corporate",
    zh: "企业层",
    en: "Corporate Layer",
    shortName: "企业",
    color: "#5b9dff",
    accent: "blue",
    icon: "ChartNoAxesColumnIncreasing",
    description: "科技企业盈利、估值、现金流、AI收入和指数集中度。",
    coreQuestion: "美国科技企业的盈利质量是否能支撑当前估值？"
  },
  {
    id: "geopolitical",
    zh: "地缘层",
    en: "Geopolitical Layer",
    shortName: "地缘",
    color: "#ef645c",
    accent: "red",
    icon: "Globe2",
    description: "战争、制裁、关税、出口管制、能源通道和阵营化风险。",
    coreQuestion: "地缘风险是否正在改变供应链、能源价格和风险溢价？"
  },
  {
    id: "social",
    zh: "社会层",
    en: "Social Layer",
    shortName: "社会",
    color: "#f5b84b",
    accent: "amber",
    icon: "UsersRound",
    description: "就业、工资、住房、消费、贫富分化、政治极化和政策反馈。",
    coreQuestion: "社会压力是否会反过来改变财政、监管和市场规则？"
  },
  {
    id: "market",
    zh: "市场层",
    en: "Market Layer",
    shortName: "市场",
    color: "#b8c0ca",
    accent: "slate",
    icon: "CandlestickChart",
    description: "估值、波动率、信用利差、流动性、情绪、资金流和资产价格。",
    coreQuestion: "市场价格是否已经反映宏观风险，还是仍然过度乐观？"
  }
];

export const layerById = layers.reduce(
  (acc, layer) => {
    acc[layer.id] = layer;
    return acc;
  },
  {} as Record<FinLayerId, LayerDefinition>
);

export const layerOrder = layers.map((layer) => layer.id);

