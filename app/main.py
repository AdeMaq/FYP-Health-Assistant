import os
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
load_dotenv()
from app.nlp import detect_intent, extract_entities
from app.models import ChatRequest, ChatResponse, AgentRequest
from app.services.youtube_service import search_workout
from app.services.nutrition_service import get_nutrition_for_ingredients, build_meal_plan
from app.services.llm_service import ask_openai
from app import db_memory
from fastapi.middleware.cors import CORSMiddleware

db_memory.init_db()

app = FastAPI(title="Fitness Chatbot & Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    user_id = req.user_id or "default_user"
    message = req.message
    db_memory.add_history(user_id, "user", message)

    intent = detect_intent(message)
    entities = extract_entities(message)

    # route
    if intent == "WORKOUT":
        # build search query from entities
        q_parts = []
        if entities.get("body_part"):
            q_parts.append(entities["body_part"])
        if entities.get("duration_minutes"):
            q_parts.append(f"{entities['duration_minutes']} min")
        if entities.get("difficulty"):
            q_parts.append(entities["difficulty"])
        query = " ".join(q_parts) or message
        try:
            videos = search_workout(query)
            resp = {
                        "intent": intent,
                        "entities": entities,
                        "response": "YouTube search disabled for now. Try asking for a workout description instead!"
                    }
            #resp = {"intent": intent, "entities": entities, "response": videos}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    elif intent == "DIET":
        # if calories present build simple meal plan
        if entities.get("calories"):
            calories = int(entities["calories"])
            diet = build_meal_plan(calories, diet_type=entities.get("diet_type"))
            resp = {"intent": intent, "entities": entities, "response": diet}
        else:
            # fallback: call nutrition API for the message
            try:
                nut = get_nutrition_for_ingredients(message)
                resp = {"intent": intent, "entities": entities, "response": nut}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

    else:
        # GENERAL
        try:
            answer = ask_openai(message)
            resp = {"intent": intent, "entities": entities, "response": answer}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    db_memory.add_history(user_id, "assistant", str(resp))
    return resp

@app.post("/agent/run")
def run_agent_endpoint(data: AgentRequest):
    from app.agent import run_agent
    result = run_agent(data.goal, user_id=data.user_id, max_steps=data.max_steps)
    # store agent result in history
    db_memory.add_history(data.user_id or "default_user", "agent", f"Goal: {data.goal} -> {result.get('result')}")
    return {"status": "ok", "result": result}

@app.get("/history/{user_id}")
def get_history(user_id: str):
    return {"history": db_memory.get_history(user_id)}

@app.get("/goals/{user_id}")
def get_goals(user_id: str):
    return {"goals": db_memory.get_goals(user_id)}
