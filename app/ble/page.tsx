"use client";

import { BleTable } from "@/components/tables/ble-table";
import { StatCard } from "@/components/cards/stat-card";
import { useScan } from "@/contexts/scan-context";
import { useESP32 } from "@/contexts/esp32-context";
import { Bluetooth, Signal, Users, Radio } from "lucide-react";

export default function BlePage() {
  const { bleDevices } = useScan();
  const { connectionStatus } = useESP32();

  const totalDevices = bleDevices.length;
  const namedDevices = bleDevices.filter((d) => d.name !== "Unknown Device" && d.name).length;
  const strongestSignal = bleDevices.length > 0 
    ? Math.max(...bleDevices.map((d) => d.rssi)) 
    : 0;
  const closestDevice = bleDevices.find((d) => d.rssi === strongestSignal);

  return (
    <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight glow-text-cyan">
              BLE Scanner
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Dispositivos Bluetooth Low Energy detectados
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
              title="Dispositivos"
              value={totalDevices}
              subtitle="Detectados"
              icon={Bluetooth}
              variant="cyan"
            />
            <StatCard
              title="Identificados"
              value={namedDevices}
              subtitle="Com nome"
              icon={Users}
              variant="green"
            />
            <StatCard
              title="Mais Proximo"
              value={strongestSignal ? `${strongestSignal} dBm` : "-"}
              subtitle={closestDevice?.name || "N/A"}
              icon={Signal}
              variant="purple"
            />
            <StatCard
              title="Desconhecidos"
              value={totalDevices - namedDevices}
              subtitle="Sem nome"
              icon={Radio}
              variant="pink"
            />
          </div>

          {/* Table */}
          <BleTable devices={bleDevices} />
        </div>
  );
}
