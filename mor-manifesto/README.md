# Mor Manifesto

Reels de tipografia cinetica da Mor Marcas e Patentes, feito com Remotion.

Frase: "Mais do que registrar um nome. A gente garante que ele seja so seu."

- Formato: 1080x1920, 30fps, 210 frames (7,0s)
- Fonte: Red Hat Display via `@remotion/google-fonts` (800 nas palavras, 500 no eyebrow)
- Cores: branco `#FFFFFF` e vinho `#8A0808`, alternando fundo e texto a cada corte
- Trilha: `public/trilha.wav`, epica, sintetizada pelo projeto a 120 BPM

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

## Trilha e cortes

A trilha e gerada por `scripts/gerar-trilha.mjs`, que importa os proprios beats
de `src/beats.ts`. Sao cordas graves em ostinato, taiko e caixa marcial nos
cortes, riser com prato invertido entrando no logo e um braam que abre na
relativa maior com coro por cima, segurando ate o fim. Tudo sintetizado no
proprio script, sem sample de terceiro.

Como o script le o mesmo array que a composicao, corte de video e ataque de
musica caem no mesmo frame por construcao: a 120 BPM e 30fps, um tempo da
musica vale 15 frames, e cada beat dura um numero inteiro de tempos. Palavra
comum leva 1 tempo, os dois pontos finais da frase levam 2 para respirar, e o
logo segura 5.

Para regerar o WAV depois de mexer no ritmo:

```bash
npm run trilha
```

## Logo

O beat final usa `public/logo-branco.png`, a versao monocromatica branca da
marca. Ela e gerada a partir do PDF oficial em `assets/logo-mor.pdf`:

```bash
./scripts/gerar-logo-branco.sh
```

O script rasteriza o PDF em 300 dpi, pinta toda a arte de branco mantendo o
alpha original (por isso os filetes internos das letras continuam vazados,
deixando o vinho aparecer), recorta na arte e salva com 1600px de largura.
Precisa de `poppler-utils` e `pillow` instalados.

O caminho fica em `CAMINHO_DO_LOGO` (`src/beats.ts`) e tambem pode ser passado
como prop `caminhoDoLogo` da composicao. Se o arquivo nao existir, o beat cai
no placeholder com a palavra MOR sobre o fundo vinho.

## Onde mexer

Todo o ritmo vive em `src/beats.ts`: texto, cor de fundo, cor do texto, duracao
em tempos e escala de cada beat. A duracao da composicao e derivada da soma do
array, entao mudar um beat ja ajusta o video inteiro (e o `npm run trilha`
reajusta a musica junto).

| campo | o que faz |
| --- | --- |
| `texto` | palavra ou trecho da frase no beat |
| `corDeFundo` / `corDoTexto` | inversao branco e vinho a cada corte |
| `duracaoEmTempos` | tamanho do beat em tempos da trilha, nunca em frames soltos |
| `escala` | fracao da largura do frame que a linha ocupa (50% a 78% nas palavras); o `fitText` deriva o fontSize dai, entao palavra curta entra grande e frase longa entra menor |

`src/MorManifesto.tsx` cuida da entrada (spring com damping alto, scale 0.94
para 1 e fade in em 4 frames, sem saida) e do grao fino de 4% sobre o fundo.
