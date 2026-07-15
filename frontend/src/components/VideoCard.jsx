import { Link } from "react-router-dom";
import { formatTime } from "../utils/api";

export default function VideoCard({ video, progressPercent }) {
  return (
    <Link to={`/video/${video.id}`} className="video-card">
      <div className="thumb-wrapper">
        <img src={video.thumbnail} alt={video.title} className="thumb" />
        <span className="duration-badge">{formatTime(video.duration)}</span>
        {progressPercent > 0 && (
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        )}
      </div>
      <div className="video-card-body">
        <span className="category-tag">{video.category}</span>
        <h4>{video.title}</h4>
        <p>{video.description}</p>
      </div>
    </Link>
  );
}
