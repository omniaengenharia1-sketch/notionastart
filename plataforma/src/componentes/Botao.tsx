import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'texto';
type Tamanho = 'normal' | 'pequeno';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  children: ReactNode;
}

// Pílula, como o "Ver Soluções" do site da Astart.
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'transition-colors disabled:opacity-50 disabled:pointer-events-none';

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-pink text-white border border-pink hover:bg-pink-tinta hover:border-pink-tinta',
  secundario: 'bg-superficie text-tinta border border-tinta hover:bg-tinta hover:text-superficie',
  texto: 'bg-transparent text-tinta-2 border border-transparent hover:text-pink-tinta',
};

const TAMANHOS: Record<Tamanho, string> = {
  normal: 'px-4 py-2 text-[12px]',
  pequeno: 'px-3 py-1 text-[11px]',
};

export function Botao({ variante = 'secundario', tamanho = 'normal', className = '', children, ...resto }: Props) {
  return (
    <button className={`${BASE} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`} {...resto}>
      {children}
    </button>
  );
}
