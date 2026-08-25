# CreatorTask Studio 🎬🤖⚡

> A production-ready, high-aesthetic task management and YouTube video idea organizer with local **Qwen 2.5 (3B)** AI intelligence, Smart Upload, and creator workflows.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21+-000000?style=flat&logo=express&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Qwen%202.5%20(3B)-FB542B?style=flat&logo=ollama&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)

---

## ✨ Features

- 🧠 **Local Qwen 2.5 (3B) AI Studio**:
  - **AI Video Brainstorming**: Generate viral titles, 15-second opening retention hooks, structured talking points, thumbnail blueprints, and custom production milestones for any topic.
  - **In-Modal "✨ Enhance with AI"**: One-click title optimizer, script notes generator, and subtask creator.
- 📁 **Smart Upload & Script Analyzer**:
  - Drag-and-drop any script notes, transcripts, outline documents (`.md`, `.txt`, `.json`, `.csv`) or paste raw text.
  - Local Qwen 2.5 automatically parses the document, determines the best format (`longform`, `shorts`, `sponsor`, `podcast`), extracts key insights, and creates a structured task with actionable milestones!
- 🎯 **Kanban Board & Checklist Views**: 3-stage Kanban board (*Ideas & To Do*, *In Production*, *Done & Published*) and a focused Checklist view with inline milestone subtasks.
- 💾 **Persistent Database & REST API**: Express backend with atomic transactional storage in `data/tasks.json` and automatic backup mirroring.
- 🔄 **Hybrid Dual-Sync Client**: Real-time synchronization, automatic offline caching in `localStorage`, and live connection indicators (`🟢 Cloud Synced`, `🤖 Qwen 2.5 Ready`).
- 🎬 **Video Format Presets**: Dedicated production milestones for **Long-form Videos (8 steps)**, **Shorts/Reels (4 steps)**, **Sponsorships (4 steps)**, and **Podcasts (6 steps)**.
- ⏱️ **Focus Pomodoro Timer**: Built-in 25-minute scripting & video editing timer with title bar countdown and celebration cues.
- 📄 **Markdown & JSON Export**: One-click export of full script outlines and production checklists directly into Markdown (ready for Obsidian / Notion) or JSON backups.
- ⚡ **Keyboard Shortcuts**: Complete hotkey navigation (`A` for AI Studio, `U` for Smart Upload, `N` for new task, `/` for search, `B`/`L` for view switching, `T` for focus timer, `?` for shortcuts guide).
- 📱 **Progressive Web App (PWA)**: Installable on desktop & mobile with `manifest.json` and `sw.js` offline service worker.
- 🐳 **Docker & Docker Compose**: 1-command containerized production deployment.

---

## 🚀 Getting Started

### 1. Prerequisites (For AI Features)

Ensure [Ollama](https://ollama.com) is installed with `qwen2.5:3b`:

```bash
ollama run qwen2.5:3b
```

### 2. Run Locally (Node.js)

```bash
# Install dependencies
npm install

# Start production server
npm start
```

Visit: `http://localhost:3000`

### 3. Run Automated Test Suite

```bash
npm test
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and uptime |
| `GET` | `/api/ai/status` | Ollama connection & Qwen 2.5:3b status |
| `POST` | `/api/ai/brainstorm` | Generate video concepts, hooks, and milestones with Qwen 2.5 |
| `POST` | `/api/ai/enhance` | Enhance task title, script notes, and recommended subtasks |
| `POST` | `/api/ai/smart-upload` | Parse uploaded document / raw text and convert into structured task |
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

- <kbd>A</kbd> — Open AI Brainstorming Studio
- <kbd>U</kbd> — Open Smart Upload & Script Analyzer
- <kbd>N</kbd> — Create New Task / Idea
- <kbd>/</kbd> — Focus Search Box
- <kbd>B</kbd> — Switch to Kanban Board View
- <kbd>L</kbd> — Switch to Checklist View
- <kbd>T</kbd> — Toggle Scripting Focus Timer
- <kbd>I</kbd> — Open Idea Sparks Catalog
- <kbd>Esc</kbd> — Close Dialog / Clear Search
- <kbd>?</kbd> — Open Keyboard Shortcuts Guide
