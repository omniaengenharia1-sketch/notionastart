/**
 * Fase 1 — teste ponta a ponta sem interface.
 *
 * Insere um post de imagem unica agendado para daqui a N minutos e fica
 * imprimindo a evolucao dos estados ate um estado final.
 *
 *   npm install
 *   cp .env.example .env   # preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *   npm run teste:publicacao -- \
 *     --ig-user-id 178414... \
 *     --imagem ./exemplos/post.jpg \
 *     --legenda "Teste de publicacao da Astart" \
 *     --minutos 2
 */

import { existsSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Carrega .env sem dependencia extra. Variavel ja definida no shell vence. */
function carregarEnv(caminho = '.env'): void {
  if (!existsSync(caminho)) return;
  for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith('#')) continue;
    const igual = limpa.indexOf('=');
    if (igual < 1) continue;
    const chave = limpa.slice(0, igual).trim();
    if (process.env[chave] !== undefined) continue;
    process.env[chave] = limpa.slice(igual + 1).trim().replace(/^["']|["']$/g, '');
  }
}

// --- Argumentos -------------------------------------------------------------

function args(): Record<string, string> {
  const saida: Record<string, string> = {};
  const lista = process.argv.slice(2);
  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    if (!item?.startsWith('--')) continue;
    const chave = item.slice(2);
    const valor = lista[i + 1];
    if (valor && !valor.startsWith('--')) {
      saida[chave] = valor;
      i++;
    } else {
      saida[chave] = 'true';
    }
  }
  return saida;
}

function exigir(valor: string | undefined, mensagem: string): string {
  if (!valor || !valor.trim()) {
    console.error(`\n  ✖ ${mensagem}\n`);
    process.exit(1);
  }
  return valor;
}

// --- Utilitarios ------------------------------------------------------------

const MIMES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

/** Le largura/altura direto do arquivo, sem dependencia externa. */
function dimensoes(buf: Buffer): { largura: number; altura: number } | null {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { largura: buf.readUInt32BE(16), altura: buf.readUInt32BE(20) };
  }

  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    const SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marcador = buf[i + 1];
      if (marcador === undefined) break;
      if (marcador === 0xd8 || marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd7)) {
        i += 2;
        continue;
      }
      const tamanho = buf.readUInt16BE(i + 2);
      if (SOF.has(marcador)) {
        return { altura: buf.readUInt16BE(i + 5), largura: buf.readUInt16BE(i + 7) };
      }
      i += 2 + tamanho;
    }
  }

  return null;
}

function hora(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false });
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ESTADOS_FINAIS = new Set(['publicado', 'falhou', 'cancelado']);
const STATUS_FINAIS = new Set(['publicado', 'publicado_parcial', 'falhou', 'cancelado']);

// --- Preparo ----------------------------------------------------------------

interface Preparo {
  postId: string;
  clienteId: string;
  contaId: string;
  agendadoPara: Date;
}

async function preparar(sb: SupabaseClient, a: Record<string, string>): Promise<Preparo> {
  const caminho = exigir(a['imagem'], 'Informe --imagem <caminho para .jpg ou .png>');
  const ext = extname(caminho).toLowerCase();
  const mime = MIMES[ext];
  if (!mime) {
    console.error(`\n  ✖ O Instagram aceita apenas JPEG ou PNG para imagem unica. Recebido: "${ext}"\n`);
    process.exit(1);
  }

  const arquivo = readFileSync(caminho);
  const dim = dimensoes(arquivo);

  if (dim) {
    const proporcao = dim.largura / dim.altura;
    console.log(`  imagem   ${dim.largura}x${dim.altura} (${proporcao.toFixed(3)}:1), ${(arquivo.length / 1024).toFixed(0)} KB`);
    if (proporcao < 0.8 || proporcao > 1.91) {
      console.warn(
        `  ⚠ proporcao fora do aceito pelo Instagram (4:5 = 0.800 ate 1.91:1). ` +
          `A Meta deve recusar este arquivo.`,
      );
    }
  } else {
    console.log(`  imagem   ${(arquivo.length / 1024).toFixed(0)} KB (dimensoes nao lidas)`);
  }

  // --- cliente ---
  const slug = a['cliente'] ?? 'teste-astart';
  const { data: cliente, error: erroCliente } = await sb
    .from('clientes')
    .upsert({ nome: a['cliente-nome'] ?? 'Cliente de Teste', slug }, { onConflict: 'slug' })
    .select('id, nome, slug')
    .single();
  if (erroCliente) throw new Error(`clientes: ${erroCliente.message}`);
  console.log(`  cliente  ${cliente.nome} (${cliente.slug})`);

  // --- conta social ---
  let contaId = a['conta'];
  if (!contaId) {
    const igUserId = exigir(
      a['ig-user-id'],
      'Informe --ig-user-id <id da conta Instagram Business> ou --conta <uuid de contas_sociais>',
    );
    const { data: conta, error: erroConta } = await sb
      .from('contas_sociais')
      .upsert(
        {
          cliente_id: cliente.id,
          plataforma: 'instagram',
          nome_exibicao: a['conta-nome'] ?? `IG ${igUserId}`,
          ig_user_id: igUserId,
          page_id: a['page-id'] ?? null,
          token_ref: a['token-ref'] ?? null,
          ativo: true,
        },
        { onConflict: 'ig_user_id' },
      )
      .select('id, nome_exibicao, token_ref')
      .single();
    if (erroConta) throw new Error(`contas_sociais: ${erroConta.message}`);
    contaId = conta.id;
    console.log(
      `  conta    ${conta.nome_exibicao} · token: ${conta.token_ref ?? 'meta_system_user_token (System User do BM)'}`,
    );
  }

  // --- post ---
  const minutos = Number(a['minutos'] ?? '2');
  const agendadoPara = new Date(Date.now() + minutos * 60_000);

  const { data: post, error: erroPost } = await sb
    .from('posts')
    .insert({
      cliente_id: cliente.id,
      titulo_interno: a['titulo'] ?? `Teste fase 1 — ${new Date().toISOString()}`,
      tipo: 'imagem',
      legenda: a['legenda'] ?? 'Teste de publicacao automatica da Astart.',
      primeiro_comentario: a['primeiro-comentario'] ?? null,
      status: 'rascunho',
    })
    .select('id')
    .single();
  if (erroPost) throw new Error(`posts: ${erroPost.message}`);

  // --- upload ---
  const nome = `0-${basename(caminho).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storagePath = `${cliente.id}/${post.id}/${nome}`;
  const { error: erroUpload } = await sb.storage
    .from('midias-posts')
    .upload(storagePath, arquivo, { contentType: mime, upsert: true });
  if (erroUpload) throw new Error(`storage: ${erroUpload.message}`);
  console.log(`  storage  midias-posts/${storagePath}`);

  const { error: erroMidia } = await sb.from('post_midias').insert({
    post_id: post.id,
    ordem: 0,
    storage_path: storagePath,
    mime,
    largura: dim?.largura ?? null,
    altura: dim?.altura ?? null,
    tamanho_bytes: arquivo.length,
  });
  if (erroMidia) throw new Error(`post_midias: ${erroMidia.message}`);

  // Destino escolhido explicitamente. O alvo so fica elegivel na hora agendada.
  const { error: erroAlvo } = await sb.from('post_alvos').insert({
    post_id: post.id,
    conta_social_id: contaId,
    estado: 'pendente',
    proxima_tentativa_em: agendadoPara.toISOString(),
  });
  if (erroAlvo) throw new Error(`post_alvos: ${erroAlvo.message}`);

  const { error: erroAgendar } = await sb
    .from('posts')
    .update({ status: 'agendado', agendado_para: agendadoPara.toISOString() })
    .eq('id', post.id);
  if (erroAgendar) throw new Error(`agendar: ${erroAgendar.message}`);

  return { postId: post.id, clienteId: cliente.id, contaId: contaId!, agendadoPara };
}

// --- Acompanhamento ---------------------------------------------------------

async function acompanhar(sb: SupabaseClient, preparo: Preparo): Promise<number> {
  const limite = Date.now() + 15 * 60_000;
  let ultimoResumo = '';
  let ultimoEventoId = 0;

  console.log(`\n  Acompanhando ate um estado final (Ctrl+C para sair).\n`);

  while (Date.now() < limite) {
    const { data: post } = await sb
      .from('posts')
      .select('status, erro_mensagem')
      .eq('id', preparo.postId)
      .single();

    const { data: alvos } = await sb
      .from('post_alvos')
      .select('id, estado, tentativas, container_id, media_id_publicado, proxima_tentativa_em, erro_mensagem')
      .eq('post_id', preparo.postId)
      .order('criado_em');

    const linhas = (alvos ?? []).map((al) => {
      const partes = [al.estado];
      if (al.tentativas > 0) partes.push(`tentativas=${al.tentativas}`);
      if (al.container_id) partes.push(`container=${al.container_id}`);
      if (al.media_id_publicado) partes.push(`media=${al.media_id_publicado}`);
      return `      alvo ${al.id.slice(0, 8)} · ${partes.join(' · ')}`;
    });

    const resumo = [`post: ${post?.status ?? '?'}`, ...linhas].join('\n');
    if (resumo !== ultimoResumo) {
      console.log(`[${hora()}] ${resumo}`);
      for (const al of alvos ?? []) {
        if (al.erro_mensagem) console.log(`      ↳ ${al.erro_mensagem}`);
      }
      if (post?.erro_mensagem) console.log(`      ↳ ${post.erro_mensagem}`);
      ultimoResumo = resumo;
    }

    const ids = (alvos ?? []).map((al) => al.id);
    if (ids.length > 0) {
      const { data: eventos } = await sb
        .from('publicacao_eventos')
        .select('id, evento, criado_em')
        .in('post_alvo_id', ids)
        .gt('id', ultimoEventoId)
        .order('id');

      for (const ev of eventos ?? []) {
        console.log(`[${hora()}]   · ${ev.evento}`);
        ultimoEventoId = Math.max(ultimoEventoId, ev.id);
      }
    }

    const alvosFinais = (alvos ?? []).every((al) => ESTADOS_FINAIS.has(al.estado));
    if (alvosFinais && post && STATUS_FINAIS.has(post.status)) {
      console.log(`\n  Estado final: ${post.status}\n`);
      return post.status === 'publicado' ? 0 : 1;
    }

    await espera(5000);
  }

  console.log('\n  ⚠ Tempo de acompanhamento esgotado (15 min) sem estado final.\n');
  return 2;
}

// --- Main -------------------------------------------------------------------

async function main(): Promise<void> {
  carregarEnv();
  const a = args();
  const url = exigir(process.env.SUPABASE_URL, 'Defina SUPABASE_URL no ambiente ou no .env');
  const chave = exigir(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Defina SUPABASE_SERVICE_ROLE_KEY no ambiente ou no .env',
  );

  const sb = createClient(url, chave, { auth: { persistSession: false } });

  console.log('\n  Agendamento Meta — teste de publicacao (fase 1)\n');
  const preparo = await preparar(sb, a);
  console.log(`  post     ${preparo.postId}`);
  console.log(`  agendado ${preparo.agendadoPara.toLocaleString('pt-BR')} (o tick roda a cada minuto)`);

  process.exit(await acompanhar(sb, preparo));
}

main().catch((e: unknown) => {
  console.error(`\n  ✖ ${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});
