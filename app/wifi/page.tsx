"use client";

import { WifiTable } from "@/components/tables/wifi-table";
import { RssiChart } from "@/components/charts/rssi-chart";
import { ChannelChart } from "@/components/charts/channel-chart";
import { StatCard } from "@/components/cards/stat-card";
import { useScan } from "@/contexts/scan-context";
import { useESP32 } from "@/contexts/esp32-context";
import { Wifi, Signal, Lock, Radio } from "lucide-react";

export default function WifiPage() {
  const { wifiNetworks, rssiHistory, channelData } = useScan();
  const { connectionStatus } = useESP32();

  const totalNetworks = wifiNetworks.length;
  const secureNetworks = wifiNetworks.filter((n) => n.encryption !== "Open").length;
  const strongestSignal = wifiNetworks.length > 0 
    ? Math.max(...wifiNetworks.map((n) => n.rssi)) 
    : 0;
  const strongestNetwork = wifiNetworks.find((n) => n.rssi === strongestSignal);
  const avgSignal = totalNetworks > 0 
    ? Math.round(wifiNetworks.reduce((a, b) => a + b.rssi, 0) / totalNetworks) 
    : 0;

  return (
    <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight glow-text-purple">
              Wi-Fi Scanner
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Analise detalhada das redes wireless detectadas
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
              title="Total de Redes"
              value={totalNetworks}
              subtitle="Detectadas"
              icon={Wifi}
              variant="purple"
            />
            <StatCard
              title="Redes Seguras"
              value={secureNetworks}
              subtitle="Com criptografia"
              icon={Lock}
              variant="green"
            />
            <StatCard
              title="Melhor Sinal"
              value={strongestSignal ? `${strongestSignal} dBm` : "-"}
              subtitle={strongestNetwork?.ssid || "N/A"}
              icon={Signal}
              variant="cyan"
            />
            <StatCard
              title="Sinal Medio"
              value={avgSignal ? `${avgSignal} dBm` : "-"}
              subtitle="Media geral"
              icon={Radio}
              variant="pink"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RssiChart
              data={rssiHistory}
              networks={wifiNetworks.slice(0, 3).map((n) => n.ssid)}
            />
            <ChannelChart data={channelData} />
          </div>

          {/* Table */}
          <WifiTable networks={wifiNetworks} />
        </div>
  );
}
