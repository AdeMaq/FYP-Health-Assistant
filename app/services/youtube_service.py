# import os
# import requests
# from dotenv import load_dotenv
# load_dotenv()

# YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# def search_workout(query: str, max_results:int = 3):
#     """
#     Uses YouTube Data API v3 search endpoint.
#     Returns a list of dicts with title, url, description.
#     """
#     url = "https://www.googleapis.com/youtube/v3/search"
#     params = {
#         "part": "snippet",
#         "q": query + " workout",
#         "type": "video",
#         "maxResults": max_results,
#         "key": YOUTUBE_API_KEY
#     }
#     resp = requests.get(url, params=params, timeout=10)
#     resp.raise_for_status()
#     data = resp.json()
#     results = []
#     for item in data.get("items", []):
#         vid = item["id"].get("videoId")
#         snip = item["snippet"]
#         results.append({
#             "title": snip.get("title"),
#             "url": f"https://www.youtube.com/watch?v={vid}",
#             "description": snip.get("description"),
#             "channel": snip.get("channelTitle")
#         })
#     return results
def search_workout(query: str, max_results: int = 3):
    # YouTube API temporarily disabled
    return [
        {
            "title": "YouTube API disabled",
            "channel": "N/A",
            "url": "https://youtube.com"
        }
    ]
