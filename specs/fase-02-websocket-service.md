# Fase 2 — WebSocket Service

## Objetivo

Criar serviço de WebSocket para consumir eventos em tempo real (`WIFI_UPDATE`, `BLE_UPDATE`) com reconexão automática.

## Arquivos Criados/Modificados

| Arquivo | Ação |
|---------|------|
| `services/websocket.ts` | **Criar** |

## Detalhamento

### `services/websocket.ts`

```typescript
export type WsEvent =
  | { event: "WIFI_UPDATE"; timestamp: number; payload: WifiNetwork }
  | { event: "BLE_UPDATE"; timestamp: number; payload: BleDevice };

interface WsCallbacks {
  onWifiUpdate?: (network: WifiNetwork) => void;
  onBleUpdate?: (device: BleDevice) => void;
  onStatusChange?: (connected: boolean) => void;
  onError?: (error: Event) => void;
}
```

**Responsabilidades:**

- Conectar em `ws://{host}/ws`
- Reconexão automática com backoff: 3s → 5s → 10s → 30s (max)
- Parse automático das mensagens JSON
- Dispatch para callbacks por tipo de evento
- Cleanup completo no `disconnect()`
- Fechar conexão se ficar inativa por muito tempo
- Não expor o WebSocket bruto — apenas interface limpa

**Métodos:**

- `connect(baseUrl: string, callbacks: WsCallbacks): void`
- `disconnect(): void`
- `isConnected(): boolean`

## Verificação

- Testar manualmente com ESP32 real ou simulador
- Verificar reconexão ao derrubar a conexão
- Verificar parsing correto dos eventos

## Dependências

Fase 1 concluída (tipos corretos).
