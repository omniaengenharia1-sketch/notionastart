import { useNavigate } from 'react-router-dom';
import { Cabecalho } from '../componentes/Layout';
import { Botao } from '../componentes/Botao';

export interface Modulo {
  nome: string;
  linha: string;
  resumo: string;
  itens: string[];
  base: string;
}

export const MODULOS: Record<string, Modulo> = {
  calendario: {
    nome: 'Calendário',
    linha: 'O mês inteiro por cliente, com arrastar para reagendar.',
    resumo:
      'A tela já foi desenhada e aprovada no protótipo. Falta portá-la para React em cima destes componentes — é o próximo passo do módulo 1.',
    itens: [
      'Visão mensal e semanal, filtro por cliente, cor por status.',
      'Arrastar uma peça para outro dia reescreve agendado_para.',
      'Peça publicada não é reagendada.',
    ],
    base: 'Consome posts e clientes, que já existem no banco com RLS.',
  },
  editor: {
    nome: 'Editor de post',
    linha: 'Upload, legenda, destino e preview fiel do feed.',
    resumo:
      'Validação antes do upload: proporção, formato, contagem de caracteres e hashtags. Bloquear o erro na tela custa menos do que descobrir que a Meta recusou na hora de publicar.',
    itens: [
      'Imagem: JPEG ou PNG, proporção entre 4:5 e 1.91:1.',
      'Carrossel: 2 a 10 itens, com aviso destacado quando as proporções divergem.',
      'Reel: 9:16, com alerta de duração fora do padrão.',
      'Primeiro comentário publicado logo após o post; falha aqui não derruba a peça.',
    ],
    base: 'Grava em posts e post_midias, e sobe arquivo para o bucket privado midias-posts.',
  },
  fila: {
    nome: 'Fila de publicação',
    linha: 'O que está saindo, o que falhou e por quê.',
    resumo:
      'Uma linha por peça × conta de destino. O worker já roda em produção; falta a tela que mostra o estado dele.',
    itens: [
      'Estado, tentativas, próxima tentativa e motivo em português.',
      'Linha do tempo de publicacao_eventos por item.',
      'Botão de reprocessar, que respeita o lease e a reconciliação.',
    ],
    base: 'Lê post_alvos e publicacao_eventos. O worker publicar-tick já está construído e testado.',
  },
  aprovacao: {
    nome: 'Portal do cliente',
    linha: 'O link de aprovação, do lado de quem aprova.',
    resumo:
      'Acessado por link com token, sem cadastro. Aprovar move a peça direto para agendado; reprovar devolve para rascunho com o comentário.',
    itens: [
      'Lista só as peças daquele cliente, validadas pelo hash do token.',
      'Comentário por peça, gravado em aprovacao_comentarios.',
      'anon não tem privilégio nenhum: a leitura passa por Edge Function com service role.',
    ],
    base: 'Usa links_aprovacao e aprovacao_comentarios, já criadas com RLS.',
  },
  financeiro: {
    nome: 'Financeiro',
    linha: 'Quanto entra por cliente, quando entra e o que ainda não entrou.',
    resumo:
      'Hierarquia Grupo → Categoria → Subcategoria em três tabelas, editável pela interface sem alterar schema. Rateio de uma transação entre vários clientes, com validação em banco de que as partes somam o total.',
    itens: [
      'Rateio por cliente: uma assinatura de ferramenta ou um freelancer dividido entre as contas atendidas.',
      'Constraint no banco impedindo rateio que não fecha com o valor total.',
      'Classificação assistida por IA sugerindo Grupo/Categoria/Subcategoria pela descrição.',
      'A sugestão nunca é aplicada sozinha: fica pendente de confirmação, e o banco guarda o que foi sugerido e o que foi aceito.',
    ],
    base: 'Reaproveita clientes. Precisa de tabelas novas para hierarquia, lançamentos e rateio.',
  },
  contratos: {
    nome: 'Contratos',
    linha: 'Vigência, escopo e reajuste em um lugar só.',
    resumo:
      'O contrato define o que a operação pode entregar. Fora do sistema, a agência descobre tarde que o escopo estourou.',
    itens: [
      'Vigência com aviso antes do vencimento e da janela de aviso prévio.',
      'Escopo contratado por mês confrontado com o que a fila realmente publicou.',
      'Índice e data de reajuste, para o financeiro não usar valor velho.',
      'PDF assinado anexado ao cliente, com histórico de aditivos.',
    ],
    base: 'Cruza clientes com posts para comparar escopo contratado × entregue.',
  },
  crm: {
    nome: 'CRM',
    linha: 'O funil antes do cliente virar cliente.',
    resumo:
      'Prospect não pode morar na cabeça de quem atendeu. O CRM guarda a origem do lead, o que foi proposto e por que fechou ou não.',
    itens: [
      'Funil com etapas da agência: lead, diagnóstico, proposta, negociação, fechado.',
      'Origem do lead, para saber o que realmente traz cliente.',
      'Proposta versionada que vira contrato ao ser aceita.',
      'Motivo de perda registrado — o dado que ninguém anota e todo mundo sente falta depois.',
    ],
    base: 'Nasce sozinho e depois promove um prospect a cliente, criando a linha em clientes.',
  },
};

export function AFazer({ chave }: { chave: string }) {
  const nav = useNavigate();
  const m = MODULOS[chave];
  if (!m) return null;

  return (
    <>
      <Cabecalho titulo={m.nome} linha={m.linha} />
      <div className="px-6 pb-8">
        <div className="max-w-3xl rounded-lg border border-linha bg-superficie p-6">
          <span className="mb-3.5 inline-flex rounded-full border border-linha-forte px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-tinta-3">
            ainda não construído
          </span>
          <p className="mb-5 max-w-[64ch] text-[13px] text-tinta-2">{m.resumo}</p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {m.itens.map((i) => (
              <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-tinta-2">
                <i className="mt-2 size-[5px] shrink-0 rounded-full bg-pink" />
                {i}
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-linha pt-4 text-[11.5px] leading-relaxed text-tinta-3">
            {m.base}
          </p>
          <Botao className="mt-5" onClick={() => nav('/')}>
            Voltar para o início
          </Botao>
        </div>
      </div>
    </>
  );
}
