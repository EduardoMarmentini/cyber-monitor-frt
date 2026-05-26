"use client";

import { cn } from "@/lib/utils";
import type { WifiNetwork } from "@/types/wifi";
import { Wifi, Lock, LockOpen, Signal } from "lucide-react";

interface WifiTableProps {
  networks: WifiNetwork[];
  className?: string;
}

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

export function WifiTable({ networks, className }: WifiTableProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-card/50 backdrop-blur-sm overflow-hidden",
        "shadow-[0_0_30px_oklch(0.7_0.25_300/0.1)]",
        className
      )}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-[oklch(0.7_0.25_300)]" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
            Redes Wi-Fi Detectadas
          </h3>
          <span className="ml-auto px-2 py-0.5 text-xs font-mono bg-[oklch(0.7_0.25_300/0.2)] text-[oklch(0.85_0.2_300)] rounded">
            {networks.length} encontradas
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
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
            {networks.map((network, index) => {
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
                      <Signal className={cn("h-4 w-4", signal.color)} />
                      <span className="font-mono text-sm font-medium">{network.ssid}</span>
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
                        <LockOpen className="h-4 w-4 text-[oklch(0.6_0.25_25)]" />
                      ) : (
                        <Lock className="h-4 w-4 text-[oklch(0.75_0.2_145)]" />
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
