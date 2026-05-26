export interface WifiNetwork {
  ssid: string;
  bssid: string;
  rssi: number;
  channel: number;
  encryption: string;
  lastSeen: number;
}

export interface WifiScanResult {
  success: boolean;
  timestamp: number;
  count: number;
  networks: WifiNetwork[];
}
