# 📚 GVCC Learning Portal

A full-stack Learning Portal built with **React (JavaScript) + Node.js/Express**, featuring a video player with multi-bookmark support, resume-from-timestamp playback, watch-progress tracking, JWT authentication, and browser-level screenshot deterrence.

> Built for the GVCC Assignment — Learning Portal Development

---

## Tech Stack

| Layer          | Technology                                                |
|----------------|------------------------------------------------------------|
| Frontend       | React 18 (JavaScript, Vite), React Router, Axios          |
| Backend        | Node.js, Express                                            |
| Database       | `lowdb` (JSON file-based DB — zero setup, easy to swap for MongoDB) |
| Auth           | JWT (jsonwebtoken) + bcrypt password hashing                |
| Styling        | Hand-written responsive CSS (no framework)                  |

This is effectively a **MERN-style stack** with `lowdb` standing in for MongoDB so the project runs anywhere with zero database installation. Swapping in real MongoDB later only requires changing `backend/data/db.js` and the query calls in `routes/*.js` — the REST API contract stays identical (see "Swapping in MongoDB" below).

---

## Project Structure

```
learning-portal/
├── backend/
│   ├── data/
│   │   └── db.js              # lowdb setup + seed videos
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js            # register / login
│   │   ├── videos.js          # list / get video
│   │   ├── bookmarks.js       # full bookmark CRUD
│   │   └── progress.js        # watch-progress tracking
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── VideoPlayer.jsx      # <video> + screenshot protection + watermark
    │   │   ├── BookmarkPanel.jsx    # add / list / edit / delete bookmarks
    │   │   ├── VideoCard.jsx        # portal grid card w/ progress bar
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Home.jsx             # video grid + "Continue Watching"
    │   │   ├── VideoDetail.jsx      # player + bookmarks page
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx      # global auth state
    │   ├── utils/
    │   │   ├── api.js               # axios instance + formatTime helper
    │   │   └── useScreenshotProtection.js
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── .env.example
```

---

## Setup Instructions

### Prerequisites
- Node.js ≥ 18
- npm

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The API will run at `http://localhost:5000`. On first run it auto-creates `data/db.json` seeded with 4 sample videos. Health check: `GET http://localhost:5000/api/health`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Register a new account, then browse videos.

### 3. Production build (frontend)

```bash
cd frontend
npm run build   # outputs static files to frontend/dist
npm run preview # preview the production build locally
```

---

## Feature Walkthrough

### 1. Learning Portal
- `Home` page lists all available course videos in a responsive card grid, searchable by title/category.
- Each card shows a thumbnail, duration, category tag, and (if applicable) a progress bar.
- Sample videos are royalty-free/public-domain test clips (Google's `gtv-videos-bucket`) so the demo works out of the box without hosting media yourself. Replace `backend/data/db.js` `videos` array with your own hosted URLs for real content.

### 2. Video Bookmark Feature
- On the video detail page, click **"+ Add Bookmark"** at any point during playback to save the *current* timestamp, with an optional name.
- Multiple bookmarks per video are supported and persisted per logged-in user via the backend API (`POST /api/bookmarks`), stored against `{ videoId, timestamp, name, userId }`.
- All bookmarks for the current video are listed below the player, **sorted by timestamp**, each showing `mm:ss` and its name.
- Clicking a bookmark calls `videoRef.current.currentTime = timestamp` and resumes playback immediately from that exact point (see `VideoDetail.jsx` → `handleJump` → `VideoPlayer.jsx` `seekTo` effect).
- **Bonus:** bookmarks can be renamed (✎) or deleted (🗑) inline, no page reload needed.

### 3. Screenshot Protection — Approach & Honest Limitations

**No web browser exposes an API that can truly block a screenshot or OS-level screen recording.** This is a hard platform limitation, not a shortcoming of this implementation — it applies to Netflix, Coursera, Udemy, and every other browser-based video platform. What *is* achievable, and what this project implements in `useScreenshotProtection.js` + `VideoPlayer.jsx`, is a layered set of real deterrents:

1. **Key-combo detection** — listens for `PrintScreen`, `Cmd+Shift+3/4/5` (macOS capture shortcuts), and dev-tools shortcuts (`F12`, `Ctrl+Shift+I/J/C`). On detection, the video is immediately paused and blurred with a warning overlay for ~2.5s.
2. **Focus/visibility detection** — many OS-level screenshot/snip tools cause a `window.blur` or `visibilitychange` event as focus shifts to the capture tool. The player detects this and pauses + blurs proactively.
3. **Dev-tools-open heuristic** — compares `window.outerWidth/outerHeight` vs `innerWidth/innerHeight`; a large gap (docked dev tools) triggers the same blur+warning, since an open inspector can be used to grab the raw video stream URL.
4. **Right-click / context-menu disabled** on the player, and native browser **download button hidden** via `controlsList="nodownload"`, discouraging the most casual save attempts.
5. **Moving traceable watermark** — while a video plays, a semi-transparent overlay showing the logged-in student's name + email drifts to a new random position every few seconds. This doesn't stop a screenshot, but it makes any leaked frame **traceable back to the student who captured it** — the same deterrence model real platforms (e.g. corporate training tools) actually use.

None of the above can stop someone photographing their screen with a second device — that is outside what any browser or native web app can control. If OS/hardware-level guarantees were a hard requirement, the correct approach would be a **native mobile app** using platform APIs (Android `FLAG_SECURE`, iOS `UIScreen.capturedDidChangeNotification` — which can detect but still not fully block recording) rather than a web app; this is called out explicitly since the assignment's own note acknowledges platform capabilities differ.

### 4. Bonus Features Implemented
- ✅ Edit / delete bookmarks
- ✅ Bookmark names (optional, editable)
- ✅ Continue Watching section on the home page
- ✅ Watch progress indicator (progress bar on each video card, % saved every 5s)
- ✅ Recently watched / continue-watching driven by `progress` API
- ✅ Full authentication (JWT register/login, protected routes)
- ✅ Responsive UI (desktop grid, mobile stacked layout, tested via CSS breakpoints)

---

## API Reference

| Method | Endpoint                     | Auth | Description                          |
|--------|-------------------------------|------|---------------------------------------|
| POST   | `/api/auth/register`         | ✗    | Create account, returns JWT           |
| POST   | `/api/auth/login`             | ✗    | Login, returns JWT                    |
| GET    | `/api/videos`                 | ✗    | List all videos                       |
| GET    | `/api/videos/:id`             | ✗    | Get single video                      |
| GET    | `/api/bookmarks?videoId=`     | ✓    | List current user's bookmarks         |
| POST   | `/api/bookmarks`              | ✓    | Create bookmark `{videoId, timestamp, name}` |
| PUT    | `/api/bookmarks/:id`          | ✓    | Rename / update timestamp             |
| DELETE | `/api/bookmarks/:id`          | ✓    | Delete a bookmark                     |
| GET    | `/api/progress`               | ✓    | List all watch-progress (recent first)|
| GET    | `/api/progress/:videoId`      | ✓    | Get progress for one video            |
| POST   | `/api/progress`               | ✓    | Save/update progress `{videoId, position, duration}` |

Protected routes require `Authorization: Bearer <token>`.

### Data Models

```js
// User
{ id, name, email, password (hashed), createdAt }

// Video
{ id, title, description, url, thumbnail, duration, category }

// Bookmark
{ id, userId, videoId, timestamp, name (nullable), createdAt }

// Progress
{ userId, videoId, position, duration, percent, updatedAt }
```

### Swapping in MongoDB

The API surface (`routes/*.js`) is intentionally written using lowdb's chainable `.find()/.filter()/.push()` calls that map almost 1:1 onto Mongoose. To swap:
1. Replace `backend/data/db.js` with a Mongoose connection + `User`, `Video`, `Bookmark`, `Progress` schemas.
2. Replace each `db.get("collection").find(...)` with `Model.findOne(...)`, `.filter(...)` with `Model.find(...)`, `.push(x).write()` with `Model.create(x)`.
3. No frontend changes needed — it only talks to the REST endpoints.

---

## Troubleshooting

**Video shows a black box / spinning forever:** this means the seeded video URL didn't finish loading — check your internet connection and that your network/firewall isn't blocking `w3schools.com` or `mdn.github.io`. The seed data (`backend/data/db.js`) intentionally uses small, currently-reliable public sample clips rather than Google's older `gtv-videos-bucket` files, which have started returning `AccessDenied` for many users. If it still doesn't load, open browser dev tools → Network tab and check the failing request, or simply replace the `url` field in `backend/data/db.js` with your own hosted `.mp4` file and delete `backend/data/db.json` so it re-seeds.

## Demo Credentials

No seed users are created — register a new account from the **Sign Up** page (any email/password works, minimum 6-character password).

---

## Screenshots

See `/screenshots` folder for UI screenshots of: Login, Video Portal grid, Video Player with bookmarks panel, and the screenshot-protection warning overlay.

(Screen recording / live deployment link: add here before submission if required by your instructor.)
