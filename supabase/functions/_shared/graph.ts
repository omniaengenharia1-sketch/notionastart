import { classificarErroMeta, type ErroClassificado, erroTransitorio, FalhaPasso } from './erros.ts';

const BASE = 'https://graph.facebook.com';

/** Registro de uma chamada, para publicacao_eventos. Nunca carrega token. */
export interface RegistroChamada {
  operacao: string;
  metodo: 'GET' | 'POST';
  url: string;
  corpo?: Record<string, unknown>;
  status?: number;
  resposta?: unknown;
  duracao_ms: number;
}

export class FalhaMeta extends FalhaPasso {
  constructor(classificado: ErroClassificado, readonly registro: RegistroChamada) {
    super(classificado);
    this.name = 'FalhaMeta';
  }
}

/**
 * A versao da Graph API e obrigatoria e vem do ambiente. Nao existe default
 * no codigo de proposito: versao chumbada e a forma mais silenciosa de
 * envelhecer uma integracao com a Meta.
 */
export function versaoApi(): string {
  const v = Deno.env.get('META_API_VERSION')?.trim();
  if (!v) {
    throw new Error(
      'META_API_VERSION nao configurada. Defina a versao vigente da Graph API ' +
        '(ex.: v23.0) em supabase secrets.',
    );
  }
  return v.startsWith('v') ? v : `v${v}`;
}

/** Remove qualquer par sensivel antes de virar log. */
function limpar(obj: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const saida: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    saida[k] = /token|secret|authorization/i.test(k) ? '[redigido]' : v;
  }
  return saida;
}

export interface OpcoesChamada {
  metodo: 'GET' | 'POST';
  caminho: string;
  token: string;
  operacao: string;
  params?: Record<string, string | undefined>;
  corpo?: Record<string, string | undefined>;
  timeoutMs?: number;
}

export async function chamarGraph<T>(
  opts: OpcoesChamada,
): Promise<{ dados: T; registro: RegistroChamada }> {
  const inicio = Date.now();
  const url = new URL(`${BASE}/${versaoApi()}/${opts.caminho.replace(/^\//, '')}`);

  for (const [k, v] of Object.entries(opts.params ?? {})) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  const urlSemToken = url.toString();

  const init: RequestInit = {
    method: opts.metodo,
    signal: AbortSignal.timeout(opts.timeoutMs ?? 25_000),
  };

  if (opts.metodo === 'POST') {
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.corpo ?? {})) {
      if (v !== undefined) form.set(k, v);
    }
    form.set('access_token', opts.token);
    init.body = form;
    init.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  } else {
    url.searchParams.set('access_token', opts.token);
  }

  const registroBase: Omit<RegistroChamada, 'duracao_ms'> = {
    operacao: opts.operacao,
    metodo: opts.metodo,
    url: urlSemToken,
    corpo: limpar(opts.corpo),
  };

  let resposta: Response;
  try {
    resposta = await fetch(url, init);
  } catch (e) {
    const registro: RegistroChamada = { ...registroBase, duracao_ms: Date.now() - inicio };
    const eNome = e instanceof Error ? e.name : 'erro';
    throw new FalhaMeta(
      erroTransitorio(
        eNome === 'TimeoutError' ? 'rede_timeout' : 'rede_indisponivel',
        'Nao foi possivel falar com a Meta agora (rede ou timeout). A fila tenta de novo automaticamente.',
        { nome: eNome, mensagem: e instanceof Error ? e.message : String(e) },
      ),
      registro,
    );
  }

  const texto = await resposta.text();
  let corpoJson: unknown = null;
  try {
    corpoJson = texto ? JSON.parse(texto) : null;
  } catch {
    corpoJson = { resposta_nao_json: texto.slice(0, 2000) };
  }

  const registro: RegistroChamada = {
    ...registroBase,
    status: resposta.status,
    resposta: corpoJson,
    duracao_ms: Date.now() - inicio,
  };

  if (!resposta.ok) {
    throw new FalhaMeta(classificarErroMeta(resposta.status, corpoJson), registro);
  }

  return { dados: corpoJson as T, registro };
}
