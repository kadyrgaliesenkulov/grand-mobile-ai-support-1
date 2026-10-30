
import json
import uuid

from pathlib import Path


# Ойын ережелерінің файлы
RULES_PATH = (
    Path(__file__).parent.parent
    / "data"
    / "rules.json"
)


# Ережелерді оқу
def load_rules():

    if RULES_PATH.exists():

        return json.loads(
            RULES_PATH.read_text(
                encoding="utf-8"
            )
        )

    return {"rules": []}


# Шағым санатын анықтау
def detect_category(text, selected):

    if selected != "auto":
        return selected

    text = text.lower()

    keywords = {

        "scam": [
            "алда",
            "ақша",
            "затымды",
            "қайтармай",
            "мошен"
        ],

        "insult": [
            "балағат",
            "қорлады",
            "дөрекі",
            "оскорб"
        ],

        "cheating": [
            "чит",
            "cheat",
            "hack",
            "хак"
        ],

        "technical": [
            "қате",
            "ашылмай",
            "лаг",
            "кірмей",
            "ошибка"
        ]
    }

    for category, words in keywords.items():

        if any(word in text for word in words):

            return category

    return "other"


# AI талдау функциясы
def analyze_complaint(data):

    category = detect_category(
        data["description"],
        data["category"]
    )

    rules = load_rules()

    has_evidence = bool(
        data.get("evidence_url")
    )

    # Техникалық мәселе
    if category == "technical":

        verdict = "self_help"

        explanation = (
            "Техникалық мәселе анықталды. "
            "Алдымен ұсынылған шешу қадамдарын орындап көріңіз."
        )

        next_action = (
            "Ойынды қайта іске қосып, "
            "интернет байланысын тексеріңіз."
        )

    # Дәлел бар болса
    elif has_evidence:

        verdict = "admin_review"

        explanation = (
            "Дәлел сілтемесі берілді. "
            "Оның мазмұнын әкімші тексеруі керек."
        )

        next_action = (
            "Шағым әкімшінің қарауына жіберілуі тиіс."
        )

    # Дәлел жоқ болса
    else:

        verdict = "need_evidence"

        explanation = (
            "Шағым санаты алдын ала анықталды, "
            "бірақ тексеруге дәлел жеткіліксіз."
        )

        next_action = (
            "Скриншот, оқиға уақыты және "
            "қосымша мәлімет жіберіңіз."
        )

    return {

        "ticket_id": str(uuid.uuid4())[:8].upper(),

        "category": category,

        "verdict": verdict,

        "explanation": explanation,

        "next_action": next_action,

        "matched_rules": rules.get("rules", []),

        "mode": "rule_based_mvp"
    }
