import type { FinGraphEvent } from "@/lib/types";

const hangulPattern = /[\uac00-\ud7af\u3130-\u318f]/;

export function containsHangul(value: string) {
  return hangulPattern.test(value);
}

export function isRetainedEvent(event: FinGraphEvent) {
  const text = `${event.title} ${event.description} ${event.url}`;

  if (event.id.startsWith("gdelt_") && containsHangul(text)) {
    return false;
  }

  return true;
}
