insert into graph_nodes (id, label, layer, score, x, y) values
  ('usd_system', '美元体系', 'currency', 68, 50, 50),
  ('fed_policy', '央行政策', 'central_bank', 72, 50, 18),
  ('treasury_supply', '财政债务', 'fiscal', 55, 78, 28),
  ('industry_capacity', '产业结构', 'industry', 63, 82, 55),
  ('corp_earnings', '企业盈利', 'corporate', 71, 21, 45),
  ('geopolitical_risk', '地缘政治', 'geopolitical', 48, 28, 75),
  ('social_structure', '社会结构', 'social', 51, 50, 82),
  ('market_sentiment', '市场情绪', 'market', 60, 76, 74),
  ('capital_flow', '资本流动', 'currency', 62, 25, 25)
on conflict (id) do nothing;

insert into graph_edges (id, source, target, direction, strength, channel) values
  ('edge_fed_usd', 'fed_policy', 'usd_system', 'mixed', 'strong', '利差与实际利率'),
  ('edge_fed_market', 'fed_policy', 'market_sentiment', 'negative', 'strong', '折现率'),
  ('edge_fiscal_yield', 'treasury_supply', 'fed_policy', 'negative', 'medium', '长期收益率'),
  ('edge_fiscal_usd', 'treasury_supply', 'usd_system', 'mixed', 'medium', '储备信心'),
  ('edge_geo_energy', 'geopolitical_risk', 'industry_capacity', 'negative', 'medium', '能源与供应链'),
  ('edge_ind_corp', 'industry_capacity', 'corp_earnings', 'positive', 'medium', '生产率'),
  ('edge_corp_market', 'corp_earnings', 'market_sentiment', 'positive', 'strong', '盈利预期'),
  ('edge_social_fiscal', 'social_structure', 'treasury_supply', 'mixed', 'medium', '政策压力'),
  ('edge_capital_usd', 'capital_flow', 'usd_system', 'mixed', 'medium', '避险需求'),
  ('edge_geo_market', 'geopolitical_risk', 'market_sentiment', 'negative', 'medium', '风险溢价')
on conflict (id) do nothing;

