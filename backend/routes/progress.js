const express = require("express");
const { db } = require("../data/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);

// GET /api/progress -> all progress entries for user, most recently watched first
router.get("/", (req, res) => {
  const entries = db
    .get("progress")
    .filter({ userId: req.user.id })
    .sortBy("updatedAt")
    .value()
    .reverse();
  res.json(entries);
});

// GET /api/progress/:videoId
router.get("/:videoId", (req, res) => {
  const entry = db
    .get("progress")
    .find({ userId: req.user.id, videoId: req.params.videoId })
    .value();
  res.json(entry || null);
});

// POST /api/progress  body: { videoId, position, duration }
router.post("/", (req, res) => {
  const { videoId, position, duration } = req.body;
  if (!videoId || position === undefined) {
    return res.status(400).json({ message: "videoId and position are required" });
  }

  const existing = db
    .get("progress")
    .find({ userId: req.user.id, videoId })
    .value();

  const percent = duration ? Math.min(100, (position / duration) * 100) : 0;

  if (existing) {
    db.get("progress")
      .find({ userId: req.user.id, videoId })
      .assign({
        position: Number(position),
        duration: Number(duration) || existing.duration,
        percent,
        updatedAt: new Date().toISOString(),
      })
      .write();
  } else {
    db.get("progress")
      .push({
        userId: req.user.id,
        videoId,
        position: Number(position),
        duration: Number(duration) || 0,
        percent,
        updatedAt: new Date().toISOString(),
      })
      .write();
  }

  res.json({ message: "Progress saved" });
});

module.exports = router;
