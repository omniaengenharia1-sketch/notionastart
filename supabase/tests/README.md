# Smoke test local das migrations

Roda o schema e as funcoes do worker num Postgres vazio, sem precisar de projeto
Supabase. `00_stubs_supabase.sql` cria versoes falsas do que o Supabase entrega
pronto (`auth`, `storage`, `vault`, `cron`, `net`); `01_smoke_worker.sql` exercita
promocao de posts, lease, reconciliacao de estado, redacao de segredos no log,
append-only e as permissoes.

```bash
initdb -D /tmp/pgdata -A trust -U postgres
pg_ctl -D /tmp/pgdata -o "-k /tmp -p 5433" start

psql -h /tmp -p 5433 -U postgres -f supabase/tests/00_stubs_supabase.sql

# as extensoes reais nao existem no Postgres stock: neutralize so essas linhas
for f in supabase/migrations/*.sql; do
  sed -E 's/^create extension if not exists (pg_net|pg_cron|supabase_vault).*/-- &/' "$f" \
    | psql -h /tmp -p 5433 -U postgres -d astart -v ON_ERROR_STOP=1 -q
done

psql -h /tmp -p 5433 -U postgres -d astart -f supabase/tests/01_smoke_worker.sql
```

Nao substitui teste contra a Meta: valida schema e logica SQL, nada mais.
