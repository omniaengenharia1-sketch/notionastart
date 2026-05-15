# Setup do SDR Astart — versão Z-API

> Este é o setup **atual**, pivotado da Meta Cloud API pra Z-API (mantém o WhatsApp Business existente). Pra histórico/referência da versão Meta, veja [SETUP.md](SETUP.md).

---

## Por que Z-API em vez de Meta Cloud API

- ✅ Mantém o número da Astart funcionando normal no WhatsApp Business app
- ✅ Plug-and-play em 10min via QR Code
- ✅ Sem templates da Meta pra aprovar (24-48h de espera)
- ⚠️ Não-oficial — risco baixo de banimento se respeitar volume e qualidade
- 💰 R$ 99/mês fixo

**Quando migrar pra Meta Cloud API:** depois de validar o SDR em 4-6 semanas. Aí compra um chip dedicado.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  PROSPECÇÃO (Workflow 3 — cron diário 9h)                   │
│  Apify (IG hashtag + Google Maps) → dedupe → Notion         │
│  cria leads como "Novo Lead"                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Layana/Viviane revisa e marca "Pronto pra abordar")
┌─────────────────────────────────────────────────────────────┐
│  OUTBOUND (Workflow 1 — cron 1h, seg-sex 9h-18h)            │
│  Notion (Etapa=Pronto pra abordar) → Claude → notifica WA   │
│  status: Aguardando aprovação                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Layana responde no WA: APROVAR/EDITAR/PULAR)
┌─────────────────────────────────────────────────────────────┐
│  CALLBACK (Workflow 2 — webhook Z-API único)                │
│  - APROVAR  → envia mensagem pro lead, vira "Contato Feito" │
│  - EDITAR   → troca texto, pede reconfirmação               │
│  - PULAR    → vira "Descartado"                             │
│  - LEAD RESPONDEU → Claude gera resposta, pede aprovação    │
└─────────────────────────────────────────────────────────────┘
```

---

## Pré-requisitos (faça antes)

| # | Item | Status |
|---|------|--------|
| 1 | Conta Notion + database `✍🏻 Comercial` | ✅ existe |
| 2 | Integração Notion `SDR Astart n8n` conectada ao DB | ✅ |
| 3 | API key Anthropic | ✅ |
| 4 | n8n self-host no Railway | ✅ |
| 5 | Conta Z-API + instância conectada ao WhatsApp Business | ✅ |
| 6 | Conta Apify | ✅ |

---

## 1. Variáveis de ambiente no Railway (n8n)

Vai em Railway → service n8n → **Variables** → adiciona/garante essas:

### Já configuradas (n8n)
```env
N8N_HOST=n8n-production-8c76.up.railway.app
N8N_PROTOCOL=https
N8N_PORT=5678
WEBHOOK_URL=https://n8n-production-8c76.up.railway.app
GENERIC_TIMEZONE=America/Sao_Paulo
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=layana
N8N_BASIC_AUTH_PASSWORD=<sua senha>
PORT=5678
```

### Adicionar agora
```env
# Notion (já gerou no setup das credenciais)
NOTION_LEADS_DB_ID=ff29e8a2-84a2-4f94-978b-e486c4310281

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Z-API (3 valores do painel da instância)
ZAPI_INSTANCE_ID=xxxxxxxxxx
ZAPI_TOKEN=xxxxxxxxxxxxxxxxxxxxx
ZAPI_CLIENT_TOKEN=xxxxxxxxxxxxxxxxxxx

# Apify
APIFY_TOKEN=apify_api_xxxxxxxxxxxxx

# Seu número pessoal (recebe aprovações) — formato: 55 + DDD + número, sem +/-
OPERATOR_PERSONAL_NUMBER=5511933554550

# Queries de prospecção (JSON arrays — pode editar/expandir)
PROSPECT_QUERIES_GMAPS=[{"search":"agência de marketing em Mogi das Cruzes","max":5},{"search":"restaurante em Arujá","max":5}]
PROSPECT_QUERIES_INSTAGRAM=[{"hashtag":"empreendedormogi","max":5}]

# Prompts (longos — colar conteúdo inteiro dos .md)
SDR_SYSTEM_PROMPT=<cole o conteúdo de sdr/prompts/system_sdr_astart.md>
SDR_FOLLOWUP_RULES=<cole o conteúdo de sdr/prompts/regras_followup.md>
```

> **Dica pros prompts longos**: no Railway, clica **Raw Editor**, cola como uma única linha. Quebras de linha viram `\n` automaticamente. Ou usa o editor de variáveis multilinha (`Variables → ⋯ → Multiline`).

---

## 2. Importar os 3 workflows no n8n

### 2.1 Credencial Notion (única — antes de importar)

n8n → menu lateral → **Credentials** → **+ Create credential**:

- Tipo: **Notion API**
- Nome: `Notion API`
- **ID interno**: tem que ser exatamente `notion-cred` (os workflows referenciam esse ID)
- API Key: cola o `NOTION_API_KEY` da integração

### 2.2 Importar

n8n → **Workflows** → **+** (canto superior) → **Import from File**:

1. `sdr/n8n/workflow_1_outbound_zapi.json` → **SDR Astart — 1. Outbound Z-API**
2. `sdr/n8n/workflow_2_callback_zapi.json` → **SDR Astart — 2. Callback Z-API**
3. `sdr/n8n/workflow_3_prospeccao_apify.json` → **SDR Astart — 3. Prospecção Apify**

**Não ative ainda** (toggle desligado no topo). Falta o webhook.

---

## 3. Configurar webhook do Z-API

### 3.1 Pega a URL do webhook do n8n

1. Abre o workflow **2. Callback Z-API**
2. Clica no nó **Webhook Z-API**
3. Copia a **Production URL** (tipo `https://n8n-production-8c76.up.railway.app/webhook/zapi-callback`)

### 3.2 Cola no Z-API

1. Z-API painel → tua instância → menu **Webhooks** (ou **Configurações da instância** → aba **Webhooks**)
2. Campo **"Ao receber mensagem"** (ou **"On Message Received"**):
   - Cola a Production URL do n8n
   - Salva

### 3.3 Ativa os 3 workflows no n8n

Toggle no topo direito de cada workflow → **Active**.

---

## 4. Configurar queries de prospecção

Edita `PROSPECT_QUERIES_GMAPS` e `PROSPECT_QUERIES_INSTAGRAM` no Railway com base no seu ICP.

### Google Maps — exemplos

```json
[
  { "search": "agência de marketing em Mogi das Cruzes", "max": 5 },
  { "search": "loja de roupas em Arujá", "max": 5 },
  { "search": "clínica odontológica em Guarulhos", "max": 5 }
]
```

> Sintaxe é o que você digitaria no Google Maps. `max` = quantos resultados por query.
>
> **Mantenha o total baixo**: 3-5 queries x 5 resultados = 15-25 leads/dia. Suficiente pra começar.

### Instagram — exemplos

```json
[
  { "hashtag": "empreendedormogi", "max": 5 },
  { "hashtag": "donadenegocio", "max": 5 }
]
```

> Atualmente, o scraper Instagram **não extrai WhatsApp do perfil**. Vai criar leads sem número de telefone — você ou a Viviane preenchem manualmente após revisar o perfil. Pra automatizar isso, dá pra plugar outro actor do Apify (`apify/instagram-profile-scraper`) que extrai bio + link.

---

## 5. Como você (operador) usa no dia-a-dia

### Fluxo manhã
1. **9h**: Workflow 3 roda automaticamente, puxa 15-25 leads novos do Apify → cria no Notion como "Novo Lead"
2. **9h30** (você): abre Notion, **revisa cada lead** (vê IG, site, decide se é ICP)
3. Pros que valem: marca **Etapa = "Pronto pra abordar"** e confere o WhatsApp tá preenchido

### Fluxo ao longo do dia
4. **9h-18h**: Workflow 1 roda **a cada 1h**, pega 1 lead "Pronto pra abordar", Claude gera mensagem, te manda no WhatsApp:
   ```
   🔔 Nova abordagem pronta
   👤 Lead: João Silva (CEO @ AcmeCorp)
   🎯 Gatilho: lançou novo produto X
   📊 Score: 🟡 Warm

   💬 Proposta:
   ━━━━━━━━━━━━━━
   Oi João, vi que vocês lançaram o app pra clínicas...
   ━━━━━━━━━━━━━━

   🧠 [raciocínio do Claude]

   ✏️ Pra responder:
   • APROVAR — envia
   • EDITAR: <novo texto>
   • PULAR — descarta
   ```
5. Você responde com **APROVAR** / **EDITAR: novo texto** / **PULAR**

### Quando o lead responde
6. Z-API recebe → Workflow 2 dispara → Claude gera resposta contextualizada → te manda no WA pedindo aprovação. Mesmo fluxo.

---

## 6. Teste end-to-end

### 6.1 Cria 1 lead de teste no Notion

| Property | Valor |
|---|---|
| Nome | Você mesma |
| Empresa | Teste Astart |
| Cargo | Founder |
| WhatsApp | seu número alternativo (não o que tá conectado no Z-API!) |
| Gatilho de prospecção | "lançou produto X" |
| Etapa | **Pronto pra abordar** |
| Origem | WhatsApp |

> ⚠️ O WhatsApp do lead **não pode** ser o mesmo número conectado no Z-API (vira loop). Usa um número diferente — celular pessoal de outra pessoa ou da Viviane.

### 6.2 Força o cron

n8n → workflow 1 → **Execute Workflow** (botão play no topo).

### 6.3 Você recebe no seu WhatsApp pessoal

A notificação `🔔 Nova abordagem pronta...`.

### 6.4 Responde APROVAR

O Z-API dispara a mensagem pro lead. Você confere no WhatsApp do lead que chegou.

### 6.5 Lead responde

Pelo WhatsApp do lead, manda uma resposta tipo "tá no radar sim, manda detalhe". Em segundos você recebe no seu pessoal `💬 Lead respondeu...` com a resposta proposta pela IA.

✅ **Se tudo isso funcionou → SDR tá vivo.**

---

## 7. Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| Webhook não recebe nada | URL errada no Z-API ou workflow inativo | Confere URL + toggle Active no n8n |
| `401 Unauthorized` na chamada Z-API | `ZAPI_CLIENT_TOKEN` errado | Verifica no painel Z-API → Segurança |
| `Phone number not found` no Z-API | Número do lead com formato errado | Notion deve ter no formato `+55 11 99999-9999`. O workflow remove não-dígitos automaticamente |
| Claude retorna texto fora do JSON | Prompt não carregou | Verifica `SDR_SYSTEM_PROMPT` no Railway tá preenchido |
| Notion: "Could not find database" | Integration não conectada ao DB | Notion → DB → `...` → Connections → adiciona `SDR Astart n8n` |
| Z-API mostra "Desconectado" | WhatsApp Business desconectou do dispositivo linkado | Reabre WhatsApp no celular, garante que tá online; reconecta via QR Code se necessário |
| Lead duplicado criado pelo workflow 3 | Dedupe falhou (formato de número diferente) | Padronize números no Notion: só dígitos, com 55+DDD |
| Operador (você) mandou mensagem normal e bot interpretou como comando | Você usou palavra reservada (APROVAR/PULAR/EDITAR) sem querer | Use palavras-chave só quando responder a notificação do bot. Texto livre é ignorado pelo bot |

---

## 8. Custos esperados

| Item | Mensal estimado |
|---|---|
| Railway (n8n self-host) | R$ 30-50 |
| Z-API plano Standard | R$ 99 |
| Apify (15-25 leads/dia) | ~R$ 75-150 ($15-30 USD) |
| Anthropic Claude Sonnet 4.6 | ~R$ 50-150 (depende do volume de mensagens) |
| **Total** | **R$ 250-450/mês** |

> Custo escala com volume. Pra ficar barato no começo: limite max 5 envios/dia, 10 prospecções/dia.

---

## 9. Limites de segurança (importantes!)

- **Máximo 5-10 envios/dia** nas primeiras 2 semanas. Depois pode subir pra 15-20.
- **Intervalos de 60-90s** entre envios (configurado no workflow).
- **Sem fim de semana** (workflow 1 só roda seg-sex 9h-18h).
- **Personalização real**: o Claude já é orientado a NÃO repetir mensagem. Se notar que tá ficando similar, ajusta o `SDR_SYSTEM_PROMPT`.
- **Sempre responda PARAR**: se o lead pedir pra parar, marca como "Descartado" + "Motivo desqualificação = pediu pra parar" e **nunca mais aborda**.

---

## 10. Próximos passos depois de validado

- [ ] **Follow-up automático** sem resposta (workflow 4: cron diário verificando leads sem resposta há 3 / 7 dias)
- [ ] **Handoff pra Viviane**: lead 🔥 Hot → notificação direto pro WA dela
- [ ] **Migrar pra Meta Cloud API oficial** com chip dedicado
- [ ] **Dashboard**: view no Notion com métricas (taxa resposta, conversão, score médio)
- [ ] **Enrichment Instagram**: extrair WhatsApp do bio via Apify Profile Scraper
- [ ] **Templates de mensagem por segmento** (tech vs varejo vs food vs saúde)
