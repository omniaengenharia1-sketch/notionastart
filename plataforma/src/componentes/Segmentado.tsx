interface Props<T extends string> {
  valor: T;
  opcoes: { valor: T; texto: string }[];
  aoTrocar: (v: T) => void;
  rotuloGrupo: string;
}

export function Segmentado<T extends string>({ valor, opcoes, aoTrocar, rotuloGrupo }: Props<T>) {
  return (
    <div role="group" aria-label={rotuloGrupo} className="flex overflow-hidden rounded-full border border-linha-forte">
      {opcoes.map((o, i) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={valor === o.valor}
          onClick={() => aoTrocar(o.valor)}
          className={
            'px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors ' +
            (i > 0 ? 'border-l border-linha-forte ' : '') +
            (valor === o.valor ? 'bg-tinta text-papel' : 'bg-superficie text-tinta-2 hover:bg-superficie-2')
          }
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
