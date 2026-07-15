import { useState } from "react";
import { formatTime } from "../utils/api";

export default function BookmarkPanel({
  bookmarks,
  currentTime,
  onAdd,
  onJump,
  onDelete,
  onRename,
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    onAdd(currentTime, name.trim());
    setName("");
  };

  const startEdit = (bookmark) => {
    setEditingId(bookmark.id);
    setEditValue(bookmark.name || "");
  };

  const saveEdit = (id) => {
    onRename(id, editValue.trim());
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="bookmark-panel">
      <div className="bookmark-add">
        <h3>Bookmarks</h3>
        <div className="bookmark-add-row">
          <span className="current-time-badge">Current: {formatTime(currentTime)}</span>
          <input
            type="text"
            placeholder="Bookmark name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Bookmark
          </button>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <p className="empty-state">
          No bookmarks yet. Play the video and click "Add Bookmark" to save the
          current timestamp.
        </p>
      ) : (
        <ul className="bookmark-list">
          {bookmarks.map((b) => (
            <li key={b.id} className="bookmark-item">
              <button className="bookmark-jump" onClick={() => onJump(b.timestamp)}>
                <span className="bookmark-time">{formatTime(b.timestamp)}</span>
                {editingId === b.id ? (
                  <input
                    autoFocus
                    className="bookmark-edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(b.id)}
                  />
                ) : (
                  <span className="bookmark-name">
                    {b.name || "Untitled bookmark"}
                  </span>
                )}
              </button>
              <div className="bookmark-actions">
                {editingId === b.id ? (
                  <button
                    className="icon-btn"
                    title="Save"
                    onClick={() => saveEdit(b.id)}
                  >
                    ✓
                  </button>
                ) : (
                  <button
                    className="icon-btn"
                    title="Rename"
                    onClick={() => startEdit(b)}
                  >
                    ✎
                  </button>
                )}
                <button
                  className="icon-btn icon-btn-danger"
                  title="Delete"
                  onClick={() => onDelete(b.id)}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
