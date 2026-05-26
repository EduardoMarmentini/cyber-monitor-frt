"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Navbar } from "@/components/navbar/navbar";
import { useESP32 } from "@/contexts/esp32-context";
import { useScan } from "@/contexts/scan-context";
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

  const handleConnect = async (): Promise<void> => {
    if (
      !wifiConfig.ssid ||
      (wifiConfig.secureNetwork && !wifiConfig.password)
    )
      return;

    setIsConnecting(true);
    addLog("info", `Tentando conectar ao ESP32...`);

    // Aqui voce faria a chamada real para configurar o Wi-Fi do ESP
    // Por agora, simula o sucesso da conexao
    setTimeout(() => {
      if (localEndpoint) {
        setEndpoint(localEndpoint);
        addLog("success", `Conectado ao ESP32 em ${localEndpoint}`);
      } else {
        addLog("success", `Conectado ao ESP32`);
      }
      setIsConnecting(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    addLog("info", "Desconectando do ESP32...");
    disconnect();
    setLocalEndpoint("");
    setWifiConfig({ ssid: "", password: "", secureNetwork: false });
  };

  const handleSave = () => {
    setScanIntervals(localSettings.wifiScanInterval, localSettings.bleScanInterval);
    addLog("success", "Configuracoes de scan salvas");
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
          text: "Desconectado",
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
          text: "Conectado",
          color: "text-[oklch(0.75_0.2_145)]",
          bgColor: "bg-[oklch(0.75_0.2_145/0.1)]",
        };
      case "error":
        return {
          icon: XCircle,
          text: "Erro na conexao",
          color: "text-[oklch(0.65_0.25_25)]",
          bgColor: "bg-[oklch(0.65_0.25_25/0.1)]",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const isConnected = connectionStatus === "connected";

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

                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-2">
                    Endpoint do ESP32
                  </label>
                  <input
                    type="text"
                    value={localEndpoint}
                    onChange={(e) => setLocalEndpoint(e.target.value)}
                    placeholder="http://192.168.0.100"
                    disabled={true}
                    className="w-full h-10 rounded-lg border border-border/50 bg-input px-4 font-mono text-sm placeholder:text-muted-foreground/50 focus:border-[oklch(0.7_0.25_300/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.7_0.25_300/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground/80 font-mono">
                    Campo opcional; apenas fallback visual para o IP/endereço usado nas requisições.
                  </p>
                </div>

                {/* Status */}
                <div className={cn("rounded-lg p-4 border", statusInfo.bgColor, "border-border/30")}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn("h-4 w-4", statusInfo.color, (isConnecting || connectionStatus === "connecting") && "animate-spin")} />
                    <span className={cn("font-mono text-xs font-medium", statusInfo.color)}>
                      {statusInfo.text}
                    </span>
                  </div>
                  
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
      </main>
    </div>
  );
}
