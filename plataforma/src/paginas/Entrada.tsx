import { useState } from 'react';
import { EQUIPE } from '../dados/mock';
import type { Perfil } from '../dados/tipos';

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return (p[0]?.charAt(0) ?? '') + (p[1]?.charAt(0) ?? '');
}

/**
 * Duas portas: a apresentação da plataforma e a escolha de quem está operando.
 *
 * Escolher o nome IDENTIFICA, não autentica. Quando a Auth do Supabase entrar,
 * o login por link mágico acontece antes desta tela — o seletor continua sendo
 * a conveniência de quiosque, não o controle de acesso.
 */
export function Entrada({ aoEntrar }: { aoEntrar: (p: Perfil) => void }) {
  const [porta, setPorta] = useState<'apresentacao' | 'quem'>('apresentacao');

  if (porta === 'apresentacao') {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-[#111111] px-6 py-8 text-white">
        <p className="mb-9 text-center text-[22px] leading-[0.98] font-semibold tracking-tight lowercase">
          astart
          <br />
          studi<span className="text-[#ea1a6e]">o</span>
        </p>
        <h1 className="m-0 max-w-[16ch] text-center font-display text-[clamp(30px,5.4vw,58px)] leading-[1.08] font-medium text-balance">
          A operação da agência em <em className="text-[#ea1a6e]">um lugar só</em>.
        </h1>
        <p className="mt-4 text-center text-[14px] font-semibold italic opacity-80">
          Conteúdo, financeiro, contratos e CRM sem trocar de aba.
        </p>
        <button
          onClick={() => setPorta('quem')}
          className="mt-8 rounded-full border border-white bg-white px-10 py-3 text-[13px] font-semibold text-[#111111] transition-colors hover:border-[#ea1a6e] hover:bg-[#ea1a6e] hover:text-white"
        >
          Entrar
        </button>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-papel px-6 py-8">
      <p className="mb-7 text-center text-[16px] leading-[0.98] font-semibold tracking-tight lowercase">
        astart
        <br />
        studi<span className="text-pink">o</span>
      </p>
      <h1 className="m-0 mb-1.5 text-center font-display text-[clamp(26px,3.6vw,38px)] font-medium">
        Quem está <em className="text-pink">operando</em>?
      </h1>
      <p className="mb-7 max-w-[52ch] text-center text-[12.5px] text-tinta-3">
        Toque no seu nome. Tudo que você agendar, aprovar ou reprocessar fica registrado no seu nome.
      </p>

      <div className="grid w-full max-w-[530px] grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        {EQUIPE.filter((p) => p.ativo).map((p) => (
          <button
            key={p.id}
            onClick={() => aoEntrar(p)}
            className="flex flex-col items-center gap-2.5 rounded-lg border border-linha bg-superficie px-3.5 pt-5 pb-4 text-center transition-all hover:-translate-y-0.5 hover:border-pink"
          >
            <span
              className="grid size-13 place-items-center rounded-full font-display text-[20px] text-white"
              style={{ background: p.cor }}
            >
              {iniciais(p.nome)}
            </span>
            <span className="text-[13.5px] leading-tight font-semibold">{p.nome}</span>
            <span className="font-mono text-[9.5px] tracking-wider text-tinta-3">{p.papel}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setPorta('apresentacao')}
        className="mt-7 text-[11.5px] text-tinta-3 underline"
      >
        Voltar
      </button>

      <p className="mt-6 max-w-[60ch] border-t border-linha pt-3.5 text-center text-[11px] leading-relaxed text-tinta-3">
        O nome vem da tabela <code className="font-mono">perfis</code>, que também define o que cada um
        pode fazer: <b>admin</b> mexe em contas e tokens, <b>operacao</b> cria e publica,{' '}
        <b>financeiro</b> lança e concilia, <b>leitura</b> só acompanha.
      </p>
    </section>
  );
}
