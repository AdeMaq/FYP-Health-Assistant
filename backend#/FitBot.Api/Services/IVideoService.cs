using FitBot.Api.DTOs;
using FitBot.Api.Models;

namespace FitBot.Api.Services
{
    public interface IVideoService
    {
        Task<List<VideoResponseDto>> GetAllVideosAsync();
        Task<VideoResponseDto?> GetVideoByIdAsync(int id);
        Task<VideoResponseDto> CreateVideoAsync(VideoDto dto);
        Task<VideoResponseDto?> UpdateVideoAsync(int id, VideoDto dto);
        Task<bool> DeleteVideoAsync(int id);
        Task<int> SeedVideosAsync();
        Task<ChatVideoResponseDto> ProcessChatPromptAsync(string prompt);
        Task<TagsDataDto> GetTagsDataAsync();
        Task<SynonymResponseDto> SaveSynonymAsync(SynonymDto dto);
        Task<bool> DeleteSynonymAsync(int id);
        Task<StopWordResponseDto> SaveStopWordAsync(StopWordDto dto);
        Task<bool> DeleteStopWordAsync(int id);
        Task SeedTagsAsync();
        Task AutoDiscoverVideosAsync(string topic);
    }
}
