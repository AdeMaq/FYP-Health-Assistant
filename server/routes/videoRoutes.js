const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const tagController = require("../controllers/tagController");

// ... imports

// 1. SPECIFIC ROUTES FIRST
router.get("/", videoController.getAllVideos);

// Move this UP so it gets hit before /:id
router.get("/tags", tagController.getData); 
router.post("/tags/synonym", tagController.saveSynonym);
router.delete("/tags/synonym/:id", tagController.deleteSynonym);
router.post("/tags/stopword", tagController.saveStopWord);
router.delete("/tags/stopword/:id", tagController.deleteStopWord);
router.post("/tags/seed", tagController.seedTags);

router.post("/chat", videoController.recommendVideo);
router.post("/seed", videoController.seedVideos);

// 2. WILDCARD ROUTES LAST
// Now "tags" won't be caught by this, because it was already handled above
router.get("/:id", videoController.getVideo); 
router.post("/", videoController.createVideo);
router.put("/:id", videoController.updateVideo);
router.delete("/:id", videoController.deleteVideo);

module.exports = router;
