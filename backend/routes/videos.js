const express = require("express");
const { db } = require("../data/db");

const router = express.Router();

// GET /api/videos
router.get("/", (req, res) => {
  const videos = db.get("videos").value();
  res.json(videos);
});

// GET /api/videos/:id
router.get("/:id", (req, res) => {
  const video = db.get("videos").find({ id: req.params.id }).value();
  if (!video) return res.status(404).json({ message: "Video not found" });
  res.json(video);
});

module.exports = router;
