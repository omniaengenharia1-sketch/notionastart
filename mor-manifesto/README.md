# Mor Manifesto

Reels de tipografia cinetica da Mor Marcas e Patentes, feito com Remotion.

Frase: "Mais do que registrar um nome. A gente garante que ele seja so seu."

- Formato: 1080x1920, 30fps, 191 frames (6,4s)
- Fonte: Red Hat Display via `@remotion/google-fonts` (800 nas palavras, 500 no eyebrow)
- Cores: branco `#FFFFFF`, preto `#000000`, vinho `#6B1229`

## Instalar

```bash
npm install
```

## Preview no Studio

```bash
npm run dev
```

## Render do MP4 em 1080x1920

```bash
npx remotion render MorManifesto out/mor-manifesto.mp4
```

Ou, com o atalho do projeto:

```bash
npm run render
```

O arquivo sai em `out/mor-manifesto.mp4`.

## Logo

O beat final procura `public/logo-branco.png`. O caminho fica em
`CAMINHO_DO_LOGO` (`src/beats.ts`) e tambem pode ser passado como prop
`caminhoDoLogo` da composicao. Se o arquivo nao existir, o beat renderiza o
placeholder com a palavra MOR sobre o fundo vinho.

## Onde mexer

Todo o ritmo vive em `src/beats.ts`: texto, cor de fundo, cor do texto,
duracao em frames, escala e o hold de respiro de cada beat. A duracao da
composicao e derivada da soma do array, entao mudar um beat ja ajusta o video
inteiro.

| campo | o que faz |
| --- | --- |
| `texto` | palavra ou trecho da frase no beat |
| `corDeFundo` / `corDoTexto` | inversao branco e preto a cada corte |
| `duracaoEmFrames` | tempo do beat |
| `holdEmFrames` | respiro extra no fim do beat, antes do corte seco |
| `escala` | fracao da largura do frame que a linha ocupa (78% a 90% nas palavras); o `fitText` deriva o fontSize dai, entao palavra curta entra grande e frase longa entra menor |

`src/MorManifesto.tsx` cuida da entrada (spring com damping alto, scale 0.94
para 1 e fade in em 4 frames, sem saida) e do grao fino de 4% sobre o fundo.
