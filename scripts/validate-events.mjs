import { readFile } from "node:fs/promises";

const path = process.argv[2] ?? "skill-template/examples/events.jsonl";
const text = await readFile(path, "utf8");
let count = 0;

for (const [index, line] of text.split(/\r?\n/).entries()) {
  if (!line.trim()) {
    continue;
  }
  try {
    const event = JSON.parse(line);
    for (const key of [
      "id",
      "time",
      "title",
      "url",
      "source_type",
      "related_layers",
      "related_nodes",
      "description",
      "direction",
      "strength",
      "horizon",
      "assets",
      "confidence"
    ]) {
      if (!(key in event)) {
        throw new Error(`missing key: ${key}`);
      }
    }
    count += 1;
  } catch (error) {
    console.error(`Invalid JSONL at line ${index + 1}:`, error.message);
    process.exit(1);
  }
}

console.log(`Validated ${count} FinGraph events from ${path}`);

