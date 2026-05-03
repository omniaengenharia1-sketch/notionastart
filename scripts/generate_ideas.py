#!/usr/bin/env python3
"""
Daily content idea generator for Astart Studio clients.
Runs at 09:00 BRT via GitHub Actions cron (0 12 * * *).

Required env vars:
  GEMINI_API_KEY  — Google Gemini API key
  NOTION_API_KEY  — Notion integration token
"""

import json
import os
import sys
import time
from datetime import date
from pathlib import Path

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

            time.sleep(1.2)

        except Exception as e:
            print(f"  [reddit/{subreddit}] Aviso: {e}")

    return "\n- ".join([""] + posts[:12]).strip() if posts else "sem posts recentes"


GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)


def generate_ideas(client: dict, trends: str, reddit_posts: str) -> dict:
    """Ask Gemini to generate structured content ideas for the client."""
    today_str = date.today().strftime("%d/%m/%Y")

    prompt = f"""Você é um estrategista de conteúdo sênior especializado em redes sociais brasileiras, trabalhando para a agência Astart Studio em São Paulo.

Cliente: {client["name"]}
Nicho: {client["niche"]}
Tom de voz: {client["tone"]}
Data: {today_str}

---
TENDÊNCIAS DO GOOGLE BRASIL (últimas 24h):
{trends}

POSTS EM ALTA NO REDDIT (referência de assuntos quentes):
{reddit_posts}
---

Com base nessas tendências reais de hoje, crie um pacote de conteúdo para Instagram com 3 formatos diferentes (CARROSSEL, ESTÁTICO, REELS) sobre o MESMO tema/tendência, e uma legenda única que serve para os três.

REGRAS DE FORMATAÇÃO — MUITO IMPORTANTE:
- NÃO use asteriscos, NÃO use **, NÃO use markdown de nenhum tipo
- NÃO use #, _, ` ou qualquer caractere de formatação
- Use apenas texto limpo e quebras de linha
- Para destacar, use CAIXA ALTA (ex: TEMA:, IDEIA:, etc)
- Português brasileiro natural

A LEGENDA deve ter NO MÁXIMO 5 hashtags, colocadas no final.

Responda APENAS com um objeto JSON válido:

{{
  "titulo": "Ideias de Conteúdo — {today_str}",
  "tipo": "Carrossel + Estático + Reels",
  "tendencias_resumo": "Resumo em 2-3 frases das tendências identificadas hoje e como se conectam ao nicho do cliente. Texto limpo.",
  "ideia_1": "CONTEÚDO PARA CARROSSEL\\n\\nTEMA:\\n[tema do carrossel]\\n\\nESTRUTURA (8 slides):\\n\\nSlide 1 — Capa:\\n[texto da capa, frase de impacto]\\n\\nSlide 2:\\n[conteúdo]\\n\\nSlide 3:\\n[conteúdo]\\n\\nSlide 4:\\n[conteúdo]\\n\\nSlide 5:\\n[conteúdo]\\n\\nSlide 6:\\n[conteúdo]\\n\\nSlide 7:\\n[conteúdo]\\n\\nSlide 8 — CTA:\\n[chamada final]\\n\\nSUGESTÃO VISUAL:\\n[cores, estilo e elementos da identidade]",
  "ideia_2": "CONTEÚDO PARA ESTÁTICO\\n\\nTEMA:\\n[tema do post estático]\\n\\nTEXTO DA ARTE:\\n[frase principal que vai na imagem, curta e impactante]\\n\\nTEXTO DE APOIO (se houver):\\n[subtítulo ou complemento opcional]\\n\\nSUGESTÃO VISUAL:\\n[descrição da arte: cores, elementos, composição]",
  "ideia_3": "CONTEÚDO PARA REELS\\n\\nTEMA:\\n[tema do reel]\\n\\nCONCEITO:\\n[gancho principal e o que torna o reel viralizável]\\n\\nDURAÇÃO: 30 a 45 segundos\\n\\nROTEIRO:\\n\\nCena 1 (0 a 3s):\\nVisual: [o que aparece]\\nTexto na tela: [texto curto]\\nÁudio/Fala: [o que é dito ou som]\\n\\nCena 2 (3 a 10s):\\nVisual: [...]\\nTexto na tela: [...]\\nÁudio/Fala: [...]\\n\\nCena 3 (10 a 20s):\\nVisual: [...]\\nTexto na tela: [...]\\nÁudio/Fala: [...]\\n\\nCena 4 (20 a 30s):\\nVisual: [...]\\nTexto na tela: [...]\\nÁudio/Fala: [...]\\n\\nCena 5 (30 a 45s — CTA):\\nVisual: [...]\\nTexto na tela: [...]\\nÁudio/Fala: [CTA direto]\\n\\nMÚSICA SUGERIDA:\\n[estilo de áudio ou trend]",
  "legenda": "[Legenda completa pronta pra postar — com gancho, desenvolvimento, CTA, em tom natural e brasileiro]\\n\\n#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5"
}}"""

    resp = requests.post(
        GEMINI_URL,
        params={"key": os.environ["GEMINI_API_KEY"]},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"},
        },
        timeout=60,
    )
    resp.raise_for_status()

    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    parsed = json.loads(raw)

    # Remove qualquer markdown que tenha escapado das instruções
    return {k: strip_markdown(v) if isinstance(v, str) else v for k, v in parsed.items()}


def strip_markdown(text: str) -> str:
    """Remove markdown bold/italic/code markers but keep content readable."""
    import re
    # Remove **bold** e *italic*
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    # Remove __bold__ e _italic_
    text = re.sub(r"__(.+?)__", r"\1", text)
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"\1", text)
    # Remove `code`
    text = re.sub(r"`(.+?)`", r"\1", text)
    # Remove headings markdown (# Título)
    text = re.sub(r"^#+\s+", "", text, flags=re.MULTILINE)
    return text


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
            "Legenda": {"rich_text": rich_text_blocks(ideas["legenda"])},
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
    missing = [k for k in ("GEMINI_API_KEY", "NOTION_API_KEY") if not os.environ.get(k)]
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

        print("  → Gerando ideias com Gemini...")
        try:
            ideas = generate_ideas(client, trends, reddit_posts)
        except json.JSONDecodeError as e:
            print(f"  ❌ JSON inválido do Gemini: {e}")
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
