# FinGraph Skill Pack Specification

## 1. Product Positioning

FinGraph should not depend on a live coding agent or a specific LLM to produce daily analysis. Its primary job is to collect reliable evidence, organize that evidence through a stable macro-financial framework, and export a portable skill pack that any capable language model can use to write a report.

The product therefore has three layers:

1. Evidence layer: official APIs, public datasets, RSS feeds, filings, market data, and search-discovered links.
2. Knowledge layer: the nine-layer FinGraph macro framework, the relation topology, and the analysis rules.
3. Export layer: a self-contained skill pack containing methodology, events, indicators, source links, and report instructions.

Every visible event, metric, and claim in the UI must keep a clickable source URL. If a source has no durable URL, it should not be used as report evidence.

## 2. Skill Pack Structure

The exported file should be a zip package:

```txt
fingraph-skill-pack-YYYY-MM-DD.zip
  SKILL.md
  references/
    nine_layer_knowledge_base.md
    relation_topology.md
  data/
    events.jsonl
    indicators.csv
    sources.csv
  manifest.json
```

`SKILL.md` is the entry file for an LLM. It tells the model what role to adopt, which references to read, how to use the evidence files, and how to produce a sourced report.

`references/nine_layer_knowledge_base.md` is the long-form background. It should assume the reader has almost no financial knowledge and explain every layer in plain language.

`references/relation_topology.md` explains how the nine layers affect each other. It includes causal chains, adjacency maps, common propagation paths, and a topology graph.

`data/events.jsonl` contains recent evidence items from APIs, RSS, filings, news databases, and search results. One line is one event.

`data/indicators.csv` contains time-series snapshots and market indicators.

`data/sources.csv` lists data sources, API documentation links, license/terms links, and reliability category.

## 3. Event JSON Principles

The event object should be compact. It should keep the fields needed for financial reasoning, while avoiding duplicate metadata.

Keep:

- `id`: stable internal event id.
- `time`: one timestamp only. Prefer the source publication time. If no source time exists, use the collection time.
- `title`: human-readable event title.
- `url`: original clickable source link.
- `source_type`: official API, official RSS, public database, filing, market data, or search result.
- `related_layers`: impacted FinGraph layers.
- `related_nodes`: specific graph nodes involved.
- `description`: concise explanation of what happened and why it matters.
- `direction`: positive, negative, neutral, mixed, or uncertain.
- `strength`: 1-5 impact estimate.
- `horizon`: short, medium, long, or structural.
- `assets`: affected assets or asset classes.
- `confidence`: 0-1 confidence score.

Remove by default:

- `publisher`: usually inferable from URL or source registry.
- `retrieved_at` and `published_at` together: use one `time`.
- `evidence_url_required`: URL is mandatory by schema.
- long raw text: store only summary and URL, not copyrighted article bodies.

## 4. UI Implications

Every event card should show:

- Title
- Time
- Source type
- Related layers
- Related nodes
- Direction, strength, horizon
- Short description
- Clickable source link
- Whether included in export

The dashboard should make source reliability visible:

```txt
Official API > Official RSS > Public database > Company filing > Search result > User-provided link
```

Search result items are acceptable as links, but should not be treated as verified facts until cross-checked by official sources or multiple reputable links.

## 5. Report Generation Rules

The exported skill must instruct the receiving model to:

1. Separate facts, interpretation, and forecasts.
2. Cite source URLs for factual claims.
3. Avoid strong conclusions from a single weak source.
4. Explain uncertainty when sources conflict.
5. Map every important event to layers, nodes, assets, direction, strength, and time horizon.
6. Explain cross-layer propagation rather than only summarizing news.
7. Produce a final investor-oriented view without giving personalized financial advice.
8. Include a beginner question guide that suggests follow-up questions from rates, inflation, fiscal policy, earnings, industry, geopolitics, sentiment, risk management, and source-verification angles.
