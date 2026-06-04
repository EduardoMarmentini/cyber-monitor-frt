import type { WifiNetwork } from "@/types/wifi";
// BLE desativado (Arduino limitado)
// import type { BleDevice } from "@/types/ble";

export type WsEventPayload =
  | { event: "WIFI_UPDATE"; timestamp: number; payload: WifiNetwork };
  // BLE desativado
  // | { event: "BLE_UPDATE"; timestamp: number; payload: BleDevice };

export interface WsCallbacks {
  onWifiUpdate?: (network: WifiNetwork) => void;
  // BLE desativado
  // onBleUpdate?: (device: BleDevice) => void;
  onStatusChange?: (connected: boolean) => void;
  onError?: (error: Event) => void;
}

const RECONNECT_DELAYS = [3000, 5000, 10000, 30000];

class WebSocketService {
  private ws: WebSocket | null = null;
  private baseUrl: string = "";
  private callbacks: WsCallbacks = {};
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;

  private getWsUrl(): string {
    const host = this.baseUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");
    return `ws://${host}/ws`;
  }

  connect(baseUrl: string, callbacks: WsCallbacks): void {
    this.disconnect();

    this.baseUrl = baseUrl;
    this.callbacks = callbacks;
    this.shouldReconnect = true;
    this.reconnectAttempt = 0;

    this.createConnection();
  }

  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.callbacks = {};
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private createConnection(): void {
    if (!this.shouldReconnect || !this.baseUrl) return;

    const url = this.getWsUrl();
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.callbacks.onStatusChange?.(true);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WsEventPayload;

        if (data.event === "WIFI_UPDATE") {
          this.callbacks.onWifiUpdate?.(data.payload);
        }
        // BLE desativado
        // else if (data.event === "BLE_UPDATE") {
        //   this.callbacks.onBleUpdate?.(data.payload);
        // }
      } catch {
        // Ignora mensagens que não são JSON válido
      }
    };

    this.ws.onerror = (error: Event) => {
      this.callbacks.onError?.(error);
    };

    this.ws.onclose = () => {
      this.callbacks.onStatusChange?.(false);

      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    const delay = RECONNECT_DELAYS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)];
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, delay);
  }
}

export const websocketService = new WebSocketService();
