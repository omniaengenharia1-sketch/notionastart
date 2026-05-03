#!/usr/bin/env python3
"""
Daily content idea generator for Astart Studio clients.
Runs at 09:00 BRT via GitHub Actions cron (0 12 * * *).

Required env vars:
  ANTHROPIC_API_KEY — Anthropic API key
  NOTION_API_KEY    — Notion integration token
"""

import json
import os
import sys
import time
from datetime import date
from pathlib import Path

import anthropic
import requests

CONFIG_PATH = Path(__file__).parent.parent / "clients_config.json"
NOTION_VERSION = "2022-06-28"
NOTION_PAGES_URL = "https://api.notion.com/v1/pages"


def fetch_google_trends(keywords: list[str]) -> str:
    """Fetch rising related queries from Google Trends for Brazil."""
    try:
        from pytrends.request import TrendReq

        pytrends = TrendReq(hl="pt-BR", tz=-180, timeout=(10, 30), retries=2, backoff_factor=0.5)
        pytrends.build_payload(keywords[:5], geo="BR", timeframe="now 1-d")
        related = pytrends.related_queries()

        rising_terms = []
        for kw, data in related.items():
            if data.get("rising") is not None and not data["rising"].empty:
                terms = data["rising"].head(5)["query"].tolist()
                rising_terms.extend(terms)
            elif data.get("top") is not None and not data["top"].empty:
                terms = data["top"].head(3)["query"].tolist()
                rising_terms.extend(terms)

        if rising_terms:
            unique_terms = list(dict.fromkeys(rising_terms))[:12]
            return ", ".join(unique_terms)

        # Fallback: daily trending searches in Brazil
        trending = pytrends.trending_searches(pn="brazil")
        top = trending.head(10)[0].tolist()
        return ", ".join(top)

    except Exception as e:
        print(f"  [trends] Aviso: {e}")
        return "sem dados de trends disponíveis hoje"


def fetch_reddit_posts(subreddits: list[str]) -> str:
    """Fetch hot post titles from subreddits for trend context."""
    posts = []
    headers = {"User-Agent": "AstartStudio-ContentBot/1.0"}

    for subreddit in subreddits[:3]:
        try:
            url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit=8"
            resp = requests.get(url, headers=headers, timeout=10)
            resp.raise_for_status()

            children = resp.json()["data"]["children"]
            for item in children:
                d = item["data"]
                if not d.get("stickied") and d.get("title"):
                    posts.append(d["title"])
                if len(posts) >= 12:
                    break

            time.sleep(1.2)  # Reddit rate limit

        except Exception as e:
            print(f"  [reddit/{subreddit}] Aviso: {e}")

    return "\n- ".join([""] + posts[:12]).strip() if posts else "sem posts recentes"


def generate_ideas(client: dict, trends: str, reddit_posts: str) -> dict:
    """Ask Claude to generate structured content ideas for the client."""
    client_obj = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    today_str = date.today().strftime("%d/%m/%Y")

    prompt = f"""Você é um estrategista de conteúdo sênior especializado em redes sociais brasileiras, trabalhando para a agência Astart Studio em São Paulo.

**Cliente:** {client["name"]}
**Nicho:** {client["niche"]}
**Tom de voz:** {client["tone"]}
**Data:** {today_str}

---
**TENDÊNCIAS DO GOOGLE BRASIL (últimas 24h):**
{trends}

**POSTS EM ALTA NO REDDIT (referência de assuntos quentes):**
{reddit_posts}
---

Com base nessas tendências reais de hoje, crie 3 ideias de conteúdo completas para o Instagram desse cliente.

Cada ideia deve:
- Aproveitar uma tendência ou assunto quente do dia
- Ser relevante para o nicho específico do cliente
- Incluir: título chamativo, legenda completa pronta para postar, hashtags relevantes e sugestão visual
- Estar em português brasileiro natural
- Refletir o tom de voz do cliente

Responda APENAS com um objeto JSON válido, sem nenhum texto antes ou depois:

{{
  "titulo": "Ideias de Conteúdo — {today_str}",
  "tipo": "Carrossel",
  "tendencias_resumo": "Resumo em 2-3 frases das tendências identificadas hoje e como se conectam ao nicho do cliente.",
  "ideia_1": "**[TÍTULO DO POST]**\\n\\n[Legenda completa pronta para postar, com gancho, desenvolvimento e CTA]\\n\\n📌 Sugestão visual: [descrição do que mostrar na arte]\\n\\n#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "ideia_2": "**[TÍTULO DO POST]**\\n\\n[Legenda completa pronta para postar, com gancho, desenvolvimento e CTA]\\n\\n📌 Sugestão visual: [descrição do que mostrar na arte]\\n\\n#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "ideia_3": "**[TÍTULO DO POST]**\\n\\n[Legenda completa pronta para postar, com gancho, desenvolvimento e CTA]\\n\\n📌 Sugestão visual: [descrição do que mostrar na arte]\\n\\n#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "roteiro_reel": "**REEL — [TEMA]**\\n\\nDuração: 30-45 segundos\\n\\n🎬 CENA 1 (0-3s): [hook visual + texto na tela]\\n🎬 CENA 2 (3-10s): [desenvolvimento]\\n🎬 CENA 3 (10-20s): [ponto principal]\\n🎬 CENA 4 (20-30s): [virada / insight]\\n🎬 CENA 5 (30-45s): [CTA direto]\\n\\n🎵 Música sugerida: [estilo]\\n📝 Legenda: [legenda + hashtags]"
}}"""

    message = client_obj.messages.create(
        model="claude-opus-4-7",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if present
    if "```json" in raw:
        raw = raw.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in raw:
        raw = raw.split("```", 1)[1].split("```", 1)[0].strip()

    return json.loads(raw)


def rich_text_blocks(content: str) -> list[dict]:
    """Split long text into 2000-char Notion rich_text chunks."""
    limit = 2000
    return [
        {"text": {"content": content[i : i + limit]}}
        for i in range(0, len(content), limit)
    ][:100]


def post_to_notion(db_id: str, ideas: dict) -> bool:
    """Create a new row in the client's Ideias de Conteúdo database."""
    token = os.environ["NOTION_API_KEY"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }

    payload = {
        "parent": {"database_id": db_id},
        "properties": {
            "Título": {"title": rich_text_blocks(ideas["titulo"])},
            "Data": {"date": {"start": date.today().isoformat()}},
            "Tipo": {"rich_text": rich_text_blocks(ideas["tipo"])},
            "Tendências do Dia": {"rich_text": rich_text_blocks(ideas["tendencias_resumo"])},
            "Ideia 1": {"rich_text": rich_text_blocks(ideas["ideia_1"])},
            "Ideia 2": {"rich_text": rich_text_blocks(ideas["ideia_2"])},
            "Ideia 3": {"rich_text": rich_text_blocks(ideas["ideia_3"])},
            "Roteiro de Reel": {"rich_text": rich_text_blocks(ideas["roteiro_reel"])},
        },
    }

    resp = requests.post(NOTION_PAGES_URL, headers=headers, json=payload, timeout=30)

    if resp.status_code == 200:
        print(f"  ✅ Adicionado: {ideas['titulo']}")
        return True
    else:
        print(f"  ❌ Erro Notion [{resp.status_code}]: {resp.text[:300]}")
        return False


def main() -> None:
    missing = [k for k in ("ANTHROPIC_API_KEY", "NOTION_API_KEY") if not os.environ.get(k)]
    if missing:
        print(f"❌ Variáveis de ambiente faltando: {', '.join(missing)}")
        sys.exit(1)

    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    clients = config["clients"]

    print(f"🚀 Astart Studio — Geração de Ideias — {date.today().strftime('%d/%m/%Y')}")
    print(f"📋 {len(clients)} clientes para processar\n")

    success_count = 0

    for client in clients:
        print(f"─── {client['name']} ───")

        print("  → Buscando tendências Google...")
        trends = fetch_google_trends(client["keywords"])
        print(f"     {trends[:100]}...")

        print("  → Buscando posts Reddit...")
        reddit_posts = fetch_reddit_posts(client["subreddits"])

        print("  → Gerando ideias com Claude...")
        try:
            ideas = generate_ideas(client, trends, reddit_posts)
        except json.JSONDecodeError as e:
            print(f"  ❌ JSON inválido do Claude: {e}")
            continue
        except Exception as e:
            print(f"  ❌ Erro ao gerar ideias: {e}")
            continue

        print("  → Postando no Notion...")
        if post_to_notion(client["notion_db_id"], ideas):
            success_count += 1

        time.sleep(2)
        print()

    print(f"✅ Concluído: {success_count}/{len(clients)} clientes atualizados.")

    if success_count < len(clients):
        sys.exit(1)


if __name__ == "__main__":
    main()
