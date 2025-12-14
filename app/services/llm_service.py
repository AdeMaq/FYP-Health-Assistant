# import os
# from dotenv import load_dotenv
# load_dotenv()
# import openai

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# openai.api_key = OPENAI_API_KEY

# def ask_openai(prompt: str, model: str = "gpt-4o-mini", max_tokens: int = 400):
#     """
#     Simple helper to talk to OpenAI. Uses chat completions if available or completion endpoint.
#     """
#     # Using Chat Completions style (works with many official OpenAI Python SDK versions)
#     response = openai.ChatCompletion.create(
#         model=model,
#         messages=[
#             {"role": "system", "content": "You are a helpful fitness coach and nutritionist. Be concise and scientific."},
#             {"role": "user", "content": prompt}
#         ],
#         max_tokens=max_tokens,
#         temperature=0.2
#     )
#     # adapt to sdk response shape
#     if "choices" in response and len(response["choices"])>0:
#         return response["choices"][0]["message"]["content"]
#     return str(response)

import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


client = OpenAI(api_key="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")

#client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ask_openai(prompt: str, model: str = "gpt-4o-mini", max_tokens: int = 400):
    """
    Uses the new OpenAI Chat Completions API (v1+).
    """
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a helpful fitness coach and nutritionist. Be concise and scientific."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=0.2
    )

    return response.choices[0].message.content

