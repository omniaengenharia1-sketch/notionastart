# Notion — Database de Leads (Astart SDR)

Schema do database que o agente lê e escreve. Pode ser criado manualmente ou via MCP do Notion.

## Properties

| Property | Type | Opções / Notas |
|---|---|---|
| **Nome** | Title | Nome do lead |
| **Empresa** | Rich text | Nome da empresa |
| **Cargo** | Rich text | Founder, CEO, CMO etc. |
| **Setor** | Select | Tech, Varejo, Saúde, Educação, Serviços, Indústria, Food, Outro |
| **Faturamento estimado** | Select | <R$1M, R$1-5M, R$5-20M, >R$20M, Desconhecido |
| **WhatsApp** | Phone | Formato internacional: +5511999999999 |
| **LinkedIn** | URL | Perfil do lead |
| **Instagram** | URL | Perfil da empresa (útil pra Astart referenciar) |
| **Site da empresa** | URL | |
| **Gatilho de prospecção** | Rich text | Por que abordar AGORA. Ex: "postou sobre rebrand", "trocou de cargo há 2 semanas", "lançou produto novo". CAMPO CRÍTICO — sem isso a msg fica genérica. |
| **Etapa** | Status | Novo, Pronto pra abordar, Aguardando aprovação, Enviada, Em conversa, Qualificado, Agendado, Perdido, Descartado |
| **Canal** | Select | WhatsApp (default), LinkedIn |
| **Mensagem proposta** | Rich text | Preenchido pelo agente — última proposta gerada |
| **Mensagem aprovada** | Rich text | Texto final que foi enviado (após edição se houve) |
| **Última interação em** | Date | Atualizado a cada envio/resposta |
| **Histórico** | Rich text | Log completo da conversa (formato: `[2026-01-15 14:30 SDR] msg\n[2026-01-15 16:00 LEAD] resposta`) |
| **Próximo follow-up em** | Date | Quando o agente deve gerar próxima ação |
| **Score de qualificação** | Select | 🔥 Hot, 🟡 Warm, ❄️ Cold, ⛔ Desqualificado |
| **Motivo desqualificação** | Rich text | Preenchido se Etapa = Perdido/Descartado |
| **Reunião agendada em** | Date | Se rolou |
| **Responsável** | Person | Quem cuida desse lead |
| **Origem** | Select | LinkedIn busca, Indicação, Evento, Inbound site, Lista comprada, Outro |
| **Notas** | Rich text | Espaço livre |

## Views recomendadas

1. **🎯 Prontos pra abordar** — filtro: Etapa = "Pronto pra abordar"
2. **⏳ Aguardando aprovação** — filtro: Etapa = "Aguardando aprovação"
3. **💬 Em conversa** — filtro: Etapa = "Em conversa" + ordenado por Última interação
4. **📅 Follow-ups hoje** — filtro: Próximo follow-up em = Hoje
5. **🔥 Hot leads** — filtro: Score = 🔥 Hot
6. **🏆 Agendados** — filtro: Etapa = Agendado

## Automation hint (no n8n)

- O workflow outbound busca leads com `Etapa = "Pronto pra abordar"` e `WhatsApp ≠ vazio`
- Após gerar a proposta, muda pra `Etapa = "Aguardando aprovação"` e preenche `Mensagem proposta`
- Após aprovação humana, muda pra `Etapa = "Enviada"`, preenche `Mensagem aprovada`, atualiza `Histórico` e `Última interação em`
- Webhook inbound: ao receber resposta, muda pra `Etapa = "Em conversa"`, append no `Histórico`, agenda `Próximo follow-up em = agora` pra gerar resposta
