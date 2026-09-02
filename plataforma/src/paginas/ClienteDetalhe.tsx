import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Cabecalho } from '../componentes/Layout';
import { Abas, type Aba } from '../componentes/Abas';
import { Aviso, Cartao, Definicoes } from '../componentes/Cartao';
import { Pilula, type TomPilula } from '../componentes/Pilula';
import { Botao } from '../componentes/Botao';
import { clientePorId, POSTS } from '../dados/mock';
import { piorAcesso } from './Clientes';
import type { AcessoParceiro, ContaSocial, Perfil } from '../dados/tipos';

const TOM_ACESSO: Record<AcessoParceiro, TomPilula> = {
  concedido: 'ok',
  pendente: 'espera',
  expirado: 'falha',
};

/** §3.4 — Cliente é a entidade central, com uma aba por conta atendida. */
export function ClienteDetalhe({ operador }: { operador: Perfil }) {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const cliente = clientePorId(id);
  const [aba, setAba] = useState('geral');

  if (!cliente) {
    return (
      <>
        <Cabecalho titulo="Cliente não encontrado" linha="O endereço aponta para um cliente que não existe." />
        <div className="px-6">
          <Botao onClick={() => nav('/clientes')}>Voltar para clientes</Botao>
        </div>
      </>
    );
  }

  const podeEditar = operador.papel === 'admin';
  const doCliente = POSTS.filter((p) => p.clienteId === cliente.id);

  const abas: Aba[] = [
    { id: 'geral', titulo: 'Visão geral' },
    ...cliente.contas.map((c) => ({
      id: c.id,
      titulo: c.nomeExibicao,
      alerta: c.acessoParceiro !== 'concedido',
    })),
    { id: 'aprovacao', titulo: 'Aprovação' },
    { id: 'conteudo', titulo: 'Conteúdo', contador: doCliente.length },
  ];

  return (
    <>
      <Cabecalho
        titulo={cliente.nome}
        linha={`${cliente.slug} · ${cliente.fusoHorario} · cliente desde ${cliente.desde}`}
        acoes={
          <>
            <Pilula tom={TOM_ACESSO[piorAcesso(cliente)]}>acesso {piorAcesso(cliente)}</Pilula>
            <Botao tamanho="pequeno" onClick={() => nav('/clientes')}>
              Todos os clientes
            </Botao>
          </>
        }
      />

      <div className="px-6 pb-8">
        <Abas abas={abas} ativa={aba} aoTrocar={setAba}>
          {aba === 'geral' && <Geral cliente={cliente} podeEditar={podeEditar} />}
          {cliente.contas.map(
            (c) => aba === c.id && <ContaAba key={c.id} conta={c} podeEditar={podeEditar} />,
          )}
          {aba === 'aprovacao' && <Aprovacao cliente={cliente} />}
          {aba === 'conteudo' && <Conteudo total={doCliente.length} />}
        </Abas>
      </div>
    </>
  );
}

function Geral({ cliente, podeEditar }: { cliente: NonNullable<ReturnType<typeof clientePorId>>; podeEditar: boolean }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-5">
      <Cartao className="flex flex-col gap-3">
        <p className="rotulo border-b border-linha pb-1.5">Cadastro</p>
        <Definicoes
          pares={[
            ['Nome', cliente.nome],
            ['Slug', cliente.slug],
            ['Fuso', cliente.fusoHorario],
            ['Cliente desde', cliente.desde],
            ['Situação', cliente.ativo ? 'ativo' : 'inativo'],
          ]}
        />
        <p className="text-[11px] leading-relaxed text-tinta-3">
          O fuso não muda o agendamento no banco — ele é <code className="font-mono">timestamptz</code>.
          Muda só o horário exibido no calendário e no portal deste cliente.
        </p>
        {podeEditar && (
          <Botao tamanho="pequeno" className="self-start">
            Editar cadastro
          </Botao>
        )}
      </Cartao>

      <Cartao className="flex flex-col gap-3">
        <p className="rotulo border-b border-linha pb-1.5">Este cliente em outros módulos</p>
        <div className="flex flex-wrap gap-2">
          {['Contrato', 'Financeiro', 'Origem no CRM'].map((t) => (
            <span
              key={t}
              className="rounded-full border border-dashed border-linha-forte px-2.5 py-1 text-[11.5px] text-tinta-3"
            >
              {t} — a fazer
            </span>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-tinta-3">
          Quando esses módulos existirem, cada um vira uma aba aqui. A tabela{' '}
          <code className="font-mono">clientes</code> é o que costura os quatro.
        </p>
      </Cartao>
    </div>
  );
}

function ContaAba({ conta, podeEditar }: { conta: ContaSocial; podeEditar: boolean }) {
  const oauth = conta.origemToken === 'oauth';
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-5">
      <Cartao className="flex flex-col gap-3">
        <p className="rotulo border-b border-linha pb-1.5">Conta</p>
        <Definicoes
          pares={[
            ['Plataforma', conta.plataforma],
            ['Exibição', conta.nomeExibicao],
            [
              conta.plataforma === 'instagram' ? 'ig_user_id' : 'page_id',
              <span className="font-mono text-[11px] break-all">{conta.identificador}</span>,
            ],
            ['Situação', conta.ativo ? 'ativa' : 'inativa'],
          ]}
        />
        {conta.acessoParceiro === 'pendente' && (
          <Aviso tom="espera">
            O cliente ainda não aceitou o convite de parceiro no Business Manager. Enquanto isso, esta conta
            não publica.
          </Aviso>
        )}
        {conta.acessoParceiro === 'expirado' && (
          <Aviso tom="falha">
            O acesso de parceiro foi removido. Reative no Business Manager antes de reagendar qualquer peça.
          </Aviso>
        )}
      </Cartao>

      <Cartao className="flex flex-col gap-3">
        <p className="rotulo border-b border-linha pb-1.5">Token</p>
        <Definicoes
          pares={[
            ['Origem', oauth ? 'OAuth do próprio cliente' : 'System User do BM da Astart'],
            ['Chave no Vault', <span className="font-mono text-[11px]">{conta.tokenRef ?? 'meta_system_user_token'}</span>],
            ['Vencimento', oauth ? (conta.tokenExpiraEm ?? '—') : 'não expira'],
          ]}
        />
        {oauth ? (
          <Aviso tom="espera">
            Token de OAuth vence. Uma rotina diária renova o que estiver a menos de 7 dias do vencimento e
            avisa a equipe se a renovação falhar.
          </Aviso>
        ) : (
          <Aviso tom="ok">
            Token de System User não expira, então não há rotina de refresh nem risco de a publicação parar
            por token vencido.
          </Aviso>
        )}
        <p className="text-[11px] leading-relaxed text-tinta-3">
          O valor do token nunca chega ao navegador. Ele fica no Vault e é lido só pela Edge Function com
          service role.
        </p>
        {podeEditar && (
          <Botao tamanho="pequeno" className="self-start">
            {oauth ? 'Reconectar conta' : 'Trocar para token próprio'}
          </Botao>
        )}
      </Cartao>
    </div>
  );
}

function Aprovacao({ cliente }: { cliente: NonNullable<ReturnType<typeof clientePorId>> }) {
  const link = cliente.linkAprovacao;
  const ativo = link && !link.revogado;
  return (
    <Cartao className="flex max-w-lg flex-col gap-3">
      <p className="rotulo border-b border-linha pb-1.5">Link de aprovação</p>
      {ativo ? (
        <>
          <Pilula tom="acao">ativo até {link.expiraEm}</Pilula>
          <p className="rounded-md border border-linha bg-papel px-2.5 py-1.5 font-mono text-[10.5px] break-all text-tinta-3">
            astart.app/aprovar/{cliente.slug}-9f3c1a7e…
          </p>
          <div className="flex gap-2">
            <Botao tamanho="pequeno">Copiar link</Botao>
            <Botao tamanho="pequeno">Revogar</Botao>
          </div>
        </>
      ) : (
        <>
          <span className="rotulo">nenhum link ativo</span>
          <Botao variante="primario" tamanho="pequeno" className="self-start">
            Gerar link
          </Botao>
        </>
      )}
      <p className="text-[11px] leading-relaxed text-tinta-3">
        O banco guarda só o <b className="text-tinta-2">hash</b> do token. O valor em claro existe uma única
        vez, no momento em que o link é gerado — se o cliente perder, ninguém recupera: só revogar e gerar
        outro.
      </p>
    </Cartao>
  );
}

function Conteudo({ total }: { total: number }) {
  return (
    <Cartao className="flex max-w-xl flex-col gap-2">
      <p className="rotulo border-b border-linha pb-1.5">Conteúdo do mês</p>
      <p className="numeros text-[25px] leading-none font-medium">{total}</p>
      <p className="text-[12px] text-tinta-3">
        peças no mês corrente. O calendário e a fila deste cliente entram aqui quando o módulo de
        agendamento for portado para React.
      </p>
    </Cartao>
  );
}
