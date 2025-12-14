import re
from typing import Dict, Any

def detect_intent(text: str) -> str:
    t = text.lower()
    if any(x in t for x in ("workout", "exercise", "video", "train", "training", "routine")):
        return "WORKOUT"
    if any(x in t for x in ("diet", "calorie", "nutrition", "meal", "keto", "vegan", "vegetarian", "food", "protein")):
        return "DIET"
    return "GENERAL"

def extract_entities(text: str) -> Dict[str, Any]:
    t = text.lower()
    body = re.search(r"(chest|arms|legs|back|shoulders|abs|full body|full-body)", t)
    duration = re.search(r"(\d+)\s?(min|minutes|minute)", t)
    difficulty = re.search(r"(beginner|easy|intermediate|hard|advanced)", t)
    diet_type = re.search(r"(keto|vegan|vegetarian|high protein|low carb|paleo)", t)
    calories = re.search(r"(\d{3,4})\s?(kcal|calories|cal)", t)

    return {
        "body_part": body.group(0) if body else None,
        "duration_minutes": int(duration.group(1)) if duration else None,
        "difficulty": difficulty.group(0) if difficulty else None,
        "diet_type": diet_type.group(0) if diet_type else None,
        "calories": int(calories.group(1)) if calories else None
    }
