# Templates de 1º Contato — Submeter à Meta Cloud API

A Meta exige templates pré-aprovados pra **iniciar conversa** com um número (cold outreach). Abaixo, **6 variações** com a voz real da Astart Studio. Submeta TODAS no Meta Business Manager (categoria **MARKETING**, idioma **pt_BR**).

Cada template usa variáveis `{{1}}`, `{{2}}`, etc. — o agente preenche dinamicamente.

---

## Template 1 — `astart_sdr_lancamento`
**Gatilho**: lead lançou produto / serviço / nova fase / captação recentemente

```
Oi {{1}}, vi que vocês lançaram {{2}} — sacada boa.

Dei uma olhada rápida no posicionamento de vocês e fiquei com uma observação. Posso falar?
```

**Exemplo preenchido**:
> Oi João, vi que vocês lançaram o app de gestão pra clínicas — sacada boa.
> Dei uma olhada rápida no posicionamento de vocês e fiquei com uma observação. Posso falar?

---

## Template 2 — `astart_sdr_marca_desalinhada`
**Gatilho**: marca em transição visível — IG inconsistente, site datado, identidade que não acompanha o tamanho da empresa

```
{{1}}, tudo certo? Caí no perfil da {{2}} e queria te perguntar uma coisa, sem agenda comercial.

Tem 2 minutos pra trocar uma ideia rápida?
```

**Exemplo preenchido**:
> Marina, tudo certo? Caí no perfil da Doce&Cia e queria te perguntar uma coisa, sem agenda comercial.
> Tem 2 minutos pra trocar uma ideia rápida?

---

## Template 3 — `astart_sdr_conteudo`
**Gatilho**: lead publicou conteúdo relevante (post no LinkedIn, vídeo, artigo)

```
{{1}}, li seu post sobre {{2}}. Curti o ponto sobre {{3}}.

Faz sentido te mandar uma reflexão rápida sobre isso aplicado à marca de vocês?
```

**Exemplo preenchido**:
> Carlos, li seu post sobre o desafio de escalar time mantendo cultura. Curti o ponto sobre rituais.
> Faz sentido te mandar uma reflexão rápida sobre isso aplicado à marca de vocês?

---

## Template 4 — `astart_sdr_novo_cargo`
**Gatilho**: lead trocou de cargo, abriu empresa nova, virou sócio, fez captação

```
Oi {{1}}, vi a mudança recente — {{2}}. Parabéns.

Costumo falar com founder nesse momento porque marca e comunicação entram em revisão quase sempre. Aí na {{3}} já tá no radar?
```

**Exemplo preenchido**:
> Oi Bruno, vi a mudança recente — agora à frente da Mello Bebidas. Parabéns.
> Costumo falar com founder nesse momento porque marca e comunicação entram em revisão quase sempre. Aí na Mello já tá no radar?

---

## Template 5 — `astart_sdr_local_grandesp`
**Gatilho**: lead é de Arujá, Mogi das Cruzes, Guarulhos ou Grande SP — usa proximidade geográfica como gancho

```
Oi {{1}}, tô vendo aqui que vocês são de {{2}} — a gente também (Astart Studio, estúdio de branding e audiovisual).

Andei olhando o trabalho de vocês e fiquei com uma observação. Posso te mandar?
```

**Exemplo preenchido**:
> Oi Camila, tô vendo aqui que vocês são de Mogi — a gente também (Astart Studio, estúdio de branding e audiovisual).
> Andei olhando o trabalho de vocês e fiquei com uma observação. Posso te mandar?

---

## Template 6 — `astart_sdr_indicacao`
**Gatilho**: lead chegou por indicação de alguém

```
Oi {{1}}, te chamei aqui porque {{2}} comentou que faria sentido a gente trocar uma ideia sobre marca e comunicação da {{3}}.

Quando der, me avisa que te conto o contexto.
```

**Exemplo preenchido**:
> Oi Camila, te chamei aqui porque o Rafael comentou que faria sentido a gente trocar uma ideia sobre marca e comunicação da Verde Foods.
> Quando der, me avisa que te conto o contexto.

---

## Notas pra submissão na Meta

- **Header (opcional)**: texto curto tipo `Astart Studio`
- **Footer (recomendado)**: `Astart Studio · Responda PARAR pra sair desta conversa.` — a Meta gosta de opt-out claro pra categoria MARKETING
- **Botões Quick Reply (recomendado, 3 botões)**:
  - `Pode falar`
  - `Agora não`
  - `Não tenho interesse`
- **Tempo de aprovação**: normalmente <1h, até 48h em casos complexos
- **Rejeição comum**: mensagens que parecem broadcast genérico. Os templates acima foram escritos pra parecer 1:1.

## Template de aprovação interna — número Ops → WhatsApp pessoal

Este é pro **número Ops** te mandar pedidos de aprovação. Submeta também:

### `astart_sdr_aprovacao_pendente`
**Categoria**: UTILITY
**Idioma**: pt_BR

```
🔔 Nova abordagem pronta pra aprovação

Lead: {{1}} ({{2}} @ {{3}})
Gatilho: {{4}}

Proposta:
{{5}}

Responda APROVAR, EDITAR ou PULAR.
```

Com **3 Quick Reply buttons**: `✅ Aprovar` / `✏️ Editar` / `❌ Pular`

**Quando usar**: só fora da janela 24h. Dentro da janela, o agente manda texto livre com botões interativos (mais natural).
