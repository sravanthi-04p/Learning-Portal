import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useScreenshotProtection } from "../utils/useScreenshotProtection";
import { formatTime } from "../utils/api";

export default function VideoPlayer({ video, onTimeUpdate, seekTo }) {
  const videoRef = useRef(null);
  const { user } = useAuth();
  const { isBlurred, warning } = useScreenshotProtection();
  const [watermarkPos, setWatermarkPos] = useState({ top: "10%", left: "10%" });

  // Move the traceability watermark every few seconds so it can't be
  // easily cropped out of a screenshot.
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        top: `${10 + Math.random() * 70}%`,
        left: `${10 + Math.random() * 60}%`,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Seek when parent requests (bookmark click)
  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTo;
      videoRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTo]);

  // Pause playback automatically while a screenshot/devtools warning is active
  useEffect(() => {
    if (isBlurred && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isBlurred]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  return (
    <div className="video-player-wrapper" onContextMenu={(e) => e.preventDefault()}>
      <div className={`video-frame ${isBlurred ? "video-blurred" : ""}`}>
        <video
          ref={videoRef}
          src={video.url}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onTimeUpdate={handleTimeUpdate}
          onContextMenu={(e) => e.preventDefault()}
          className="video-el"
        />

        {/* Traceable watermark overlay - deters casual sharing */}
        {user && (
          <div
            className="watermark"
            style={{ top: watermarkPos.top, left: watermarkPos.left }}
          >
            {user.name} • {user.email}
          </div>
        )}

        {isBlurred && (
          <div className="protection-overlay">
            <span className="protection-icon">🔒</span>
            <p>{warning}</p>
          </div>
        )}
      </div>
      <p className="protection-note">
        🔒 Screenshot &amp; screen-recording deterrents are active while you watch.
      </p>
    </div>
  );
}
