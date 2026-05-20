#!/usr/bin/env python3
"""Gera versões dos workflows Z-API que NÃO usam $env.
Em vez disso, injeta um nó 'Config' (Set) logo após o trigger, onde os valores
ficam centralizados. Todos os $env.X viram $('Config').first().json.Y.
Segredos ficam como placeholder (preenchidos na UI do n8n); resto pré-preenchido.
"""
import json, re, copy, os

BASE = os.path.dirname(os.path.abspath(__file__))
N8N = os.path.join(BASE, "n8n")
PROMPTS = os.path.join(BASE, "prompts")

with open(os.path.join(PROMPTS, "system_sdr_astart.md")) as f:
    SYSTEM_PROMPT = f.read()
with open(os.path.join(PROMPTS, "regras_followup.md")) as f:
    FOLLOWUP_RULES = f.read()

# Mapeamento $env.X -> chave no nó Config
ENV_MAP = {
    "NOTION_LEADS_DB_ID": "notionDbId",
    "ZAPI_INSTANCE_ID": "zapiInstance",
    "ZAPI_TOKEN": "zapiToken",
    "ZAPI_CLIENT_TOKEN": "zapiClientToken",
    "OPERATOR_PERSONAL_NUMBER": "operatorNumber",
    "ANTHROPIC_API_KEY": "anthropicKey",
    "SDR_SYSTEM_PROMPT": "systemPrompt",
    "SDR_FOLLOWUP_RULES": "followupRules",
    "APIFY_TOKEN": "apifyToken",
    "PROSPECT_QUERIES_GMAPS": "queriesGmaps",
    "PROSPECT_QUERIES_INSTAGRAM": "queriesInstagram",
}

# Valores do nó Config: (chave, valor, eh_segredo)
CONFIG_FIELDS = [
    ("notionDbId", "ff29e8a2-84a2-4f94-978b-e486c4310281", False),
    ("operatorNumber", "5511933554550", False),
    ("zapiInstance", "COLE_SEU_ZAPI_INSTANCE_ID_AQUI", True),
    ("zapiToken", "COLE_SEU_ZAPI_TOKEN_AQUI", True),
    ("zapiClientToken", "COLE_SEU_ZAPI_CLIENT_TOKEN_AQUI", True),
    ("anthropicKey", "COLE_SUA_ANTHROPIC_API_KEY_AQUI", True),
    ("apifyToken", "COLE_SEU_APIFY_TOKEN_AQUI", True),
    ("queriesGmaps", "[]", False),
    ("queriesInstagram", "[]", False),
    ("systemPrompt", SYSTEM_PROMPT, False),
    ("followupRules", FOLLOWUP_RULES, False),
]

def replace_env(text):
    """Substitui $env.X por $('Config').first().json.Y em qualquer string."""
    for env_key, cfg_key in ENV_MAP.items():
        text = text.replace(f"$env.{env_key}", f"$('Config').first().json.{cfg_key}")
    return text

def deep_replace(obj):
    if isinstance(obj, str):
        return replace_env(obj)
    if isinstance(obj, list):
        return [deep_replace(x) for x in obj]
    if isinstance(obj, dict):
        return {k: deep_replace(v) for k, v in obj.items()}
    return obj

def make_config_node(needs_prompts, needs_apify):
    """Cria o nó Config (Set v3.4) com os campos relevantes pro workflow."""
    assignments = []
    for i, (key, val, _secret) in enumerate(CONFIG_FIELDS):
        if key in ("systemPrompt", "followupRules") and not needs_prompts:
            continue
        if key in ("apifyToken", "queriesGmaps", "queriesInstagram") and not needs_apify:
            continue
        assignments.append({
            "id": f"cfg-{i}",
            "name": key,
            "value": val,
            "type": "string",
        })
    return {
        "parameters": {
            "mode": "manual",
            "includeOtherInputFields": True,
            "assignments": {"assignments": assignments},
            "options": {},
        },
        "id": "config-node",
        "name": "Config",
        "type": "n8n-nodes-base.set",
        "typeVersion": 3.4,
        "position": [240, 600],
        "notes": "Preencha os campos COLE_..._AQUI com seus valores reais. Os demais já vêm prontos.",
    }

def transform(path_in, path_out, trigger_name, needs_prompts, needs_apify):
    with open(path_in) as f:
        wf = json.load(f)

    # 1) Substitui $env em todos os parâmetros
    wf = deep_replace(wf)

    # 2) Adiciona o nó Config
    config_node = make_config_node(needs_prompts, needs_apify)
    wf["nodes"].append(config_node)

    # 3) Religa: trigger -> Config -> (targets originais do trigger)
    conns = wf["connections"]
    original_targets = conns.get(trigger_name, {}).get("main", [[]])
    conns["Config"] = {"main": copy.deepcopy(original_targets)}
    conns[trigger_name] = {"main": [[{"node": "Config", "type": "main", "index": 0}]]}

    with open(path_out, "w") as f:
        json.dump(wf, f, ensure_ascii=False, indent=2)
    print(f"OK: {os.path.basename(path_out)}  ({len(wf['nodes'])} nós)")

transform(
    os.path.join(N8N, "workflow_1_outbound_zapi.json"),
    os.path.join(N8N, "workflow_1_outbound_zapi.json"),
    "A cada 1h", needs_prompts=True, needs_apify=False,
)
transform(
    os.path.join(N8N, "workflow_2_callback_zapi.json"),
    os.path.join(N8N, "workflow_2_callback_zapi.json"),
    "Webhook Z-API", needs_prompts=True, needs_apify=False,
)
transform(
    os.path.join(N8N, "workflow_3_prospeccao_apify.json"),
    os.path.join(N8N, "workflow_3_prospeccao_apify.json"),
    "Toda manhã 9h (seg-sex)", needs_prompts=False, needs_apify=True,
)
print("Todos gerados.")
