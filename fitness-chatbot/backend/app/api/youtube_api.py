from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from ..config import settings
from ..database import SessionLocal
from ..models import YouTubeVideoCache

class YouTubeService:
    def __init__(self):
        self.youtube = build('youtube', 'v3', developerKey=settings.youtube_api_key)
        self.cache_duration = timedelta(hours=24)
    
    def search_videos(self, 
                     query: str, 
                     max_results: int = 5,
                     use_cache: bool = True) -> List[Dict[str, Any]]:
        """
        Search YouTube for fitness videos with caching
        
        Args:
            query: Search query
            max_results: Number of videos to return
            use_cache: Whether to use cached results
            
        Returns:
            List of video dictionaries
        """
        
        # Check cache first
        if use_cache:
            cached_results = self._get_cached_videos(query)
            if cached_results:
                return cached_results
        
        try:
            # Build search query
            search_query = f"{query} workout fitness"
            
            # Execute search
            search_response = self.youtube.search().list(
                q=search_query,
                part="snippet",
                type="video",
                maxResults=max_results,
                videoDuration="medium",
                videoDefinition="high",
                relevanceLanguage="en",
                safeSearch="moderate",
                order="relevance"
            ).execute()
            
            videos = []
            
            # Get video details
            video_ids = [item['id']['videoId'] for item in search_response['items']]
            
            if video_ids:
                video_response = self.youtube.videos().list(
                    part="snippet,contentDetails,statistics",
                    id=','.join(video_ids)
                ).execute()
                
                for item in video_response['items']:
                    video_data = {
                        "id": item["id"],
                        "title": item["snippet"]["title"],
                        "description": item["snippet"]["description"],
                        "thumbnail_url": item["snippet"]["thumbnails"]["high"]["url"],
                        "channel_title": item["snippet"]["channelTitle"],
                        "published_at": item["snippet"]["publishedAt"],
                        "duration": item["contentDetails"]["duration"],
                        "view_count": item["statistics"].get("viewCount", "0"),
                        "like_count": item["statistics"].get("likeCount", "0"),
                        "url": f"https://www.youtube.com/watch?v={item['id']}",
                        "embed_url": f"https://www.youtube.com/embed/{item['id']}",
                        "category": self._categorize_video(query, item["snippet"]["title"])
                    }
                    videos.append(video_data)
            
            # Cache the results
            if use_cache and videos:
                self._cache_videos(query, videos)
            
            return videos
            
        except HttpError as e:
            if e.resp.status == 403:
                raise Exception("YouTube API quota exceeded. Please try again later.")
            raise Exception(f"YouTube API error: {str(e)}")
    
    def _get_cached_videos(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached YouTube videos for a query"""
        db = SessionLocal()
        try:
            cache_entry = db.query(YouTubeVideoCache).filter(
                YouTubeVideoCache.query == query,
                YouTubeVideoCache.expires_at > datetime.utcnow()
            ).first()
            
            if cache_entry:
                return json.loads(cache_entry.videos)
        finally:
            db.close()
        
        return None
    
    def _cache_videos(self, query: str, videos: List[Dict[str, Any]]):
        """Cache YouTube videos for a query"""
        db = SessionLocal()
        try:
            cache_entry = YouTubeVideoCache(
                query=query,
                videos=json.dumps(videos),
                created_at=datetime.utcnow(),
                expires_at=datetime.utcnow() + self.cache_duration
            )
            db.add(cache_entry)
            db.commit()
        finally:
            db.close()
    
    def _categorize_video(self, query: str, title: str) -> str:
        """Categorize video based on content"""
        title_lower = title.lower()
        
        categories = {
            "cardio": ["cardio", "hiit", "running", "jumping", "aerobic"],
            "strength": ["strength", "weight", "dumbbell", "barbell", "resistance"],
            "yoga": ["yoga", "stretch", "flexibility", "meditation"],
            "calisthenics": ["calisthenics", "bodyweight", "pushup", "pullup"],
            "recovery": ["recovery", "foam roll", "mobility", "rehab"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in title_lower for keyword in keywords):
                return category
        
        return "general"
    
    def get_video_categories(self) -> List[Dict[str, str]]:
        """Get available video categories"""
        return [
            {"id": "cardio", "name": "Cardio & HIIT", "icon": "❤️"},
            {"id": "strength", "name": "Strength Training", "icon": "💪"},
            {"id": "yoga", "name": "Yoga & Stretching", "icon": "🧘"},
            {"id": "calisthenics", "name": "Bodyweight", "icon": "🏃"},
            {"id": "recovery", "name": "Recovery", "icon": "🩹"},
            {"id": "beginner", "name": "Beginner Friendly", "icon": "👶"},
            {"id": "advanced", "name": "Advanced", "icon": "🔥"}
        ]