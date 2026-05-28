# Fase 5 — Integrar Stats na UI

## Objetivo

Exibir as estatísticas do ESP32 (`GET /api/stats`) na interface — uptime, contagens oficiais do dispositivo.

## Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `components/sidebar/sidebar.tsx` | Adicionar uptime na sidebar |
| `app/page.tsx` | Opcional: exibir uptime no dashboard |

## Detalhamento

### 1. `components/sidebar/sidebar.tsx`

Adicionar na seção de status do ESP32:

- Uptime formatado (dias, horas, minutos)
- Stats vindos do `useESP32().stats`

### 2. `app/page.tsx` (opcional)

Adicionar no dashboard um card ou indicador de uptime.

## Verificação

- Conectar ao ESP32 e ver uptime aparecendo na sidebar
- Ver contagens de wifi/ble vindo do stats (pode ser útil como fallback)

## Dependências

Fase 3 concluída (stats disponível no ESP32Context).
