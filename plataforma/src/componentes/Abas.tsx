import type { ReactNode } from 'react';

export interface Aba {
  id: string;
  titulo: string;
  contador?: number;
  /** Marca que exige atenção — some quando o problema é resolvido. */
  alerta?: boolean;
}

interface Props {
  abas: Aba[];
  ativa: string;
  aoTrocar: (id: string) => void;
  children: ReactNode;
}

export function Abas({ abas, ativa, aoTrocar, children }: Props) {
  return (
    <div className="flex flex-col">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-linha">
        {abas.map((a) => {
          const on = a.id === ativa;
          return (
            <button
              key={a.id}
              role="tab"
              aria-selected={on}
              onClick={() => aoTrocar(a.id)}
              className={
                'flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-[11px] font-semibold tracking-[0.09em] uppercase transition-colors ' +
                (on
                  ? 'border-pink text-pink-tinta'
                  : 'border-transparent text-tinta-3 hover:text-tinta')
              }
            >
              {a.titulo}
              {a.contador !== undefined && (
                <span className="numeros text-[10px] font-medium text-tinta-3">{a.contador}</span>
              )}
              {a.alerta && <i className="size-1.5 rounded-full bg-falha" aria-label="requer atenção" />}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-5">
        {children}
      </div>
    </div>
  );
}
