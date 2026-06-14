import { z } from "zod";

export const finGraphEventSchema = z.object({
  id: z.string().min(1),
  time: z.string().datetime(),
  title: z.string().min(1),
  url: z.string().url(),
  source_type: z.enum([
    "official_api",
    "official_rss",
    "public_database",
    "company_filing",
    "market_data",
    "search_result",
    "user_link"
  ]),
  related_layers: z
    .array(
      z.enum([
        "currency",
        "central_bank",
        "fiscal",
        "industry",
        "corporate",
        "geopolitical",
        "social",
        "market"
      ])
    )
    .min(1),
  related_nodes: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
  direction: z.enum(["positive", "negative", "neutral", "mixed", "uncertain"]),
  strength: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  horizon: z.enum(["short", "medium", "long", "structural"]),
  assets: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  included_in_export: z.boolean().optional()
});

export const finGraphEventsSchema = z.array(finGraphEventSchema);

