"use client";

import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";

interface TerminalLogProps {
  logs: Array<{
    timestamp: Date;
    type: "info" | "success" | "warning" | "error";
    message: string;
  }>;
  className?: string;
}

export function TerminalLog({ logs, className }: TerminalLogProps) {
  const typeColors = {
    info: "text-[oklch(0.75_0.15_195)]",
    success: "text-[oklch(0.75_0.2_145)]",
    warning: "text-[oklch(0.75_0.15_80)]",
    error: "text-[oklch(0.6_0.25_25)]",
  };

  const typeLabels = {
    info: "INFO",
    success: "OK",
    warning: "WARN",
    error: "ERR",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-[oklch(0.06_0.01_280)] overflow-hidden",
        "shadow-[0_0_30px_oklch(0.7_0.25_300/0.1)]",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/30 bg-[oklch(0.1_0.015_280)] px-4 py-2">
        <Terminal className="h-4 w-4 text-[oklch(0.7_0.25_300)]" />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Terminal Log
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.6_0.25_25)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.15_80)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.2_145)]" />
        </div>
      </div>

      <div className="h-[200px] overflow-y-auto p-4 font-mono text-xs">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start gap-2 py-0.5">
            <span className="text-muted-foreground shrink-0">
              [{log.timestamp.toLocaleTimeString("pt-BR")}]
            </span>
            <span className={cn("shrink-0 font-bold", typeColors[log.type])}>
              [{typeLabels[log.type]}]
            </span>
            <span className="text-foreground/90">{log.message}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-2 text-[oklch(0.7_0.25_300)]">
          <span>{">"}</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}
