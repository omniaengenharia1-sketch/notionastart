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
