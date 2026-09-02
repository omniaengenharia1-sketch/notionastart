import type { ReactNode } from 'react';

export type TomPilula = 'ok' | 'espera' | 'falha' | 'acao' | 'neutro';

const TONS: Record<TomPilula, string> = {
  ok: 'bg-ok-suave text-ok',
  espera: 'bg-espera-suave text-espera',
  // Falha usa pílula sólida: assim nunca se confunde com o pink da marca.
  falha: 'bg-falha-solido text-falha-texto',
  acao: 'bg-pink-suave text-pink-tinta',
  neutro: 'bg-neutro-suave text-neutro',
};

export function Pilula({ tom = 'neutro', children }: { tom?: TomPilula; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold whitespace-nowrap ${TONS[tom]}`}
    >
      <i className="size-[5px] shrink-0 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}
