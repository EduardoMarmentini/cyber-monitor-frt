export interface Stats {
  wifiNetworks: number;
  bleDevices: number;
  uptime: number;
}

export interface StatsResponse {
  success: boolean;
  data: Stats;
}

export interface WifiConfigPayload {
  ssid: string;
  password?: string;
}

export interface WifiConfigResponse {
  success: boolean;
  message: string;
  ip?: string;
}
