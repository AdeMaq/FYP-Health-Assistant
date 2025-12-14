import os
import requests
from dotenv import load_dotenv
load_dotenv()

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_APP_KEY")
print("Spoonacular Key:", SPOONACULAR_API_KEY)

def get_nutrition_for_ingredients(ingr: str):
    """
    Uses Spoonacular Nutrition Endpoint
    Example: ingr = "1 large apple"
    """
    url = "https://api.spoonacular.com/recipes/guessNutrition"
    params = {
        "title": ingr,
        "apiKey": SPOONACULAR_API_KEY
    }

    resp = requests.get(url, params=params, timeout=10)

    if resp.status_code != 200:
        raise Exception(f"Spoonacular error: {resp.text}")

    return resp.json()

def build_meal_plan(calories_target: int, diet_type: str = None):
    """
    Simple mock meal plan generator — calls nutrition API to calculate sample items.
    For production: replace with a proper meal plan algorithm or use a meal-planner API.
    """
    # naive: propose breakfast, lunch, dinner with proportional calorie split
    breakfast_cal = int(calories_target * 0.3)
    lunch_cal = int(calories_target * 0.4)
    dinner_cal = calories_target - breakfast_cal - lunch_cal

    # Use a few sample items (these example strings are pass to Edamam for estimation)
    breakfast = f"{breakfast_cal} calories of oats and banana"
    lunch = f"{lunch_cal} calories of chicken salad"
    dinner = f"{dinner_cal} calories of grilled fish and veggies"

    return {
        "target_calories": calories_target,
        "meals": {
            "breakfast": {"text": breakfast, "cal_est": breakfast_cal},
            "lunch": {"text": lunch, "cal_est": lunch_cal},
            "dinner": {"text": dinner, "cal_est": dinner_cal},
        },
        "notes": f"Suggested diet type: {diet_type or 'balanced'}"
    }
