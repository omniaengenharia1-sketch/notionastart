export const fps = 30;
export const largura = 1080;
export const altura = 1920;

export const cores = {
  fundo: '#07070B',
  fundoAlto: '#141428',
  texto: '#F4F4F6',
  textoFraco: 'rgba(244,244,246,0.62)',
};

/** Paleta por cliente — o `accent` tinge gradiente, numeros e barra de progresso. */
export const paletas: Record<string, {accent: string; accent2: string}> = {
  'Mor Marcas': {accent: '#4F8CFF', accent2: '#8A5CFF'},
  'Publika.ai': {accent: '#FF5C8A', accent2: '#FF9F5C'},
  'Confraria Somos': {accent: '#FFC44D', accent2: '#FF6B4D'},
  padrao: {accent: '#5CE1E6', accent2: '#5C7CFF'},
};

export const paletaDe = (cliente: string) => paletas[cliente] ?? paletas.padrao;

export const fonte =
  'Inter, "Helvetica Neue", "Liberation Sans", DejaVu Sans, system-ui, sans-serif';
