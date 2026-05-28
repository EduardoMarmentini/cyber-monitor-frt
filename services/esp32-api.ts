import type { WifiNetwork, WifiScanResult } from "@/types/wifi";
import type { BleDevice, BleScanResult } from "@/types/ble";
import type { Stats, StatsResponse, WifiConfigPayload, WifiConfigResponse } from "@/types/stats";

// Mantido para compatibilidade — será removido na Fase 3
export interface ESP32Config {
  ssid: string;
  password: string;
}

// Mantido para compatibilidade — será removido na Fase 3
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
    this.baseUrl = url.replace(/\/$/, "");
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

  // ─── Health ───────────────────────────────────────────

  // GET /
  async healthCheck(): Promise<boolean> {
    if (!this.baseUrl) return false;

    try {
      const response = await fetch(this.baseUrl, { method: "GET" });
      const text = await response.text();
      return text === "OK";
    } catch {
      return false;
    }
  }

  // ─── Stats ────────────────────────────────────────────

  // GET /api/stats
  async getStats(): Promise<Stats> {
    const result = await this.request<StatsResponse>("/api/stats");
    return result.data;
  }

  // ─── Wi-Fi Scan ───────────────────────────────────────

  // GET /api/wifi
  async scanWifi(): Promise<WifiScanResult> {
    return this.request<WifiScanResult>("/api/wifi");
  }

  async getWifiNetworks(): Promise<WifiNetwork[]> {
    const result = await this.scanWifi();
    return result.data;
  }

  // ─── BLE Scan ─────────────────────────────────────────

  // GET /api/ble
  async scanBle(): Promise<BleScanResult> {
    return this.request<BleScanResult>("/api/ble");
  }

  async getBleDevices(): Promise<BleDevice[]> {
    const result = await this.scanBle();
    return result.data;
  }

  // ─── WiFi Config ──────────────────────────────────────

  // GET /api/config/wifi
  async getWifiConfig(): Promise<{ ssid: string }> {
    return this.request<{ ssid: string }>("/api/config/wifi");
  }

  // POST /api/config/wifi
  async configureWifi(payload: WifiConfigPayload): Promise<WifiConfigResponse> {
    return this.request<WifiConfigResponse>("/api/config/wifi", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // ─── Deprecated — mantido para compatibilidade ────────

  /** @deprecated Use configureWifi() */
  async connect(config: ESP32Config): Promise<{ success: boolean; ip: string }> {
    const result = await this.configureWifi(config);
    return { success: result.success, ip: result.ip ?? "" };
  }

  /** @deprecated Não existe mais na API */
  async disconnect(): Promise<{ success: boolean }> {
    return { success: true };
  }

  /** @deprecated Use getStats() */
  async getStatus(): Promise<ESP32Status> {
    const stats = await this.getStats();
    return {
      online: true,
      ip: "",
      rssi: 0,
      freeHeap: 0,
      uptime: stats.uptime,
    };
  }

  /** @deprecated Use healthCheck() */
  async ping(): Promise<boolean> {
    return this.healthCheck();
  }

  /** @deprecated Não existe mais na API */
  async getConfig(): Promise<{ wifiInterval: number; bleInterval: number }> {
    return { wifiInterval: 5, bleInterval: 10 };
  }

  /** @deprecated Não existe mais na API */
  async setConfig(): Promise<{ success: boolean }> {
    return { success: true };
  }
}

// Singleton export
export const esp32Api = new ESP32ApiService();
