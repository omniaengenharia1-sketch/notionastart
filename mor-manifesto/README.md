# Mor Manifesto

Reels de tipografia cinetica da Mor Marcas e Patentes, feito com Remotion.

Frase: "Mais do que registrar um nome. A gente garante que ele seja so seu."

- Formato: 1080x1920, 30fps, 168 frames (5,6s)
- Fonte: Red Hat Display via `@remotion/google-fonts` (800 nas palavras, 500 no eyebrow)
- Cores: branco `#FFFFFF`, preto `#000000` e vinho `#8A0808`
- Corte metronomico a cada 12 frames, ou seja, 0,4s

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
npm run render
```

O arquivo sai em `out/mor-manifesto.mp4`. Existe tambem a versao muda, para
subir uma trilha licenciada no proprio Instagram:

```bash
npm run render:mudo
```

## Tom dos beats

O visual e uma alternancia de tom, e cada beat declara o seu em `tom`:

| tom | fundo | texto | foto |
| --- | --- | --- | --- |
| `claro` | branco | vinho | monocromatica e estourada no branco |
| `escuro` | preto | branco | monocromatica, fechada e tingida de vinho |
| `vinho` | vinho | branco | fechada, com o vinho por cima |

Os valores de cada tom ficam em `PALETA` (`src/beats.ts`): filtro da foto,
opacidade e forca da tinta. Mexer ali muda o tratamento do video inteiro.

## Imagens de fundo

Cada beat aponta um arquivo de `public/fundos` no campo `imagem`. A foto entra
em tela cheia com um drift lento de escala, tratada conforme o tom do beat.
Beat sem `imagem` fica chapado na cor do tom.

Formato: vertical, pelo menos 1080x1920, JPG. Foto com bastante contraste
funciona melhor, porque o tratamento estoura os claros e fecha os escuros.

## Trilha

O projeto nao traz musica. Enquanto nao existir `public/trilha.wav`, o video
renderiza mudo, e e so isso que muda.

Para colocar uma faixa:

```bash
npm run trilha -- caminho/da/faixa.mp3 [inicioEmSegundos]
```

O script decodifica com o ffmpeg que ja vem no Remotion, corta na duracao exata
da composicao e aplica fade de entrada e de saida, gravando `public/trilha.wav`.
O segundo argumento e opcional e serve para comecar de um trecho no meio da
faixa, quando o comeco dela nao serve.

Trocar de musica e rodar o comando de novo, sem tocar em codigo nenhum.

## Logo

`scripts/gerar-logo-branco.sh` gera as duas versoes do logo a partir do PDF
oficial em `assets/logo-mor.pdf`:

- `public/logo-cor.png`, a arte original, usada em fundo claro
- `public/logo-branco.png`, monocromatica, usada em fundo escuro e vinho

Na versao branca o alpha original e mantido, entao os filetes internos das
letras continuam vazados e deixam o fundo aparecer. Precisa de `poppler-utils`
e `pillow` instalados.

## Onde mexer

Todo o ritmo vive em `src/beats.ts`. A duracao da composicao e derivada da soma
do array, entao mudar um beat ja ajusta o video inteiro.

| campo | o que faz |
| --- | --- |
| `texto` | palavra ou trecho da frase no beat |
| `tom` | `claro`, `escuro` ou `vinho`, conforme a tabela acima |
| `imagem` | arquivo em `public/fundos`, opcional |
| `duracaoEmTempos` | tamanho do beat em tempos do grid, nunca em frames soltos |
| `escala` | fracao da largura do frame que a linha ocupa (50% a 78% nas palavras); o `fitText` deriva o fontSize dai, entao palavra curta entra grande e frase longa entra menor |

`src/MorManifesto.tsx` cuida da entrada (spring com damping alto, scale 0.94
para 1 e fade in em 4 frames, sem saida) e do grao fino de 4% sobre o fundo.
