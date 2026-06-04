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
import { esp32Api } from "@/services/esp32-api";
import type { Stats } from "@/types/stats";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ESP32ContextType {
  connectionStatus: ConnectionStatus;
  endpoint: string;
  stats: Stats | null;
  isOnline: boolean;
  error: string | null;
  wifiScanInterval: number;
  manualConnect: (endpoint: string) => Promise<boolean>;
  disconnect: () => void;
  setEndpoint: (url: string) => void;
  setScanIntervals: (wifi: number) => void;
  refreshStats: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
}

const ESP32Context = createContext<ESP32ContextType | undefined>(undefined);

const STORAGE_KEY = "esp32_config";
const DEFAULT_ENDPOINT = "http://esp32.local:8080";

interface StoredConfig {
  endpoint: string;
  wifiScanInterval: number;
}

export function ESP32Provider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [endpoint, setEndpointState] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wifiScanInterval, setWifiScanInterval] = useState(5);

  // Carregar config salva + tentar conexao automatica
  useEffect(() => {
    const init = async () => {
      let targetEndpoint = DEFAULT_ENDPOINT;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const config: StoredConfig = JSON.parse(stored);
          if (config.endpoint) targetEndpoint = config.endpoint;
          if (config.wifiScanInterval) setWifiScanInterval(config.wifiScanInterval);
        }
      } catch {
        // ignore
      }

      const online = await esp32Api.checkConnection(targetEndpoint);
      if (online) {
        setEndpointState(targetEndpoint);
        esp32Api.setBaseUrl(targetEndpoint);
        setConnectionStatus("connected");
        setIsOnline(true);
      } else if (targetEndpoint !== DEFAULT_ENDPOINT) {
        const fallbackOnline = await esp32Api.checkConnection(DEFAULT_ENDPOINT);
        if (fallbackOnline) {
          setEndpointState(DEFAULT_ENDPOINT);
          esp32Api.setBaseUrl(DEFAULT_ENDPOINT);
          setConnectionStatus("connected");
          setIsOnline(true);
        }
      }
    };

    init();
  }, []);

  // Salvar config
  useEffect(() => {
    if (endpoint) {
      const config: StoredConfig = { endpoint, wifiScanInterval };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [endpoint, wifiScanInterval]);

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
    const interval = setInterval(check, 60000);
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

  const manualConnect = useCallback(async (endpointUrl: string): Promise<boolean> => {
    setConnectionStatus("connecting");
    setError(null);

    try {
      const online = await esp32Api.checkConnection(endpointUrl);
      if (online) {
        setEndpointState(endpointUrl);
        esp32Api.setBaseUrl(endpointUrl);
        setConnectionStatus("connected");
        setIsOnline(true);
        return true;
      } else {
        setConnectionStatus("error");
        setError("ESP32 não está respondendo em " + endpointUrl);
        return false;
      }
    } catch (err) {
      setConnectionStatus("error");
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnectionStatus("disconnected");
    setEndpointState("");
    setStats(null);
    setIsOnline(false);
    setError(null);
    esp32Api.setBaseUrl("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setScanIntervals = useCallback((wifi: number) => {
    setWifiScanInterval(wifi);
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
        manualConnect,
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
