import type { SourceDefinition } from "@/lib/types";

export const sourceRegistry: SourceDefinition[] = [
  {
    id: "fred",
    name: "FRED",
    type: "official_api",
    reliability: "very_high",
    docs_url: "https://fred.stlouisfed.org/docs/api/fred/",
    base_url: "https://api.stlouisfed.org/fred",
    api_key_required: true,
    api_key_env: "FRED_API_KEY",
    connector_status: "key_required",
    layers: ["currency", "central_bank", "fiscal", "market", "social"],
    cadence: "daily",
    collector_notes: "已写采集器；未配置 FRED_API_KEY 时会跳过，不会生成伪数据。",
    notes: "U.S. and global macro time series: rates, inflation, labor, yields, dollar indexes, credit."
  },
  {
    id: "bls",
    name: "BLS Public Data API",
    type: "official_api",
    reliability: "very_high",
    docs_url: "https://www.bls.gov/developers/",
    base_url: "https://api.bls.gov/publicAPI",
    api_key_required: false,
    api_key_env: "BLS_API_KEY",
    connector_status: "implemented",
    layers: ["central_bank", "social", "industry"],
    cadence: "monthly",
    collector_notes: "已接入 BLS v2 timeseries 批量 POST；无 key 可用匿名额度，配置 BLS_API_KEY 后额度更稳。",
    notes: "Official U.S. labor, CPI, PPI, wage, employment, and unemployment data."
  },
  {
    id: "bea",
    name: "BEA API",
    type: "official_api",
    reliability: "very_high",
    docs_url: "https://apps.bea.gov/api/signup/",
    base_url: "https://apps.bea.gov/api/data",
    api_key_required: true,
    api_key_env: "BEA_API_KEY",
    connector_status: "key_required",
    layers: ["fiscal", "industry", "corporate", "social"],
    cadence: "monthly",
    collector_notes: "已接入 BEA NIPA parser；未配置 BEA_API_KEY 时会跳过，不会生成伪数据。",
    notes: "GDP, PCE, income, industry accounts, trade, and investment data."
  },
  {
    id: "federal_reserve",
    name: "Federal Reserve",
    type: "official_rss",
    reliability: "very_high",
    docs_url: "https://www.federalreserve.gov/data.htm",
    base_url: "https://www.federalreserve.gov/feeds/feeds.htm",
    api_key_required: false,
    connector_status: "implemented",
    layers: ["central_bank", "market", "currency"],
    cadence: "event_driven",
    collector_notes: "已接入 Federal Reserve 官方 RSS，采集货币政策新闻、讲话与证词链接。",
    notes: "FOMC statements, speeches, press releases, supervision, and policy communications."
  },
  {
    id: "treasury_fiscal_data",
    name: "U.S. Treasury Fiscal Data",
    type: "official_api",
    reliability: "very_high",
    docs_url: "https://fiscaldata.treasury.gov/api-documentation/",
    base_url: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service",
    api_key_required: false,
    connector_status: "implemented",
    layers: ["fiscal", "currency", "market"],
    cadence: "daily",
    collector_notes: "已接入 Treasury Fiscal Data，无 key，输出美国公共债务快照。",
    notes: "Debt, deficit, auctions, interest expense, Treasury statements, and fiscal datasets."
  },
  {
    id: "sec_edgar",
    name: "SEC EDGAR",
    type: "company_filing",
    reliability: "very_high",
    docs_url: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces",
    base_url: "https://data.sec.gov",
    api_key_required: false,
    api_key_env: "SEC_USER_AGENT",
    connector_status: "implemented",
    layers: ["corporate", "market", "industry"],
    cadence: "event_driven",
    collector_notes: "已接入 SEC submissions API；建议生产环境配置 SEC_USER_AGENT。",
    notes: "Company submissions, 10-K, 10-Q, 8-K, XBRL facts, and official filing links."
  },
  {
    id: "gdelt",
    name: "GDELT",
    type: "public_database",
    reliability: "medium",
    docs_url: "https://www.gdeltproject.org/data.html",
    base_url: "https://api.gdeltproject.org/api/v2",
    api_key_required: false,
    connector_status: "implemented",
    layers: ["geopolitical", "industry", "market", "currency"],
    cadence: "realtime",
    collector_notes: "已接入 GDELT Doc API，用于发现新闻链接；可靠性低于官方源。",
    notes: "Global event and news monitoring useful for geopolitical and cross-border risk discovery."
  },
  {
    id: "world_bank",
    name: "World Bank Indicators",
    type: "official_api",
    reliability: "very_high",
    docs_url: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    base_url: "https://api.worldbank.org/v2",
    api_key_required: false,
    connector_status: "implemented",
    layers: ["currency", "social", "industry", "fiscal"],
    cadence: "monthly",
    collector_notes: "已接入 World Bank Indicators，无 key，输出长期宏观指标。",
    notes: "Global macro, development, trade, reserves, debt, demographics, and social indicators."
  },
  {
    id: "stooq",
    name: "Stooq Market Data",
    type: "market_data",
    reliability: "medium",
    docs_url: "https://stooq.com/",
    base_url: "https://stooq.com/q/d/l/",
    api_key_required: false,
    connector_status: "implemented",
    layers: ["market", "industry", "currency"],
    cadence: "daily",
    collector_notes: "已接入 Stooq CSV 日线数据，无 key，输出 SPY、QQQ、TLT、GLD、USO 等市场代理指标。",
    notes: "Free delayed market data for ETFs and other instruments. Use as market context rather than official macro evidence."
  },
  {
    id: "eia",
    name: "U.S. Energy Information Administration",
    type: "official_api",
    reliability: "very_high",
    docs_url: "https://www.eia.gov/opendata/",
    base_url: "https://api.eia.gov/v2",
    api_key_required: true,
    api_key_env: "EIA_API_KEY",
    connector_status: "key_required",
    layers: ["industry", "geopolitical", "central_bank", "market"],
    cadence: "weekly",
    collector_notes: "已写采集器；未配置 EIA_API_KEY 时会跳过，不会生成伪数据。",
    notes: "Oil, gas, electricity, inventories, production, imports, exports, and energy prices."
  },
  {
    id: "cftc_cot",
    name: "CFTC Commitments of Traders",
    type: "public_database",
    reliability: "high",
    docs_url: "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm",
    base_url: "https://publicreporting.cftc.gov",
    api_key_required: false,
    connector_status: "implemented",
    layers: ["market", "currency", "industry"],
    cadence: "weekly",
    collector_notes: "已接入 CFTC Public Reporting / Socrata TFF Combined 数据集；无 key，输出杠杆资金净持仓。",
    notes: "Weekly futures positioning for rates, currencies, equity indexes, and speculative leverage. It is positioning, not real-time fund flow."
  },
  {
    id: "alpha_vantage",
    name: "Alpha Vantage",
    type: "market_data",
    reliability: "medium",
    docs_url: "https://www.alphavantage.co/documentation/",
    base_url: "https://www.alphavantage.co/query",
    api_key_required: true,
    api_key_env: "ALPHA_VANTAGE_API_KEY",
    connector_status: "key_required",
    layers: ["market", "corporate", "currency", "industry", "geopolitical"],
    cadence: "daily",
    collector_notes: "已接入 GLOBAL_QUOTE 与 NEWS_SENTIMENT；免费额度有限，超限时会记录错误并跳过。",
    notes: "Market quotes, ETF proxies, selected market news sentiment, FX, commodities, and technical indicators. Free quota is limited."
  },
  {
    id: "twelve_data",
    name: "Twelve Data",
    type: "market_data",
    reliability: "medium",
    docs_url: "https://twelvedata.com/docs",
    base_url: "https://api.twelvedata.com",
    api_key_required: true,
    api_key_env: "TWELVE_DATA_API_KEY",
    connector_status: "key_required",
    layers: ["market", "currency", "corporate"],
    cadence: "daily",
    collector_notes: "已接入 quote endpoint；免费额度有限，用作 Stooq/Alpha Vantage 的市场数据补充。",
    notes: "Market data fallback for equities, ETFs, FX, crypto, and commodities. TradingView links are used for chart inspection."
  },
  {
    id: "brave_search",
    name: "Brave Search API",
    type: "search_result",
    reliability: "low",
    docs_url: "https://api.search.brave.com/app/documentation",
    base_url: "https://api.search.brave.com/res/v1",
    api_key_required: true,
    api_key_env: "BRAVE_SEARCH_API_KEY",
    connector_status: "key_required",
    layers: ["geopolitical", "industry", "corporate", "market", "social"],
    cadence: "daily",
    collector_notes: "已写采集器；未配置 BRAVE_SEARCH_API_KEY 时会跳过。搜索结果只作为发现与交叉验证。",
    notes: "Search-discovered reporting links. Use for discovery and cross-checking, not as sole evidence."
  }
];

export function sourceStatusSummary() {
  return sourceRegistry.reduce(
    (summary, source) => {
      summary.total += 1;
      summary[source.connector_status] += 1;
      return summary;
    },
    { total: 0, implemented: 0, key_required: 0, planned: 0 }
  );
}
