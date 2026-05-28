# Fase 3 — Atualizar Contexts (ESP32 + Scan)

## Objetivo

Atualizar os dois contextos para usar os serviços corrigidos e integrar o WebSocket.

## Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `contexts/esp32-context.tsx` | Adicionar `stats`, corrigir `connect()`/`refreshStatus()` |
| `contexts/scan-context.tsx` | Integrar WS, corrigir `scanWifi()`/`scanBle()` |

## Detalhamento

### 1. `contexts/esp32-context.tsx`

**Mudanças:**

- `connect(config)` agora chama `esp32Api.configureWifi({ ssid, password })` → `POST /api/config/wifi`
- `refreshStatus()` agora chama `esp32Api.getStats()` → `GET /api/stats` e armazena `Stats`
- Adicionar `stats: Stats | null` no estado e no context
- Adicionar `isOnline: boolean` derivado do health check
- Remover `ping()` → substituir por `healthCheck()` → `GET /`
- `setEndpoint(url)` agora faz health check imediato (`GET /`) para validar conexão

**Novas interfaces no context:**

```typescript
interface ESP32ContextType {
  // ... existentes
  stats: Stats | null;
  isOnline: boolean;
  refreshStats: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
}
```

### 2. `contexts/scan-context.tsx`

**Mudanças:**

- `scanWifi()` → `esp32Api.getWifiNetworks()` acessa `result.data` em vez de `result.networks`
- `scanBle()` → `esp32Api.getBleDevices()` acessa `result.data` em vez de `result.devices`
- Ao conectar, abrir WebSocket via `websocketService.connect()`
- Ao desconectar, fechar WebSocket via `websocketService.disconnect()`
- `WIFI_UPDATE`: encontrar rede por BSSID e atualizar (ou adicionar se nova)
- `BLE_UPDATE`: encontrar dispositivo por MAC e atualizar (ou adicionar se novo)
- Manter polling como fallback (quando WS não está conectado)
- Atualizar `lastSeen` localmente ao receber dados (`Date.now()`)

**WebSocket integrado no ScanContext:**

```typescript
useEffect(() => {
  if (connectionStatus !== "connected") return;
  
  const ws = websocketService.connect(api.getBaseUrl(), {
    onWifiUpdate: (network) => {
      setWifiNetworks(prev => updateOrAdd(prev, "bssid", { ...network, lastSeen: Date.now() }));
      updateRssiHistory(...);
      updateChannelData(...);
    },
    onBleUpdate: (device) => {
      setBleDevices(prev => updateOrAdd(prev, "mac", { ...device, lastSeen: Date.now() }));
    },
    onStatusChange: (connected) => { ... },
  });

  return () => websocketService.disconnect();
}, [connectionStatus]);
```

## Verificação

- Conectar e ver se scans funcionam com endpoint correto
- Verificar dados aparecendo nas tabelas e gráficos
- Testar WebSocket com ESP32 real

## Dependências

Fases 1 e 2 concluídas.
