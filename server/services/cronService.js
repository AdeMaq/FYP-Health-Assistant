const cron = require("node-cron");
const videoService = require("./videoService");
const AppDataSource = require("../datasource");

const autoDiscoverVideos = async () => {
    console.log("🤖 [Cron] Starting periodic fitness video discovery...");

    const topics = [
        // Weight Management
        "fat loss cardio workout for beginners",
        "strength training for healthy weight gain",
        "high calorie burning hiit",
        "full body weight loss exercises at home",

        // Targeted Fat Loss & Shaping (Popular searches)
        "face fat loss exercises and jawline workout",
        "chest lifting exercises for women",
        "lower belly fat blasting workout",
        "exercises to reduce arm fat",
        "glute building and hip dips workout",

        // Specific Muscle Groups
        "shoulder mobility and strength",
        "dumbbell only back exercises",
        "inner thigh toning workout",
        "six pack abs intensive circuit",

        // Wellness & Corrective
        "posture correction exercises for slouching",
        "lower back pain relief stretches",
        "yoga for stress and anxiety",
        "pelvic floor strengthening exercises",

        // Equipment Specific
        "resistance band full body workout",
        "jump rope workout for fat loss",
        "bench press form for chest growth"
    ];

    // Pick a random topic
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    try {
        // We reuse your existing logic that searches YouTube and saves to DB
        // By calling processChatPrompt with a 'forced' prompt
        const result = await videoService.processChatPrompt(`latest ${randomTopic}`);

        console.log(`✅ [Cron] Successfully processed topic: "${randomTopic}". Found ${result.videos?.length || 0} videos.`);
    } catch (error) {
        console.error("❌ [Cron] Error during auto-discovery:", error.message);
    }
};

// Schedule: Runs every day at midnight ('0 0 * * *')
// For testing every 1 hour: '0 * * * *'
// For testing every 2 minutes: '*/2 * * * *'
const initCron = () => {
    cron.schedule("*/1 * * * *", () => {
        autoDiscoverVideos();
    });

    console.log("⏰ Cron Job Scheduled: Daily Fitness Discovery at Midnight.");
};

module.exports = { initCron };