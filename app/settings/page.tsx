"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useESP32 } from "@/contexts/esp32-context";
import { useScan } from "@/contexts/scan-context";
import { cn } from "@/lib/utils";
import {
  Wifi,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  Plug,
} from "lucide-react";

type LocalSettings = {
  wifiScanInterval: number;
};

export default function SettingsPage() {
  const {
    connectionStatus,
    endpoint,
    wifiScanInterval,
    setScanIntervals,
    manualConnect,
    disconnect,
  } = useESP32();

  const { addLog } = useScan();

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    wifiScanInterval,
  });

  const [localEndpoint, setLocalEndpoint] = useState(endpoint || "http://esp32.local:8080");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!localEndpoint) return;

    setIsConnecting(true);
    setConnectionMessage(null);
    addLog("info", `Conectando ao ESP32 em ${localEndpoint}...`);

    try {
      const success = await manualConnect(localEndpoint);
      if (success) {
        addLog("success", "ESP32 conectado com sucesso");
        toast.success("ESP32 conectado", {
          description: `Conectado em ${localEndpoint}`,
        });
      } else {
        throw new Error("ESP32 não está respondendo");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setConnectionMessage(msg);
      addLog("error", msg);
      toast.error("Erro de conexão", {
        description: msg,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    addLog("info", "Desconectando do ESP32...");
    disconnect();
    setLocalEndpoint("http://esp32.local:8080");
    setConnectionMessage(null);
  };

  const handleSave = () => {
    setScanIntervals(localSettings.wifiScanInterval);
    addLog("success", "Configuracoes de scan salvas");
    toast.success("Configurações salvas", {
      description: `Wi-Fi: ${localSettings.wifiScanInterval}s`,
    });
  };

  const handleReset = () => {
    setLocalSettings({ wifiScanInterval: 5 });
    setScanIntervals(5);
    addLog("info", "Configuracoes resetadas para o padrao");
  };

  const isConnected = connectionStatus === "connected";
  const isConnectingState = connectionStatus === "connecting" || isConnecting;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight glow-text-purple">
            Configuracoes
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            Configure a conexao com o ESP32
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary px-4 py-2 font-mono text-xs transition-colors hover:bg-secondary/80"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-[oklch(0.75_0.2_145/0.2)] px-4 py-2 font-mono text-xs text-[oklch(0.85_0.15_145)] transition-colors hover:bg-[oklch(0.75_0.2_145/0.3)]"
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-card/50 backdrop-blur-sm p-6 shadow-[0_0_30px_oklch(0.7_0.25_300/0.1)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.7_0.25_300/0.2)]">
              <Wifi className="h-5 w-5 text-[oklch(0.85_0.2_300)]" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold">Configuracoes de Scan</h3>
              <p className="font-mono text-xs text-muted-foreground">Intervalo de varredura</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-2">
                Intervalo Wi-Fi (segundos)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={localSettings.wifiScanInterval}
                onChange={(e) => setLocalSettings({ ...localSettings, wifiScanInterval: Number(e.target.value) })}
                className="w-full h-10 rounded-lg border border-border/50 bg-input px-4 font-mono text-sm focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-card/50 backdrop-blur-sm p-6 shadow-[0_0_30px_oklch(0.75_0.2_145/0.1)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.75_0.2_145/0.2)]">
              <Plug className="h-5 w-5 text-[oklch(0.85_0.15_145)]" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold">Conexao ESP32</h3>
              <p className="font-mono text-xs text-muted-foreground">Endereco do dispositivo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-2">
                Endereco IP:Porta
              </label>
              <input
                type="text"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                placeholder="http://esp32.local:8080"
                disabled={isConnected}
                className="w-full h-10 rounded-lg border border-border/50 bg-input px-4 font-mono text-sm placeholder:text-muted-foreground/50 focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-[11px] text-muted-foreground/80 font-mono">
                Ex: http://192.168.1.100:8080 ou http://esp32.local:8080
              </p>
            </div>

            <div className={cn(
              "rounded-lg p-4 border",
              isConnected
                ? "bg-[oklch(0.75_0.2_145/0.1)] border-[oklch(0.75_0.2_145/0.3)]"
                : isConnectingState
                  ? "bg-[oklch(0.75_0.15_80/0.1)] border-[oklch(0.75_0.15_80/0.3)]"
                  : connectionMessage
                    ? "bg-[oklch(0.65_0.25_25/0.1)] border-[oklch(0.65_0.25_25/0.3)]"
                    : "bg-muted/50 border-border/30"
            )}>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <CheckCircle2 className="h-4 w-4 text-[oklch(0.75_0.2_145)]" />
                ) : isConnectingState ? (
                  <Loader2 className="h-4 w-4 text-[oklch(0.75_0.15_80)] animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(
                  "font-mono text-xs font-medium",
                  isConnected && "text-[oklch(0.8_0.15_145)]",
                  isConnectingState && "text-[oklch(0.85_0.15_80)]",
                  !isConnected && !isConnectingState && "text-muted-foreground"
                )}>
                  {isConnected ? "Conectado" : isConnectingState ? "Conectando..." : connectionMessage || "Desconectado"}
                </span>
              </div>

              {isConnected && endpoint && (
                <div className="mt-3">
                  <label className="block font-mono text-xs text-muted-foreground mb-1">
                    Endpoint ativo:
                  </label>
                  <code className="block rounded bg-background/50 px-3 py-2 font-mono text-xs text-[oklch(0.85_0.2_300)]">
                    {endpoint}
                  </code>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={!localEndpoint || isConnectingState}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-[oklch(0.75_0.2_145/0.2)] px-4 py-2 font-mono text-xs text-[oklch(0.85_0.15_145)] transition-colors hover:bg-[oklch(0.75_0.2_145/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnectingState ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Plug className="h-4 w-4" />
                      Conectar
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[oklch(0.65_0.25_25/0.3)] bg-[oklch(0.65_0.25_25/0.2)] px-4 py-2 font-mono text-xs text-[oklch(0.85_0.2_25)] transition-colors hover:bg-[oklch(0.65_0.25_25/0.3)]"
                >
                  <XCircle className="h-4 w-4" />
                  Desconectar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
