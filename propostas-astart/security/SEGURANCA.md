# Segurança do propostas-astart — passo a passo

Encontrei três exposições no sistema. Por prioridade:

1. **Chave da Groq** (IA) no código público → pode gerar custo no seu nome.
2. **Chave do Unsplash** no código público.
3. **Firestore e admin sem login** → qualquer pessoa com o endereço
   `propostas-astart.netlify.app` vê o painel e pode criar, editar e apagar
   proposta; e dá pra ler as propostas pelo banco sem senha.

O conteúdo abaixo resolve tudo. **Parte 1 é urgente e não quebra nada.**
**Parte 2 é recomendada e adiciona um login.**

---

## PARTE 1 — Esconder as chaves (faça primeiro)

As duas chaves saem do navegador e passam a viver em variáveis de ambiente do
Netlify, atrás de duas funções. **Já deixei tudo pronto** na pasta de deploy
que te enviei (`index.html` já aponta para as funções; a pasta
`netlify/functions/` e o `netlify.toml` já vão junto).

### 1.1 Revogue as chaves atuais (elas já vazaram)
- **Groq:** https://console.groq.com → API Keys → apague a chave antiga e
  **gere uma nova**.
- **Unsplash:** https://unsplash.com/oauth/applications → sua aplicação →
  **gere um novo Access Key** (ou rode a aplicação; o antigo fica inválido).

### 1.2 Cadastre as chaves novas no Netlify (como variável, não no código)
No painel: **app.netlify.com/projects/propostas-astart → Site configuration →
Environment variables → Add a variable**, e crie:

| Key            | Value                         |
|----------------|-------------------------------|
| `GROQ_KEY`     | (a chave NOVA da Groq)        |
| `UNSPLASH_KEY` | (a chave NOVA do Unsplash)    |

### 1.3 Publique a pasta de deploy
A pasta que te enviei já contém:

```
index.html              → app com o design novo, SEM as chaves, chamando as funções
netlify.toml            → aponta a pasta de funções
netlify/functions/
   ├── groq.js          → fala com a Groq usando GROQ_KEY do ambiente
   └── unsplash.js      → fala com o Unsplash usando UNSPLASH_KEY do ambiente
_redirects
fonts/
```

Publique pela **Netlify CLI** (o drag-drop nem sempre sobe funções):

```bash
cd deploy_site
netlify deploy --prod --dir=. --functions=netlify/functions --site=076f6c61-abea-4951-a9cc-6ca3b39d1e72
```

> Se preferir o site pela interface, dá pra conectar essa pasta a um
> repositório e deixar o deploy automático — me avise que eu monto.

### 1.4 Teste
Abra o admin, gere uma proposta de teste. Se a IA melhorar o texto e a foto
aparecer, as funções estão funcionando (as chaves agora estão escondidas).
Confirme que o código-fonte da página **não** mostra mais `gsk_...` nem a
chave do Unsplash.

---

## PARTE 2 — Fechar o banco (recomendado)

Hoje **não há login**: qualquer pessoa com o endereço vê o painel e mexe nas
propostas. Para fechar, é preciso primeiro **criar um login** — senão a regra
de segurança bloquearia você também.

### 2.1 Ative o login no Firebase
No **console.firebase.google.com → projeto `astart-propostas` →
Authentication → Sign-in method**, ative **Email/senha**. Depois, em **Users →
Add user**, crie o seu usuário (seu e-mail + uma senha forte).

### 2.2 Adicione a tela de login no admin
No `index.html`, logo depois do `firebase.initializeApp({...})`, cole:

```html
<script>
(function(){
  // Só o painel exige login. A proposta do cliente (?p=slug) continua aberta.
  var ehProposta = new URLSearchParams(location.search).get('p');
  if (ehProposta) return;                 // link público do cliente: não pede login
  firebase.auth().onAuthStateChanged(function(user){
    if (user) return;                     // já logado: segue normal
    var email = prompt('E-mail do admin Astart:');
    var senha = email && prompt('Senha:');
    if (!email || !senha) { document.body.innerHTML = 'Acesso restrito.'; return; }
    firebase.auth().signInWithEmailAndPassword(email, senha)
      .catch(function(e){ alert('Login inválido.'); location.reload(); });
  });
})();
</script>
```

> Isso usa o Firebase Auth. Inclua também o SDK de auth junto dos outros
> scripts do Firebase, se ainda não estiver:
> `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>`

### 2.3 Publique a regra do Firestore
No **console.firebase.google.com → Firestore Database → Rules**, cole o
conteúdo de **`firestore.rules`** (nesta pasta) e clique **Publish**.

Ela deixa a **leitura aberta** (o cliente abre a proposta por link) e permite
**escrita só para quem está logado** (você, no admin).

### 2.4 Teste
- Abra o admin sem estar logado → deve pedir e-mail/senha.
- Abra uma proposta pelo link `?p=...` → deve abrir normalmente, sem pedir
  login.
- Logado, crie/edite/apague → deve funcionar.

---

## Nível 3 (opcional, para depois)

Fechar a leitura **também** — hoje ela precisa ficar aberta porque o cliente
lê a proposta direto do Firestore. O ideal é servir a proposta por uma função
(que lê o banco com credencial de servidor) e então **negar toda leitura
direta** no Firestore. É um passo maior e mexe no visualizador. Se quiser esse
nível, me avise que eu monto.
