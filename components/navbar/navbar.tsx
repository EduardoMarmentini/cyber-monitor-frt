"use client";

import { cn } from "@/lib/utils";
import { Activity, RefreshCw, WifiOff } from "lucide-react";
import { useESP32 } from "@/contexts/esp32-context";
import { useScan } from "@/contexts/scan-context";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { connectionStatus } = useESP32();
  const { isScanning, scanAll } = useScan();

  const isConnected = connectionStatus === "connected";

  const handleScan = () => {
    if (!isConnected) return;
    scanAll();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[oklch(0.7_0.25_300/0.2)] bg-background/80 backdrop-blur-xl px-6",
        className
      )}
    >
      {/* Left Section - Title */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-muted-foreground">
          ESP32 Network Scanner
        </span>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleScan}
          disabled={isScanning || !isConnected}
          className={cn(
            "flex items-center gap-2 rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-[oklch(0.7_0.25_300/0.1)] px-4 py-2 font-mono text-xs font-medium text-[oklch(0.85_0.2_300)] transition-all hover:bg-[oklch(0.7_0.25_300/0.2)] disabled:opacity-50 disabled:cursor-not-allowed",
            isScanning && "shadow-[0_0_20px_oklch(0.7_0.25_300/0.3)]"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isScanning && "animate-spin")} />
          {isScanning ? "Escaneando..." : "Escanear"}
        </button>

        {isConnected ? (
          <div className="flex items-center gap-2 rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-[oklch(0.75_0.2_145/0.1)] px-3 py-1.5">
            <Activity className="h-4 w-4 text-[oklch(0.75_0.2_145)]" />
            <span className="font-mono text-xs text-[oklch(0.8_0.15_145)]">ONLINE</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-muted/30 px-3 py-1.5">
            <WifiOff className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">OFFLINE</span>
          </div>
        )}
      </div>
    </header>
  );
}
