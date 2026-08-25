/**
 * CreatorTask Studio — Task & YouTube Idea Tracker
 * Production Client with local Qwen 2.5 (3B) AI Integration, Smart Upload,
 * Dual-Sync REST API, Offline Cache, Focus Timer, Format Presets, and PWA.
 */

// --- Production Checklist Templates ---
const PRODUCTION_PRESETS = {
  longform: [
    "Hook, Target Audience & Script Outline",
    "Record 4K A-Roll (Talking Head / Intro)",
    "Capture B-Roll, Screen Recordings & Assets",
    "Rough Cut & Pacing in DaVinci / Premiere",
    "Sound Design, Kinematic BGM & Sound FX",
    "Design High-CTR Thumbnail (3 Variations)",
    "Write High-SEO Title, Description & Tags",
    "Publish, Pin Comment & Social Distribution"
  ],
  shorts: [
    "Draft 45-second fast-paced audio hook & script",
    "Record vertical 9:16 video / screen capture",
    "Auto-caption with bold kinetic text & sound effects",
    "Select high-CTR thumbnail frame & publish"
  ],
  sponsor: [
    "Review brand brief & mandatory talking points",
    "Submit script outline to sponsor agency for approval",
    "Record 60s integration with custom affiliate tracking link",
    "Send final video preview link & tracking verification"
  ],
  podcast: [
    "Research guest topics & draft 10 core questions",
    "Equipment check (Microphones, Cameras & OBS)",
    "Record 60-minute multi-cam conversation",
    "Master audio & balance loudness (-14 LUFS)",
    "Extract 3 viral short-form highlight clips",
    "Distribute to Spotify, Apple Podcasts & YouTube"
  ]
};

// --- YouTube Idea Sparks Catalog ---
const IDEA_SPARKS = {
  tech: [
    {
      title: "Building an App from Scratch with AI Agents in 1 Hour",
      hook: "Show a real-time stopwatch building a production-ready web application using agentic coding tools.",
      tags: ["AI", "Coding", "Challenge"],
      category: "youtube",
      format: "longform",
      priority: "high"
    },
    {
      title: "Stop Learning Frameworks — Do This Instead",
      hook: "A contrarian take on foundational CS principles vs chasing the weekly JavaScript frameworks.",
      tags: ["Career", "Programming", "Advice"],
      category: "youtube",
      format: "longform",
      priority: "medium"
    },
    {
      title: "3 Terminal Commands That Feel Like Superpowers",
      hook: "Ultra-fast vertical video demonstrating modern CLI navigation in 40 seconds.",
      tags: ["Shorts", "CLI", "Linux"],
      category: "youtube",
      format: "shorts",
      priority: "high"
    }
  ],
  productivity: [
    {
      title: "The Simple 3-Tier Daily System That Fixed My Procrastination",
      hook: "How to eliminate overwhelm using energy-based time blocking instead of rigid 10-hour schedules.",
      tags: ["Habits", "Focus", "Routine"],
      category: "youtube",
      format: "longform",
      priority: "high"
    },
    {
      title: "I Tried Elon Musk's 5-Minute Time Blocking for 7 Days",
      hook: "Documentary vlog testing ultra-granular schedule blocks and analyzing burnout vs output.",
      tags: ["Experiment", "Challenge", "TimeManagement"],
      category: "youtube",
      format: "longform",
      priority: "urgent"
    }
  ],
  gaming: [
    {
      title: "Can You Beat This Impossible Challenge Without Taking Damage?",
      hook: "High-stakes gaming run with commentary, live heart rate monitor, and intense fail cuts.",
      tags: ["Gaming", "Challenge", "NoHit"],
      category: "youtube",
      format: "longform",
      priority: "medium"
    },
    {
      title: "The Ultimate Budget Streaming & Recording Setup in 2026",
      hook: "Show how to get a $5,000 streamer look on a $300 budget using lighting hacks and free OBS plugins.",
      tags: ["Streaming", "Gear", "Budget"],
      category: "youtube",
      format: "longform",
      priority: "high"
    }
  ],
  business: [
    {
      title: "How I Built a Micro-SaaS to $5,000/mo as a Solo Creator",
      hook: "Transparent breakdown of tech stack, payment gateways, marketing channels, and customer acquisition costs.",
      tags: ["SaaS", "Entrepreneurship", "Finance"],
      category: "youtube",
      format: "longform",
      priority: "high"
    },
    {
      title: "Is Digital Nomad Life Still Worth It in 2026?",
      hook: "Realistic cost breakdown, taxes, Wi-Fi speeds, and loneliness realities across 5 countries.",
      tags: ["Lifestyle", "Finance", "Travel"],
      category: "youtube",
      format: "longform",
      priority: "medium"
    }
  ],
  creative: [
    {
      title: "How to Make Boring Videos Look Cinematic (5 Lighting Rules)",
      hook: "Step-by-step room transformation showing key light, backlight, practicals, and color temperature.",
      tags: ["Cinematography", "Lighting", "Filmmaking"],
      category: "youtube",
      format: "longform",
      priority: "high"
    },
    {
      title: "Designing YouTube Thumbnails That Get 15%+ CTR",
      hook: "Photoshop live breakdown: composition hierarchy, face expressions, 3D typography, and color contrast.",
      tags: ["Thumbnail", "Design", "Photoshop"],
      category: "thumbnail",
      format: "longform",
      priority: "urgent"
    }
  ]
};

// --- App State & API Client ---
class AppManager {
  constructor() {
    this.tasks = [];
    this.currentFormat = "all";
    this.currentPriority = "all";
    this.searchQuery = "";
    this.currentView = "board";
    this.listSortBy = "created";
    this.draggedTaskId = null;
    this.activeSparkNiche = "tech";
    this.isOnline = true;
    this.isAiReady = false;
    this.apiBase = window.location.origin;

    // Focus Timer State
    this.timerSeconds = 25 * 60;
    this.timerInitialSeconds = 25 * 60;
    this.timerInterval = null;
    this.timerIsRunning = false;
  }

  // Check Local Ollama AI Status
  async checkAIStatus() {
    try {
      const res = await fetch(`${this.apiBase}/api/ai/status`);
      if (res.ok) {
        const data = await res.json();
        this.isAiReady = data.available && data.modelInstalled;
        const aiIndicator = document.getElementById("ai-indicator");
        const aiStatusText = document.getElementById("ai-status-text");

        if (this.isAiReady) {
          aiIndicator.className = "sync-badge ai-badge connected";
          aiStatusText.textContent = "🤖 Qwen 2.5:3B Ready";
          aiIndicator.title = "Local Ollama Qwen 2.5:3b model active";
        } else {
          aiIndicator.className = "sync-badge offline";
          aiStatusText.textContent = "🤖 AI Offline";
          aiIndicator.title = data.error || "Ollama service unreachable";
        }
      }
    } catch (err) {
      this.isAiReady = false;
    }
  }

  // Dual-Sync: Fetch tasks
  async fetchTasks() {
    try {
      const res = await fetch(`${this.apiBase}/api/tasks`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        this.tasks = data.tasks || [];
        this.setOnlineStatus(true);
        this.saveToLocalCache();
        return this.tasks;
      }
      throw new Error("Server responded with error");
    } catch (err) {
      console.warn("Backend API unavailable, loading from local offline cache:", err);
      this.setOnlineStatus(false);
      this.loadFromLocalCache();
      return this.tasks;
    }
  }

  setOnlineStatus(online) {
    this.isOnline = online;
    const badge = document.getElementById("sync-indicator");
    const text = document.getElementById("sync-text");
    if (!badge || !text) return;

    if (online) {
      badge.className = "sync-badge connected";
      text.textContent = "Cloud Synced";
      badge.title = "Connected to persistent backend database";
    } else {
      badge.className = "sync-badge offline";
      text.textContent = "Offline Mode";
      badge.title = "Operating in offline mode (local cache active)";
    }
  }

  loadFromLocalCache() {
    try {
      const stored = localStorage.getItem("creatortask_cache");
      if (stored) {
        this.tasks = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to read local cache:", e);
    }
  }

  saveToLocalCache() {
    try {
      localStorage.setItem("creatortask_cache", JSON.stringify(this.tasks));
    } catch (e) {
      console.error("Failed to write to local cache:", e);
    }
  }

  async createTask(taskData) {
    const tempId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newTask = {
      id: tempId,
      title: taskData.title.trim(),
      category: taskData.category || "youtube",
      priority: taskData.priority || "medium",
      status: taskData.status || "todo",
      format: taskData.format || "longform",
      dueDate: taskData.dueDate || "",
      tags: taskData.tags || [],
      description: taskData.description || "",
      subtasks: taskData.subtasks || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.tasks.unshift(newTask);
    this.saveToLocalCache();

    if (this.isOnline) {
      try {
        const res = await fetch(`${this.apiBase}/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask)
        });
        if (res.ok) {
          const resData = await res.json();
          const idx = this.tasks.findIndex((t) => t.id === tempId);
          if (idx !== -1 && resData.task) {
            this.tasks[idx] = resData.task;
            this.saveToLocalCache();
          }
        }
      } catch (err) {
        console.warn("Error creating task on server:", err);
      }
    }
    return newTask;
  }

  async updateTask(taskId, updates) {
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      this.tasks[idx] = {
        ...this.tasks[idx],
        ...updates,
        updatedAt: Date.now()
      };
      this.saveToLocalCache();

      if (this.isOnline) {
        try {
          await fetch(`${this.apiBase}/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
          });
        } catch (err) {
          console.warn("Error updating task on server:", err);
        }
      }
      return this.tasks[idx];
    }
    return null;
  }

  async deleteTask(taskId) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveToLocalCache();

    if (this.isOnline) {
      try {
        await fetch(`${this.apiBase}/api/tasks/${taskId}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Error deleting task on server:", err);
      }
    }
  }

  async toggleTaskCompletion(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      const isDone = task.status === "done";
      const nextStatus = isDone ? "todo" : "done";
      const updatedSubtasks = task.subtasks
        ? task.subtasks.map((s) => ({ ...s, done: !isDone ? true : s.done }))
        : [];

      return await this.updateTask(taskId, {
        status: nextStatus,
        subtasks: updatedSubtasks
      });
    }
    return null;
  }

  async toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && task.subtasks) {
      const subtasks = task.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s));

      const allDone = subtasks.every((s) => s.done);
      let status = task.status;
      if (allDone && task.status !== "done") {
        status = "done";
      } else if (!allDone && task.status === "done") {
        status = "in-progress";
      }

      await this.updateTask(taskId, { subtasks, status });
      return { task, subtasks, allDone };
    }
    return null;
  }

  async clearCompleted() {
    this.tasks = this.tasks.filter((t) => t.status !== "done");
    this.saveToLocalCache();

    if (this.isOnline) {
      try {
        await fetch(`${this.apiBase}/api/tasks/clear-done`, { method: "POST" });
      } catch (err) {
        console.warn("Error clearing done on server:", err);
      }
    }
  }

  async resetSampleData() {
    if (this.isOnline) {
      try {
        const res = await fetch(`${this.apiBase}/api/tasks/reset-sample`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          this.tasks = data.tasks || [];
          this.saveToLocalCache();
          return this.tasks;
        }
      } catch (err) {
        console.warn("Error resetting sample on server:", err);
      }
    }
    await this.fetchTasks();
    return this.tasks;
  }

  getFilteredTasks() {
    return this.tasks.filter((task) => {
      if (this.currentFormat !== "all" && (task.format || "longform") !== this.currentFormat) {
        return false;
      }
      if (this.currentPriority !== "all" && task.priority !== this.currentPriority) {
        return false;
      }
      if (this.searchQuery.trim() !== "") {
        const q = this.searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = (task.description || "").toLowerCase().includes(q);
        const matchTags = (task.tags || []).some((tag) => tag.toLowerCase().includes(q));
        const matchSubtasks = (task.subtasks || []).some((sub) => sub.text.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags && !matchSubtasks) {
          return false;
        }
      }
      return true;
    });
  }

  getStats() {
    const total = this.tasks.length;
    const inProgress = this.tasks.filter((t) => t.status === "in-progress").length;
    const completed = this.tasks.filter((t) => t.status === "done").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    let totalSubtasks = 0;
    let completedSubtasks = 0;
    this.tasks.forEach((t) => {
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter((s) => s.done).length;
      }
    });

    return { total, inProgress, completed, percent, totalSubtasks, completedSubtasks };
  }
}

// --- Confetti Celebration Helper ---
function triggerCelebration() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#38bdf8", "#fbbf24"]
    });
  } else {
    renderMiniConfetti();
  }
}

function renderMiniConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#38bdf8", "#fbbf24"];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.7,
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 12 + 6),
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360
    });
  }

  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.alpha -= 0.015;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });

    frames++;
    if (frames < 70) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(animate);
}

// --- Toast Notification Helper ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✅" : type === "ai" ? "🤖" : "⚡"}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3400);
}

// --- Main Application Lifecycle ---
document.addEventListener("DOMContentLoaded", async () => {
  const app = new AppManager();

  // Register PWA Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  // DOM Elements
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("btn-clear-search");
  const formatFilters = document.getElementById("format-filters");
  const priorityFilter = document.getElementById("priority-filter");
  const btnViewBoard = document.getElementById("btn-view-board");
  const btnViewList = document.getElementById("btn-view-list");
  const boardView = document.getElementById("board-view");
  const listView = document.getElementById("list-view");
  const emptyState = document.getElementById("empty-state");

  // Kanban Columns
  const listTodo = document.getElementById("list-todo");
  const listInProgress = document.getElementById("list-in-progress");
  const listDone = document.getElementById("list-done");

  // Stat Elements
  const statTotal = document.getElementById("stat-total");
  const statInProgress = document.getElementById("stat-in-progress");
  const statCompleted = document.getElementById("stat-completed");
  const statPercent = document.getElementById("stat-percent");
  const statProgressBar = document.getElementById("stat-progress-bar");
  const statSubtasksSummary = document.getElementById("stat-subtasks-summary");
  const countTodo = document.getElementById("count-todo");
  const countInProgress = document.getElementById("count-in-progress");
  const countDone = document.getElementById("count-done");

  // Task Modal Elements
  const modalTask = document.getElementById("modal-task");
  const taskForm = document.getElementById("task-form");
  const modalTitle = document.getElementById("modal-title");
  const btnOpenAddTask = document.getElementById("btn-open-add-task");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");
  const btnDeleteTask = document.getElementById("btn-delete-task");
  const btnEmptyAdd = document.getElementById("btn-empty-add");
  const selectPresetTemplate = document.getElementById("select-preset-template");
  const btnAddSubtaskRow = document.getElementById("btn-add-subtask-row");
  const subtasksContainer = document.getElementById("subtasks-container");
  const btnAiEnhanceTask = document.getElementById("btn-ai-enhance-task");
  const aiEnhanceBtnText = document.getElementById("ai-enhance-btn-text");

  // Form Fields
  const taskIdInput = document.getElementById("task-id");
  const taskTitleInput = document.getElementById("task-title");
  const taskFormatInput = document.getElementById("task-format");
  const taskCategoryInput = document.getElementById("task-category");
  const taskPriorityInput = document.getElementById("task-priority");
  const taskStatusInput = document.getElementById("task-status");
  const taskDueDateInput = document.getElementById("task-due-date");
  const taskTagsInput = document.getElementById("task-tags");
  const taskDescInput = document.getElementById("task-desc");

  // AI Studio Modal Elements
  const modalAiStudio = document.getElementById("modal-ai-studio");
  const btnOpenAiStudio = document.getElementById("btn-open-ai-studio");
  const btnCloseAiStudio = document.getElementById("btn-close-ai-studio");
  const aiTopicInput = document.getElementById("ai-topic-input");
  const aiNicheSelect = document.getElementById("ai-niche-select");
  const aiFormatSelect = document.getElementById("ai-format-select");
  const btnGenerateAiIdeas = document.getElementById("btn-generate-ai-ideas");
  const aiIdeasResults = document.getElementById("ai-ideas-results");

  // Smart Upload Modal Elements
  const modalSmartUpload = document.getElementById("modal-smart-upload");
  const btnOpenSmartUpload = document.getElementById("btn-open-smart-upload");
  const btnCloseSmartUpload = document.getElementById("btn-close-smart-upload");
  const smartDropzone = document.getElementById("smart-dropzone");
  const smartFileInput = document.getElementById("smart-file-input");
  const btnBrowseFile = document.getElementById("btn-browse-file");
  const smartRawText = document.getElementById("smart-raw-text");
  const btnProcessSmartUpload = document.getElementById("btn-process-smart-upload");
  const smartAnalysisPreview = document.getElementById("smart-analysis-preview");
  const smartPreviewTitle = document.getElementById("smart-preview-title");
  const smartPreviewFormat = document.getElementById("smart-preview-format");
  const smartPreviewSummary = document.getElementById("smart-preview-summary");
  const smartPreviewMilestones = document.getElementById("smart-preview-milestones");
  const btnAcceptSmartTask = document.getElementById("btn-accept-smart-task");
  let stagedSmartTask = null;

  // Sparks & Shortcuts Modals
  const modalSpark = document.getElementById("modal-spark");
  const btnQuickIdea = document.getElementById("btn-quick-idea");
  const btnCloseSpark = document.getElementById("btn-close-spark");
  const sparkNicheTabs = document.getElementById("spark-niche-tabs");
  const sparkCardsContainer = document.getElementById("spark-cards-container");
  const modalShortcuts = document.getElementById("modal-shortcuts");
  const btnOpenShortcuts = document.getElementById("btn-open-shortcuts");
  const btnCloseShortcuts = document.getElementById("btn-close-shortcuts");

  // Focus Timer Elements
  const focusTimerBar = document.getElementById("focus-timer-bar");
  const btnFocusTimerTrigger = document.getElementById("btn-focus-timer-trigger");
  const timerDigits = document.getElementById("timer-digits");
  const btnTimerToggle = document.getElementById("btn-timer-toggle");
  const btnTimerReset = document.getElementById("btn-timer-reset");
  const btnTimerClose = document.getElementById("btn-timer-close");

  // Footer Actions
  const btnClearCompleted = document.getElementById("btn-clear-completed");
  const btnExportMarkdown = document.getElementById("btn-export-markdown");
  const btnExportData = document.getElementById("btn-export-data");
  const btnImportTrigger = document.getElementById("btn-import-trigger");
  const fileImport = document.getElementById("file-import");
  const btnResetSample = document.getElementById("btn-reset-sample");

  // List View Elements
  const checklistTasks = document.getElementById("checklist-tasks");
  const listSortBtns = document.querySelectorAll(".sort-btn");

  // --- Render Functions ---

  function updateStats() {
    const stats = app.getStats();
    statTotal.textContent = stats.total;
    statInProgress.textContent = stats.inProgress;
    statCompleted.textContent = stats.completed;
    statPercent.textContent = `${stats.percent}%`;
    statProgressBar.style.width = `${stats.percent}%`;

    if (stats.totalSubtasks > 0) {
      statSubtasksSummary.textContent = `${stats.completedSubtasks}/${stats.totalSubtasks} subtasks cleared (${Math.round((stats.completedSubtasks / stats.totalSubtasks) * 100)}%)`;
    } else {
      statSubtasksSummary.textContent = `0 subtasks registered`;
    }
  }

  function getFormatBadge(format) {
    switch (format) {
      case "shorts": return `<span class="badge badge-format-shorts">📱 Shorts</span>`;
      case "sponsor": return `<span class="badge badge-format-sponsor">🤝 Sponsor</span>`;
      case "podcast": return `<span class="badge badge-format-podcast">🎙️ Podcast</span>`;
      default: return `<span class="badge badge-format-longform">🎬 Long-form</span>`;
    }
  }

  function getCategoryEmoji(cat) {
    switch (cat) {
      case "youtube": return "🎬 YouTube";
      case "script": return "📝 Script";
      case "thumbnail": return "🎨 Design";
      case "editing": return "✂️ Edit";
      default: return "⚡ General";
    }
  }

  function renderBoard() {
    const tasks = app.getFilteredTasks();

    listTodo.innerHTML = "";
    listInProgress.innerHTML = "";
    listDone.innerHTML = "";

    let todoCount = 0;
    let inProgressCount = 0;
    let doneCount = 0;

    tasks.forEach((task) => {
      const card = createTaskCardElement(task);
      if (task.status === "todo") {
        listTodo.appendChild(card);
        todoCount++;
      } else if (task.status === "in-progress") {
        listInProgress.appendChild(card);
        inProgressCount++;
      } else if (task.status === "done") {
        listDone.appendChild(card);
        doneCount++;
      }
    });

    countTodo.textContent = todoCount;
    countInProgress.textContent = inProgressCount;
    countDone.textContent = doneCount;

    if (tasks.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }
  }

  function createTaskCardElement(task) {
    const card = document.createElement("div");
    card.className = `task-card ${task.status === "done" ? "completed" : ""}`;
    card.draggable = true;
    card.dataset.id = task.id;

    const totalSubs = task.subtasks ? task.subtasks.length : 0;
    const doneSubs = task.subtasks ? task.subtasks.filter((s) => s.done).length : 0;
    const subtaskPercent = totalSubs > 0 ? (doneSubs / totalSubs) * 100 : 0;

    let dueHtml = "";
    if (task.dueDate) {
      const due = new Date(task.dueDate);
      const isOverdue = task.status !== "done" && due < new Date().setHours(0, 0, 0, 0);
      dueHtml = `
        <span class="task-due-tag ${isOverdue ? "overdue" : ""}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${isOverdue ? "Overdue: " : "Due: "}${task.dueDate}
        </span>
      `;
    }

    card.innerHTML = `
      <div class="task-card-header">
        <div class="task-checkbox-wrap" title="Toggle completion">
          <input type="checkbox" class="custom-checkbox task-status-toggle" ${task.status === "done" ? "checked" : ""}>
        </div>
        <div class="task-main-info">
          <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-desc-preview">${escapeHtml(task.description)}</p>` : ""}
        </div>
      </div>

      <div class="badge-row">
        ${getFormatBadge(task.format || "longform")}
        <span class="badge badge-category">${getCategoryEmoji(task.category)}</span>
        <span class="badge badge-priority-${task.priority}">● ${task.priority}</span>
        ${(task.tags || []).slice(0, 2).map((t) => `<span class="badge badge-category">#${escapeHtml(t)}</span>`).join("")}
      </div>

      ${
        totalSubs > 0
          ? `
        <div class="card-subtask-progress">
          <div class="card-subtask-meta">
            <span>Milestones</span>
            <span><strong>${doneSubs}/${totalSubs}</strong> (${Math.round(subtaskPercent)}%)</span>
          </div>
          <div class="card-subtask-bar">
            <div class="card-subtask-bar-fill" style="width: ${subtaskPercent}%"></div>
          </div>
        </div>
      `
          : ""
      }

      <div class="task-card-footer">
        ${dueHtml || "<span>Created recently</span>"}
        <span class="edit-hint">Edit details →</span>
      </div>
    `;

    const checkbox = card.querySelector(".task-status-toggle");
    checkbox.addEventListener("click", async (e) => {
      e.stopPropagation();
      const updated = await app.toggleTaskCompletion(task.id);
      if (updated && updated.status === "done") {
        triggerCelebration();
        showToast("Task completed! Milestone reached! 🎉", "success");
      }
      renderAll();
    });

    card.addEventListener("click", () => {
      openEditTaskModal(task.id);
    });

    card.addEventListener("dragstart", (e) => {
      app.draggedTaskId = task.id;
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", task.id);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      app.draggedTaskId = null;
    });

    return card;
  }

  function renderList() {
    const tasks = app.getFilteredTasks();

    tasks.sort((a, b) => {
      if (app.listSortBy === "priority") {
        const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      } else if (app.listSortBy === "due") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        return b.createdAt - a.createdAt;
      }
    });

    checklistTasks.innerHTML = "";

    if (tasks.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    tasks.forEach((task) => {
      const row = document.createElement("div");
      row.className = `checklist-item-row ${task.status === "done" ? "completed" : ""}`;
      row.dataset.id = task.id;

      const totalSubs = task.subtasks ? task.subtasks.length : 0;
      const doneSubs = task.subtasks ? task.subtasks.filter((s) => s.done).length : 0;

      row.innerHTML = `
        <div class="checklist-main-row">
          <div class="checklist-left-cell">
            <input type="checkbox" class="custom-checkbox task-status-toggle" ${task.status === "done" ? "checked" : ""}>
            <div>
              <h3 class="checklist-title">${escapeHtml(task.title)}</h3>
              <div class="badge-row" style="margin-top: 0.35rem">
                ${getFormatBadge(task.format || "longform")}
                <span class="badge badge-category">${getCategoryEmoji(task.category)}</span>
                <span class="badge badge-priority-${task.priority}">${task.priority}</span>
                ${task.dueDate ? `<span class="badge badge-category">📅 ${task.dueDate}</span>` : ""}
              </div>
            </div>
          </div>
          <div class="checklist-right-cell">
            ${totalSubs > 0 ? `<span class="badge badge-category">${doneSubs}/${totalSubs} steps</span>` : ""}
            <button class="btn-subtle edit-row-btn">Edit</button>
          </div>
        </div>

        ${
          totalSubs > 0
            ? `
          <div class="checklist-subtasks-tree">
            ${task.subtasks
              .map(
                (sub) => `
              <label class="subtask-inline-item ${sub.done ? "done" : ""}" data-sub-id="${sub.id}">
                <input type="checkbox" class="custom-checkbox inline-sub-toggle" ${sub.done ? "checked" : ""}>
                <span>${escapeHtml(sub.text)}</span>
              </label>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
      `;

      const mainCheckbox = row.querySelector(".task-status-toggle");
      mainCheckbox.addEventListener("click", async (e) => {
        e.stopPropagation();
        const updated = await app.toggleTaskCompletion(task.id);
        if (updated && updated.status === "done") {
          triggerCelebration();
          showToast("Task completed! 🎉", "success");
        }
        renderAll();
      });

      row.querySelectorAll(".inline-sub-toggle").forEach((subBox) => {
        subBox.addEventListener("click", async (e) => {
          e.stopPropagation();
          const subId = subBox.closest(".subtask-inline-item").dataset.subId;
          const res = await app.toggleSubtask(task.id, subId);
          if (res && res.allDone) {
            triggerCelebration();
          }
          renderAll();
        });
      });

      row.querySelector(".edit-row-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openEditTaskModal(task.id);
      });

      checklistTasks.appendChild(row);
    });
  }

  function renderAll() {
    updateStats();
    if (app.currentView === "board") {
      renderBoard();
    } else {
      renderList();
    }
  }

  // --- Drag and Drop Handlers for Columns ---
  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", async (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain") || app.draggedTaskId;
      const targetStatus = column.dataset.status;

      if (taskId && targetStatus) {
        const task = app.tasks.find((t) => t.id === taskId);
        if (task && task.status !== targetStatus) {
          await app.updateTask(taskId, { status: targetStatus });
          if (targetStatus === "done") {
            triggerCelebration();
            showToast("Video idea moved to Completed & Published! 🚀", "success");
          }
          renderAll();
        }
      }
    });
  });

  // --- Modal Operations (Add / Edit Task) ---

  function openAddTaskModal(defaultStatus = "todo") {
    modalTitle.textContent = "Create New Task / Video Idea";
    taskIdInput.value = "";
    taskTitleInput.value = "";
    taskFormatInput.value = "longform";
    taskCategoryInput.value = "youtube";
    taskPriorityInput.value = "medium";
    taskStatusInput.value = defaultStatus;
    taskDueDateInput.value = "";
    taskTagsInput.value = "";
    taskDescInput.value = "";
    subtasksContainer.innerHTML = "";
    selectPresetTemplate.value = "";
    btnDeleteTask.classList.add("hidden");

    // Load default Long-form steps
    PRODUCTION_PRESETS.longform.forEach((step) => addSubtaskRowInput(step));

    modalTask.classList.remove("hidden");
    taskTitleInput.focus();
  }

  function openEditTaskModal(taskId) {
    const task = app.tasks.find((t) => t.id === taskId);
    if (!task) return;

    modalTitle.textContent = "Edit Task / Video Idea";
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskFormatInput.value = task.format || "longform";
    taskCategoryInput.value = task.category;
    taskPriorityInput.value = task.priority;
    taskStatusInput.value = task.status;
    taskDueDateInput.value = task.dueDate || "";
    taskTagsInput.value = (task.tags || []).join(", ");
    taskDescInput.value = task.description || "";
    selectPresetTemplate.value = "";

    subtasksContainer.innerHTML = "";
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((sub) => addSubtaskRowInput(sub.text, sub.id, sub.done));
    } else {
      addSubtaskRowInput("");
    }

    btnDeleteTask.classList.remove("hidden");
    modalTask.classList.remove("hidden");
  }

  function closeModal() {
    modalTask.classList.add("hidden");
  }

  function addSubtaskRowInput(text = "", id = null, done = false) {
    const row = document.createElement("div");
    row.className = "subtask-input-item";
    const subId = id || "sub-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    row.dataset.subId = subId;
    row.dataset.done = done ? "true" : "false";

    row.innerHTML = `
      <input type="text" class="form-input subtask-text-input" placeholder="Milestone / Production Step" value="${escapeHtml(text)}">
      <button type="button" class="btn-remove-subtask" title="Remove step">✕</button>
    `;

    row.querySelector(".btn-remove-subtask").addEventListener("click", () => {
      row.remove();
    });

    subtasksContainer.appendChild(row);
  }

  selectPresetTemplate.addEventListener("change", (e) => {
    const presetKey = e.target.value;
    if (presetKey && PRODUCTION_PRESETS[presetKey]) {
      subtasksContainer.innerHTML = "";
      PRODUCTION_PRESETS[presetKey].forEach((step) => addSubtaskRowInput(step));
      showToast(`Loaded ${PRODUCTION_PRESETS[presetKey].length} milestone steps!`, "info");
    }
  });

  btnAddSubtaskRow.addEventListener("click", () => {
    addSubtaskRowInput("");
  });

  // --- AI In-Modal Enhance Trigger (Qwen 2.5:3b) ---
  btnAiEnhanceTask.addEventListener("click", async () => {
    const title = taskTitleInput.value.trim();
    if (!title) {
      showToast("Please enter a basic title/topic to enhance with AI!", "info");
      taskTitleInput.focus();
      return;
    }

    aiEnhanceBtnText.textContent = "Enhancing with Qwen 2.5...";
    btnAiEnhanceTask.disabled = true;

    try {
      const res = await fetch(`${app.apiBase}/api/ai/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: taskDescInput.value,
          category: taskCategoryInput.value,
          format: taskFormatInput.value
        })
      });

      if (res.ok) {
        const data = await res.json();
        const enh = data.enhanced;
        if (enh) {
          if (enh.optimizedTitle) taskTitleInput.value = enh.optimizedTitle;
          if (enh.enhancedDescription) {
            taskDescInput.value = `${enh.enhancedDescription}\n\n🎬 15-Sec Hook:\n${enh.hook || ""}`;
          }
          if (enh.tags && Array.isArray(enh.tags)) {
            taskTagsInput.value = enh.tags.join(", ");
          }
          if (enh.priority) taskPriorityInput.value = enh.priority;

          if (enh.recommendedSubtasks && Array.isArray(enh.recommendedSubtasks)) {
            subtasksContainer.innerHTML = "";
            enh.recommendedSubtasks.forEach((step) => addSubtaskRowInput(step));
          }
          triggerCelebration();
          showToast("Enhanced with Qwen 2.5 AI!", "ai");
        }
      } else {
        showToast("AI enhancement failed. Verify Ollama is running.", "info");
      }
    } catch (err) {
      showToast("Could not connect to local Qwen 2.5 AI.", "info");
    } finally {
      aiEnhanceBtnText.textContent = "Enhance with AI";
      btnAiEnhanceTask.disabled = false;
    }
  });

  // --- Modal Form Submit ---
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    const subtasks = [];
    subtasksContainer.querySelectorAll(".subtask-input-item").forEach((row) => {
      const text = row.querySelector(".subtask-text-input").value.trim();
      if (text) {
        subtasks.push({
          id: row.dataset.subId || "sub-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          text: text,
          done: row.dataset.done === "true"
        });
      }
    });

    const tags = taskTagsInput.value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const taskData = {
      title,
      format: taskFormatInput.value,
      category: taskCategoryInput.value,
      priority: taskPriorityInput.value,
      status: taskStatusInput.value,
      dueDate: taskDueDateInput.value,
      tags,
      description: taskDescInput.value.trim(),
      subtasks
    };

    const editId = taskIdInput.value;
    if (editId) {
      await app.updateTask(editId, taskData);
      showToast("Task updated successfully!", "info");
    } else {
      await app.createTask(taskData);
      showToast("New idea created! Let's build it!", "success");
    }

    closeModal();
    renderAll();
  });

  // Delete Task
  btnDeleteTask.addEventListener("click", async () => {
    const editId = taskIdInput.value;
    if (editId && confirm("Are you sure you want to delete this task?")) {
      await app.deleteTask(editId);
      closeModal();
      renderAll();
      showToast("Task deleted", "info");
    }
  });

  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);
  modalTask.addEventListener("click", (e) => {
    if (e.target === modalTask) closeModal();
  });

  btnOpenAddTask.addEventListener("click", () => openAddTaskModal("todo"));
  btnEmptyAdd.addEventListener("click", () => openAddTaskModal("todo"));

  document.querySelectorAll(".btn-quick-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      openAddTaskModal(btn.dataset.status);
    });
  });

  // --- AI Video Brainstorming Studio Modal (Qwen 2.5:3b) ---
  function openAiStudio() {
    modalAiStudio.classList.remove("hidden");
    aiTopicInput.focus();
  }

  function closeAiStudio() {
    modalAiStudio.classList.add("hidden");
  }

  btnOpenAiStudio.addEventListener("click", openAiStudio);
  btnCloseAiStudio.addEventListener("click", closeAiStudio);
  modalAiStudio.addEventListener("click", (e) => {
    if (e.target === modalAiStudio) closeAiStudio();
  });

  btnGenerateAiIdeas.addEventListener("click", async () => {
    const topic = aiTopicInput.value.trim();
    const niche = aiNicheSelect.value;
    const format = aiFormatSelect.value;

    aiIdeasResults.innerHTML = `
      <div class="ai-placeholder-msg">
        <div class="timer-pulse-dot" style="margin: 0 auto 1rem auto; width: 16px; height: 16px;"></div>
        <p>🧠 <strong>Qwen 2.5 (3B) is brainstorming viral concepts...</strong></p>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem">Analyzing retention hooks, CTR patterns, and production milestones</p>
      </div>
    `;
    btnGenerateAiIdeas.disabled = true;

    try {
      const res = await fetch(`${app.apiBase}/api/ai/brainstorm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, niche, format, count: 3 })
      });

      if (res.ok) {
        const data = await res.json();
        const ideas = data.ideas || [];
        renderAiStudioResults(ideas);
        showToast("Generated 3 video concepts with Qwen 2.5!", "ai");
      } else {
        aiIdeasResults.innerHTML = `
          <div class="ai-placeholder-msg">
            <p>⚠️ AI generation error. Please check if Ollama is running.</p>
          </div>
        `;
      }
    } catch (err) {
      aiIdeasResults.innerHTML = `
        <div class="ai-placeholder-msg">
          <p>⚠️ Could not connect to local Ollama (qwen2.5:3b).</p>
        </div>
      `;
    } finally {
      btnGenerateAiIdeas.disabled = false;
    }
  });

  function renderAiStudioResults(ideas) {
    if (!ideas || ideas.length === 0) {
      aiIdeasResults.innerHTML = `<div class="ai-placeholder-msg"><p>No ideas returned. Try adjusting your prompt.</p></div>`;
      return;
    }

    aiIdeasResults.innerHTML = ideas
      .map(
        (idea, idx) => `
      <div class="ai-generated-card" data-idx="${idx}">
        <div>
          <div class="badge-row" style="margin-bottom: 0.5rem">
            ${getFormatBadge(idea.format || "longform")}
            <span class="badge badge-priority-urgent">🔥 Viral Concept</span>
          </div>
          <h3 class="ai-card-title">${escapeHtml(idea.title)}</h3>
          <p class="ai-card-hook" style="margin-top: 0.5rem">🎯 <strong>Hook:</strong> ${escapeHtml(idea.hook || "")}</p>
          ${idea.thumbnailIdea ? `<div class="ai-card-thumbnail-box" style="margin-top: 0.5rem">🎨 <strong>Thumbnail Concept:</strong> ${escapeHtml(idea.thumbnailIdea)}</div>` : ""}
          <div class="ai-card-subtasks-preview" style="margin-top: 0.65rem">
            <strong>📋 Milestones (${(idea.subtasks || []).length}):</strong>
            ${(idea.subtasks || []).slice(0, 3).map((s) => `<span>• ${escapeHtml(s)}</span>`).join("")}
          </div>
        </div>
        <button class="btn btn-primary btn-full-width use-ai-idea-btn" style="margin-top: 0.75rem">
          ✨ Use This Concept
        </button>
      </div>
    `
      )
      .join("");

    aiIdeasResults.querySelectorAll(".ai-generated-card").forEach((card) => {
      card.querySelector(".use-ai-idea-btn").addEventListener("click", () => {
        const idx = parseInt(card.dataset.idx, 10);
        const selected = ideas[idx];
        if (selected) {
          closeAiStudio();
          openAddTaskModal("todo");
          taskTitleInput.value = selected.title;
          taskFormatInput.value = selected.format || "longform";
          taskCategoryInput.value = selected.category || "youtube";
          taskPriorityInput.value = selected.priority || "high";
          taskTagsInput.value = (selected.tags || []).join(", ");
          taskDescInput.value = `${selected.description || ""}\n\n🎯 15-Sec Hook:\n${selected.hook || ""}\n\n🎨 Thumbnail Concept:\n${selected.thumbnailIdea || ""}`;

          subtasksContainer.innerHTML = "";
          (selected.subtasks || []).forEach((step) => addSubtaskRowInput(step));
          showToast("AI idea loaded into task creator!", "success");
        }
      });
    });
  }

  // --- Smart Upload & Script Analyzer Logic ---
  function openSmartUpload() {
    smartAnalysisPreview.classList.add("hidden");
    smartRawText.value = "";
    stagedSmartTask = null;
    modalSmartUpload.classList.remove("hidden");
  }

  function closeSmartUpload() {
    modalSmartUpload.classList.add("hidden");
  }

  btnOpenSmartUpload.addEventListener("click", openSmartUpload);
  btnCloseSmartUpload.addEventListener("click", closeSmartUpload);
  modalSmartUpload.addEventListener("click", (e) => {
    if (e.target === modalSmartUpload) closeSmartUpload();
  });

  btnBrowseFile.addEventListener("click", () => {
    smartFileInput.click();
  });

  smartFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleSmartFile(file);
  });

  // Drag and Drop on Dropzone
  smartDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    smartDropzone.classList.add("drag-active");
  });

  smartDropzone.addEventListener("dragleave", () => {
    smartDropzone.classList.remove("drag-active");
  });

  smartDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    smartDropzone.classList.remove("drag-active");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSmartFile(e.dataTransfer.files[0]);
    }
  });

  function handleSmartFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      smartRawText.value = event.target.result;
      showToast(`Loaded "${file.name}" ready for AI analysis!`, "info");
      processSmartContent(event.target.result, file.name);
    };
    reader.readAsText(file);
  }

  btnProcessSmartUpload.addEventListener("click", () => {
    const text = smartRawText.value.trim();
    if (!text) {
      showToast("Please drop a file or paste text first!", "info");
      smartRawText.focus();
      return;
    }
    processSmartContent(text, "pasted_script_notes.txt");
  });

  async function processSmartContent(content, filename) {
    btnProcessSmartUpload.disabled = true;
    btnProcessSmartUpload.innerHTML = `<span>⏳ Qwen 2.5 is analyzing document...</span>`;

    try {
      const res = await fetch(`${app.apiBase}/api/ai/smart-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, filename })
      });

      if (res.ok) {
        const data = await res.json();
        const extracted = data.extractedTask;
        if (extracted) {
          stagedSmartTask = extracted;
          smartPreviewTitle.textContent = extracted.title || "Extracted Video Concept";
          smartPreviewFormat.textContent = extracted.format || "Long-form";
          smartPreviewSummary.textContent = extracted.summary || "Summary extracted from document";

          smartPreviewMilestones.innerHTML = (extracted.subtasks || [])
            .map((s) => `<div>• ${escapeHtml(s)}</div>`)
            .join("");

          smartAnalysisPreview.classList.remove("hidden");
          triggerCelebration();
          showToast("Document analyzed by Qwen 2.5!", "ai");
        }
      } else {
        showToast("Analysis failed. Verify Ollama is running.", "info");
      }
    } catch (err) {
      showToast("Could not connect to Qwen 2.5 AI engine.", "info");
    } finally {
      btnProcessSmartUpload.disabled = false;
      btnProcessSmartUpload.innerHTML = `<span class="ai-spark-icon">✨</span><span>Analyze & Generate Structured Task</span>`;
    }
  }

  btnAcceptSmartTask.addEventListener("click", async () => {
    if (stagedSmartTask) {
      const subtasks = (stagedSmartTask.subtasks || []).map((text) => ({
        id: "sub-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        text,
        done: false
      }));

      await app.createTask({
        title: stagedSmartTask.title || "Uploaded Script Task",
        format: stagedSmartTask.format || "longform",
        category: stagedSmartTask.category || "youtube",
        priority: stagedSmartTask.priority || "high",
        status: "todo",
        tags: stagedSmartTask.tags || ["SmartUpload"],
        description: stagedSmartTask.summary || "",
        subtasks
      });

      closeSmartUpload();
      renderAll();
      triggerCelebration();
      showToast("Smart Upload Task added to your board! 🚀", "success");
    }
  });

  // --- Static Sparks Catalog Logic ---
  function openSparkModal() {
    renderSparkIdeas(app.activeSparkNiche);
    modalSpark.classList.remove("hidden");
  }

  function closeSparkModal() {
    modalSpark.classList.add("hidden");
  }

  function renderSparkIdeas(niche) {
    const ideas = IDEA_SPARKS[niche] || [];
    sparkCardsContainer.innerHTML = ideas
      .map(
        (item, idx) => `
      <div class="spark-idea-card" data-idx="${idx}">
        <div>
          <h3 class="spark-idea-title">${escapeHtml(item.title)}</h3>
          <p class="spark-idea-hook">${escapeHtml(item.hook)}</p>
        </div>
        <div class="badge-row" style="margin-top: 0.5rem">
          ${getFormatBadge(item.format || "longform")}
          ${item.tags.map((t) => `<span class="badge badge-category">#${t}</span>`).join("")}
          <span class="badge badge-priority-${item.priority}">${item.priority}</span>
        </div>
        <button class="spark-use-btn">✨ Use This Video Idea</button>
      </div>
    `
      )
      .join("");

    sparkCardsContainer.querySelectorAll(".spark-idea-card").forEach((card) => {
      card.addEventListener("click", () => {
        const idx = parseInt(card.dataset.idx, 10);
        const selected = ideas[idx];
        if (selected) {
          closeSparkModal();
          openAddTaskModal("todo");
          taskTitleInput.value = selected.title;
          taskFormatInput.value = selected.format || "longform";
          taskCategoryInput.value = selected.category || "youtube";
          taskPriorityInput.value = selected.priority || "medium";
          taskTagsInput.value = selected.tags.join(", ");
          taskDescInput.value = `Video Hook Idea:\n${selected.hook}`;

          subtasksContainer.innerHTML = "";
          const template = PRODUCTION_PRESETS[selected.format] || PRODUCTION_PRESETS.longform;
          template.forEach((step) => addSubtaskRowInput(step));
          showToast("Loaded spark idea into new task!", "success");
        }
      });
    });
  }

  btnQuickIdea.addEventListener("click", openSparkModal);
  btnCloseSpark.addEventListener("click", closeSparkModal);
  modalSpark.addEventListener("click", (e) => {
    if (e.target === modalSpark) closeSparkModal();
  });

  sparkNicheTabs.querySelectorAll(".spark-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      sparkNicheTabs.querySelectorAll(".spark-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      app.activeSparkNiche = tab.dataset.niche;
      renderSparkIdeas(app.activeSparkNiche);
    });
  });

  // --- Focus Timer (Pomodoro Engine) ---
  function updateTimerDisplay() {
    const mins = Math.floor(app.timerSeconds / 60);
    const secs = app.timerSeconds % 60;
    const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    timerDigits.textContent = timeStr;

    if (app.timerIsRunning) {
      document.title = `(${timeStr}) CreatorTask Studio`;
    } else {
      document.title = `CreatorTask Studio — Task & Idea Management`;
    }
  }

  function startFocusTimer() {
    if (app.timerInterval) clearInterval(app.timerInterval);
    app.timerIsRunning = true;
    btnTimerToggle.textContent = "Pause";
    focusTimerBar.classList.remove("hidden");

    app.timerInterval = setInterval(() => {
      if (app.timerSeconds > 0) {
        app.timerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(app.timerInterval);
        app.timerIsRunning = false;
        btnTimerToggle.textContent = "Start";
        triggerCelebration();
        showToast("Focus session completed! Take a 5-min breather! ☕", "success");
        updateTimerDisplay();
      }
    }, 1000);
    updateTimerDisplay();
  }

  function pauseFocusTimer() {
    if (app.timerInterval) clearInterval(app.timerInterval);
    app.timerIsRunning = false;
    btnTimerToggle.textContent = "Resume";
    updateTimerDisplay();
  }

  function resetFocusTimer() {
    if (app.timerInterval) clearInterval(app.timerInterval);
    app.timerIsRunning = false;
    app.timerSeconds = app.timerInitialSeconds;
    btnTimerToggle.textContent = "Start";
    updateTimerDisplay();
  }

  btnFocusTimerTrigger.addEventListener("click", () => {
    focusTimerBar.classList.toggle("hidden");
    if (!focusTimerBar.classList.contains("hidden") && !app.timerIsRunning) {
      startFocusTimer();
    }
  });

  btnTimerToggle.addEventListener("click", () => {
    if (app.timerIsRunning) {
      pauseFocusTimer();
    } else {
      startFocusTimer();
    }
  });

  btnTimerReset.addEventListener("click", resetFocusTimer);
  btnTimerClose.addEventListener("click", () => {
    focusTimerBar.classList.add("hidden");
  });

  // --- Shortcuts Modal ---
  function openShortcutsModal() {
    modalShortcuts.classList.remove("hidden");
  }

  function closeShortcutsModal() {
    modalShortcuts.classList.add("hidden");
  }

  btnOpenShortcuts.addEventListener("click", openShortcutsModal);
  btnCloseShortcuts.addEventListener("click", closeShortcutsModal);
  modalShortcuts.addEventListener("click", (e) => {
    if (e.target === modalShortcuts) closeShortcutsModal();
  });

  // Global Keyboard Shortcuts
  window.addEventListener("keydown", (e) => {
    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);

    if (e.key === "Escape") {
      closeModal();
      closeSparkModal();
      closeAiStudio();
      closeSmartUpload();
      closeShortcutsModal();
      return;
    }

    if (!isTyping) {
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        openAiStudio();
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        openSmartUpload();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openAddTaskModal("todo");
      } else if (e.key === "/") {
        e.preventDefault();
        searchInput.focus();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        btnViewBoard.click();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        btnViewList.click();
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        btnFocusTimerTrigger.click();
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        openSparkModal();
      } else if (e.key === "?") {
        e.preventDefault();
        openShortcutsModal();
      }
    }
  });

  // --- Search and Filters ---
  searchInput.addEventListener("input", (e) => {
    app.searchQuery = e.target.value;
    if (app.searchQuery) {
      clearSearchBtn.classList.remove("hidden");
    } else {
      clearSearchBtn.classList.add("hidden");
    }
    renderAll();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    app.searchQuery = "";
    clearSearchBtn.classList.add("hidden");
    renderAll();
  });

  formatFilters.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      formatFilters.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      app.currentFormat = pill.dataset.format;
      renderAll();
    });
  });

  priorityFilter.addEventListener("change", (e) => {
    app.currentPriority = e.target.value;
    renderAll();
  });

  // --- View Switcher ---
  btnViewBoard.addEventListener("click", () => {
    app.currentView = "board";
    btnViewBoard.classList.add("active");
    btnViewList.classList.remove("active");
    boardView.classList.remove("hidden");
    listView.classList.add("hidden");
    renderAll();
  });

  btnViewList.addEventListener("click", () => {
    app.currentView = "list";
    btnViewList.classList.add("active");
    btnViewBoard.classList.remove("active");
    listView.classList.remove("hidden");
    boardView.classList.add("hidden");
    renderAll();
  });

  listSortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      listSortBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      app.listSortBy = btn.dataset.sort;
      renderList();
    });
  });

  // --- Data Import, Export & Reset ---
  btnClearCompleted.addEventListener("click", async () => {
    const doneCount = app.tasks.filter((t) => t.status === "done").length;
    if (doneCount === 0) {
      showToast("No completed tasks to clear.", "info");
      return;
    }
    if (confirm(`Remove all ${doneCount} completed tasks?`)) {
      await app.clearCompleted();
      renderAll();
      showToast("Completed tasks cleared!", "info");
    }
  });

  btnExportMarkdown.addEventListener("click", () => {
    window.location.href = `${app.apiBase}/api/export/markdown`;
    showToast("Generating Markdown script catalog...", "info");
  });

  btnExportData.addEventListener("click", () => {
    window.location.href = `${app.apiBase}/api/export/json`;
    showToast("Exporting full JSON backup...", "success");
  });

  btnImportTrigger.addEventListener("click", () => {
    fileImport.click();
  });

  fileImport.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          if (app.isOnline) {
            const res = await fetch(`${app.apiBase}/api/import`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(imported)
            });
            if (res.ok) {
              await app.fetchTasks();
              renderAll();
              showToast(`Imported ${imported.length} tasks successfully!`, "success");
              return;
            }
          }
          app.tasks = imported;
          app.saveToLocalCache();
          renderAll();
          showToast(`Imported ${imported.length} tasks into local cache!`, "success");
        } else {
          alert("Invalid backup file format. Expected a JSON array.");
        }
      } catch (err) {
        alert("Error reading JSON file.");
      }
      fileImport.value = "";
    };
    reader.readAsText(file);
  });

  btnResetSample.addEventListener("click", async () => {
    if (confirm("Reset to default creator sample tasks? This will reload fresh templates.")) {
      await app.resetSampleData();
      renderAll();
      showToast("Reset to sample tasks!", "info");
    }
  });

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Initialization ---
  await app.fetchTasks();
  await app.checkAIStatus();
  renderAll();
});
