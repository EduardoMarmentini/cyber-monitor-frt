"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useESP32 } from "@/contexts/esp32-context";
import {
  LayoutDashboard,
  Wifi,
  Bluetooth,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Zap,
  WifiOff,
  Clock,
} from "lucide-react";
import Image from "next/image";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wifi", label: "Wi-Fi Scanner", icon: Wifi },
  { href: "/ble", label: "BLE Scanner", icon: Bluetooth },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Configuracoes", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { connectionStatus, endpoint, stats } = useESP32();

  const isConnected = connectionStatus === "connected";

  const formatUptime = (seconds: number): string => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-[oklch(0.7_0.25_300/0.2)] bg-sidebar/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border/30 px-4">
        <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.7_0.25_300/0.2)] shadow-[0_0_20px_oklch(0.7_0.25_300/0.3)]">
            <Image
              src="/cyber-monitor-logo.png"
              alt="Cyber Monitor Logo"
              width={100}
              height={100}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className={cn(
              "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full",
              isConnected 
                ? "bg-[oklch(0.75_0.2_145)] pulse-glow" 
                : "bg-muted-foreground"
            )} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-[oklch(0.85_0.2_300)] glow-text-purple">
                CYBER.MONITOR
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">v1.0.0</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-[oklch(0.7_0.25_300/0.2)] text-[oklch(0.85_0.2_300)] shadow-[0_0_20px_oklch(0.7_0.25_300/0.2)]"
                  : "text-muted-foreground hover:bg-[oklch(0.7_0.25_300/0.1)] hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-[oklch(0.85_0.2_300)]")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.25_300)] pulse-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status Panel */}
      {!collapsed && (
        <div className="border-t border-border/30 p-3">
          {isConnected ? (
            <div className="rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-[oklch(0.75_0.2_145/0.1)] p-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Radio className="h-4 w-4 text-[oklch(0.75_0.2_145)]" />
                <span className="text-[oklch(0.8_0.15_145)]">ESP32 Conectado</span>
              </div>
              <div className="mt-2 space-y-1 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 shrink-0" />
                  <span className="truncate">{endpoint.replace("http://", "")}</span>
                </div>
                {stats && (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Uptime: {formatUptime(stats.uptime)}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[oklch(0.7_0.25_300)]">{stats.wifiNetworks} WiFi</span>
                      <span className="text-[oklch(0.75_0.15_195)]">{stats.bleDevices} BLE</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border/30 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ESP32 Desconectado</span>
              </div>
              <Link
                href="/settings"
                className="mt-2 block text-xs font-mono text-[oklch(0.75_0.2_300)] hover:underline"
              >
                Configurar conexao
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-[oklch(0.7_0.25_300/0.3)] bg-sidebar text-muted-foreground transition-colors hover:bg-[oklch(0.7_0.25_300/0.2)] hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
