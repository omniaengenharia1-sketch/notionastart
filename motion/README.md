# Astart Motion (Remotion)

Motion graphics em formato Reels/Stories (1080x1920, 30fps) para as ideias de
conteudo dos clientes. O video e escrito em React e renderizado em mp4 pelo
[Remotion](https://remotion.dev) — o mesmo texto que vira post pode virar video
sem passar por editor.

## Rodar

```bash
cd motion
npm install
npm run studio        # editor visual, com os campos do reel editaveis na lateral
```

Renderizar o exemplo:

```bash
npm run render:exemplo             # -> out/reel.mp4
```

Renderizar com um conteudo proprio:

```bash
npm run render -- ReelIdeia out/mor.mp4 --props=props/mor-dominio.json
```

## O que tem aqui

| composicao | formato | o que e |
| --- | --- | --- |
| `Vitrine` | 9:16, ~9,9s | a marca aplicada em tudo, piscando escuro/claro a cada 4 frames |
| `Manifesto` | 9:16, ~16s | frases em corte seco sobre b-roll, fechando na marca |
| `LogoSurgindo` / `...Vertical` / `...Wide` | 1:1, 9:16, 16:9, 7s | a marca se formando devagar no escuro |
| `LogoMotion` / `...Vertical` / `...Wide` | 1:1, 9:16, 16:9, 5s | assinatura tipografica (wordmark), sem depender do arquivo do logo |
| `ReelIdeia` | 9:16, duracao variavel | reel de lista a partir de uma ideia de conteudo |

## Composicao `Vitrine`

Feita em cima da referencia (reel da @ownmediabr), medida frame a frame:

- corte a cada **4 frames** — a 30fps sao 7,5 cortes por segundo, do primeiro ao
  ultimo quadro;
- **nada se move** dentro do quadro: o ritmo vem so do corte;
- cada foto aparece duas vezes seguidas, **escura e clara**. Na escura a imagem
  vai a preto-e-branco com uma camada da cor da marca e a logo entra em branco;
  na clara a imagem estoura para o branco (negativo, quando a foto e escura) e a
  logo entra na cor da marca.

A marca fica sempre no mesmo lugar: centro do quadro, mesmo tamanho em todas as
cenas (`larguraMarca`, em % da largura). So a foto atras muda.

`inverter` marca as fotos escuras: nelas a versao clara e o negativo. Em foto
que ja e clara, o negativo daria preto — entao ali a versao clara e um estouro
de luz.

```bash
npm run render:vitrine              # -> out/astart-vitrine.mp4, com trilha
npm run render:vitrine out/x.mp4    # outro destino
```

### Epilepsia fotossensivel — leia antes de publicar

O pulso da referencia pisca **8 vezes por segundo** varrendo quase toda a escala
de luminancia (medido no arquivo final: 0,03 a 0,98 de luminancia relativa, em
100% da tela). O limite da WCAG 2.3.1 — o mesmo criterio das normas de TV — e de
**3 flashes por segundo**. Isso e risco real de convulsao para quem tem
epilepsia fotossensivel, e em feed de rede social o video ainda toca sozinho,
sem ninguem escolher ver.

Por isso a composicao tem o prop `pulso`:

| valor | o que faz | flashes no pior segundo |
| --- | --- | --- |
| `forte` | o da referencia: escuro e claro alternando | 8 (acima do limite) |
| `suave` | mesma troca de quadro, luminancia igualada; o que alterna e a cor da marca sobre a foto | 1 (dentro do limite) |

No `suave` o corte continua caindo no clique, no mesmo ritmo — o que sai e o
estroboscopio, nao o ritmo. Cada cena leva um `brilho` proprio para que todos os
quadros fiquem na mesma faixa de luminancia; quem calcula e:

```bash
python3 scripts/brilho-suave.py props/vitrine-suave.json
```

```bash
scripts/render-vitrine.sh out/suave.mp4 props/vitrine-suave.json
```

### Versoes

| props | o que e | duracao |
| --- | --- | --- |
| `props/vitrine-suave.json` | vitrine de ~6s, frases, marca | 8,87s |
| `props/vitrine-curta.json` | o video inteiro em ~6s | 5,93s |
| `props/vitrine.json` | mesma montagem, pulso forte | 8,87s |

Cada uma tem a sua trilha, porque a musica e escrita em cima da duracao:

```bash
python3 scripts/trilha.py props/vitrine-curta.json public/audio/trilha-curta.wav
scripts/render-vitrine.sh out/curta.mp4 props/vitrine-curta.json public/audio/trilha-curta.wav
```

O ultimo quadro usa `logos/astart-producoes.png` — a marca com "Producoes"
embaixo (prop `marcaFecho`). A marca que aparece sobre as fotos continua sendo
o simbolo sozinho.

### Trilha

`public/audio/trilha.mp3` — composicao original (nao e a musica da referencia),
gerada por `scripts/trilha.py`. O andamento sai do corte: 4 frames a 30fps sao
0,1333s, que e exatamente uma semicolcheia a **112,5 BPM**. Entao bumbo, palma e
marcacao caem junto com o corte, e o ultimo compasso puxa para o fecho.

Mesmo espirito da referencia: grave dominante, quase nada de agudo — mas o
**clique da troca de quadro fica por cima do grave**, e ele que conduz. Um
clique em cada corte, mais forte a cada quatro, que e onde cai a batida.

```bash
npm run trilha   # regrava public/audio/trilha.wav
```

**Por que o render passa por um script.** O audio que o `remotion render` escreve
no mp4 sai 45ms atrasado (medido: o primeiro clique cai em 45ms em vez de 2ms).
Em um video que corta a cada 133ms isso e um terco de corte, e da para ouvir o
clique chegando depois da imagem. Por isso `scripts/render-vitrine.sh` renderiza
mudo e casa a trilha depois com o ffmpeg: aferido, o clique cai a 0-2ms do corte.

A trilha fica em wav de proposito — mp3 e aac carregam atraso de codificacao,
e aqui a referencia de tempo precisa ser exata.

Para rodar mudo ou trocar a faixa, e o prop `trilha` (caminho dentro de
`public/`; vazio desliga o audio).

## Composicao `Manifesto`

Cada bloco e uma frase sobre uma foto: a imagem entra ja em movimento (o sentido
alterna a cada bloco), o texto sobe de tras de uma mascara e a passagem para o
bloco seguinte e corte seco — sem transicao, que e o que da o ritmo.

As fotos sao tratadas em preto e branco com uma camada da cor da marca por cima
(`mix-blend-mode: color`), entao qualquer foto nova entra no mesmo clima sem
precisar de edicao.

O corpo do texto se ajusta a linha mais longa antes de deixar a frase quebrar
sozinha. Cada bloco dura 66 frames (2,2s) e a duracao total sai do numero de
blocos.

```bash
npm run render -- Manifesto out/manifesto.mp4 --props=props/manifesto.json
```

## Composicoes de logo

`LogoSurgindo` e a marca se formando: sai do desfoque enquanto uma mascara de
gradiente sobe revelando o desenho, assenta a escala e leva um brilho metalico
que usa o proprio PNG como mascara — a luz respeita o recorte do logo.

O arquivo da marca fica em `public/logos/astart.png` (fundo transparente, ja
aparado). Trocar o arquivo troca as duas composicoes.

## Composicao `ReelIdeia`

Um reel de lista: gancho -> topicos numerados -> CTA. A duracao se ajusta
sozinha ao numero de topicos (`calculateMetadata`), entao um reel de 3 itens sai
mais curto que um de 5 sem precisar mexer em frames.

Props (validadas por zod, entao aparecem como formulario no Studio):

| campo | tipo | o que e |
| --- | --- | --- |
| `cliente` | string | nome do cliente; define a paleta em `src/theme.ts` |
| `arroba` | string | @ que aparece no rodape |
| `gancho` | string[] | a primeira frase, uma linha do array por linha na tela |
| `topicos` | string[] (1 a 5) | os itens numerados |
| `cta` | string | frase final |
| `accent` / `accent2` | cor (opcional) | sobrescreve a paleta do cliente |

Quebrar o gancho em linhas e proposital: em video, onde a linha corta muda o
ritmo da leitura, e isso e decisao de quem escreve — nao do `word-wrap`.

## Imagens de fundo

`public/imagens/` — Unsplash, creditos e links em `public/imagens/CREDITOS.md`.

## Paletas

`src/theme.ts` guarda uma paleta por cliente (Mor Marcas, Publika.ai, Confraria
Somos) e um fallback. Cliente novo: adiciona uma entrada em `paletas`.

## Fonte

A Inter fica em `public/fontes/` como woff2 e e carregada com `@remotion/fonts`.
Fica no repo de proposito: render nao depende de rede nem do Google Fonts
responder no meio de um lote.

## Ambientes sem download de Chrome

O Remotion baixa um Chrome Headless Shell proprio na primeira renderizacao. Se o
ambiente ja tiver um (CI, container), aponte:

```bash
REMOTION_BROWSER=/caminho/para/chrome npm run render:exemplo
```
