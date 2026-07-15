import { useEffect, useState } from "react";
import api from "../utils/api";
import VideoCard from "../components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [videosRes, progressRes] = await Promise.all([
          api.get("/videos"),
          api.get("/progress").catch(() => ({ data: [] })),
        ]);
        setVideos(videosRes.data);
        const map = {};
        progressRes.data.forEach((p) => {
          map[p.videoId] = p;
        });
        setProgressMap(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const continueWatching = videos.filter(
    (v) => progressMap[v.id] && progressMap[v.id].percent > 2 && progressMap[v.id].percent < 95
  );

  const filtered = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Loading videos...</div>;

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Keep learning, one video at a time 🎓</h1>
        <p>Pick up where you left off or explore something new.</p>
        <input
          className="search-input"
          type="text"
          placeholder="Search videos by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {continueWatching.length > 0 && (
        <section className="section">
          <h2>Continue Watching</h2>
          <div className="video-grid">
            {continueWatching.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                progressPercent={progressMap[v.id]?.percent || 0}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>All Courses</h2>
        <div className="video-grid">
          {filtered.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              progressPercent={progressMap[v.id]?.percent || 0}
            />
          ))}
        </div>
        {filtered.length === 0 && <p className="empty-state">No videos match your search.</p>}
      </section>
    </div>
  );
}
