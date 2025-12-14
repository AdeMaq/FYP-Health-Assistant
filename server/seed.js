// // seed.js
// const AppDataSource = require("./datasource");
// const Video = require("./entities/Video");
// const videosData = require("./videos.json"); // your JSON file


// AppDataSource.initialize().then(async () => {
//     const videoRepo = AppDataSource.getRepository("Video");
//     for (const video of videosData) {
//         const v = videoRepo.create(video);
//         await videoRepo.save(v);
//     }
//     console.log("Videos seeded!");
//     process.exit();
// });
