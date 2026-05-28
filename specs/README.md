# Plano de Integração ESP32 API ↔ Frontend

## Diagnóstico

| Problema | Detalhe |
|----------|---------|
| Endpoints errados | Service usa `/scan/wifi`, `/scan/ble`, `/status`, `/ping` — API documentada usa `/api/wifi`, `/api/ble`, `/api/stats`, `/` |
| Campo `data` vs `networks`/`devices` | API retorna `{ data: [...] }` mas os types esperam `{ networks: [...] }` / `{ devices: [...] }` |
| Sem WebSocket | API documenta `ws://.../ws` com eventos `WIFI_UPDATE` e `BLE_UPDATE`, mas o frontend só faz polling |
| Sem `/api/stats` | endpoint de estatísticas (uptime, contagens) não é consumido |
| SettingsPage mockada | `handleConnect` usa `setTimeout` em vez de chamar `POST /api/config/wifi` real |
| Types com campos extras | `BleDevice` tem `manufacturer?` e `lastSeen` que a API não retorna |

## Arquitetura Final

```
LAYOUT (ESP32Provider → ScanProvider)
  │
  ├─ ESP32Context ────────── gerenciamento de conexão
  │   ├─ connect()        → POST /api/config/wifi
  │   ├─ healthCheck()    → GET  /
  │   ├─ getStats()       → GET  /api/stats
  │   └─ setEndpoint()    → configura URL base
  │
  ├─ ScanContext ─────────── dados de scan + tempo real
  │   ├─ scanWifi()       → GET  /api/wifi
  │   ├─ scanBle()        → GET  /api/ble
  │   ├─ WebSocket /ws    → WIFI_UPDATE / BLE_UPDATE
  │   └─ polling como fallback
  │
  └─ Serviços
      ├─ services/esp32-api.ts   ← endpoints corrigidos
      └─ services/websocket.ts   ← NOVO
```

## Fluxo de Dados

```
[Abrir página]
  ↓
ESP32Provider carrega config salva (localStorage)
  ↓
Se endpoint configurado:
  ├─ GET  /              → health check
  ├─ GET  /api/stats     → uptime, contagens
  ├─ GET  /api/wifi      → redes WiFi (data)
  ├─ GET  /api/ble       → dispositivos BLE (data)
  └─ WS   /ws            → tempo real
       ├─ WIFI_UPDATE → atualiza wifiNetworks + gráficos
       └─ BLE_UPDATE  → atualiza bleDevices
  ↓
ScanContext gerencia estado + polling fallback
  ↓
Componentes re-renderizam via useContext
```
