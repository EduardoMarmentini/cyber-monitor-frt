"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { WifiNetwork } from "@/types/wifi";
import { Wifi, Lock, LockOpen, Signal, Search, X } from "lucide-react";

interface WifiTableProps {
  networks: WifiNetwork[];
  className?: string;
  maxHeight?: string;
}

const ENCRYPTION_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Abertas" },
  { value: "secure", label: "Seguras" },
] as const;

function getSignalStrength(rssi: number): { label: string; color: string; bars: number } {
  if (rssi >= -50) return { label: "Excelente", color: "text-[oklch(0.75_0.2_145)]", bars: 4 };
  if (rssi >= -60) return { label: "Bom", color: "text-[oklch(0.75_0.15_195)]", bars: 3 };
  if (rssi >= -70) return { label: "Regular", color: "text-[oklch(0.75_0.15_80)]", bars: 2 };
  return { label: "Fraco", color: "text-[oklch(0.6_0.25_25)]", bars: 1 };
}

function SignalBars({ rssi }: { rssi: number }) {
  const { bars, color } = getSignalStrength(rssi);

  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-1 rounded-t transition-all",
            bar <= bars ? color.replace("text-", "bg-") : "bg-muted-foreground/20"
          )}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
}

export function WifiTable({ networks, className, maxHeight = "400px" }: WifiTableProps) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<number | null>(null);
  const [encryptionFilter, setEncryptionFilter] = useState<string>("all");

  const channels = useMemo(() => {
    const set = new Set(networks.map((n) => n.channel));
    return Array.from(set).sort((a, b) => a - b);
  }, [networks]);

  const filtered = useMemo(() => {
    return networks.filter((n) => {
      if (search && !n.ssid.toLowerCase().includes(search.toLowerCase())) return false;
      if (channelFilter !== null && n.channel !== channelFilter) return false;
      if (encryptionFilter === "open" && n.encryption !== "Open") return false;
      if (encryptionFilter === "secure" && n.encryption === "Open") return false;
      return true;
    });
  }, [networks, search, channelFilter, encryptionFilter]);

  const hasActiveFilters = search || channelFilter !== null || encryptionFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setChannelFilter(null);
    setEncryptionFilter("all");
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-card/50 backdrop-blur-sm",
        "shadow-[0_0_30px_oklch(0.7_0.25_300/0.1)]",
        className
      )}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="h-5 w-5 text-[oklch(0.7_0.25_300)]" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
            Redes Wi-Fi Detectadas
          </h3>
          <span className="ml-auto px-2 py-0.5 text-xs font-mono bg-[oklch(0.7_0.25_300/0.2)] text-[oklch(0.85_0.2_300)] rounded">
            {filtered.length}/{networks.length} encontradas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por SSID..."
              className="w-full h-9 rounded-lg border border-border/50 bg-input pl-9 pr-3 font-mono text-xs placeholder:text-muted-foreground/50 focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)]"
            />
          </div>

          <select
            value={encryptionFilter}
            onChange={(e) => setEncryptionFilter(e.target.value)}
            className="h-9 rounded-lg border border-border/50 bg-input px-3 font-mono text-xs focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)]"
          >
            {ENCRYPTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={channelFilter ?? ""}
            onChange={(e) => setChannelFilter(e.target.value ? Number(e.target.value) : null)}
            className="h-9 rounded-lg border border-border/50 bg-input px-3 font-mono text-xs focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)]"
          >
            <option value="">Todos canais</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>Canal {ch}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 h-9 px-3 rounded-lg border border-border/50 bg-muted/30 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight }} >
        <div className="overflow-y-auto max-h-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-muted/30 sticky top-0 z-10">
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  SSID
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  BSSID
                </th>
                <th className="px-4 py-3 text-center text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Sinal
                </th>
                <th className="px-4 py-3 text-center text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Canal
                </th>
                <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Segurança
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="font-mono text-sm text-muted-foreground">
                      {networks.length === 0
                        ? "Nenhuma rede Wi-Fi detectada"
                        : "Nenhuma rede corresponde aos filtros"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((network, index) => {
                  const signal = getSignalStrength(network.rssi);
                  const isOpen = network.encryption === "Open";

                  return (
                    <tr
                      key={network.bssid}
                      className={cn(
                        "border-b border-border/20 transition-colors hover:bg-[oklch(0.7_0.25_300/0.05)]",
                        index % 2 === 0 && "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Signal className={cn("h-4 w-4 shrink-0", signal.color)} />
                          <span className="font-mono text-sm font-medium truncate max-w-[200px]">
                            {network.ssid}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-muted-foreground">{network.bssid}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <SignalBars rssi={network.rssi} />
                          <span className={cn("text-xs font-mono", signal.color)}>
                            {network.rssi} dBm
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[oklch(0.75_0.15_195/0.15)] text-[oklch(0.75_0.15_195)] font-mono text-sm font-bold">
                          {network.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isOpen ? (
                            <LockOpen className="h-4 w-4 shrink-0 text-[oklch(0.6_0.25_25)]" />
                          ) : (
                            <Lock className="h-4 w-4 shrink-0 text-[oklch(0.75_0.2_145)]" />
                          )}
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs font-mono rounded",
                              isOpen
                                ? "bg-[oklch(0.6_0.25_25/0.2)] text-[oklch(0.75_0.2_25)]"
                                : "bg-[oklch(0.75_0.2_145/0.2)] text-[oklch(0.8_0.15_145)]"
                            )}
                          >
                            {network.encryption}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
