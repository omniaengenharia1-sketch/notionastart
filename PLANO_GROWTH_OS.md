# 🚀 Growth OS — Plano do Sistema Operacional de Marketing da Agência

> **Status:** Plano para aprovação (nada foi criado no Notion ainda)
> **Modelo escolhido:** Template replicável por cliente
> **Local:** Nova página/workspace "Growth OS"
> **Data:** 2026-06-14

---

## 1. Nome e descrição do serviço

### Nome recomendado: **Growth OS**
*O Sistema Operacional de Marketing da agência.*

**Descrição (pitch para clientes):**
> Growth OS é a plataforma única onde toda a jornada de marketing do seu negócio
> vive — da pesquisa de mercado à escala. Centralizamos estratégia, execução,
> entregas, métricas e aprovações em um só lugar no Notion, com processos
> padronizados (SOPs), templates prontos e dashboards de resultado em tempo real.
> Você enxerga exatamente o que está sendo feito, por quem e com qual impacto.

**Descrição (uso interno):**
> Estrutura padronizada e replicável que transforma a operação da agência em um
> sistema escalável: cada novo cliente recebe um workspace completo a partir de
> um template, com as 16 áreas de marketing, tarefas, SOPs e automações já prontas.

**Alternativas de nome:** Marketing HQ · Órbita · Núcleo · Maestria · Eixo

---

## 2. O que já existe (não recomeçamos do zero)

A agência **já opera uma automação real** neste repositório:

| Componente | O que faz |
|------------|-----------|
| `scripts/generate_ideas.py` | Pipeline diário de ideias de conteúdo (Gemini 2.5 Flash + Reddit + Google Trends → Notion) |
| `clients_config.json` | Configuração dos clientes (nicho, tom de voz, keywords, subreddits, subtemas, DB do Notion) |
| `.github/` (workflow) | Execução automática do pipeline |

**Clientes ativos hoje:** Mor Marcas · Publika.ai · Confraria Somos · Pamela Dantas
(cada um com seu banco de ideias no Notion).

➡️ **Conclusão:** essa automação cobre **1 subárea** do mapa completo
(*Conteúdo → Estratégia de Conteúdo / Calendário Editorial*). O Growth OS é a
estrutura maior que abriga essa e dezenas de outras entregas.

---

## 3. As 6 camadas necessárias para entregar tudo

Pastas sozinhas não gerenciam clientes. Para virar serviço escalável, precisamos:

| # | Camada | Função | Ferramenta |
|---|--------|--------|------------|
| 1 | **CRM de Clientes** | Banco central de clientes (status, plano, responsável, contrato) | Notion DB |
| 2 | **Árvore de Marketing** | As 16 áreas / ~80 subáreas (sua estrutura) | Notion (template) |
| 3 | **Central de Tarefas** | Tarefas com responsável, prazo, status, área e cliente | Notion DB |
| 4 | **Templates & SOPs** | Modelo de entrega + passo-a-passo por subárea | Notion DB/páginas |
| 5 | **Dashboards & KPIs** | Painel por cliente + painel-geral da agência | Notion views |
| 6 | **Automações** | Ideias, relatórios, lembretes, onboarding (amplia o que já existe) | Python + GitHub Actions + Notion API |

---

## 4. Arquitetura no Notion (modelo template replicável)

```
🏢 Growth OS
│
├── 🎛️  Dashboard Geral da Agência
│        (clientes ativos · tarefas atrasadas · entregas da semana · KPIs)
│
├── 👥 CRM — Clientes                         [Banco de dados]
│        props: Nome · Status · Plano · Responsável · Início ·
│               Contrato · Links · Relação→Tarefas · Relação→Área
│
├── ✅ Central de Tarefas                      [Banco de dados]
│        props: Tarefa · Cliente(rel) · Área · Subárea · Responsável ·
│               Status(Backlog→Fazendo→Revisão→Aprovado) · Prazo · Prioridade
│
├── 📚 Biblioteca de Templates & SOPs          [Banco de dados]
│        props: Título · Área · Subárea · Tipo(Template|SOP) · Conteúdo
│
├── 🗂️  TEMPLATE DE CLIENTE  ⭐ (duplicado a cada novo cliente)
│        └── espelha as 16 áreas abaixo + dashboard próprio do cliente
│
└── 📦 Clientes (instâncias)
         ├── Mor Marcas        → cópia do template + banco de ideias atual
         ├── Publika.ai        → cópia do template + banco de ideias atual
         ├── Confraria Somos   → cópia do template + banco de ideias atual
         └── Pamela Dantas     → cópia do template + banco de ideias atual
```

**Por que template replicável:** padroniza a operação, garante que nenhum cliente
"esquece" uma etapa, e permite onboarding de novo cliente em minutos (duplicar +
preencher CRM).

---

## 5. A árvore de Marketing — 16 áreas (sua estrutura)

Cada área vira uma seção do template do cliente. Resumo das 16 áreas e ~80 subáreas:

1. **Pesquisa** — Mercado · Público · Concorrentes · Tendências · Oportunidades
2. **Estratégia** — Posicionamento · Mensagem · Persona (ICP) · Canais · Plano
3. **Branding** — Identidade · Ativos Visuais · Tom de Voz · Guia de Estilo · Manual
4. **Conteúdo** — Estratégia · Blog · Vídeos/Podcasts · Estudos de Caso · Calendário ⚙️*(automação ativa)*
5. **SEO** — Palavras-chave · On-Page · Link Building · Técnico · Relatórios
6. **Tráfego Pago** — Google · Meta · LinkedIn · Remarketing · Criativos
7. **Redes Sociais** — Orgânico · Comunidade · Influenciadores · Colaborações · Calendário
8. **Email Marketing** — Lista · Newsletters · Sequências · Automações · Métricas
9. **Aquisição** — Leads · Prospecção · Afiliados · Parcerias · Distribuição
10. **Conversão** — Landing Pages · Funis · CRO · Copywriting · Ofertas
11. **Lançamentos** — Campanha · Validação · Imprensa · Materiais · Pós-lançamento
12. **Analytics** — KPIs · Funil · Relatórios · Testes A/B · Atribuição
13. **Retenção** — Onboarding · Ciclo de Vida · Reengajamento · Fidelidade · Churn
14. **Crescimento** — Indicações · Loops Virais · Comunidade · PLG · Expansão
15. **Escala** — Automações · Equipe · Processos/SOPs · Campanhas Globais · Orçamento

Cada subárea recebe: **(a)** uma página com template de entrega, **(b)** um SOP
(passo-a-passo), **(c)** vínculo automático com a Central de Tarefas.

---

## 6. Roadmap de automações (expandindo a base atual)

A automação de ideias prova que o padrão funciona. Podemos replicá-lo:

| Automação | Área | Base | Esforço |
|-----------|------|------|---------|
| ✅ Ideias de conteúdo diárias | Conteúdo | **já existe** | — |
| Calendário editorial auto-preenchido | Conteúdo | ideias→datas | Baixo |
| Relatório semanal por cliente (KPIs) | Analytics | Notion API | Médio |
| Onboarding 1-clique (duplica template + cria tarefas) | Escala | Notion API | Médio |
| Lembretes de prazo / tarefas atrasadas | Tarefas | Notion + cron | Baixo |
| Pesquisa de palavras-chave assistida | SEO | Trends/Gemini | Médio |
| Briefs de criativos para anúncios | Tráfego Pago | Gemini | Médio |
| Resumo de tendências do nicho | Pesquisa | Reddit/Trends | Baixo |

---

## 7. Plano de execução por fases

**Fase 0 — Aprovação (agora):** você valida este documento.

**Fase 1 — Fundação (MVP):**
- Criar página raiz Growth OS
- Criar CRM de Clientes + Central de Tarefas
- Cadastrar os 4 clientes atuais
- Montar Dashboard Geral
- Conectar os bancos de ideias existentes ao CRM

**Fase 2 — Template replicável:**
- Construir o "Template de Cliente" com as 16 áreas e ~80 subáreas
- Duplicar para os 4 clientes

**Fase 3 — Templates & SOPs:**
- Preencher modelo de entrega + SOP para cada subárea (priorizar as mais usadas)

**Fase 4 — Automações:**
- Onboarding 1-clique
- Relatórios semanais
- Lembretes de prazo

**Fase 5 — Refino:**
- Dashboards por cliente, permissões/compartilhamento, métricas de agência

---

## 8. O que preciso de você para executar

- ✅ Aprovação do nome **Growth OS** (ou escolher alternativa)
- ✅ Aprovação desta arquitetura
- 🔑 Confirmar que posso **criar páginas/bancos no Notion** conectado a esta sessão
- 📋 (Opcional) Definir os planos/pacotes de serviço para o campo "Plano" do CRM
- 📋 (Opcional) Lista de campos que você quer no CRM além dos sugeridos

➡️ **Próximo passo sugerido:** aprovar e me liberar para executar a **Fase 1 (MVP)**.
