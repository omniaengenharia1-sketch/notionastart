# SDR Assistant — Astart Studio

Assistente de prospecção (Sales Development Representative) humanizado para a Astart Studio. Drafta mensagens de WhatsApp personalizadas para leads, envia pra aprovação humana via WhatsApp pessoal, e dispara o envio após aprovação.

## Arquitetura

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│   Notion     │◄──►│  n8n workflows  │◄──►│ Claude API   │
│ (leads DB)   │    │                 │    │  (Sonnet)    │
└──────────────┘    └────────┬────────┘    └──────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
       ┌──────────────────┐      ┌──────────────────┐
       │ WhatsApp Cloud   │      │ WhatsApp Cloud   │
       │ #Ops (aprovação) │      │ #SDR (leads)     │
       └──────────────────┘      └──────────────────┘
                ▲                         │
                │     webhook  ◄──────────┘
                │   (respostas dos leads)
```

## Componentes

### 1. Notion — CRM de Leads
Database único com properties listadas em `notion_lead_schema.md`. Cada lead passa pelas etapas: Novo → Pronto pra abordar → Mensagem proposta → Aguardando aprovação → Enviada → Em conversa → Qualificado → Agendado / Perdido.

### 2. Claude API — geração de mensagem
- **System prompt**: `prompts/system_sdr_astart.md` (persona, tom, regras)
- **Templates 1º toque**: `prompts/templates_primeiro_contato.md` (submeter à Meta)
- **Regras de follow-up**: `prompts/regras_followup.md` (texto livre na janela 24h)

### 3. n8n — orquestração
Dois workflows:
- **WF1 — Outbound**: cron → busca leads "Pronto pra abordar" → Claude drafta → manda aprovação no Ops → recebe aprovação → envia via SDR → atualiza Notion
- **WF2 — Inbound**: webhook Meta → recebe resposta do lead → loga no Notion → Claude drafta follow-up → loop volta pra WF1

### 4. WhatsApp Cloud API — 2 números
- **Número SDR** → conversa com leads (templates Meta pra 1º toque, texto livre na janela 24h)
- **Número Ops** → manda aprovações pro WhatsApp pessoal da operadora

## Fluxo de aprovação

1. Lead pronto no Notion
2. Claude gera proposta de mensagem
3. Número Ops dispara no seu pessoal:
   ```
   🔔 Nova abordagem pronta
   Lead: João Silva (CTO @ Acme)
   Gatilho: postou sobre escalar time
   Proposta:
   ━━━━━━━━━━━━━━━━━━
   [mensagem completa]
   ━━━━━━━━━━━━━━━━━━
   [✅ Aprovar] [✏️ Editar] [❌ Pular]
   ```
4. Você responde no celular (botões interativos)
5. Número SDR dispara pro lead, Notion atualiza

**Manutenção da janela 24h:** mande "oi" pro Ops 1x/dia (alarme 9h). Template fallback será submetido à Meta como backup.

## Custo estimado

| Item | Mensal |
|---|---|
| Meta Cloud API (2 números) | ~R$0,50/lead abordado |
| Chips/numbers (Twilio Numbers ou chip BR) | ~R$60-120 |
| n8n self-host (Railway/Render) | ~R$30 |
| Claude API (Sonnet, ~R$0,30/lead) | variável |
| **Fixo** | ~R$100-150 |
| **Variável** | ~R$0,80/lead |

## Fases de entrega

- [x] **Fase 1** — Notion DB schema + system prompt + templates + scaffold (esta entrega)
- [ ] **Fase 2** — Workflow n8n outbound + integrações
- [ ] **Fase 3** — Webhook inbound + loop de follow-up + submissão de templates à Meta

## Setup (será detalhado na Fase 2)

Credenciais necessárias (a serem colocadas em `.env` do n8n):

```
ANTHROPIC_API_KEY=
NOTION_API_KEY=
NOTION_LEADS_DB_ID=
WA_SDR_TOKEN=
WA_SDR_PHONE_ID=
WA_OPS_TOKEN=
WA_OPS_PHONE_ID=
WA_VERIFY_TOKEN=
OPERATOR_PERSONAL_NUMBER=
```
