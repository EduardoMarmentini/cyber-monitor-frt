"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { WifiNetwork } from "@/types/wifi";
import type { BleDevice } from "@/types/ble";
import { esp32Api } from "@/services/esp32-api";
import { useESP32 } from "./esp32-context";

interface ScanContextType {
  // Dados
  wifiNetworks: WifiNetwork[];
  bleDevices: BleDevice[];
  
  // Estado
  isScanning: boolean;
  lastWifiScan: Date | null;
  lastBleScan: Date | null;
  
  // Historico para graficos
  rssiHistory: Array<{ time: string; [key: string]: number | string }>;
  channelData: Array<{ channel: number; count: number; networks: string[] }>;
  scanHistory: Array<{ time: string; wifi: number; ble: number }>;

  // Logs
  logs: Array<{ timestamp: Date; type: "info" | "success" | "warning" | "error"; message: string }>;
  
  // Acoes
  scanWifi: () => Promise<void>;
  scanBle: () => Promise<void>;
  scanAll: () => Promise<void>;
  startAutoScan: () => void;
  stopAutoScan: () => void;
  addLog: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const { connectionStatus, wifiScanInterval, bleScanInterval } = useESP32();
  
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [bleDevices, setBleDevices] = useState<BleDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastWifiScan, setLastWifiScan] = useState<Date | null>(null);
  const [lastBleScan, setLastBleScan] = useState<Date | null>(null);
  
  const [rssiHistory, setRssiHistory] = useState<Array<{ time: string; [key: string]: number | string }>>([]);
  const [channelData, setChannelData] = useState<Array<{ channel: number; count: number; networks: string[] }>>([]);
  const [scanHistory, setScanHistory] = useState<Array<{ time: string; wifi: number; ble: number }>>([]);
  
  const [logs, setLogs] = useState<Array<{ timestamp: Date; type: "info" | "success" | "warning" | "error"; message: string }>>([
    { timestamp: new Date(), type: "info", message: "Sistema iniciado. Aguardando conexao com ESP32..." },
  ]);
  
  const autoScanRef = useRef<{ wifi: NodeJS.Timeout | null; ble: NodeJS.Timeout | null }>({
    wifi: null,
    ble: null,
  });

  const addLog = useCallback((type: "info" | "success" | "warning" | "error", message: string) => {
    setLogs((prev) => [...prev.slice(-99), { timestamp: new Date(), type, message }]);
  }, []);

  const updateChannelData = useCallback((networks: WifiNetwork[]) => {
    const channelMap = new Map<number, { count: number; networks: string[] }>();
    
    networks.forEach((network) => {
      const existing = channelMap.get(network.channel) || { count: 0, networks: [] };
      existing.count++;
      existing.networks.push(network.ssid);
      channelMap.set(network.channel, existing);
    });

    const data = Array.from(channelMap.entries()).map(([channel, info]) => ({
      channel,
      count: info.count,
      networks: info.networks,
    }));

    setChannelData(data.sort((a, b) => a.channel - b.channel));
  }, []);

  const updateRssiHistory = useCallback((networks: WifiNetwork[]) => {
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const entry: { time: string; [key: string]: number | string } = { time };
    
    // Pega os top 5 networks por sinal
    const topNetworks = [...networks]
      .sort((a, b) => b.rssi - a.rssi)
      .slice(0, 5);
    
    topNetworks.forEach((network) => {
      entry[network.ssid] = network.rssi;
    });

    setRssiHistory((prev) => [...prev.slice(-19), entry]);
  }, []);

  const scanWifi = useCallback(async () => {
    if (connectionStatus !== "connected") {
      addLog("warning", "ESP32 nao conectado. Configure a conexao nas configuracoes.");
      return;
    }

    setIsScanning(true);
    addLog("info", "Iniciando scan de redes Wi-Fi...");

    try {
      const networks = await esp32Api.getWifiNetworks();
      setWifiNetworks(networks);
      setLastWifiScan(new Date());
      updateChannelData(networks);
      updateRssiHistory(networks);
      
      const openCount = networks.filter((n) => n.encryption === "Open").length;
      addLog("success", `${networks.length} redes Wi-Fi detectadas`);
      
      if (openCount > 0) {
        addLog("warning", `${openCount} rede(s) sem criptografia detectada(s)`);
      }

      // Atualiza historico de scan
      setScanHistory((prev) => {
        const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.time === time) {
          return [...prev.slice(0, -1), { ...lastEntry, wifi: networks.length }];
        }
        return [...prev.slice(-19), { time, wifi: networks.length, ble: bleDevices.length }];
      });
    } catch (err) {
      addLog("error", `Erro no scan Wi-Fi: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsScanning(false);
    }
  }, [connectionStatus, addLog, updateChannelData, updateRssiHistory, bleDevices.length]);

  const scanBle = useCallback(async () => {
    if (connectionStatus !== "connected") {
      addLog("warning", "ESP32 nao conectado. Configure a conexao nas configuracoes.");
      return;
    }

    setIsScanning(true);
    addLog("info", "Iniciando scan BLE...");

    try {
      const devices = await esp32Api.getBleDevices();
      setBleDevices(devices);
      setLastBleScan(new Date());
      addLog("success", `${devices.length} dispositivos BLE encontrados`);

      // Atualiza historico de scan
      setScanHistory((prev) => {
        const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.time === time) {
          return [...prev.slice(0, -1), { ...lastEntry, ble: devices.length }];
        }
        return [...prev.slice(-19), { time, wifi: wifiNetworks.length, ble: devices.length }];
      });
    } catch (err) {
      addLog("error", `Erro no scan BLE: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsScanning(false);
    }
  }, [connectionStatus, addLog, wifiNetworks.length]);

  const scanAll = useCallback(async () => {
    await scanWifi();
    await scanBle();
  }, [scanWifi, scanBle]);

  const startAutoScan = useCallback(() => {
    if (connectionStatus !== "connected") return;

    addLog("info", `Auto-scan iniciado: Wi-Fi a cada ${wifiScanInterval}s, BLE a cada ${bleScanInterval}s`);

    // Faz scan inicial
    scanAll();

    // Configura intervalos
    autoScanRef.current.wifi = setInterval(() => {
      scanWifi();
    }, wifiScanInterval * 1000);

    autoScanRef.current.ble = setInterval(() => {
      scanBle();
    }, bleScanInterval * 1000);
  }, [connectionStatus, wifiScanInterval, bleScanInterval, scanWifi, scanBle, scanAll, addLog]);

  const stopAutoScan = useCallback(() => {
    if (autoScanRef.current.wifi) {
      clearInterval(autoScanRef.current.wifi);
      autoScanRef.current.wifi = null;
    }
    if (autoScanRef.current.ble) {
      clearInterval(autoScanRef.current.ble);
      autoScanRef.current.ble = null;
    }
    addLog("info", "Auto-scan parado");
  }, [addLog]);

  // Limpa intervalos ao desmontar
  useEffect(() => {
    return () => {
      stopAutoScan();
    };
  }, [stopAutoScan]);

  // Para auto-scan se desconectar
  useEffect(() => {
    if (connectionStatus !== "connected") {
      stopAutoScan();
    }
  }, [connectionStatus, stopAutoScan]);

  return (
    <ScanContext.Provider
      value={{
        wifiNetworks,
        bleDevices,
        isScanning,
        lastWifiScan,
        lastBleScan,
        rssiHistory,
        channelData,
        scanHistory,
        logs,
        scanWifi,
        scanBle,
        scanAll,
        startAutoScan,
        stopAutoScan,
        addLog,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
}
