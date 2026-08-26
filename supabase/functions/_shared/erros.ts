import type { FamiliaErro } from './tipos.ts';

export interface ErroClassificado {
  familia: FamiliaErro;
  /** Codigo estavel para o monitor da fila. */
  codigo: string;
  /** Mensagem em portugues, para a tela. Nunca o JSON cru da Meta. */
  mensagem: string;
  /** Cru, so para publicacao_eventos. Nunca chega no front. */
  detalhe?: unknown;
}

export function erroTransitorio(codigo: string, mensagem: string, detalhe?: unknown): ErroClassificado {
  return { familia: 'transitorio', codigo, mensagem, detalhe };
}

export function erroPermanente(codigo: string, mensagem: string, detalhe?: unknown): ErroClassificado {
  return { familia: 'permanente', codigo, mensagem, detalhe };
}

const MSG_INSTAVEL =
  'A Meta esta instavel ou limitou as requisicoes agora. A fila tenta de novo automaticamente.';

/**
 * Codigos que a Meta devolve de forma reconhecidamente temporaria.
 * 4/17/32/613 sao os limites de taxa; 1/2 sao falhas transitorias de servico.
 */
const CODIGOS_TRANSITORIOS = new Set([1, 2, 4, 17, 32, 341, 613, 80004]);

/** Mensagens em portugues por codigo da Meta. */
const MENSAGENS: Record<number, { familia: FamiliaErro; mensagem: string }> = {
  4: { familia: 'transitorio', mensagem: MSG_INSTAVEL },
  17: { familia: 'transitorio', mensagem: MSG_INSTAVEL },
  32: { familia: 'transitorio', mensagem: MSG_INSTAVEL },
  341: { familia: 'transitorio', mensagem: MSG_INSTAVEL },
  613: { familia: 'transitorio', mensagem: MSG_INSTAVEL },
  80004: {
    familia: 'transitorio',
    mensagem: 'Limite de publicacoes da Meta atingido nesta janela de 24h. A fila reagenda sozinha.',
  },
  190: {
    familia: 'permanente',
    mensagem:
      'O token de acesso da Meta expirou ou foi revogado. Regere o token do System User no Business Manager da Astart.',
  },
  200: {
    familia: 'permanente',
    mensagem:
      'O app da Astart nao tem permissao para publicar nesta conta. Confira o acesso de parceiro a Pagina e ao Instagram no Business Manager.',
  },
  10: {
    familia: 'permanente',
    mensagem:
      'Permissao negada pela Meta para esta acao. Verifique as permissoes aprovadas do app e o acesso de parceiro.',
  },
  3: {
    familia: 'permanente',
    mensagem: 'O app da Astart nao esta autorizado a usar este endpoint da Meta.',
  },
  100: {
    familia: 'permanente',
    mensagem: 'A Meta recusou os parametros da publicacao. Confira a midia, a legenda e o vinculo da conta.',
  },
  9004: {
    familia: 'permanente',
    mensagem:
      'A conta do Instagram nao esta acessivel pelo app. Confirme que e uma conta Business vinculada a uma Pagina.',
  },
  2207003: {
    familia: 'transitorio',
    mensagem: 'A Meta nao conseguiu baixar a midia agora. Nova tentativa automatica.',
  },
  2207004: {
    familia: 'permanente',
    mensagem:
      'A Meta nao conseguiu baixar o arquivo de midia. Verifique se o arquivo ainda esta no Storage e se o link assinado nao expirou.',
  },
  2207005: {
    familia: 'permanente',
    mensagem: 'Formato de arquivo nao suportado pelo Instagram. Use JPEG ou PNG.',
  },
  2207006: { familia: 'permanente', mensagem: 'A midia informada nao foi encontrada pela Meta.' },
  2207009: {
    familia: 'permanente',
    mensagem:
      'Proporcao da imagem fora do permitido pelo Instagram. Use algo entre 4:5 (vertical) e 1.91:1 (horizontal).',
  },
  2207010: { familia: 'permanente', mensagem: 'A legenda excede o limite de caracteres do Instagram.' },
  2207020: {
    familia: 'transitorio',
    mensagem: 'O container de midia ainda esta sendo processado pela Meta.',
  },
  2207023: { familia: 'permanente', mensagem: 'Tipo de midia desconhecido para o Instagram.' },
  2207026: { familia: 'permanente', mensagem: 'Formato de video nao suportado pelo Instagram.' },
  2207027: {
    familia: 'permanente',
    mensagem: 'O video e mais longo do que o Instagram aceita para este formato.',
  },
  2207028: {
    familia: 'permanente',
    mensagem: 'O video e mais curto do que o Instagram aceita para este formato.',
  },
  2207032: {
    familia: 'transitorio',
    mensagem: 'Falha temporaria ao criar a midia na Meta. Nova tentativa automatica.',
  },
  2207042: {
    familia: 'permanente',
    mensagem: 'A Meta recusou a midia por limite de tamanho ou duracao.',
  },
  2207050: {
    familia: 'permanente',
    mensagem: 'A conta do Instagram nao esta vinculada a uma Pagina do Facebook ou nao e uma conta Business.',
  },
  2207051: { familia: 'transitorio', mensagem: MSG_INSTAVEL },
  2207053: { familia: 'transitorio', mensagem: 'Erro temporario de processamento da midia na Meta.' },
};

interface CorpoErroMeta {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
    fbtrace_id?: string;
  };
}

/**
 * Regra de decisao:
 *   1. codigo conhecido manda;
 *   2. sem codigo conhecido, HTTP 429/5xx e transitorio;
 *   3. qualquer outro 4xx e permanente — nao adianta reenviar o que a Meta recusou.
 * O texto cru da Meta vai para `detalhe` (log), nunca para `mensagem` (tela).
 */
export function classificarErroMeta(status: number, corpo: unknown): ErroClassificado {
  const erro = (corpo as CorpoErroMeta | null)?.error;
  const codigo = erro?.code;
  const subcodigo = erro?.error_subcode;

  const conhecido = (subcodigo !== undefined ? MENSAGENS[subcodigo] : undefined) ??
    (codigo !== undefined ? MENSAGENS[codigo] : undefined);

  const identificador = [codigo, subcodigo].filter((v) => v !== undefined).join('_') || `http_${status}`;

  if (conhecido) {
    return {
      familia: conhecido.familia,
      codigo: `meta_${identificador}`,
      mensagem: conhecido.mensagem,
      detalhe: erro ?? corpo,
    };
  }

  if (codigo !== undefined && CODIGOS_TRANSITORIOS.has(codigo)) {
    return erroTransitorio(`meta_${identificador}`, MSG_INSTAVEL, erro ?? corpo);
  }

  if (status === 429 || status >= 500) {
    return erroTransitorio(`meta_${identificador}`, MSG_INSTAVEL, erro ?? corpo);
  }

  return erroPermanente(
    `meta_${identificador}`,
    'A Meta recusou esta publicacao e nao adianta tentar de novo sem mudar algo. ' +
      'O detalhe tecnico esta no log de eventos deste item.',
    erro ?? corpo,
  );
}

/**
 * Falha de um passo da maquina de estados, ja classificada e ja em portugues.
 * Tudo que sobe ate o worker passa por aqui — nao existe erro sem familia,
 * sem codigo e sem mensagem legivel.
 */
export class FalhaPasso extends Error {
  constructor(readonly classificado: ErroClassificado) {
    super(classificado.mensagem);
    this.name = 'FalhaPasso';
  }
}
