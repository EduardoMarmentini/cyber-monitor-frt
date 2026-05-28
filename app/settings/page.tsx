"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useESP32 } from "@/contexts/esp32-context";
import { useScan } from "@/contexts/scan-context";
import { esp32Api } from "@/services/esp32-api";
import { cn } from "@/lib/utils";
import {
  Wifi,
  Cpu,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type WifiConfig = {
  ssid: string;
  password: string;
  secureNetwork: boolean;
};

type LocalSettings = {
  wifiScanInterval: number;
  bleScanInterval: number;
};

type StatusInfo = {
  icon: typeof Loader2;
  text: string;
  color: string;
  bgColor: string;
};

export default function SettingsPage() {
  const {
    connectionStatus,
    endpoint,
    wifiScanInterval,
    bleScanInterval,
    setEndpoint,
    setScanIntervals,
    disconnect,
  } = useESP32();

  const { addLog } = useScan();

  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    wifiScanInterval,
    bleScanInterval,
  });

  const [wifiConfig, setWifiConfig] = useState<WifiConfig>({
    ssid: "",
    password: "",
    secureNetwork: false,
  });

  const [localEndpoint, setLocalEndpoint] = useState(endpoint);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [connectedIp, setConnectedIp] = useState<string | null>(null);

  const handleConnect = async (): Promise<void> => {
    if (
      !wifiConfig.ssid ||
      !localEndpoint ||
      (wifiConfig.secureNetwork && !wifiConfig.password)
    )
      return;

    setIsConnecting(true);
    setConnectionMessage(null);
    setConnectedIp(null);
    addLog("info", `Conectando ao ESP32 em ${localEndpoint}...`);

    try {
      // Configura URL sem marcar como conectado ainda
      esp32Api.setBaseUrl(localEndpoint);

      // Health check primeiro
      addLog("info", "Verificando conexao com o ESP32...");
      const isOnline = await esp32Api.healthCheck();
      if (!isOnline) {
        throw new Error("ESP32 não está respondendo");
      }

      // Configurar WiFi
      addLog("info", `Configurando rede Wi-Fi ${wifiConfig.ssid}...`);
      const result = await esp32Api.configureWifi({
        ssid: wifiConfig.ssid,
        password: wifiConfig.secureNetwork ? wifiConfig.password : undefined,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      // So marca como conectado apos sucesso
      setEndpoint(localEndpoint);
      setConnectionMessage(result.message);
      addLog("success", result.message);

      if (result.ip) {
        setConnectedIp(result.ip);
        addLog("info", `ESP32 conectado — IP: ${result.ip}`);
      }

      toast.success("ESP32 conectado", {
        description: result.ip
          ? `Conectado em ${result.ip}`
          : `Rede ${wifiConfig.ssid} configurada`,
      });
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
    setLocalEndpoint("");
    setWifiConfig({ ssid: "", password: "", secureNetwork: false });
    setConnectionMessage(null);
    setConnectedIp(null);
  };

  const handleSave = () => {
    setScanIntervals(localSettings.wifiScanInterval, localSettings.bleScanInterval);
    addLog("success", "Configuracoes de scan salvas");
    toast.success("Configurações salvas", {
      description: `Wi-Fi: ${localSettings.wifiScanInterval}s | BLE: ${localSettings.bleScanInterval}s`,
    });
  };

  const handleReset = () => {
    setLocalSettings({ wifiScanInterval: 5, bleScanInterval: 10 });
    setScanIntervals(5, 10);
    addLog("info", "Configuracoes resetadas para o padrao");
  };

  const getStatusInfo = (): StatusInfo => {
    if (isConnecting) {
      return {
        icon: Loader2,
        text: "Conectando...",
        color: "text-[oklch(0.75_0.15_80)]",
        bgColor: "bg-[oklch(0.75_0.15_80/0.1)]",
      };
    }

    switch (connectionStatus) {
      case "disconnected":
        return {
          icon: XCircle,
          text: connectionMessage || "Desconectado",
          color: "text-muted-foreground",
          bgColor: "bg-muted/50",
        };
      case "connecting":
        return {
          icon: Loader2,
          text: "Conectando...",
          color: "text-[oklch(0.75_0.15_80)]",
          bgColor: "bg-[oklch(0.75_0.15_80/0.1)]",
        };
      case "connected":
        return {
          icon: CheckCircle2,
          text: connectionMessage || "Conectado",
          color: "text-[oklch(0.75_0.2_145)]",
          bgColor: "bg-[oklch(0.75_0.2_145/0.1)]",
        };
      case "error":
        return {
          icon: XCircle,
          text: connectionMessage || "Erro na conexao",
          color: "text-[oklch(0.65_0.25_25)]",
          bgColor: "bg-[oklch(0.65_0.25_25/0.1)]",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const isConnected = connectionStatus === "connected";

  return (
    <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold tracking-tight glow-text-purple">
                Configuracoes
              </h1>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                Ajuste as configuracoes do sistema
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
            {/* Scan Settings */}
            <div className="rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-card/50 backdrop-blur-sm p-6 shadow-[0_0_30px_oklch(0.7_0.25_300/0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.7_0.25_300/0.2)]">
                  <Wifi className="h-5 w-5 text-[oklch(0.85_0.2_300)]" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-semibold">Configuracoes de Scan</h3>
                  <p className="font-mono text-xs text-muted-foreground">Intervalos de varredura</p>
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

                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-2">
                    Intervalo BLE (segundos)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={localSettings.bleScanInterval}
                    onChange={(e) => setLocalSettings({ ...localSettings, bleScanInterval: Number(e.target.value) })}
                    className="w-full h-10 rounded-lg border border-border/50 bg-input px-4 font-mono text-sm focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)]"
                  />
                </div>
              </div>
            </div>

            {/* ESP32 Connection Settings */}
            <div className="rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-card/50 backdrop-blur-sm p-6 shadow-[0_0_30px_oklch(0.75_0.2_145/0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.75_0.2_145/0.2)]">
                  <Cpu className="h-5 w-5 text-[oklch(0.85_0.15_145)]" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-semibold">Conexao ESP32</h3>
                  <p className="font-mono text-xs text-muted-foreground">Configurar rede Wi-Fi do ESP</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-2">
                    Endpoint do ESP32
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
                    URL base do ESP32 (ex: http://esp32.local:8080)
                  </p>
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-2">
                    Nome da Rede (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiConfig.ssid}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                    placeholder="Digite o nome da rede"
                    disabled={isConnected}
                    className="w-full h-10 rounded-lg border border-border/50 bg-input px-4 font-mono text-sm placeholder:text-muted-foreground/50 focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-2">
                    <input
                      type="checkbox"
                      checked={wifiConfig.secureNetwork}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, secureNetwork: e.target.checked, password: e.target.checked ? wifiConfig.password : "" })}
                      disabled={isConnected}
                      className="h-4 w-4 rounded border-border/50 bg-input text-[oklch(0.75_0.2_145)] focus:ring-[oklch(0.7_0.25_300/0.3)]"
                    />
                    Rede segura
                  </label>
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={wifiConfig.password}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                    placeholder="Digite a senha da rede"
                    disabled={isConnected || !wifiConfig.secureNetwork}
                    className="w-full h-10 rounded-lg border border-border/50 bg-input px-4 font-mono text-sm placeholder:text-muted-foreground/50 focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Status */}
                <div className={cn("rounded-lg p-4 border", statusInfo.bgColor, "border-border/30")}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn("h-4 w-4", statusInfo.color, (isConnecting || connectionStatus === "connecting") && "animate-spin")} />
                    <span className={cn("font-mono text-xs font-medium", statusInfo.color)}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {connectedIp && (
                    <div className="mt-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        IP atribuido:{" "}
                      </span>
                      <code className="font-mono text-xs text-[oklch(0.85_0.2_300)]">
                        {connectedIp}
                      </code>
                    </div>
                  )}

                  {isConnected && endpoint && (
                    <div className="mt-3">
                      <label className="block font-mono text-xs text-muted-foreground mb-1">
                        Endpoint para requisicoes:
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-background/50 px-3 py-2 font-mono text-xs text-[oklch(0.85_0.2_300)]">
                          {endpoint}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(endpoint)}
                          className="rounded px-2 py-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botoes de acao */}
                <div className="flex gap-3">
                  {!isConnected ? (
                    <button
                      onClick={handleConnect}
                      disabled={
                        !wifiConfig.ssid ||
                        !localEndpoint ||
                        isConnecting ||
                        (wifiConfig.secureNetwork && !wifiConfig.password)
                      }
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-[oklch(0.75_0.2_145/0.2)] px-4 py-2 font-mono text-xs text-[oklch(0.85_0.15_145)] transition-colors hover:bg-[oklch(0.75_0.2_145/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Wifi className="h-4 w-4" />
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
