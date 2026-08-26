import { chamarGraph, type RegistroChamada } from '../graph.ts';
import { erroPermanente, FalhaPasso } from '../erros.ts';
import type {
  AdaptadorPlataforma,
  Cota,
  EntradaContainer,
  MidiaRecente,
  ResultadoContainer,
  ResultadoPublicacao,
  StatusContainer,
} from '../adaptador.ts';
import type { ContextoConta } from '../tipos.ts';

const MIMES_IMAGEM = new Set(['image/jpeg', 'image/jpg', 'image/png']);

function exigirIgUserId(ctx: ContextoConta): string {
  if (!ctx.ig_user_id) {
    throw new FalhaPasso(
      erroPermanente(
        'conta_sem_ig_user_id',
        'A conta nao tem o ID do Instagram cadastrado. Preencha ig_user_id em contas_sociais.',
      ),
    );
  }
  return ctx.ig_user_id;
}

export const adaptadorInstagram: AdaptadorPlataforma = {
  plataforma: 'instagram',

  async criarContainer(ctx: ContextoConta, entrada: EntradaContainer): Promise<ResultadoContainer> {
    const igUserId = exigirIgUserId(ctx);

    // Fase 1: imagem unica. Carrossel, Reel e Story entram aqui depois,
    // reaproveitando a mesma assinatura.
    if (entrada.tipo !== 'imagem') {
      throw new FalhaPasso(
        erroPermanente(
          'tipo_fora_da_fase_1',
          `Esta versao publica apenas imagem unica no Instagram. Tipo recebido: "${entrada.tipo}".`,
        ),
      );
    }

    if (entrada.midias.length !== 1) {
      throw new FalhaPasso(
        erroPermanente(
          'quantidade_de_midia_invalida',
          `Um post de imagem unica precisa de exatamente 1 arquivo; foram encontrados ${entrada.midias.length}.`,
        ),
      );
    }

    const midia = entrada.midias[0];
    if (!MIMES_IMAGEM.has(midia.mime.toLowerCase())) {
      throw new FalhaPasso(
        erroPermanente(
          'formato_nao_suportado',
          `O Instagram aceita apenas JPEG ou PNG para imagem. Arquivo enviado: ${midia.mime}.`,
        ),
      );
    }

    const { dados, registro } = await chamarGraph<{ id: string }>({
      metodo: 'POST',
      caminho: `${igUserId}/media`,
      token: ctx.access_token,
      operacao: 'ig.criar_container_imagem',
      corpo: {
        image_url: midia.url,
        caption: entrada.legenda || undefined,
      },
    });

    if (!dados?.id) {
      throw new FalhaPasso(
        erroPermanente(
          'container_sem_id',
          'A Meta aceitou a requisicao mas nao devolveu o ID do container. Verifique o log deste item.',
        ),
      );
    }

    // Imagem nao passa por processamento assincrono: ja nasce pronta.
    return { containerId: dados.id, aguardarProcessamento: false, registros: [registro] };
  },

  async verificarContainer(ctx: ContextoConta, containerId: string): Promise<StatusContainer> {
    const { dados, registro } = await chamarGraph<{ status_code?: string; status?: string }>({
      metodo: 'GET',
      caminho: containerId,
      token: ctx.access_token,
      operacao: 'ig.verificar_container',
      params: { fields: 'status_code,status' },
    });

    const codigo = (dados?.status_code ?? '').toUpperCase();
    const registros = [registro];

    switch (codigo) {
      case 'FINISHED':
        return { estado: 'pronto', detalhe: dados?.status, registros };
      case 'PUBLISHED':
        return { estado: 'publicado', detalhe: dados?.status, registros };
      case 'IN_PROGRESS':
        return { estado: 'processando', detalhe: dados?.status, registros };
      case 'ERROR':
      case 'EXPIRED':
        return { estado: 'erro', detalhe: dados?.status ?? codigo, registros };
      default:
        return { estado: 'processando', detalhe: dados?.status ?? codigo, registros };
    }
  },

  async consultarCota(ctx: ContextoConta): Promise<Cota> {
    const igUserId = exigirIgUserId(ctx);

    const { dados, registro } = await chamarGraph<{
      data?: Array<{ quota_usage?: number; config?: { quota_total?: number; quota_duration?: number } }>;
    }>({
      metodo: 'GET',
      caminho: `${igUserId}/content_publishing_limit`,
      token: ctx.access_token,
      operacao: 'ig.consultar_cota',
      params: { fields: 'config,quota_usage' },
    });

    const linha = dados?.data?.[0];
    // A cota e uma janela movel de 24h mantida pela propria Meta. O total vem
    // da resposta — nunca de um numero chumbado aqui.
    return {
      usadas: linha?.quota_usage ?? 0,
      total: linha?.config?.quota_total ?? 0,
      registros: [registro],
    };
  },

  async publicar(ctx: ContextoConta, containerId: string): Promise<ResultadoPublicacao> {
    const igUserId = exigirIgUserId(ctx);

    const { dados, registro } = await chamarGraph<{ id: string }>({
      metodo: 'POST',
      caminho: `${igUserId}/media_publish`,
      token: ctx.access_token,
      operacao: 'ig.publicar',
      corpo: { creation_id: containerId },
    });

    if (!dados?.id) {
      throw new FalhaPasso(
        erroPermanente(
          'publicacao_sem_id',
          'A Meta respondeu a publicacao sem devolver o ID da midia. Confira a conta antes de tentar de novo.',
        ),
      );
    }

    return { mediaId: dados.id, registros: [registro] };
  },

  async comentar(ctx: ContextoConta, mediaId: string, texto: string): Promise<ResultadoPublicacao> {
    const { dados, registro } = await chamarGraph<{ id: string }>({
      metodo: 'POST',
      caminho: `${mediaId}/comments`,
      token: ctx.access_token,
      operacao: 'ig.primeiro_comentario',
      corpo: { message: texto },
    });

    return { mediaId: dados?.id ?? '', registros: [registro] };
  },

  async midiasPublicadasApos(
    ctx: ContextoConta,
    desde: Date,
  ): Promise<{ candidatos: MidiaRecente[]; registros: RegistroChamada[] }> {
    const igUserId = exigirIgUserId(ctx);

    const { dados, registro } = await chamarGraph<{
      data?: Array<{ id: string; timestamp: string }>;
    }>({
      metodo: 'GET',
      caminho: `${igUserId}/media`,
      token: ctx.access_token,
      operacao: 'ig.midias_recentes',
      params: { fields: 'id,timestamp', limit: '25' },
    });

    // Margem de 60s: o timestamp da Meta e o do servidor dela, nao o nosso.
    const corte = desde.getTime() - 60_000;
    const candidatos = (dados?.data ?? []).filter((m) => {
      const t = Date.parse(m.timestamp);
      return Number.isFinite(t) && t >= corte;
    });

    return { candidatos, registros: [registro] };
  },
};
