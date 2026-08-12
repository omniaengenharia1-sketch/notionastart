# Novo template de proposta — Astart Studio

Este pacote troca o visual das propostas geradas pelo sistema
`propostas-astart` (Netlify + Firebase), **sem mexer** no preenchimento por
IA nem no banco. O admin continua igual; muda só o HTML que a proposta vira.

O design novo é o de rolagem (scroll) na identidade da Astart — preto, branco
e rosa `#E91E63`, com o logo vetorial, a fonte Neue Machina e as animações de
título subindo palavra por palavra.

## O que tem aqui

```
propostas-astart/
├── template.js            → o novo buildHTML + SVC_CONTENT + PROPOSAL_CSS
├── fonts/                 → as 4 fontes da marca (Neue Machina + Comodo)
│   ├── machina-light.woff2
│   ├── machina-regular.woff2
│   ├── machina-ultrabold.woff2
│   └── comodo.woff2
└── exemplo-larissa.html   → uma proposta de exemplo já gerada, pra conferir
```

## Como instalar (3 passos)

### 1. Suba as fontes para o site do Netlify
Coloque a pasta `fonts/` na raiz pública do projeto `propostas-astart`, de
forma que fiquem acessíveis em:

```
https://propostas-astart.netlify.app/fonts/machina-light.woff2
https://propostas-astart.netlify.app/fonts/machina-regular.woff2
https://propostas-astart.netlify.app/fonts/machina-ultrabold.woff2
https://propostas-astart.netlify.app/fonts/comodo.woff2
```

O `template.js` já aponta para esses endereços. Se o domínio mudar, troque a
constante `ASSET` no topo do arquivo.

### 2. Substitua o gerador no app
No `index.html` (ou no bundle) do app, localize e **apague**:

- a definição atual de `const SVC_CONTENT = { ... }`
- a definição atual de `const PROPOSAL_CSS = ...` (ou `` `...` ``)
- a função `function buildHTML(f, photoUrl) { ... }`

e **cole no lugar** o conteúdo de `template.js` (ele define os três).

> Nada mais muda: o app continua chamando `buildHTML(formForBuild, photoUrl)`
> exatamente como antes. Os campos lidos são os mesmos do Firestore —
> `client, company, segment, services, serviceValues, descricaoIA,
> descricaoIA_improved, descricao, value, tipo, pagamento, condicoes, prazo,
> onboardingIA, proposalMode, options, dirs`.

### 3. Publique e teste
Gere uma proposta de teste no admin e abra o link. Compare com
`exemplo-larissa.html` (abra direto no navegador — as fontes só carregam
depois que o passo 1 estiver no ar; sem elas, o layout usa uma fonte de
sistema, mas a estrutura é idêntica).

## Diferenças de comportamento

- **Uma proposta = uma página que rola** (o modelo antigo era deck de slides
  em tela cheia). Se preferir manter o deck, me avise que adapto.
- Seções opcionais seguem os mesmos `dirs`: `intro`, `feedbacks`, `processo`.
  As entregas ("O que você vai receber") vêm do campo `descricaoIA`; os
  próximos passos, do `onboardingIA` — mesma lógica de hoje.
- Modo A/B (`proposalMode: "multi"`) vira cartões de plano selecionáveis.
- O HTML gerado ficou **leve (~31 KB)** porque as fontes são carregadas por
  URL, não embutidas — o documento no Firestore não incha.

---

## ⚠️ Segurança — corrigir com prioridade

Ao abrir o sistema para pegar a copy, encontrei três exposições no código
público do app. Qualquer pessoa com o link vê:

1. **Chave da API Groq** exposta no JavaScript (`GROQ_KEY = "gsk_..."`).
   → Revogue no painel da Groq e gere outra. Chave de IA no front-end pode ser
   usada por terceiros e gerar custo no seu nome.
2. **Chave do Unsplash** exposta (`UNSPLASH_KEY = "..."`).
   → Mesma coisa: revogue e troque.
3. **Firestore aberto para leitura.** Foi assim que consegui ler a proposta da
   Larissa sem senha — e dá para listar/ler todas. Feche com uma regra de
   segurança que só permita leitura autenticada, por exemplo:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /proposals/{id} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   (Se as propostas precisam ser abertas por link público pelo cliente, o
   ideal é servir o HTML já renderizado por uma função/hospedagem, e não expor
   a coleção inteira do Firestore para leitura.)

O correto é mover as chaves de IA para uma função serverless (Netlify
Functions), onde ficam fora do alcance do navegador. Posso montar isso se você
quiser — é um passo separado.
