import { ExternalLink } from "lucide-react";

export function SourceLink({ url, label = "来源" }: { url: string; label?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 text-xs font-medium text-blue transition hover:border-blue/35 hover:bg-blue/10"
      title={url}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}
