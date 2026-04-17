using FitBot.Api.Data;
using FitBot.Api.DTOs;
using FitBot.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FitBot.Api.Services
{
    public class VideoService : IVideoService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<VideoService> _logger;

        private string GetJsonPath(string fileName)
        {
            return Path.Combine(AppContext.BaseDirectory, fileName);
        }

        public VideoService(
            AppDbContext context,
            IConfiguration config,
            IHttpClientFactory httpClientFactory,
            ILogger<VideoService> logger)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // ── Discovery topics (mirrors cronService.js) ────────────────────────
        private static readonly string[] _discoveryTopics = new[]
        {
            "fat loss cardio workout for beginners",
            "strength training for weight gain",
            "high calorie burning hiit",
            "full body weight loss exercises at home",
            "face fat loss exercises jawline workout",
            "lower belly fat blasting workout",
            "exercises to reduce arm fat",
            "glute building hip dips workout",
            "shoulder mobility and strength",
            "dumbbell only back exercises",
            "inner thigh toning workout",
            "six pack abs circuit",
            "posture correction exercises",
            "lower back pain relief stretches",
            "yoga for stress and anxiety",
            "resistance band full body workout",
            "jump rope workout for fat loss",
            "bench press form for chest growth",
            "core stability pilates",
            "bodyweight pull workout no equipment"
        };

        // ── Mapping helpers ──────────────────────────────────────────────────
        private static VideoResponseDto Map(Video v) => new()
        {
            Id = v.Id,
            Title = v.Title,
            Link = v.Link,
            Tags = v.Tags,
            CreatedAt = v.CreatedAt
        };

        private static SynonymResponseDto MapSyn(Synonym s) => new()
        {
            Id = s.Id,
            Keyword = s.Keyword,
            Synonyms = s.Synonyms,
            IsNew = s.IsNew
        };

        private static StopWordResponseDto MapSw(StopWord s) => new()
        {
            Id = s.Id,
            Word = s.Word
        };

        // ── CRUD Videos ──────────────────────────────────────────────────────
        public async Task<List<VideoResponseDto>> GetAllVideosAsync()
            => await _context.Videos
                .OrderByDescending(v => v.CreatedAt)
                .Select(v => new VideoResponseDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    Link = v.Link,
                    Tags = v.Tags,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();

        public async Task<VideoResponseDto?> GetVideoByIdAsync(int id)
        {
            var v = await _context.Videos.FindAsync(id);
            return v == null ? null : Map(v);
        }

        public async Task<VideoResponseDto> CreateVideoAsync(VideoDto dto)
        {
            var v = new Video { Title = dto.Title, Link = dto.Link };
            v.Tags = dto.Tags;
            _context.Videos.Add(v);
            await _context.SaveChangesAsync();
            return Map(v);
        }

        public async Task<VideoResponseDto?> UpdateVideoAsync(int id, VideoDto dto)
        {
            var v = await _context.Videos.FindAsync(id);
            if (v == null) return null;
            v.Title = dto.Title;
            v.Link = dto.Link;
            v.Tags = dto.Tags;
            await _context.SaveChangesAsync();
            return Map(v);
        }

        public async Task<bool> DeleteVideoAsync(int id)
        {
            var v = await _context.Videos.FindAsync(id);
            if (v == null) return false;
            _context.Videos.Remove(v);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> SeedVideosAsync()
        {
            var path = GetJsonPath("videos.json");
            if (!File.Exists(path)) return 0;

            var json = await File.ReadAllTextAsync(path);
            var seedVideos = JsonSerializer.Deserialize<List<VideoDto>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (seedVideos == null) return 0;

            int added = 0;
            foreach (var dto in seedVideos)
            {
                if (!await _context.Videos.AnyAsync(v => v.Link == dto.Link))
                {
                    var v = new Video { Title = dto.Title, Link = dto.Link };
                    v.Tags = dto.Tags;
                    _context.Videos.Add(v);
                    added++;
                }
            }
            await _context.SaveChangesAsync();
            return added;
        }

        // ── Tags CRUD ────────────────────────────────────────────────────────
        public async Task<TagsDataDto> GetTagsDataAsync()
        {
            var synonyms = await _context.Synonyms
                .OrderByDescending(s => s.IsNew)
                .ThenBy(s => s.Keyword)
                .ToListAsync();

            var stopwords = await _context.StopWords
                .OrderBy(s => s.Word)
                .ToListAsync();

            return new TagsDataDto
            {
                Synonyms = synonyms.Select(MapSyn).ToList(),
                Stopwords = stopwords.Select(MapSw).ToList()
            };
        }

        public async Task<SynonymResponseDto> SaveSynonymAsync(SynonymDto dto)
        {
            var synList = dto.Synonyms
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .ToList();

            if (dto.Id.HasValue)
            {
                var existing = await _context.Synonyms.FindAsync(dto.Id.Value);
                if (existing != null)
                {
                    existing.Keyword = dto.Keyword;
                    existing.Synonyms = synList;
                    existing.IsNew = false;
                    await _context.SaveChangesAsync();
                    return MapSyn(existing);
                }
            }

            var s = new Synonym { Keyword = dto.Keyword, IsNew = false };
            s.Synonyms = synList;
            _context.Synonyms.Add(s);
            await _context.SaveChangesAsync();
            return MapSyn(s);
        }

        public async Task<bool> DeleteSynonymAsync(int id)
        {
            var s = await _context.Synonyms.FindAsync(id);
            if (s == null) return false;
            _context.Synonyms.Remove(s);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<StopWordResponseDto> SaveStopWordAsync(StopWordDto dto)
        {
            var word = dto.Word.Trim().ToLowerInvariant();
            var existing = await _context.StopWords.FirstOrDefaultAsync(s => s.Word == word);
            if (existing != null) return MapSw(existing);

            var sw = new StopWord { Word = word };
            _context.StopWords.Add(sw);
            await _context.SaveChangesAsync();
            return MapSw(sw);
        }

        public async Task<bool> DeleteStopWordAsync(int id)
        {
            var sw = await _context.StopWords.FindAsync(id);
            if (sw == null) return false;
            _context.StopWords.Remove(sw);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task SeedTagsAsync()
        {
            var synPath = GetJsonPath("synonyms.json");
            if (File.Exists(synPath))
            {
                var synJson = await File.ReadAllTextAsync(synPath);
                var seedSynonyms = JsonSerializer.Deserialize<List<SynonymSeedDto>>(synJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (seedSynonyms != null)
                {
                    foreach (var item in seedSynonyms)
                    {
                        if (!await _context.Synonyms.AnyAsync(s => s.Keyword == item.Keyword))
                        {
                            var s = new Synonym { Keyword = item.Keyword, IsNew = false };
                            s.Synonyms = item.Synonyms ?? new List<string>();
                            _context.Synonyms.Add(s);
                        }
                    }
                }
            }

            var swPath = GetJsonPath("stopwords.json");
            if (File.Exists(swPath))
            {
                var swJson = await File.ReadAllTextAsync(swPath);
                var seedStopWords = JsonSerializer.Deserialize<List<StopWordSeedDto>>(swJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (seedStopWords != null)
                {
                    foreach (var item in seedStopWords)
                    {
                        if (!await _context.StopWords.AnyAsync(s => s.Word == item.Word))
                            _context.StopWords.Add(new StopWord { Word = item.Word });
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        // ── Auto Discovery (cron equivalent) ─────────────────────────────────
        public async Task AutoDiscoverVideosAsync(string topic)
        {
            try
            {
                _logger.LogInformation("[AutoDiscover] Processing topic: {Topic}", topic);

                // ExtractSearchQueryAsync already:
                //   1. strips stop words
                //   2. maps known keywords via Synonyms table
                //   3. calls Datamuse for unknown words and saves them with IsNew=true
                var (searchQuery, tags) = await ExtractSearchQueryAsync(topic);

                const int Limit = 4;

                // Score existing DB videos for this topic
                var allVideos = await _context.Videos.ToListAsync();
                var scored = allVideos
                    .Select(v =>
                    {
                        int score = 0;
                        var titleLower = v.Title.ToLowerInvariant();
                        var firstWord = searchQuery.Split(' ')[0];
                        if (titleLower.Contains(firstWord)) score += 50;
                        foreach (var tag in tags)
                        {
                            if (titleLower.Contains(tag)) score += 20;
                            if (v.Tags.Any(t => t.Contains(tag))) score += 15;
                        }
                        return (video: v, score);
                    })
                    .Where(x => x.score > 15)
                    .ToList();

                int videosAdded = 0;

                // Only fetch from YouTube if fewer than 2 matching videos exist
                // avoids hammering the API for already well-covered topics
                if (scored.Count < 2)
                {
                    _logger.LogInformation(
                        "[AutoDiscover] Gap found for '{Query}' ({Found} videos) — fetching from YouTube",
                        searchQuery, scored.Count);

                    var external = await FetchYouTubeAsync(searchQuery, Limit);

                    foreach (var vid in external)
                    {
                        bool exists = await _context.Videos.AnyAsync(v => v.Link == vid.Link);
                        if (!exists)
                        {
                            var newV = new Video { Title = vid.Title, Link = vid.Link };
                            newV.Tags = tags;
                            _context.Videos.Add(newV);
                            videosAdded++;
                        }
                    }

                    if (videosAdded > 0)
                        _logger.LogInformation(
                            "[AutoDiscover] Added {Count} new videos for topic: {Topic}",
                            videosAdded, topic);
                }
                else
                {
                    _logger.LogInformation(
                        "[AutoDiscover] Topic '{Query}' already well-covered ({Count} videos), skipping YouTube.",
                        searchQuery, scored.Count);
                }

                // Always update synonym coverage so IsNew flags stay accurate
                await UpdateSynonymCoverageAsync(tags, searchQuery);

                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "[AutoDiscover] Done. Topic: '{Topic}' | Videos added: {Count}",
                    topic, videosAdded);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AutoDiscover] Failed for topic: {Topic}", topic);
            }
        }

        // ── Synonym coverage updater ──────────────────────────────────────────
        /// <summary>
        /// For every tag produced by NLP for a topic:
        ///   - If no Synonym entry exists yet, create one and try to fetch synonyms.
        ///   - If an entry exists but has no synonyms, enrich it via Datamuse.
        ///   - Flip IsNew = false when at least one DB video now matches that tag,
        ///     meaning "this keyword has coverage in the video library".
        ///   - Keep IsNew = true when no video covers it yet (shows as red row in admin).
        /// </summary>
        private async Task UpdateSynonymCoverageAsync(List<string> tags, string searchQuery)
        {
            foreach (var tag in tags.Distinct())
            {
                if (string.IsNullOrWhiteSpace(tag) || tag.Length < 2) continue;

                var tagLower = tag.ToLowerInvariant();

                // Check whether any video in DB matches this tag
                bool videoExistsForTag = await _context.Videos.AnyAsync(v =>
                    v.Title.ToLower().Contains(tagLower) ||
                    v.TagsRaw.ToLower().Contains(tagLower));

                var existing = await _context.Synonyms
                    .FirstOrDefaultAsync(s => s.Keyword == tagLower);

                if (existing == null)
                {
                    // Brand-new tag — create a synonym entry for it
                    var fetched = await FetchDatamuseAsync(tagLower);

                    var synEntry = new Synonym
                    {
                        Keyword = tagLower,
                        IsNew = !videoExistsForTag
                        // IsNew=false  → confirmed, video exists in DB
                        // IsNew=true   → learned but no video yet (red in admin)
                    };
                    synEntry.Synonyms = fetched;

                    _context.Synonyms.Add(synEntry);

                    _logger.LogInformation(
                        "[SynonymUpdate] Created entry for '{Tag}' | HasVideo: {Has} | Synonyms: {Count}",
                        tagLower, videoExistsForTag, fetched.Count);
                }
                else
                {
                    // Entry already exists — update IsNew based on current video coverage
                    bool wasNew = existing.IsNew;
                    existing.IsNew = !videoExistsForTag;

                    // Enrich synonyms list if it is empty
                    if (existing.Synonyms.Count == 0)
                    {
                        var fetched = await FetchDatamuseAsync(tagLower);
                        if (fetched.Count > 0)
                        {
                            existing.Synonyms = fetched;
                            _logger.LogInformation(
                                "[SynonymUpdate] Enriched synonyms for '{Tag}' ({Count} added)",
                                tagLower, fetched.Count);
                        }
                    }

                    if (wasNew != existing.IsNew)
                        _logger.LogInformation(
                            "[SynonymUpdate] '{Tag}' IsNew: {Old} → {New}",
                            tagLower, wasNew, existing.IsNew);
                }
            }
        }

        // ── Chat / NLP ────────────────────────────────────────────────────────
        public async Task<ChatVideoResponseDto> ProcessChatPromptAsync(string prompt)
        {
            var (searchQuery, tags) = await ExtractSearchQueryAsync(prompt);
            const int Limit = 4;

            var allVideos = await _context.Videos.ToListAsync();
            var scored = allVideos.Select(v =>
            {
                int score = 0;
                var titleLower = v.Title.ToLowerInvariant();
                var firstWord = searchQuery.Split(' ')[0];
                if (titleLower.Contains(firstWord)) score += 50;
                foreach (var tag in tags)
                {
                    if (titleLower.Contains(tag)) score += 20;
                    if (v.Tags.Any(t => t.Contains(tag))) score += 15;
                }
                return (video: v, score);
            })
            .Where(x => x.score > 15)
            .OrderByDescending(x => x.score)
            .Take(Limit)
            .ToList();

            var recommended = scored.Select(x => Map(x.video)).ToList();
            var source = "database";

            if (recommended.Count < Limit)
            {
                var external = await FetchYouTubeAsync(searchQuery, Limit - recommended.Count + 1);
                if (external.Count > 0)
                {
                    source = recommended.Count > 0 ? "mixed" : "youtube";
                    foreach (var ext in external)
                    {
                        if (recommended.Count >= Limit) break;
                        var exists = await _context.Videos.AnyAsync(v => v.Link == ext.Link);
                        if (!exists)
                        {
                            var newV = new Video { Title = ext.Title, Link = ext.Link };
                            newV.Tags = tags;
                            _context.Videos.Add(newV);
                            await _context.SaveChangesAsync();
                            recommended.Add(Map(newV));
                        }
                    }
                }
            }

            // Update synonym coverage after every chat prompt too
            await UpdateSynonymCoverageAsync(tags, searchQuery);
            await _context.SaveChangesAsync();

            return new ChatVideoResponseDto
            {
                Message = $"Found exercises for: {searchQuery.Replace(" workout", "")}",
                Videos = recommended,
                Source = source
            };
        }

        // ── NLP extraction ────────────────────────────────────────────────────
        private async Task<(string searchQuery, List<string> tags)> ExtractSearchQueryAsync(string prompt)
        {
            var stopWords = (await _context.StopWords.ToListAsync())
                            .Select(s => s.Word.ToLowerInvariant())
                            .ToHashSet();

            var synonymData = await _context.Synonyms.ToListAsync();

            var clean = new string(prompt.ToLowerInvariant()
                .Where(c => char.IsLetterOrDigit(c) || c == ' ').ToArray());

            var words = clean.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            var queryTerms = new List<string>();
            var expandedTags = new List<string>();
            var unknownWords = new List<string>();

            foreach (var w in words)
            {
                if (w.Length < 2 || stopWords.Contains(w)) continue;

                var mapped = synonymData.FirstOrDefault(s => s.Keyword == w);
                if (mapped != null)
                {
                    queryTerms.Add(mapped.Synonyms.FirstOrDefault() ?? w);
                    expandedTags.Add(w);
                    expandedTags.AddRange(mapped.Synonyms);
                }
                else
                {
                    queryTerms.Add(w);
                    expandedTags.Add(w);
                    unknownWords.Add(w);
                }
            }

            // Auto-learn unknown words via Datamuse and save with IsNew=true
            foreach (var word in unknownWords)
            {
                if (!await _context.Synonyms.AnyAsync(s => s.Keyword == word))
                {
                    var onlineSyns = await FetchDatamuseAsync(word);
                    var s = new Synonym { Keyword = word, IsNew = true };
                    s.Synonyms = onlineSyns;
                    _context.Synonyms.Add(s);
                    expandedTags.AddRange(onlineSyns);
                }
            }

            await _context.SaveChangesAsync();

            var finalQuery = queryTerms.Count > 0
                ? string.Join(" ", queryTerms.Distinct()) + " workout"
                : "full body workout";

            return (finalQuery, expandedTags.Distinct().ToList());
        }

        // ── Datamuse helper ───────────────────────────────────────────────────
        private async Task<List<string>> FetchDatamuseAsync(string word)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(5);

                var url = $"https://api.datamuse.com/words?rel_syn={Uri.EscapeDataString(word)}" +
                          $"&topics=fitness,exercise&max=6";

                var resp = await client.GetAsync(url);
                if (!resp.IsSuccessStatusCode) return new();

                var json = await resp.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                return doc.RootElement.EnumerateArray()
                    .Select(e => e.GetProperty("word").GetString() ?? "")
                    .Where(w => !string.IsNullOrEmpty(w))
                    .Take(6)
                    .ToList();
            }
            catch
            {
                return new();
            }
        }

        // ── YouTube helper ────────────────────────────────────────────────────
        private async Task<List<VideoDto>> FetchYouTubeAsync(string query, int limit)
        {
            var apiKey = _config["ApiKeys:YouTube"];
            if (string.IsNullOrEmpty(apiKey)) return new();

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(10);

                var url = $"https://www.googleapis.com/youtube/v3/search?part=snippet" +
                          $"&q={Uri.EscapeDataString(query)}&type=video&maxResults={limit}" +
                          $"&relevanceLanguage=en&key={apiKey}";

                var resp = await client.GetAsync(url);
                if (!resp.IsSuccessStatusCode) return new();

                var json = await resp.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                return doc.RootElement.GetProperty("items").EnumerateArray()
                    .Select(item => new VideoDto
                    {
                        Title = item.GetProperty("snippet").GetProperty("title").GetString() ?? "",
                        Link = $"https://www.youtube.com/watch?v=" +
                               item.GetProperty("id").GetProperty("videoId").GetString(),
                        Tags = new()
                    })
                    .ToList();
            }
            catch
            {
                return new();
            }
        }
    }
}