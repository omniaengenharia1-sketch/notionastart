# Astart — Plataforma interna

Front da plataforma de operação da Astart Studio. React + Vite + TypeScript + Tailwind,
sem acoplamento a Vercel ou Netlify: o build é estático puro em `dist/`.

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # tsc -b && vite build
npm run typecheck
```

## Estado atual

Fase visual. **Nada aqui grava no banco ainda** — todas as telas leem de
`src/dados/mock.ts`. Quando o schema de cada módulo for aprovado, cada função
daquele arquivo vira uma query Supabase com o mesmo formato de retorno, e nada
mais precisa mudar nas páginas.

| Módulo | Estado |
| --- | --- |
| Fundação (layout, navegação, tabelas, formulários) | pronto |
| Clientes (lista + ficha com abas por conta) | desenhado |
| Calendário, Editor, Fila, Portal | a fazer no front — o worker já existe em `../supabase` |
| Financeiro, Contratos, CRM | a fazer |

## Estrutura

```
src/
  estilos/global.css      tokens da marca (branco, preto, pink) nos dois temas
  dados/tipos.ts          tipos do domínio, espelhando o schema
  dados/mock.ts           dados fictícios — o único ponto a trocar por Supabase
  componentes/            Layout, Tabela, Abas, Botao, Pilula, Campo, Cartao
  paginas/                Entrada, Inicio, Clientes, ClienteDetalhe, AFazer
```

## Decisões que o código carrega

- **Pink só para marca e interação.** As cores de estado (ok, espera, falha) são
  separadas do acento; `falhou` usa pílula sólida para nunca se confundir com um botão.
- **Escolher o nome identifica, não autentica.** A tela de operador é conveniência de
  quiosque. Quando a Auth do Supabase entrar, o login acontece antes dela — sem isso,
  a RLS e os campos `criado_por` / `aprovado_por` viram enfeite.
- **System User como padrão, OAuth como exceção.** `contas_sociais.origem_token`
  separa os dois: `system_user` não expira e não tem rotina de refresh; `oauth`
  mostra vencimento e depende do cron de renovação.
- **Nenhum segredo no front.** Token da Meta e service role só existem em Edge Function.

## Repositório

Este diretório é uma subárvore autocontida. Quando o repositório próprio da
plataforma existir, ele sai inteiro com `git mv` sem tocar em mais nada.
