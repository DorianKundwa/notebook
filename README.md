# CreatorTask Studio 🎬⚡

> A production-ready, high-aesthetic task management and YouTube video idea organizer built for content creators and power users.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21+-000000?style=flat&logo=express&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)

---

## ✨ Features

- 🎯 **Kanban Board & Checklist Views**: Toggle between a 3-stage Kanban board (*Ideas & To Do*, *In Production*, *Done & Published*) and a focused Checklist view with inline milestone subtasks.
- 💾 **Persistent Database & REST API**: Powered by a robust Node.js Express server with atomic transactional file storage in `data/tasks.json` and automatic backup mirroring.
- 🔄 **Hybrid Dual-Sync Client**: Real-time synchronization with the backend database, automatic offline caching in `localStorage`, and auto-reconnection indicators (`🟢 Cloud Synced` / `🟡 Offline Mode`).
- 🎬 **Video Format Presets**: Dedicated production presets for **Long-form Videos (8 milestones)**, **Shorts/Reels (4 steps)**, **Sponsorships (4 steps)**, and **Podcasts (6 steps)**.
- ⏱️ **Focus Pomodoro Timer**: Built-in 25-minute scripting & video editing timer with title bar updates and audio/visual celebration cues.
- 💡 **Idea Spark Generator**: Pre-loaded viral concept templates across Tech, Productivity, Gaming, Business, and Creative niches.
- 📄 **Markdown & JSON Export**: One-click export of full script outlines and production checklists directly into Markdown (ready for Obsidian / Notion) or JSON backups.
- ⚡ **Keyboard Shortcuts**: Complete hotkey navigation (`N` for new task, `/` for search, `B`/`L` for view switching, `T` for focus timer, `?` for shortcuts guide).
- 📱 **Progressive Web App (PWA)**: Installable on desktop & mobile with `manifest.json` and `sw.js` offline service worker.
- 🐳 **Docker & Docker Compose**: 1-command containerized production deployment.

---

## 🚀 Getting Started

### 1. Run Locally (Node.js)

```bash
# Install dependencies
npm install

# Start production server
npm start
```

Visit: `http://localhost:3000`

### 2. Run with Docker

```bash
# Build and run container
docker-compose up -d
```

### 3. Run Automated Tests

```bash
npm test
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and uptime |
| `GET` | `/api/tasks` | List all tasks (Supports `?format=`, `?category=`, `?priority=`, `?search=`) |
| `GET` | `/api/tasks/:id` | Retrieve single task |
| `POST` | `/api/tasks` | Create a new task / video idea |
| `PUT` | `/api/tasks/:id` | Update task details, milestones, or status |
| `DELETE` | `/api/tasks/:id` | Remove a task |
| `POST` | `/api/tasks/clear-done` | Bulk remove completed tasks |
| `POST` | `/api/tasks/reset-sample` | Reset database to starter creator templates |
| `GET` | `/api/export/markdown` | Download formatted Markdown catalog |
| `GET` | `/api/export/json` | Download full JSON backup |
| `POST` | `/api/import` | Upload JSON backup with schema validation |

---

## ⌨️ Keyboard Shortcuts

- <kbd>N</kbd> — Create New Task / Idea
- <kbd>/</kbd> — Focus Search Box
- <kbd>B</kbd> — Switch to Kanban Board View
- <kbd>L</kbd> — Switch to Checklist View
- <kbd>T</kbd> — Toggle Scripting Focus Timer
- <kbd>I</kbd> — Open Idea Sparks Generator
- <kbd>Esc</kbd> — Close Dialog / Clear Search
- <kbd>?</kbd> — Open Keyboard Shortcuts Guide

---

## 🛡️ Architecture & Tech Stack

- **Backend**: Node.js, Express 4, Compression, CORS, Transactional File Database
- **Frontend**: Semantic HTML5, Vanilla CSS3 (Glassmorphism & Cyber Glow Theme), Modular ES6 JS
- **Persistence**: Atomic file writes to `./data/tasks.json` with `./data/tasks.backup.json` failover
- **Offline / PWA**: Web App Manifest & Service Worker Cache
