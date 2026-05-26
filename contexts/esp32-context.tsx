"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { esp32Api, type ESP32Config, type ESP32Status } from "@/services/esp32-api";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ESP32ContextType {
  // Estado de conexao
  connectionStatus: ConnectionStatus;
  endpoint: string;
  status: ESP32Status | null;
  error: string | null;

  // Configuracoes de scan
  wifiScanInterval: number;
  bleScanInterval: number;

  // Acoes
  connect: (config: ESP32Config) => Promise<boolean>;
  disconnect: () => void;
  setEndpoint: (url: string) => void;
  setScanIntervals: (wifi: number, ble: number) => void;
  refreshStatus: () => Promise<void>;
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
  const [status, setStatus] = useState<ESP32Status | null>(null);
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

  // Verificar conexao periodicamente
  useEffect(() => {
    if (connectionStatus !== "connected" || !endpoint) return;

    const checkConnection = async () => {
      const isOnline = await esp32Api.ping();
      if (!isOnline) {
        setConnectionStatus("error");
        setError("Conexao perdida com o ESP32");
      }
    };

    const interval = setInterval(checkConnection, 10000);
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
      const result = await esp32Api.connect(config);
      if (result.success) {
        setConnectionStatus("connected");
        return true;
      } else {
        setConnectionStatus("error");
        setError("Falha ao conectar");
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
    setStatus(null);
    setError(null);
    esp32Api.setBaseUrl("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setScanIntervals = useCallback((wifi: number, ble: number) => {
    setWifiScanInterval(wifi);
    setBleScanInterval(ble);
  }, []);

  const refreshStatus = useCallback(async () => {
    if (connectionStatus !== "connected") return;
    
    try {
      const newStatus = await esp32Api.getStatus();
      setStatus(newStatus);
    } catch (err) {
      console.error("Erro ao buscar status:", err);
    }
  }, [connectionStatus]);

  return (
    <ESP32Context.Provider
      value={{
        connectionStatus,
        endpoint,
        status,
        error,
        wifiScanInterval,
        bleScanInterval,
        connect,
        disconnect,
        setEndpoint,
        setScanIntervals,
        refreshStatus,
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
