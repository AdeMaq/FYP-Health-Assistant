# app/services/chat_service.py
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

class ChatService:
    """Service for handling chat conversations and message processing"""
    
    def __init__(self):
        self.conversation_history = {}
    
    def start_conversation(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Start a new conversation"""
        conversation_id = datetime.now().timestamp()
        conversation = {
            "id": conversation_id,
            "user_id": user_id,
            "messages": [],
            "started_at": datetime.now().isoformat(),
            "title": "New Conversation"
        }
        
        if user_id:
            self.conversation_history[user_id] = self.conversation_history.get(user_id, [])
            self.conversation_history[user_id].append(conversation)
        
        return conversation
    
    def add_message(self, 
                   conversation: Dict[str, Any], 
                   content: str, 
                   is_user: bool = True,
                   metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Add a message to conversation"""
        message = {
            "id": len(conversation["messages"]) + 1,
            "content": content,
            "is_user": is_user,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        conversation["messages"].append(message)
        
        # Update conversation title if it's the first user message
        if is_user and len(conversation["messages"]) == 1:
            # Use first 50 chars of first message as title
            title = content[:50] + "..." if len(content) > 50 else content
            conversation["title"] = title
        
        return message
    
    def get_conversation_summary(self, conversation: Dict[str, Any]) -> str:
        """Get a summary of the conversation"""
        user_messages = [msg for msg in conversation["messages"] if msg["is_user"]]
        if not user_messages:
            return "Empty conversation"
        
        # Use the first user message as summary
        first_message = user_messages[0]["content"]
        if len(first_message) > 100:
            return first_message[:100] + "..."
        return first_message
    
    def extract_fitness_data(self, messages: List[Dict]) -> Dict[str, Any]:
        """Extract fitness-related data from conversation"""
        fitness_data = {
            "workout_mentions": 0,
            "diet_mentions": 0,
            "equipment_mentioned": [],
            "goals_mentioned": [],
            "last_user_query": ""
        }
        
        workout_keywords = ["workout", "exercise", "gym", "train", "cardio", "strength"]
        diet_keywords = ["diet", "food", "meal", "nutrition", "eat", "calorie"]
        equipment_keywords = ["dumbbell", "barbell", "kettlebell", "resistance band", "yoga mat"]
        goal_keywords = ["weight loss", "muscle gain", "strength", "endurance", "flexibility"]
        
        for msg in messages:
            if msg["is_user"]:
                content_lower = msg["content"].lower()
                fitness_data["last_user_query"] = msg["content"]
                
                # Count mentions
                for keyword in workout_keywords:
                    if keyword in content_lower:
                        fitness_data["workout_mentions"] += 1
                
                for keyword in diet_keywords:
                    if keyword in content_lower:
                        fitness_data["diet_mentions"] += 1
                
                # Extract equipment
                for equipment in equipment_keywords:
                    if equipment in content_lower:
                        if equipment not in fitness_data["equipment_mentioned"]:
                            fitness_data["equipment_mentioned"].append(equipment)
                
                # Extract goals
                for goal in goal_keywords:
                    if goal in content_lower:
                        if goal not in fitness_data["goals_mentioned"]:
                            fitness_data["goals_mentioned"].append(goal)
        
        return fitness_data
    
    def format_response_for_storage(self, 
                                   user_message: str, 
                                   ai_response: str,
                                   model_used: str,
                                   metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Format a conversation pair for storage"""
        return {
            "user_message": user_message,
            "ai_response": ai_response,
            "model_used": model_used,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {},
            "response_type": self._determine_response_type(ai_response)
        }
    
    def _determine_response_type(self, response: str) -> str:
        """Determine the type of response based on content"""
        response_lower = response.lower()
        
        if any(word in response_lower for word in ["workout", "exercise", "reps", "sets"]):
            return "workout_plan"
        elif any(word in response_lower for word in ["diet", "meal", "nutrition", "calorie"]):
            return "diet_plan"
        elif any(word in response_lower for word in ["video", "youtube", "watch", "tutorial"]):
            return "video_suggestion"
        elif any(word in response_lower for word in ["tip", "advice", "recommendation"]):
            return "fitness_tip"
        else:
            return "general_advice"