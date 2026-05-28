"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { esp32Api, type ESP32Config } from "@/services/esp32-api";
import type { Stats } from "@/types/stats";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ESP32ContextType {
  connectionStatus: ConnectionStatus;
  endpoint: string;
  stats: Stats | null;
  isOnline: boolean;
  error: string | null;

  wifiScanInterval: number;
  bleScanInterval: number;

  connect: (config: ESP32Config) => Promise<boolean>;
  disconnect: () => void;
  setEndpoint: (url: string) => void;
  setScanIntervals: (wifi: number, ble: number) => void;
  refreshStats: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
}

const ESP32Context = createContext<ESP32ContextType | undefined>(undefined);

const STORAGE_KEY = "esp32_config";

interface StoredConfig {
  endpoint: string;
  wifiScanInterval: number;
  bleScanInterval: number;
}

export function ESP32Provider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [endpoint, setEndpointState] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wifiScanInterval, setWifiScanInterval] = useState(5);
  const [bleScanInterval, setBleScanInterval] = useState(10);

  // Carregar configuracoes salvas
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config: StoredConfig = JSON.parse(stored);
        if (config.endpoint) {
          setEndpointState(config.endpoint);
          esp32Api.setBaseUrl(config.endpoint);
        }
        if (config.wifiScanInterval) setWifiScanInterval(config.wifiScanInterval);
        if (config.bleScanInterval) setBleScanInterval(config.bleScanInterval);
      }
    } catch {
      // Ignora erros de parse
    }
  }, []);

  // Salvar configuracoes
  const saveConfig = useCallback(() => {
    const config: StoredConfig = {
      endpoint,
      wifiScanInterval,
      bleScanInterval,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [endpoint, wifiScanInterval, bleScanInterval]);

  useEffect(() => {
    saveConfig();
  }, [saveConfig]);

  // Health check periodico
  useEffect(() => {
    if (connectionStatus !== "connected" || !endpoint) return;

    const check = async () => {
      const online = await esp32Api.healthCheck();
      setIsOnline(online);
      if (!online) {
        setConnectionStatus("error");
        setError("Conexao perdida com o ESP32");
        toast.error("Conexão perdida", {
          description: "ESP32 não está respondendo",
        });
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [connectionStatus, endpoint]);

  const setEndpoint = useCallback((url: string) => {
    setEndpointState(url);
    esp32Api.setBaseUrl(url);
    if (url) {
      setConnectionStatus("connected");
      setError(null);
    }
  }, []);

  const connect = useCallback(async (config: ESP32Config): Promise<boolean> => {
    if (!endpoint) {
      setError("Endpoint nao configurado");
      return false;
    }

    setConnectionStatus("connecting");
    setError(null);

    try {
      const result = await esp32Api.configureWifi(config);
      if (result.success) {
        setConnectionStatus("connected");
        return true;
      } else {
        setConnectionStatus("error");
        setError(result.message || "Falha ao conectar");
        return false;
      }
    } catch (err) {
      setConnectionStatus("error");
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return false;
    }
  }, [endpoint]);

  const disconnect = useCallback(() => {
    setConnectionStatus("disconnected");
    setEndpointState("");
    setStats(null);
    setIsOnline(false);
    setError(null);
    esp32Api.setBaseUrl("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setScanIntervals = useCallback((wifi: number, ble: number) => {
    setWifiScanInterval(wifi);
    setBleScanInterval(ble);
  }, []);

  const refreshStats = useCallback(async () => {
    if (connectionStatus !== "connected") return;

    try {
      const newStats = await esp32Api.getStats();
      setStats(newStats);
      setIsOnline(true);
    } catch (err) {
      console.error("Erro ao buscar stats:", err);
    }
  }, [connectionStatus]);

  const healthCheck = useCallback(async (): Promise<boolean> => {
    return esp32Api.healthCheck();
  }, []);

  return (
    <ESP32Context.Provider
      value={{
        connectionStatus,
        endpoint,
        stats,
        isOnline,
        error,
        wifiScanInterval,
        bleScanInterval,
        connect,
        disconnect,
        setEndpoint,
        setScanIntervals,
        refreshStats,
        healthCheck,
      }}
    >
      {children}
    </ESP32Context.Provider>
  );
}

export function useESP32() {
  const context = useContext(ESP32Context);
  if (context === undefined) {
    throw new Error("useESP32 must be used within an ESP32Provider");
  }
  return context;
}
