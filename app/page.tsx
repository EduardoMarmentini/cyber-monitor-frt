"use client";

import { Sidebar } from "@/components/sidebar/sidebar";
import { Navbar } from "@/components/navbar/navbar";
import { StatCard } from "@/components/cards/stat-card";
import { WifiTable } from "@/components/tables/wifi-table";
import { BleTable } from "@/components/tables/ble-table";
import { RssiChart } from "@/components/charts/rssi-chart";
import { ChannelChart } from "@/components/charts/channel-chart";
import { DevicesHistoryChart } from "@/components/charts/devices-history-chart";
import { TerminalLog } from "@/components/terminal/terminal-log";
import { useScan } from "@/contexts/scan-context";
import { useESP32 } from "@/contexts/esp32-context";
import {
  Wifi,
  Bluetooth,
  Shield,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const { wifiNetworks, bleDevices, rssiHistory, channelData, scanHistory, logs } = useScan();
  const { connectionStatus } = useESP32();
  
  const openNetworks = wifiNetworks.filter((n) => n.encryption === "Open").length;

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Sidebar />
      
      <main className="pl-64 transition-all duration-300">
        <Navbar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold tracking-tight glow-text-purple">
                Dashboard
              </h1>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                Monitoramento em tempo real de redes e dispositivos
              </p>
            </div>
          </div>

          {/* Aviso de conexao */}
          {connectionStatus !== "connected" && (
            <div className="rounded-lg border border-[oklch(0.75_0.15_80/0.3)] bg-[oklch(0.75_0.15_80/0.1)] p-4">
              <p className="font-mono text-sm text-[oklch(0.85_0.15_80)]">
                ESP32 nao conectado. Acesse as <a href="/settings" className="underline hover:text-foreground">Configuracoes</a> para configurar a conexao.
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Redes Wi-Fi"
              value={wifiNetworks.length}
              subtitle="Detectadas"
              icon={Wifi}
              variant="purple"
            />
            <StatCard
              title="Dispositivos BLE"
              value={bleDevices.length}
              subtitle="Ativos"
              icon={Bluetooth}
              variant="cyan"
            />
            <StatCard
              title="Redes Seguras"
              value={wifiNetworks.length - openNetworks}
              subtitle="Com criptografia"
              icon={Shield}
              variant="green"
            />
            <StatCard
              title="Redes Abertas"
              value={openNetworks}
              subtitle="Sem protecao"
              icon={AlertTriangle}
              variant="pink"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <RssiChart
              data={rssiHistory}
              networks={wifiNetworks.slice(0, 5).map((n) => n.ssid)}
              className="xl:col-span-1"
            />
            <ChannelChart data={channelData} className="xl:col-span-1" />
            <DevicesHistoryChart data={scanHistory} className="xl:col-span-1" />
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <WifiTable networks={wifiNetworks} />
            <BleTable devices={bleDevices} />
          </div>

          {/* Terminal */}
          <TerminalLog logs={logs} />
        </div>
      </main>
    </div>
  );
}
