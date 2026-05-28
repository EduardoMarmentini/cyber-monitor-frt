# ESP32 Cyber Monitor — API Reference

## Base URL

```txt
http://esp32.local:8080
```

## WebSocket

```txt
ws://esp32.local:8080/ws
```

> Caso o mDNS não funcione, utilize o IP mostrado no monitor serial ou identificado no roteador.

---

# 1. Health Check

## GET /

### Response — 200 OK

```txt
OK
```

---

# 2. Listar Redes WiFi

## GET /api/wifi

### Response — 200 OK

```json
{
  "success": true,
  "timestamp": 12345678,
  "count": 3,
  "data": [
    {
      "ssid": "NETGEAR",
      "bssid": "00:11:22:33:44:55",
      "rssi": -42,
      "channel": 6,
      "encryption": "WPA2"
    }
  ]
}
```

## Campos

| Campo      | Tipo   | Descrição                   |
| ---------- | ------ | --------------------------- |
| ssid       | string | Nome da rede                |
| bssid      | string | MAC do roteador             |
| rssi       | int    | Intensidade do sinal em dBm |
| channel    | int    | Canal WiFi                  |
| encryption | string | Tipo de criptografia        |

## Valores possíveis para encryption

* Open
* WEP
* WPA
* WPA2
* WPA3
* WPA2 Enterprise
* Unknown

> `Open` significa rede sem senha.

---

# 3. Listar Dispositivos BLE

## GET /api/ble

### Response — 200 OK

```json
{
  "success": true,
  "timestamp": 12345678,
  "count": 2,
  "data": [
    {
      "name": "Galaxy Buds",
      "mac": "11:22:33:44:55:66",
      "rssi": -61,
      "uuid": "180D"
    }
  ]
}
```

## Campos

| Campo | Tipo   | Descrição            |
| ----- | ------ | -------------------- |
| name  | string | Nome do dispositivo  |
| mac   | string | Endereço MAC         |
| rssi  | int    | Intensidade do sinal |
| uuid  | string | UUID BLE             |

---

# 4. Estatísticas do Dispositivo

## GET /api/stats

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "wifiNetworks": 5,
    "bleDevices": 3,
    "uptime": 3600
  }
}
```

## Campos

| Campo        | Tipo | Descrição                |
| ------------ | ---- | ------------------------ |
| wifiNetworks | int  | Redes detectadas         |
| bleDevices   | int  | Dispositivos BLE         |
| uptime       | int  | Tempo ligado em segundos |

---

# 5. Ver Rede Configurada

## GET /api/config/wifi

### Response — 200 OK

```json
{
  "ssid": "MinhaRede"
}
```

> A senha nunca é retornada pela API.

---

# 6. Alterar Rede WiFi

## POST /api/config/wifi

### Headers

```txt
Content-Type: application/json
```

### Request

```json
{
  "ssid": "NovaRede",
  "password": "senha123"
}
```

## Campos

| Campo    | Obrigatório | Descrição     |
| -------- | ----------- | ------------- |
| ssid     | sim         | Nome da rede  |
| password | não         | Senha da rede |

---

## Resposta — Conectado

```json
{
  "success": true,
  "message": "Connected to NovaRede",
  "ip": "192.168.1.100"
}
```

---

## Resposta — Falha

```json
{
  "success": false,
  "message": "Failed to connect to NovaRede"
}
```

---

## Resposta — SSID inválido

```json
{
  "success": false,
  "message": "SSID is required"
}
```

---

## Resposta — JSON inválido

```json
{
  "success": false,
  "message": "Invalid JSON"
}
```

> Ao trocar de rede o IP muda. Utilize `esp32.local` para evitar depender do IP fixo.

---

# 7. WebSocket — Tempo Real

## Endpoint

```txt
ws://esp32.local:8080/ws
```

Mantenha a conexão aberta para receber eventos em tempo real.

---

# Evento — WIFI_UPDATE

```json
{
  "event": "WIFI_UPDATE",
  "timestamp": 12345678,
  "payload": {
    "ssid": "NETGEAR",
    "bssid": "00:11:22:33:44:55",
    "rssi": -42,
    "channel": 6,
    "encryption": "WPA2"
  }
}
```

---

# Evento — BLE_UPDATE

```json
{
  "event": "BLE_UPDATE",
  "timestamp": 12345678,
  "payload": {
    "name": "Galaxy Buds",
    "mac": "11:22:33:44:55:66",
    "rssi": -61,
    "uuid": "180D"
  }
}
```

---

# 8. Fluxo Recomendado do Frontend

```txt
[Abrir página]
    │
    ├── GET /api/stats
    ├── GET /api/wifi
    ├── GET /api/ble
    └── WebSocket /ws
         │
         ├── WIFI_UPDATE
         └── BLE_UPDATE
```

---

# Exemplo — WebSocket

```javascript
const ws = new WebSocket(`ws://${window.location.hostname}:8080/ws`)

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  if (msg.event === "WIFI_UPDATE") {
    adicionarNaListaWifi(msg.payload)
  }

  if (msg.event === "BLE_UPDATE") {
    adicionarNaListaBle(msg.payload)
  }
}

ws.onclose = () => {
  setTimeout(() => reconectarWebSocket(), 3000)
}
```

---

# Exemplo — Fetch WiFi

```javascript
const baseUrl = window.location.origin

async function carregarWifi() {
  const res = await fetch(`${baseUrl}/api/wifi`)
  const json = await res.json()

  return json.data
}
```

---

# Exemplo — Fetch Stats

```javascript
async function carregarStats() {
  const res = await fetch(`${baseUrl}/api/stats`)
  const json = await res.json()

  return json.data
}
```

---

# Exemplo — Configurar WiFi

```javascript
async function configurarWifi(ssid, password) {
  const res = await fetch(`${baseUrl}/api/config/wifi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ssid,
      password
    })
  })

  return await res.json()
}
```

---

# Resumo dos Objetos

| Endpoint   | Estrutura                                  |
| ---------- | ------------------------------------------ |
| /api/wifi  | { ssid, bssid, rssi, channel, encryption } |
| /api/ble   | { name, mac, rssi, uuid }                  |
| /api/stats | { wifiNetworks, bleDevices, uptime }       |
