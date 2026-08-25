# CreatorTask Studio 🎬🤖📦

> A production-grade PC Desktop & Web Application for content creators, combining local **Qwen 2.5 (3B)** AI intelligence, **105+ Viral Video Vault**, Smart Upload script analyzer, and Kanban productivity workflows.

<p align="center">
  <img src="assets/icon.svg" width="100" height="100" alt="CreatorTask Studio Notebook Logo" />
</p>

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-Desktop%20App-47848F?style=flat&logo=electron&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Qwen%202.5%20(3B)-FB542B?style=flat&logo=ollama&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa&logoColor=white)
![Windows](https://img.shields.io/badge/Windows-PC%20Setup%20Ready-0078D6?style=flat&logo=windows&logoColor=white)

---

## 💻 Standalone PC Desktop App & Setup

### 🚀 1-Click Windows Setup (`setup.bat`)
Double-click **`setup.bat`** (or run `npm run setup`):
1. ✅ Checks Node.js runtime environment.
2. 📦 Automatically installs all dependencies & desktop libraries.
3. 🤖 Verifies local Ollama (`qwen2.5:3b`) connection.
4. 🖥️ **Creates a Windows Desktop Shortcut** (`CreatorTask Studio.lnk`) with the custom notebook icon!
5. ⚡ Prompts to launch the desktop application immediately.

### 🎬 Launching Desktop App
- **Option 1**: Double-click the **`CreatorTask Studio`** desktop shortcut.
- **Option 2**: Run **`launch.bat`**.
- **Option 3**: Run `npm run app` (starts Electron with internal background server & system tray).
- **Option 4**: Run `npm start` (starts web server at `http://localhost:3000`).

---

## ✨ Features

- 🖥️ **Standalone Desktop Window & System Tray**: Native PC app window with custom notebook titlebar, quick tray menu (Open Board, Brainstorm Idea, Focus Timer, Quit).
- 🧠 **Local Qwen 2.5 (3B) AI Studio**:
  - **AI Video Brainstorming** (<kbd>A</kbd>): Generate viral titles, 15-second opening retention hooks, structured talking points, thumbnail blueprints, and custom milestones.
  - **In-Modal "✨ Enhance with AI"**: 1-click optimization of title, script notes, and milestone checklists.
- 📦 **Viral Ideas Vault (105+ Topics)** (<kbd>V</kbd>):
  - 1-click category imports for **🚨 Top 15 CTR**, **🔥 Stages Of... (20)**, **🕵️ Conspiracies (20)**, **🧠 Psychological (15)**, **☠️ Dark History (15)**, **👁️ Mysteries (15)**, and **🌎 What If? (15)**.
- 📁 **Smart Upload & Script Analyzer** (<kbd>U</kbd>):
  - Drag-and-drop `.md`, `.txt`, `.json`, `.csv` notes or paste raw transcripts. Automatically detects numbered topic lists for 1-click bulk import!
- 🎯 **Kanban Board & Checklist Views**: 3-stage Kanban board (*Ideas & To Do*, *In Production*, *Done & Published*) and a focused Checklist view with inline milestone subtasks.
- 💾 **Persistent Database & REST API**: Atomic transactional storage in `data/tasks.json` with automatic backup mirroring.
- ⏱️ **Focus Pomodoro Timer** (<kbd>T</kbd>): Built-in 25-minute scripting & video editing timer with title bar countdown and celebration cues.
- 📄 **Markdown & JSON Export**: One-click export of full script outlines and production checklists directly into Markdown (ready for Obsidian / Notion) or JSON backups.
- ⚡ **Keyboard Shortcuts**: Complete hotkey navigation (`A` for AI Studio, `U` for Smart Upload, `V` for Viral Vault, `N` for new task, `/` for search, `B`/`L` for view switching, `T` for focus timer, `?` for shortcuts guide).

---

## ⌨️ Keyboard Shortcuts

- <kbd>V</kbd> — Open Viral YouTube Vault (105+ Ideas)
- <kbd>A</kbd> — Open AI Brainstorming Studio (Qwen 2.5)
- <kbd>U</kbd> — Open Smart Upload & Script Analyzer
- <kbd>N</kbd> — Create New Task / Idea
- <kbd>/</kbd> — Focus Search Box
- <kbd>B</kbd> — Switch to Kanban Board View
- <kbd>L</kbd> — Switch to Checklist View
- <kbd>T</kbd> — Toggle Scripting Focus Timer
- <kbd>I</kbd> — Open Idea Sparks Catalog
- <kbd>Esc</kbd> — Close Dialog / Clear Search
- <kbd>?</kbd> — Open Keyboard Shortcuts Guide
