import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import VideoPlayer from "../components/VideoPlayer";
import BookmarkPanel from "../components/BookmarkPanel";

export default function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState(null);
  const [loading, setLoading] = useState(true);

  const lastSavedRef = useRef(0);
  const durationRef = useRef(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [videoRes, bookmarksRes, progressRes] = await Promise.all([
          api.get(`/videos/${id}`),
          api.get(`/bookmarks?videoId=${id}`),
          api.get(`/progress/${id}`).catch(() => ({ data: null })),
        ]);
        setVideo(videoRes.data);
        setBookmarks(bookmarksRes.data);
        if (progressRes.data && progressRes.data.position > 5) {
          setSeekTo(progressRes.data.position);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleTimeUpdate = (time, duration) => {
    setCurrentTime(time);
    durationRef.current = duration;

    // Throttle progress saves to once every 5 seconds
    if (time - lastSavedRef.current > 5) {
      lastSavedRef.current = time;
      api.post("/progress", { videoId: id, position: time, duration }).catch(() => {});
    }
  };

  const handleAddBookmark = async (timestamp, name) => {
    if (!timestamp || timestamp === 0) return;
    const { data } = await api.post("/bookmarks", {
      videoId: id,
      timestamp,
      name: name || null,
    });
    setBookmarks((prev) => [...prev, data].sort((a, b) => a.timestamp - b.timestamp));
  };

  const handleJump = (timestamp) => {
    setSeekTo(timestamp);
    // reset so clicking the same bookmark twice still triggers effect
    setTimeout(() => setSeekTo(null), 100);
  };

  const handleDelete = async (bookmarkId) => {
    await api.delete(`/bookmarks/${bookmarkId}`);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  const handleRename = async (bookmarkId, name) => {
    await api.put(`/bookmarks/${bookmarkId}`, { name });
    setBookmarks((prev) =>
      prev.map((b) => (b.id === bookmarkId ? { ...b, name } : b))
    );
  };

  if (loading) return <div className="page-loading">Loading video...</div>;
  if (!video) return <div className="page-loading">Video not found.</div>;

  return (
    <div className="video-detail-page">
      <Link to="/" className="back-link">
        ← Back to all videos
      </Link>

      <div className="video-detail-layout">
        <div className="player-column">
          <VideoPlayer video={video} onTimeUpdate={handleTimeUpdate} seekTo={seekTo} />
          <h1>{video.title}</h1>
          <span className="category-tag">{video.category}</span>
          <p className="video-description">{video.description}</p>
        </div>

        <div className="sidebar-column">
          <BookmarkPanel
            bookmarks={bookmarks}
            currentTime={currentTime}
            onAdd={handleAddBookmark}
            onJump={handleJump}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </div>
      </div>
    </div>
  );
}
