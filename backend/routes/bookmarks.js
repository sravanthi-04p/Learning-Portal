const express = require("express");
const { db, uuid } = require("../data/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// All bookmark routes require authentication
router.use(authRequired);

// GET /api/bookmarks?videoId=v1
// Returns all bookmarks for the logged-in user (optionally filtered by videoId)
router.get("/", (req, res) => {
  const { videoId } = req.query;
  let query = { userId: req.user.id };
  if (videoId) query.videoId = videoId;

  const bookmarks = db
    .get("bookmarks")
    .filter(query)
    .sortBy("timestamp")
    .value();

  res.json(bookmarks);
});

// POST /api/bookmarks
// body: { videoId, timestamp, name }
router.post("/", (req, res) => {
  const { videoId, timestamp, name } = req.body;

  if (!videoId || timestamp === undefined || timestamp === null) {
    return res.status(400).json({ message: "videoId and timestamp are required" });
  }

  const video = db.get("videos").find({ id: videoId }).value();
  if (!video) return res.status(404).json({ message: "Video not found" });

  const bookmark = {
    id: uuid(),
    userId: req.user.id,
    videoId,
    timestamp: Number(timestamp),
    name: name && name.trim() ? name.trim() : null,
    createdAt: new Date().toISOString(),
  };

  db.get("bookmarks").push(bookmark).write();
  res.status(201).json(bookmark);
});

// PUT /api/bookmarks/:id
// body: { name?, timestamp? }
router.put("/:id", (req, res) => {
  const bookmark = db
    .get("bookmarks")
    .find({ id: req.params.id, userId: req.user.id })
    .value();

  if (!bookmark) return res.status(404).json({ message: "Bookmark not found" });

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.timestamp !== undefined) updates.timestamp = Number(req.body.timestamp);

  db.get("bookmarks")
    .find({ id: req.params.id })
    .assign(updates)
    .write();

  const updated = db.get("bookmarks").find({ id: req.params.id }).value();
  res.json(updated);
});

// DELETE /api/bookmarks/:id
router.delete("/:id", (req, res) => {
  const bookmark = db
    .get("bookmarks")
    .find({ id: req.params.id, userId: req.user.id })
    .value();

  if (!bookmark) return res.status(404).json({ message: "Bookmark not found" });

  db.get("bookmarks").remove({ id: req.params.id }).write();
  res.json({ message: "Bookmark deleted" });
});

module.exports = router;
