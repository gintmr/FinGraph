"use client";

import Link from "next/link";
import { Check, ClipboardCopy, Download, FileArchive, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

type ExportFormat = "zip" | "txt";
type PromptLanguage = "zh" | "en";

function OptionButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition",
        active ? "border-blue bg-blue/12 text-blue" : "border-line bg-panel2 text-muted hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

export function ExportControls({ days = 14, compact = false }: { days?: number; compact?: boolean }) {
  const [format, setFormat] = useState<ExportFormat>("zip");
  const [language, setLanguage] = useState<PromptLanguage>("zh");
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "error">("idle");

  const href = useMemo(
    () => `/api/export/skill-pack?days=${days}&format=${format}&prompt=${language}`,
    [days, format, language]
  );

  async function copyTxtToClipboard() {
    if (format !== "txt") {
      return;
    }

    setCopyState("copying");
    try {
      const response = await fetch(href, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to build TXT export.");
      }

      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 3000);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-medium text-muted">导出格式</div>
        <div className="flex gap-2">
          <OptionButton active={format === "zip"} onClick={() => setFormat("zip")}>
            <FileArchive className="h-4 w-4" />
            ZIP 包
          </OptionButton>
          <OptionButton active={format === "txt"} onClick={() => setFormat("txt")}>
            <FileText className="h-4 w-4" />
            单个 TXT
          </OptionButton>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium text-muted">最后 User Prompt 语言</div>
        <div className="flex gap-2">
          <OptionButton active={language === "zh"} onClick={() => setLanguage("zh")}>
            中文
          </OptionButton>
          <OptionButton active={language === "en"} onClick={() => setLanguage("en")}>
            English
          </OptionButton>
        </div>
      </div>

      {!compact ? (
        <p className="text-xs leading-5 text-muted">
          语言选项只改变文件末尾的 user prompt，从而控制模型回答语言；前面的证据和知识上下文保持原样，避免重复维护两套背景。
        </p>
      ) : null}

      <Link
        href={href}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue/90"
      >
        <Download className="h-4 w-4" aria-hidden />
        导出 {format.toUpperCase()} · {language === "zh" ? "中文 Prompt" : "English Prompt"}
      </Link>

      {format === "txt" ? (
        <button
          type="button"
          onClick={copyTxtToClipboard}
          disabled={copyState === "copying"}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-panel2 px-4 text-sm font-semibold text-text transition hover:border-blue/35 hover:bg-blue/10 disabled:cursor-wait disabled:opacity-70"
        >
          {copyState === "copied" ? <Check className="h-4 w-4 text-green" aria-hidden /> : <ClipboardCopy className="h-4 w-4" aria-hidden />}
          {copyState === "copying"
            ? "正在生成并复制..."
            : copyState === "copied"
              ? "已复制到剪切板"
              : copyState === "error"
                ? "复制失败，请改用导出 TXT"
                : "复制 TXT 到剪切板"}
        </button>
      ) : null}
    </div>
  );
}
