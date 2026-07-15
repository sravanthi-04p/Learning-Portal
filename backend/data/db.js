const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const { v4: uuid } = require("uuid");

const adapter = new FileSync(path.join(__dirname, "db.json"));
const db = low(adapter);

// Default DB structure
db.defaults({
  users: [],
  videos: [
    {
      id: "v1",
      title: "Introduction to React Hooks",
      description:
        "A beginner-friendly walkthrough of useState, useEffect and custom hooks.",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "https://placehold.co/640x360/4f46e5/ffffff?text=React+Hooks",
      duration: 10,
      category: "Web Development",
    },
    {
      id: "v2",
      title: "Data Structures: Trees & Graphs",
      description:
        "Understand the fundamentals of tree and graph data structures with examples.",
      url: "https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4",
      thumbnail: "https://placehold.co/640x360/4f46e5/ffffff?text=Trees+%26+Graphs",
      duration: 60,
      category: "Computer Science",
    },
    {
      id: "v3",
      title: "REST API Design Best Practices",
      description:
        "Learn how to design clean, scalable REST APIs for real-world applications.",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "https://placehold.co/640x360/4f46e5/ffffff?text=REST+APIs",
      duration: 10,
      category: "Backend Development",
    },
    {
      id: "v4",
      title: "Database Normalization Explained",
      description:
        "A practical guide to 1NF, 2NF, 3NF and why normalization matters.",
      url: "https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4",
      thumbnail: "https://placehold.co/640x360/4f46e5/ffffff?text=Normalization",
      duration: 60,
      category: "Database",
    },
  ],
  bookmarks: [],
  progress: [],
}).write();

module.exports = { db, uuid };
