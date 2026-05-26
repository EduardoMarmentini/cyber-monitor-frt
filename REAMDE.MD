# ESP32 Cyber Monitor — DashBoard Frontend

<p align="center">
  <img src="./public/cyber-monitor-logo-repo.png" width="300" />
</p>

<p align="center">
  Real-time Wi-Fi & BLE monitoring dashboard powered by ESP32.
</p>

---

# Visão Geral

O frontend será responsável por:

* Exibição realtime de redes Wi-Fi
* Exibição realtime de dispositivos BLE
* Dashboard visual
* Consumo da API REST do ESP32
* Comunicação WebSocket
* Métricas do dispositivo
* Logs visuais
* Monitoramento em tempo real

---

# Objetivos do Frontend

## Principais responsabilidades

* Consumir API do ESP32
* Consumir eventos realtime
* Exibir redes Wi-Fi detectadas
* Exibir dispositivos BLE
* Atualizar dashboard automaticamente
* Exibir métricas e estatísticas
* Gerenciar estado global
* Fornecer interface moderna e responsiva

---

# Stack

## Framework

* Next.js
* React

---

# UI

* Tailwind CSS
* shadcn/ui
* Lucide Icons

---

# Realtime

* WebSocket API

---

# Estrutura do Projeto

```txt
/frontend
 ├── public
 │   └── cyber-monitor-logo-repo.png
 │
 ├── src
 │   ├── app
 │   │   ├── layout.tsx
 │   │   ├── page.tsx
 │   │   └── globals.css
 │   │
 │   ├── components
 │   │   ├── dashboard
 │   │   │   ├── wifi-card.tsx
 │   │   │   ├── ble-card.tsx
 │   │   │   ├── stats-card.tsx
 │   │   │   └── realtime-log.tsx
 │   │   │
 │   │   ├── layout
 │   │   │   ├── sidebar.tsx
 │   │   │   ├── navbar.tsx
 │   │   │   └── footer.tsx
 │   │   │
 │   │   └── ui
 │   │
 │   ├── contexts
 │   │   ├── wifi-context.tsx
 │   │   ├── ble-context.tsx
 │   │   └── websocket-context.tsx
 │   │
 │   ├── services
 │   │   ├── api.service.ts
 │   │   ├── websocket.service.ts
 │   │   └── stats.service.ts
 │   │
 │   ├── hooks
 │   │   ├── useWifi.ts
 │   │   ├── useBle.ts
 │   │   └── useRealtime.ts
 │   │
 │   ├── types
 │   │   ├── wifi-network.ts
 │   │   ├── ble-device.ts
 │   │   └── stats.ts
 │   │
 │   └── config
 │       └── env.ts
 │
 ├── package.json
 ├── tailwind.config.ts
 ├── tsconfig.json
 └── README.md
```

---

# Objetivo Visual

O dashboard terá foco em:

* Cyber aesthetic
* Tons escuros
* Roxo neon
* Branco
* Interface realtime
* Cards modernos
* Visual inspirado em monitoramento de rede/hacking

---

# Funcionalidades

# Dashboard

## Exibição

* Redes Wi-Fi detectadas
* Dispositivos BLE
* Intensidade de sinal
* Quantidade de dispositivos
* Logs realtime
* Status do ESP32
* Uptime
* Métricas gerais

---

# Comunicação

# API REST

## Base URL

```txt
http://ESP32_IP:8080/api
```

---

# Endpoints Consumidos

## GET /api/wifi

Retorna redes Wi-Fi detectadas.

---

## GET /api/ble

Retorna dispositivos BLE.

---

## GET /api/stats

Retorna métricas gerais.

---

# WebSocket

## Endpoint

```txt
ws://ESP32_IP:8080/ws
```

---

# Eventos Consumidos

## WIFI_UPDATE

```json
{
  "event": "WIFI_UPDATE",
  "payload": {
    "ssid": "NETGEAR",
    "rssi": -40
  }
}
```

---

## BLE_UPDATE

```json
{
  "event": "BLE_UPDATE",
  "payload": {
    "name": "Smart Watch",
    "rssi": -58
  }
}
```

---

# Arquitetura Frontend

# Contexts

## wifi-context.tsx

Responsável por:

* armazenar redes Wi-Fi
* sincronizar API
* atualizar realtime

---

## ble-context.tsx

Responsável por:

* armazenar dispositivos BLE
* sincronizar eventos realtime

---

## websocket-context.tsx

Responsável por:

* conexão realtime
* reconexão
* listeners
* dispatch de eventos

---

# Services

# api.service.ts

Responsável por:

* chamadas HTTP
* abstração REST
* tratamento de erros

---

# websocket.service.ts

Responsável por:

* conexão WebSocket
* eventos realtime
* reconexão automática

---

# Hooks

# useWifi.ts

```ts
const { networks, refresh } = useWifi();
```

---

# useBle.ts

```ts
const { devices } = useBle();
```

---

# useRealtime.ts

```ts
const { connected } = useRealtime();
```

---

# Tipagem

# wifi-network.ts

```ts
export interface WifiNetwork {
  ssid: string;
  bssid: string;
  rssi: number;
  channel: number;
  encryption: string;
}
```

---

# ble-device.ts

```ts
export interface BleDevice {
  name: string;
  mac: string;
  rssi: number;
  uuid: string;
}
```

---

# stats.ts

```ts
export interface Stats {
  wifiNetworks: number;
  bleDevices: number;
  uptime: number;
}
```

---

# Fluxo do Frontend

```txt
Next.js App
    ↓
Contexts
    ↓
API/WebSocket Services
    ↓
ESP32
    ↓
Realtime Updates
    ↓
UI Rendering
```

---

# Responsabilidades

# components/

Componentes visuais.

---

# services/

Comunicação externa.

---

# contexts/

Estado global.

---

# hooks/

Abstração de lógica React.

---

# types/

Tipagem TypeScript.

---

# config/

Configurações globais.

---

# Variáveis de Ambiente

# .env.local

```env
NEXT_PUBLIC_ESP32_HOST=192.168.0.10
NEXT_PUBLIC_ESP32_PORT=8080
```

---

# Convenções

# Arquivos

snake_case.

```txt
wifi-card.tsx
```

---

# Componentes

PascalCase.

```tsx
export function WifiCard() {}
```

---

# Hooks

camelCase.

```ts
useRealtime();
```

---

# Futuras Expansões

* Heatmap Wi-Fi
* Histórico de scans
* Gráficos realtime
* MQTT
* Multi-device support
* Sistema de alertas
* Autenticação
* Dark/Light themes
* Mobile dashboard
* Exportação CSV/JSON
