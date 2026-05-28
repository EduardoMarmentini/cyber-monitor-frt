# Fase 4 — Corrigir Settings Page

## Objetivo

Substituir a simulação de conexão na página de configurações pela chamada real à API.

## Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `app/settings/page.tsx` | Corrigir `handleConnect` e habilitar endpoint input |

## Detalhamento

### `app/settings/page.tsx`

**Mudanças:**

- `handleConnect()` agora chama `esp32Api.configureWifi({ ssid, password })` em vez de `setTimeout` simulado
- Exibir a resposta da API (mensagem de sucesso/erro, IP retornado)
- Habilitar o input de endpoint (`disabled={true}` → condicional baseado em `isConnected`)
- Adicionar loading state real durante a requisição
- Após conectar com sucesso, chamar `setEndpoint()` com o endpoint configurado

**Fluxo novo:**

```
Usuário preenche SSID + senha
  ↓
Clica "Conectar"
  ↓
Chama POST /api/config/wifi { ssid, password }
  ↓
Se success:
  → setEndpoint(localEndpoint)   → ativa conexão
  → mostra IP retornado
  → addLog "success"
Se falha:
  → mostra mensagem de erro
  → addLog "error"
```

## Verificação

- Conseguir conectar a um ESP32 real
- Ver toast/log de sucesso/erro
- Ver endpoint aparecendo como conectado

## Dependências

Fase 1 concluída (endpoints corretos no service).
