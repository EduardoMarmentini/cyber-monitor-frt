# Fase 1 — Corrigir Types + API Service

## Objetivo

Ajustar os tipos TypeScript para espelhar exatamente a API documentada e reescrever o service para usar os endpoints corretos.

## Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `types/wifi.ts` | Renomear `WifiScanResult.networks` → `data` |
| `types/ble.ts` | Renomear `BleScanResult.devices` → `data` |
| `types/stats.ts` | **Criar** com `Stats`, `WifiConfigResponse`, `WifiConfigPayload` |
| `services/esp32-api.ts` | Reescrever endpoints e métodos |

## Detalhamento

### 1. `types/wifi.ts`

```diff
- networks: WifiNetwork[];
+ data: WifiNetwork[];
```

### 2. `types/ble.ts`

```diff
- devices: BleDevice[];
+ data: BleDevice[];
```

Manter `manufacturer?: string` e `lastSeen: number` — são opcionais/preenchidos localmente.

### 3. `types/stats.ts` (novo)

```typescript
export interface Stats {
  wifiNetworks: number;
  bleDevices: number;
  uptime: number; // segundos
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
```

### 4. `services/esp32-api.ts`

Reescrita completa dos métodos para os endpoints documentados:

| Método Atual | Endpoint Atual | → Novo Método | Novo Endpoint |
|---|---|---|---|
| `connect(config)` | `POST /wifi/connect` | `configureWifi(payload)` | `POST /api/config/wifi` |
| `disconnect()` | `POST /wifi/disconnect` | **remover** | — |
| `getStatus()` | `GET /status` | `getStats()` | `GET /api/stats` |
| `scanWifi()` | `GET /scan/wifi` | `scanWifi()` | `GET /api/wifi` |
| `getWifiNetworks()` | — (chama scanWifi) | `getWifiNetworks()` | acessa `.data` |
| `scanBle()` | `GET /scan/ble` | `scanBle()` | `GET /api/ble` |
| `getBleDevices()` | — (chama scanBle) | `getBleDevices()` | acessa `.data` |
| `getConfig()` | `GET /config` | **remover** | — |
| `setConfig()` | `POST /config` | **remover** | — |
| `ping()` | `GET /ping` | `healthCheck()` | `GET /` |
| — | — | `getWifiConfig()` | `GET /api/config/wifi` |

### 5. Atualizar consumidores do tipo `WifiScanResult`/`BleScanResult`

Em `scan-context.tsx`, onde `esp32Api.getWifiNetworks()` e `esp32Api.getBleDevices()` são chamados, eles agora acessam `result.data` em vez de `result.networks`/`result.devices`.

## Verificação

- `npm run typecheck` (ou `npx tsc --noEmit`)
- `npm run lint`

## Dependências

Nenhuma — é a primeira fase.
