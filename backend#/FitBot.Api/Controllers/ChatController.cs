// Controllers/ChatController.cs
using FitBot.Api.DTOs;
using FitBot.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FitBot.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IProfileService _profileService;
        private readonly IVideoService _videoService;

        public ChatController(IChatService chatService, IProfileService profileService, IVideoService videoService)
        {
            _chatService = chatService;
            _profileService = profileService;
            _videoService = videoService;
        }

        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetHistory()
        {
            // Returns last 50 messages for this user (optional persistence)
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            var user = await _profileService.GetUserByUsernameAsync(username);
            if (user == null) return Unauthorized();

            var history = await _chatService.GetHistoryAsync(user.Id);
            return Ok(history);
        }

        // In SendMessage, after getting the AI result:
        [HttpPost("message")]
        [Authorize]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequestDto request)
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(username)) return Unauthorized();

                var user = await _profileService.GetUserByUsernameAsync(username);
                var profile = user?.Profile;

                var aiTask = _chatService.GetAiResponseAsync(request.Message, request.History, profile);

                // Detect video intent
                bool isVideoRequest = IsVideoRequest(request.Message);
                Task<ChatVideoResponseDto>? videoTask = isVideoRequest
                    ? _videoService.ProcessChatPromptAsync(request.Message)
                    : null;

                await Task.WhenAll(aiTask, videoTask ?? Task.CompletedTask);

                var aiResult = await aiTask;
                var videoResult = videoTask != null ? await videoTask : null;

                return Ok(new
                {
                    reply = aiResult.Reply,
                    source = aiResult.Source,
                    videos = videoResult?.Videos,       // null if no video intent
                    videoMessage = videoResult?.Message
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("CHAT ERROR: " + ex.Message);
                return StatusCode(500, new { reply = "Sorry, I encountered an error.", source = "error" });
            }
        }

        private static bool IsVideoRequest(string message)
        {
            var lower = message.ToLowerInvariant();
            var triggers = new[] {
        "video", "watch", "workout", "exercise", "show me", "recommend",
        "youtube", "tutorial", "how to", "demonstrate", "routine"
    };
            return triggers.Any(t => lower.Contains(t));
        }
    }
}