# Como publicar o novo template no propostas-astart

O sistema de vocês é publicado **por API** (não tem repositório Git nem
deploy pela interface). Por isso o conector do Netlify que eu tenho aqui
**não consegue** subir o arquivo — ele publica a partir de uma pasta que o
servidor dele enxerga, e o meu arquivo montado não está lá.

Então deixei tudo pronto pra você subir em 30 segundos. **O formulário do
admin não muda em nada** — só troquei o "molde" que transforma as respostas
em página.

## A pasta pronta: `propostas-astart/deploy/`

```
deploy/
├── index.html      → o app inteiro, já com o novo gerador
├── _redirects      → regra de rota (igual à de hoje)
└── fonts/          → as fontes da marca (Neue Machina + Comodo)
```

## Jeito mais fácil — arrastar no Netlify (sem instalar nada)

1. Entre em **app.netlify.com/projects/propostas-astart** → aba **Deploys**.
2. Baixe a pasta `deploy/` deste repositório.
3. **Arraste a pasta inteira** para a área "Drag and drop your site output
   folder here".
4. Pronto. O Netlify guarda o deploy anterior — se algo sair diferente do
   esperado, é um clique em **"Publish deploy"** no deploy antigo pra voltar.

## Ou pela linha de comando (Netlify CLI)

```bash
cd propostas-astart/deploy
netlify deploy --prod --dir=. --site=076f6c61-abea-4951-a9cc-6ca3b39d1e72
```

## Como fica o fluxo depois (é o que você perguntou)

Nada muda no seu dia a dia:

1. Você abre o admin e **preenche o formulário do cliente** como sempre
   (nome, segmento, serviços, valor, condições, etc.).
2. A **IA melhora os textos** como já fazia.
3. Ao salvar, o sistema chama o gerador novo e monta a proposta **no design
   novo** (rolagem, preto/branco/rosa, logo e fonte da marca, animações).
4. Você copia o **link** e manda pro cliente — igual hoje.

O gerador lê exatamente os mesmos campos que o formulário já preenche:
`client, company, segment, services, serviceValues, descricaoIA,
descricaoIA_improved, descricao, value, tipo, pagamento, condicoes, prazo,
onboardingIA, proposalMode, options, dirs`.

> As fontes são carregadas de `/fonts` (por isso a pasta vai junto no deploy).
> Assim cada proposta salva no banco fica **leve (~31 KB)**, sem inchar.

## Verifiquei antes de te entregar

Rodei o app com o gerador novo e gerei a proposta da Larissa a partir dos
dados reais do seu banco: nome, serviços, valor, entregáveis e próximos
passos entraram certos. O `exemplo-larissa.html` (nesta pasta) é essa saída —
abra no navegador pra ver.

---

## ⚠️ Ainda pendente: segurança (importante)

Enquanto lia o sistema encontrei, no código público:

- **Chave da Groq** exposta → revogue e gere outra.
- **Chave do Unsplash** exposta → revogue e gere outra.
- **Firestore aberto para leitura** → foi assim que consegui ler a proposta
  da Larissa sem senha. Feche com regra de segurança.

O ideal é mover as chaves para uma **Netlify Function** (fora do navegador).
Posso montar isso pra vocês — é um passo separado, me avisa.
