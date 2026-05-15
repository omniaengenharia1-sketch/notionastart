# Setup do SDR Astart — passo a passo

Este guia te leva do zero ao SDR funcionando. **Faça na ordem** — alguns passos dependem dos anteriores.

> **Arquitetura escolhida:** 1 chip dedicado (SDR) faz tudo — envia mensagens pros leads E te manda aprovações no seu WhatsApp pessoal. O webhook é único e roteia internamente por remetente.

---

## Visão geral do que vai ser configurado

| # | O quê | Tempo |
|---|---|---|
| 1 | Notion: database de Leads (✅ já existe) | 0 |
| 2 | Anthropic: chave da Claude API | 5 min |
| 3 | Meta Cloud API: 1 número (SDR) | 1-2h (espera de verificação) |
| 4 | n8n: instância (cloud ou self-host) | 30 min |
| 5 | n8n: importar 2 workflows + credenciais | 10 min |
| 6 | Meta: cadastrar 1 webhook | 5 min |
| 7 | Meta: submeter 6 templates pra aprovação | espera 24-48h |
| 8 | Teste com 1 lead | 10 min |

---

## 1. Notion — database de Leads

1. Vá no seu workspace Notion → **+ New page**
2. Escolha **Database — Full page**, nomeie como `SDR Leads — Astart`
3. Adicione as properties conforme `sdr/notion_lead_schema.md` (22 properties)
4. Crie as views recomendadas
5. **Copie o ID do database**:
   - URL do database: `https://www.notion.so/seu-workspace/8a3f9b...?v=...`
   - O ID é `8a3f9b...` (32 caracteres antes do `?v=`)
   - Guarde como `NOTION_LEADS_DB_ID`
6. Crie uma **internal integration** em https://www.notion.so/profile/integrations
   - Nome: `Astart SDR n8n`
   - Capabilities: Read, Update, Insert content
   - Copie o secret (`secret_xxxxx`) → será `NOTION_API_KEY`
7. No database, clique nos `...` → **Connections → Connect to Astart SDR n8n**

---

## 2. Anthropic — Claude API

1. Vá em https://console.anthropic.com/
2. Settings → API Keys → **Create Key** → nomeie `astart-sdr-n8n`
3. Copie a chave (`sk-ant-xxxxx`) → será `ANTHROPIC_API_KEY`
4. Em **Plans & Billing**, garanta que tem créditos (mínimo US$5 pra começar)
5. Modelo recomendado: `claude-sonnet-4-6` (melhor custo/qualidade pra SDR)

---

## 3. Meta Cloud API — 1 número WhatsApp Business (SDR)

### 3.1 Cria o Business Manager (se ainda não tem)

1. https://business.facebook.com/ → **Criar conta** → fornece dados da Astart Studio
2. Adicione **1 conta de WhatsApp Business**:
   - **WABA SDR** → faz TUDO: conversa com leads E manda aprovações pro seu WA pessoal

### 3.2 Cadastra o número SDR

1. **Phone Numbers → Add phone number**
2. Use o chip dedicado da Astart
3. **Verifique o número** por SMS/voz
4. Após verificar, anote:
   - `Phone Number ID` → vai pra `WA_SDR_PHONE_ID`
   - `WhatsApp Business Account ID`

### 3.3 Gera o token de acesso

1. https://developers.facebook.com/apps → cria um app tipo **Business**
2. Adicione produto **WhatsApp**
3. Vincule a WABA SDR ao app
4. **System User** (recomendado pra produção, token não expira):
   - Business Settings → System Users → Add → nomeie `astart-sdr-bot`
   - Assign Assets: a WABA SDR + o app (permissão Manage nos dois)
   - Generate Token → escopo: `whatsapp_business_messaging`, `whatsapp_business_management`, `business_management`
   - Guarda como `WA_SDR_TOKEN`

### 3.4 Seu número pessoal

1. Define o seu WhatsApp pessoal (o que recebe as aprovações)
2. Formato internacional sem `+`: `5511989384452`
3. Guarda como `OPERATOR_PERSONAL_NUMBER`

### 3.5 Abre a janela 24h SDR ↔ seu pessoal (importante!)

1. Salva o número SDR na agenda do seu celular como `Astart SDR Bot`
2. Manda qualquer mensagem ("oi") pelo seu WA pessoal pro SDR
3. Isso abre a janela 24h. As aprovações chegam em texto livre com botões.
4. Repete 1x/dia até a Meta aprovar o template de aprovação (passo 7).

---

## 4. n8n — instância

### Opção A — n8n Cloud (mais rápido, $20/mês)
1. https://n8n.io/cloud → cria conta
2. Já vem pronto, pula pro passo 5

### Opção B — Self-host (mais barato, ~R$30/mês)
1. Crie conta no [Railway](https://railway.app) ou [Render](https://render.com)
2. Deploy do template oficial n8n (1 clique)
3. Configure domínio: `n8n.seudominio.com.br`
4. **HTTPS obrigatório** (Meta não aceita webhook sem HTTPS)

---

## 5. n8n — importar workflows e credenciais

### 5.1 Variáveis de ambiente

Em n8n → Settings → Environment Variables (ou no `.env` se self-host):

```env
NOTION_API_KEY=secret_xxxxx
NOTION_LEADS_DB_ID=ff29e8a2-84a2-4f94-978b-e486c4310281
ANTHROPIC_API_KEY=sk-ant-xxxxx
WA_SDR_TOKEN=EAAxxxxx
WA_SDR_PHONE_ID=123456789012345
WA_VERIFY_TOKEN=qualquer-string-secreta-de-sua-escolha
OPERATOR_PERSONAL_NUMBER=5511989384452
SDR_SYSTEM_PROMPT=<cole aqui o conteúdo de sdr/prompts/system_sdr_astart.md>
SDR_FOLLOWUP_RULES=<cole aqui o conteúdo de sdr/prompts/regras_followup.md>
```

> **Dica**: o `SDR_SYSTEM_PROMPT` é longo. No n8n Cloud você pode usar **Credentials → Custom** pra armazenar prompts longos como variáveis. Self-host: use `.env` com escape de quebras de linha.

### 5.2 Credencial Notion no n8n

1. Credentials → New → **Notion API**
2. ID interno: `notion-cred` (importante — os workflows referenciam esse ID)
3. API Key: cole o `NOTION_API_KEY`

### 5.3 Importa os 2 workflows

Em n8n → Workflows → **Import from file**:

1. `sdr/n8n/workflow_1_outbound.json` — gerador de mensagens (cron 30min, busca lead → Claude → pede aprovação)
2. `sdr/n8n/workflow_2_callback.json` — webhook unificado (roteia entre aprovação do operador OU resposta de lead)

**Não ative ainda.** Falta configurar o webhook da Meta.

---

## 6. Meta — cadastra o webhook (único)

### 6.1 Pega a URL de webhook do n8n

Abra `workflow_2_callback.json` no n8n → node "Webhook Meta (SDR)" → copie a **Production URL** (algo como `https://seu-n8n.com/webhook/wa-callback`).

### 6.2 Configura no app Meta

1. https://developers.facebook.com/apps/SEU_APP/whatsapp-business/wa-settings/
2. Na **WABA SDR**, seção **Webhooks**:
   - **Callback URL**: a URL do n8n (`/webhook/wa-callback`)
   - **Verify token**: cola o `WA_VERIFY_TOKEN`
   - **Subscribe to fields**: marca `messages`
3. Salva. A Meta chama uma vez pra validar.

> **Atenção**: o n8n por padrão espera POST. A Meta primeiro faz GET pra verificar. Se der erro de verificação, adiciona um node Webhook duplicado (método GET) que retorna `{{$query['hub.challenge']}}` se `{{$query['hub.verify_token']}} === $env.WA_VERIFY_TOKEN`. Ou usa ngrok pra debugar.

### 6.3 Ativa os workflows

Volta no n8n e ativa os 2 workflows (toggle no topo direito).

---

## 7. Meta — submete templates pra aprovação

Pra **iniciar conversa** com leads, precisa dos templates aprovados.

1. https://business.facebook.com/wa/manage/message-templates → **WABA SDR**
2. Pra cada template em `sdr/prompts/templates_primeiro_contato.md`:
   - **Create Template** → categoria **MARKETING**, idioma **pt_BR**
   - Nome: `astart_sdr_lancamento`, `astart_sdr_marca_desalinhada`, etc.
   - Body: cole o conteúdo (com `{{1}}`, `{{2}}`...)
   - Body Example: exemplos preenchidos plausíveis (ajuda aprovação)
   - Footer (opcional): `Astart Studio · Responda PARAR pra sair desta conversa.`
   - Buttons: 3 Quick Reply (`Pode falar`, `Agora não`, `Não tenho interesse`)
   - **Submit**

3. Repete pro template de aprovação interna (`astart_sdr_aprovacao_pendente`) na **MESMA WABA SDR**, categoria UTILITY. (Como você está usando 1 número só, todos os templates vão na mesma WABA.)

4. Aguarda aprovação (geralmente < 1h, até 48h).

---

## 8. Teste end-to-end

### 8.1 Cria um lead de teste no Notion

| Property | Valor |
|---|---|
| Nome | Você mesma (pra testar com seu próprio número de teste) |
| Empresa | Teste Astart |
| Cargo | Founder |
| WhatsApp | seu número de teste (NÃO o pessoal que recebe aprovações) |
| Gatilho de prospecção | "lançou produto X" |
| Etapa | **Pronto pra abordar** |
| Canal | WhatsApp |

### 8.2 Espera ou força o cron

- Espera até 30min OU clica no n8n no workflow 1 → **Execute Workflow**
- Você deve receber no seu WA pessoal: 🔔 *Nova abordagem pronta*...

### 8.3 Clica em ✅ Aprovar

- O número SDR dispara a mensagem pro lead de teste
- Notion atualiza pra "Enviada", preenche histórico

### 8.4 Responde como lead

- No número de teste, responde à mensagem do SDR
- Em segundos, você recebe no pessoal: 💬 *Lead respondeu*...
- Aprova, edita ou pula novamente

Se tudo isso funcionou → **o SDR tá vivo**.

---

## Troubleshooting comum

| Sintoma | Causa provável | Solução |
|---|---|---|
| Webhook não recebe nada | URL HTTP em vez de HTTPS, ou verify token errado | Confere URL + `WA_VERIFY_TOKEN` |
| "messaging_product is required" | Token sem permissão whatsapp_business_messaging | Regerar token com escopo correto |
| Claude retorna texto fora do JSON | Prompt mal carregado, ou modelo errado | Confere `SDR_SYSTEM_PROMPT` no env, usa Sonnet 4.6 |
| Notion: "Could not find database" | Integration não foi conectada ao DB | Database → ... → Connections → adiciona integration |
| Template rejeitado pela Meta | Mensagem soou como broadcast genérico | Revisar conforme dicas em `templates_primeiro_contato.md` |
| Botões interativos não aparecem no seu WA | Você tá fora da janela 24h com o Ops | Manda "oi" pro Ops, abre janela. Use o template de aprovação após Meta aprovar. |

---

## Próximos passos (Fase 3)

Depois que tudo isso tiver funcionando:

- [ ] Follow-up automático sem resposta (cron diário verificando leads sem resposta há 3 / 7 dias)
- [ ] Webhook de status (entregue/lida) pra detectar quando lead leu mas não respondeu
- [ ] Dashboard no Notion com métricas (taxa de resposta, conversão, score médio)
- [ ] Handoff automático: lead 🔥 Hot → notificação direto pra Viviane no comercial
- [ ] Cool down automático (90 dias) pra leads "Perdido"
