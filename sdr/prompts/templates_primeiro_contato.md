# Templates de 1º Contato — Submeter à Meta Cloud API

A Meta exige templates pré-aprovados pra **iniciar conversa** com um número (cold outreach). Abaixo, **5 variações** cobrindo os principais gatilhos. Submeta TODAS no Meta Business Manager (categoria **MARKETING**, idioma **pt_BR**).

Cada template usa variáveis `{{1}}`, `{{2}}`, etc. — o agente preenche dinamicamente. **A Meta aprova templates com variáveis desde que o "corpo de exemplo" mostre uso plausível.**

---

## Template 1 — `astart_sdr_gatilho_lancamento`
**Categoria**: MARKETING
**Gatilho**: lead lançou produto / nova fase / captação / prêmio recentemente

```
Oi, {{1}}! Vi que vocês lançaram {{2}} — parabéns, sacada boa.

Dei uma olhada no posicionamento de vocês e fiquei curioso com uma coisa que percebi. Posso te falar?
```

**Exemplo preenchido**:
> Oi, João! Vi que vocês lançaram o app de gestão pra clínicas — parabéns, sacada boa.
> Dei uma olhada no posicionamento de vocês e fiquei curioso com uma coisa que percebi. Posso te falar?

---

## Template 2 — `astart_sdr_gatilho_rebrand_visual`
**Categoria**: MARKETING
**Gatilho**: marca está numa transição visual evidente (IG inconsistente, site antigo, identidade datada)

```
{{1}}, tudo certo? Caí no perfil da {{2}} e queria te perguntar uma coisa, sem agenda comercial nenhuma.

Tem 2 minutos pra trocar uma ideia rápida?
```

**Exemplo preenchido**:
> Marina, tudo certo? Caí no perfil da Doce&Cia e queria te perguntar uma coisa, sem agenda comercial nenhuma.
> Tem 2 minutos pra trocar uma ideia rápida?

---

## Template 3 — `astart_sdr_gatilho_conteudo`
**Categoria**: MARKETING
**Gatilho**: lead publicou conteúdo relevante (post no LinkedIn, vídeo, artigo)

```
{{1}}, li seu post sobre {{2}} — gostei muito de {{3}}.

Faz sentido te mandar uma reflexão rápida sobre isso aplicado à marca de vocês?
```

**Exemplo preenchido**:
> Carlos, li seu post sobre o desafio de escalar time mantendo cultura — gostei muito do ponto sobre rituais.
> Faz sentido te mandar uma reflexão rápida sobre isso aplicado à marca de vocês?

---

## Template 4 — `astart_sdr_gatilho_cargo_mudanca`
**Categoria**: MARKETING
**Gatilho**: lead trocou de cargo, abriu empresa, virou sócio

```
Oi {{1}}, vi a mudança recente {{2}} — parabéns!

Costumo falar com founders nesse momento porque marca e comunicação geralmente entram em revisão. Aí na {{3}} já tá no radar?
```

**Exemplo preenchido**:
> Oi Bruno, vi a mudança recente — agora à frente da Mello Bebidas, parabéns!
> Costumo falar com founders nesse momento porque marca e comunicação geralmente entram em revisão. Aí na Mello já tá no radar?

---

## Template 5 — `astart_sdr_indicacao`
**Categoria**: MARKETING (ou UTILITY, conforme caso)
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

- **Footer (opcional)** que pode ajudar na aprovação: `Astart Studio · Para sair desta conversa, responda PARAR.` — Meta gosta de templates com opt-out claro pra categoria MARKETING.
- **Header**: pode deixar vazio ou usar texto curto tipo `Astart Studio`.
- **Botões**: a Meta permite incluir **Quick Reply buttons** ("Pode falar", "Agora não"). Recomendo incluir — aumenta taxa de resposta e ajuda a Meta aprovar.
- **Tempo de aprovação**: normalmente <1h, pode levar até 24-48h em casos complexos.
- **Rejeição comum**: mensagens que parecem genéricas demais ou que "vendem" explicitamente. Os templates acima foram escritos pra parecer 1:1, não broadcast.

## Template extra: aprovação interna (número Ops → seu WhatsApp pessoal)

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
