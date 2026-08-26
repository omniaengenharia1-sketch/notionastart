import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { RegistroChamada } from './graph.ts';

/**
 * Log append-only. Nunca derruba o passo: se o log falhar, o erro vai para o
 * stderr da function, mas a maquina de estados segue.
 */
export async function registrarEvento(
  sb: SupabaseClient,
  postAlvoId: string,
  evento: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { error } = await sb
      .from('publicacao_eventos')
      .insert({ post_alvo_id: postAlvoId, evento, payload });
    if (error) throw error;
  } catch (e) {
    console.error(
      JSON.stringify({
        nivel: 'erro',
        origem: 'registrarEvento',
        post_alvo_id: postAlvoId,
        evento,
        detalhe: e instanceof Error ? e.message : String(e),
      }),
    );
  }
}

export async function registrarChamadas(
  sb: SupabaseClient,
  postAlvoId: string,
  registros: RegistroChamada[],
): Promise<void> {
  for (const r of registros) {
    await registrarEvento(sb, postAlvoId, `meta.${r.operacao}`, r as unknown as Record<string, unknown>);
  }
}

/**
 * Falha silenciosa e proibida: alem do status visivel e do log, uma falha
 * permanente dispara alerta se ALERTA_WEBHOOK_URL estiver configurada.
 */
export async function alertar(titulo: string, contexto: Record<string, unknown>): Promise<void> {
  console.error(JSON.stringify({ nivel: 'alerta', titulo, ...contexto }));

  const url = Deno.env.get('ALERTA_WEBHOOK_URL')?.trim();
  if (!url) return;

  const linhas = Object.entries(contexto).map(([k, v]) => `• ${k}: ${String(v)}`);
  const texto = `🚨 *Agendamento Meta* — ${titulo}\n${linhas.join('\n')}`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texto, content: texto }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch (e) {
    console.error(
      JSON.stringify({
        nivel: 'erro',
        origem: 'alertar',
        detalhe: e instanceof Error ? e.message : String(e),
      }),
    );
  }
}
