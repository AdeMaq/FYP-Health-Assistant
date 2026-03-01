const videoService = require("../services/videoService");
const AppDataSource = require("../datasource");
const videosData = require("../videos.json");

exports.getAllVideos = async (req, res, next) => {
    try {
        const videos = await videoService.getAllVideos();
        res.json(videos);
    } catch (err) {
        next(err);
    }
};

exports.getVideo = async (req, res, next) => {
    try {
        const video = await videoService.getVideoById(req.params.id);
        if (!video) return res.status(404).json({ message: "Video not found" });
        res.json(video);
    } catch (err) {
        next(err);
    }
};

exports.createVideo = async (req, res, next) => {
    try {
        const video = await videoService.createVideo(req.body);
        res.status(201).json(video);
    } catch (err) {
        next(err);
    }
};

exports.updateVideo = async (req, res, next) => {
    try {
        const video = await videoService.updateVideo(req.params.id, req.body);
        if (!video) return res.status(404).json({ message: "Video not found" });
        res.json(video);
    } catch (err) {
        next(err);
    }
};

exports.deleteVideo = async (req, res, next) => {
    try {
        await videoService.deleteVideo(req.params.id);
        res.json({ message: "Video deleted" });
    } catch (err) {
        next(err);
    }
};


exports.seedVideos = async (req, res, next) => {
    try {
        const videoRepo = AppDataSource.getRepository("Video");
        const existingVideos = await videoRepo.find();

        if (existingVideos.length > 0) {
            return res.status(400).json({ message: "Videos already exist in DB." });
        }

        for (const video of videosData) {
            const v = videoRepo.create(video);
            await videoRepo.save(v);
        }
        res.json({ message: "Videos seeded successfully!" });
    } catch (err) {
        next(err);
    }
};


// ... existing exports (getAllVideos, etc.) ...

exports.recommendVideo = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: "Prompt is required" });

        const result = await videoService.processChatPrompt(prompt);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.cleanupDatabase = async (req, res, next) => {
    try {
        const allVideos = await videoService.getAllVideos();
        // The service function we just wrote handles the deletion
        const aliveVideos = await videoService.filterAvailableVideos(allVideos);
        res.json({
            message: "Cleanup complete",
            removed: allVideos.length - aliveVideos.length,
            remaining: aliveVideos.length
        });
    } catch (err) {
        next(err);
    }
};
