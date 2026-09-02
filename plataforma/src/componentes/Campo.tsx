import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

const CONTROLE =
  'w-full rounded-md border border-linha-forte bg-papel px-2.5 py-1.5 text-[13px] ' +
  'text-tinta placeholder:text-tinta-3 focus:border-pink';

function Envolucro({ rotulo, dica, id, children }: { rotulo: string; dica?: string; id: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      {children}
      {dica && <p className="text-[11px] leading-relaxed text-tinta-3">{dica}</p>}
    </div>
  );
}

export function CampoTexto({
  rotulo,
  dica,
  ...resto
}: { rotulo: string; dica?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Envolucro rotulo={rotulo} dica={dica} id={id}>
      <input id={id} className={CONTROLE} {...resto} />
    </Envolucro>
  );
}

export function CampoArea({
  rotulo,
  dica,
  ...resto
}: { rotulo: string; dica?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Envolucro rotulo={rotulo} dica={dica} id={id}>
      <textarea id={id} className={`${CONTROLE} min-h-24 resize-y leading-relaxed`} {...resto} />
    </Envolucro>
  );
}

export function CampoSelecao({
  rotulo,
  dica,
  opcoes,
  ...resto
}: { rotulo: string; dica?: string; opcoes: { valor: string; texto: string }[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Envolucro rotulo={rotulo} dica={dica} id={id}>
      <select id={id} className={CONTROLE} {...resto}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </Envolucro>
  );
}
