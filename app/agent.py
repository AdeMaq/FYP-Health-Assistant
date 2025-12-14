from typing import Dict, Any
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from langchain.agents import AgentType
from app.services.youtube_service import search_workout
from app.services.nutrition_service import get_nutrition_for_ingredients, build_meal_plan
from app.services.llm_service import ask_openai
from app import db_memory

# Tools wrappers - simple functions that LangChain can call


def youtube_tool_fn(query: str) -> str:
    return "YouTube search temporarily disabled (no API key)."
# def youtube_tool_fn(query: str) -> str:
#     try:
#         videos = search_workout(query, max_results=3)
#         out = []
#         for v in videos:
#             out.append(f"{v['title']} ({v['channel']}) - {v['url']}")
#         return "\n".join(out) if out else "No videos found."
#     except Exception as e:
#         return f"Error calling YouTube API: {e}"

def nutrition_tool_fn(query: str) -> str:
    try:
        # if query contains numbers, treat as ingredient; else assume calorie target
        if any(c.isdigit() for c in query):
            res = get_nutrition_for_ingredients(query)
            return f"Estimated calories: {res.get('calories')}, total weight: {res.get('total_weight')}"
        else:
            # assume user asked for a meal plan with calorie number
            return str(build_meal_plan(2000, diet_type=query if query else None))
    except Exception as e:
        return f"Error calling Nutrition API: {e}"

def llm_tool_fn(prompt: str) -> str:
    try:
        return ask_openai(prompt)
    except Exception as e:
        return f"LLM error: {e}"

# Build LangChain tools

youtube_tool = Tool(
    name="youtube_search",
    func=youtube_tool_fn,
    description="Search for workout videos on YouTube. Input: search query like '30 minute chest workout beginner'. Returns video list."
)
nutrition_tool = Tool(
    name="nutrition",
    func=nutrition_tool_fn,
    description="Get nutrition estimation or build a simple meal plan. Input: ingredient text or '2000 calories vegan' etc."
)
llm_tool = Tool(
    name="llm",
    func=llm_tool_fn,
    description="General knowledge or reasoning for fitness-related questions."
)

# Initialize LLM for agent planning (uses OpenAI via LangChain)
def create_agent():
    # Use OpenAI LLM wrapper from langchain - will use OPENAI_API_KEY env var
    llm = OpenAI(temperature=0)
    tools = [youtube_tool, nutrition_tool, llm_tool]
    agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=False)
    return agent

def run_agent(goal: str, user_id: str = "default_user", max_steps: int = 5) -> Dict[str, Any]:
    db_memory.add_goal(user_id, goal)
    agent = create_agent()
    # Simple multi-step loop: ask agent to accomplish the goal, optionally break if it seems done.
    final_answer = agent.run(goal)
    return {"goal": goal, "result": final_answer}
