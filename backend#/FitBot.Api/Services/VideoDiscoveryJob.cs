// Services/VideoDiscoveryJob.cs
namespace FitBot.Api.Services
{
    public class VideoDiscoveryJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<VideoDiscoveryJob> _logger;

        // Change to TimeSpan.FromMinutes(2) for quick testing
        private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

        public VideoDiscoveryJob(
            IServiceScopeFactory scopeFactory,
            ILogger<VideoDiscoveryJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "[AutoDiscover] Background job started. Interval: {Interval}", Interval);

            // Run once immediately on startup
            await RunDiscovery(stoppingToken);

            using var timer = new PeriodicTimer(Interval);

            while (!stoppingToken.IsCancellationRequested &&
                   await timer.WaitForNextTickAsync(stoppingToken))
            {
                await RunDiscovery(stoppingToken);
            }
        }

        private async Task RunDiscovery(CancellationToken ct)
        {
            if (ct.IsCancellationRequested) return;

            // Pick a random topic from the list inside VideoService
            // We pull the same list here so the job is self-contained
            var topics = new[]
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

            var topic = topics[Random.Shared.Next(topics.Length)];

            _logger.LogInformation("[AutoDiscover] Tick — picked topic: {Topic}", topic);

            // IVideoService is Scoped, BackgroundService is Singleton
            // Must create a new DI scope for each run
            using var scope = _scopeFactory.CreateScope();
            var videoService = scope.ServiceProvider.GetRequiredService<IVideoService>();

            await videoService.AutoDiscoverVideosAsync(topic);
        }
    }
}
