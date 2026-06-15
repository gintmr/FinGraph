export type ExternalPlatform = {
  id: string;
  name: string;
  url: string;
  category: "widget" | "news" | "calendar" | "market";
  note: string;
};

export const embeddedPageSources: ExternalPlatform[] = [
  {
    id: "jin10",
    name: "金十数据",
    url: "https://www.jin10.com/",
    category: "news",
    note: "中文宏观快讯、央行动态和市场新闻入口。"
  },
  {
    id: "financialjuice",
    name: "FinancialJuice",
    url: "https://www.financialjuice.com/home",
    category: "news",
    note: "英文实时市场快讯、Squawk、宏观、债券、商品和美股新闻入口。"
  },
  {
    id: "forexlive",
    name: "ForexLive",
    url: "https://www.forexlive.com/",
    category: "news",
    note: "美元、央行、利率、外汇、商品和风险偏好快讯入口。"
  },
  {
    id: "fxstreet_calendar",
    name: "FXStreet 经济日历",
    url: "https://www.fxstreet.com/economic-calendar",
    category: "calendar",
    note: "全球宏观日历、央行讲话、美元与大宗商品相关事件入口。"
  },
  {
    id: "investing_calendar",
    name: "Investing.com 日历",
    url: "https://www.investing.com/economic-calendar/",
    category: "calendar",
    note: "宏观经济日历、预期值和公布值入口。"
  }
];

export const externalPlatformLinks: ExternalPlatform[] = [
  {
    id: "tradingview",
    name: "TradingView",
    url: "https://www.tradingview.com/widget-docs/",
    category: "widget",
    note: "图表、市场概览、热力图、新闻和经济日历官方嵌入组件。"
  },
  ...embeddedPageSources
];
