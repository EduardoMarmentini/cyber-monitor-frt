"use client";

import { RssiChart } from "@/components/charts/rssi-chart";
import { ChannelChart } from "@/components/charts/channel-chart";
import { DevicesHistoryChart } from "@/components/charts/devices-history-chart";
import { StatCard } from "@/components/cards/stat-card";
import { useScan } from "@/contexts/scan-context";
import { useESP32 } from "@/contexts/esp32-context";
import { BarChart3, TrendingUp, Activity, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const { wifiNetworks, rssiHistory, channelData, scanHistory, logs } = useScan(); // bleDevices removido
  const { connectionStatus } = useESP32();

  const avgWifi = scanHistory.length > 0 
    ? Math.round(scanHistory.reduce((a, b) => a + b.wifi, 0) / scanHistory.length) 
    : 0;
  // BLE desativado
  // const avgBle = scanHistory.length > 0
  //   ? Math.round(scanHistory.reduce((a, b) => a + b.ble, 0) / scanHistory.length)
  //   : 0;
  const peakWifi = scanHistory.length > 0 
    ? Math.max(...scanHistory.map((h) => h.wifi)) 
    : 0;
  // BLE desativado
  // const peakBle = scanHistory.length > 0
  //   ? Math.max(...scanHistory.map((h) => h.ble))
  //   : 0;

  const totalScans = scanHistory.length;
  const totalAlerts = logs.filter((l) => l.type === "warning" || l.type === "error").length;

  return (
    <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight glow-text-purple">
              Analytics
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Analise historica e metricas avancadas
            </p>
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
              title="Media Wi-Fi"
              value={avgWifi}
              subtitle="Redes/scan"
              icon={BarChart3}
              variant="purple"
            />
            {/* BLE desativado */}
            {/* <StatCard
              title="Media BLE"
              value={avgBle}
              subtitle="Dispositivos/scan"
              icon={Activity}
              variant="cyan"
            /> */}
            <StatCard
              title="Pico Wi-Fi"
              value={peakWifi}
              subtitle="Maximo detectado"
              icon={TrendingUp}
              variant="green"
            />
            {/* BLE desativado */}
            {/* <StatCard
              title="Pico BLE"
              value={peakBle}
              subtitle="Maximo detectado"
              icon={Zap}
              variant="pink"
            /> */}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DevicesHistoryChart data={scanHistory} />
            <RssiChart
              data={rssiHistory}
              networks={wifiNetworks.slice(0, 3).map((n) => n.ssid)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChannelChart data={channelData} />
            <div className="rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-card/50 backdrop-blur-sm p-6 shadow-[0_0_30px_oklch(0.7_0.25_300/0.1)]">
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider mb-4">
                Resumo do Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-mono text-xs text-muted-foreground">Total de Scans</span>
                  <span className="font-mono text-sm font-bold text-[oklch(0.85_0.2_300)]">{totalScans}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-mono text-xs text-muted-foreground">Redes Wi-Fi Atuais</span>
                  <span className="font-mono text-sm font-bold text-[oklch(0.75_0.15_195)]">{wifiNetworks.length}</span>
                </div>
                {/* BLE desativado */}
                {/* <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-mono text-xs text-muted-foreground">Dispositivos BLE Atuais</span>
                  <span className="font-mono text-sm font-bold text-[oklch(0.75_0.15_195)]">{bleDevices.length}</span>
                </div> */}
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="font-mono text-xs text-muted-foreground">Alertas Gerados</span>
                  <span className="font-mono text-sm font-bold text-[oklch(0.75_0.15_80)]">{totalAlerts}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-mono text-xs text-muted-foreground">Status</span>
                  <span className={`font-mono text-sm font-bold ${connectionStatus === "connected" ? "text-[oklch(0.75_0.2_145)]" : "text-muted-foreground"}`}>
                    {connectionStatus === "connected" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
