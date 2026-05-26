import type { WifiNetwork, WifiScanResult } from "@/types/wifi";
import type { BleDevice, BleScanResult } from "@/types/ble";

export interface ESP32Config {
  ssid: string;
  password: string;
}

export interface ESP32Status {
  online: boolean;
  ip: string;
  rssi: number;
  freeHeap: number;
  uptime: number;
}

class ESP32ApiService {
  private baseUrl: string = "";

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, ""); // Remove trailing slash
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("ESP32 endpoint not configured");
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Conexao Wi-Fi
  async connect(config: ESP32Config): Promise<{ success: boolean; ip: string }> {
    return this.request("/wifi/connect", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  async disconnect(): Promise<{ success: boolean }> {
    return this.request("/wifi/disconnect", { method: "POST" });
  }

  // Status do ESP32
  async getStatus(): Promise<ESP32Status> {
    return this.request("/status");
  }

  // Scan Wi-Fi
  async scanWifi(): Promise<WifiScanResult> {
    return this.request("/scan/wifi");
  }

  async getWifiNetworks(): Promise<WifiNetwork[]> {
    const result = await this.scanWifi();
    return result.networks;
  }

  // Scan BLE
  async scanBle(): Promise<BleScanResult> {
    return this.request("/scan/ble");
  }

  async getBleDevices(): Promise<BleDevice[]> {
    const result = await this.scanBle();
    return result.devices;
  }

  // Configuracoes
  async getConfig(): Promise<{ wifiInterval: number; bleInterval: number }> {
    return this.request("/config");
  }

  async setConfig(config: { wifiInterval?: number; bleInterval?: number }): Promise<{ success: boolean }> {
    return this.request("/config", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  // Ping para verificar conexao
  async ping(): Promise<boolean> {
    try {
      await this.request("/ping");
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton export
export const esp32Api = new ESP32ApiService();
