/**
 * CreatorTask Studio — Task & YouTube Idea Tracker
 * Modern vanilla JS application with state management, Kanban/List rendering,
 * drag-and-drop, subtasks, celebration confetti, and localStorage persistence.
 */

// --- Default Starter Data for Content Creators ---
const DEFAULT_TASKS = [
  {
    id: "task-1",
    title: "🎬 10 AI Tools You Didn't Know Existed in 2026",
    category: "youtube",
    priority: "urgent",
    status: "in-progress",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    tags: ["AI", "Tech", "Tutorial"],
    description: "Cover emerging agentic coding tools, video generators, and automated research assistants. Focus on practical demos.",
    subtasks: [
      { id: "sub-1-1", text: "Research & curate top 10 AI tools", done: true },
      { id: "sub-1-2", text: "Write high-retention script hook & outline", done: true },
      { id: "sub-1-3", text: "Record A-roll talking head + screen captures", done: true },
      { id: "sub-1-4", text: "Edit video with kinetic captions & SFX", done: false },
      { id: "sub-1-5", text: "Design 3 thumbnail variations (A/B test)", done: false },
      { id: "sub-1-6", text: "Publish & schedule community post", done: false }
    ],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now()
  },
  {
    id: "task-2",
    title: "🎨 Redesign Main Channel Branding & 4K Banner",
    category: "thumbnail",
    priority: "medium",
    status: "todo",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    tags: ["Branding", "Photoshop", "Design"],
    description: "Update channel header banner, profile avatar, and video end-card layouts for a sleeker cyber-dark aesthetic.",
    subtasks: [
      { id: "sub-2-1", text: "Create moodboard on Pinterest / Figma", done: true },
      { id: "sub-2-2", text: "Design desktop & mobile banner versions", done: false },
      { id: "sub-2-3", text: "Export in PNG 2560x1440 resolution", done: false }
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now()
  },
  {
    id: "task-3",
    title: "📝 Script: Why Most Developers Fail with AI Coding",
    category: "script",
    priority: "high",
    status: "todo",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    tags: ["Coding", "Opinion", "Script"],
    description: "Deep dive into prompting psychology, verification loops, and how to stay in control of generated codebases.",
    subtasks: [
      { id: "sub-3-1", text: "Draft core 3 arguments & real code examples", done: false },
      { id: "sub-3-2", text: "Structure 15-second intro retention hook", done: false },
      { id: "sub-3-3", text: "Add mid-roll sponsor segment placement", done: false }
    ],
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now()
  },
  {
    id: "task-4",
    title: "⚡ Clean up Studio Audio Gear & Calibration",
    category: "general",
    priority: "low",
    status: "done",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    tags: ["Studio", "Audio", "Setup"],
    description: "Calibrate Shure SM7B gain stage, noise gate filters, and acoustics foam positioning.",
    subtasks: [
      { id: "sub-4-1", text: "Test audio levels in OBS & DaVinci Resolve", done: true },
      { id: "sub-4-2", text: "Clean dust filters and check XLR cables", done: true }
    ],
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 1
  }
];

// --- YouTube Idea Sparks Catalog ---
const IDEA_SPARKS = {
  tech: [
    {
      title: "Building an App from Scratch with AI Agents in 1 Hour",
      hook: "Show a real-time stopwatch building a production-ready web application using DeepMind agentic tools.",
      tags: ["AI", "Coding", "Challenge"],
      category: "youtube",
      priority: "high"
    },
    {
      title: "Stop Learning Frameworks — Do This Instead",
      hook: "A contrarian take on foundational CS principles vs chasing the weekly JavaScript frameworks.",
      tags: ["Career", "Programming", "Advice"],
      category: "youtube",
      priority: "medium"
    },
    {
      title: "5 Hidden VS Code Extensions That Save 10 Hours a Week",
      hook: "Curated fast-paced showcase of underrated tools every dev should install immediately.",
      tags: ["VSCode", "Productivity", "Tech"],
      category: "youtube",
      priority: "medium"
    }
  ],
  productivity: [
    {
      title: "The Simple 3-Tier Daily System That Fixed My Procrastination",
      hook: "How to eliminate overwhelm using energy-based time blocking instead of rigid 10-hour schedules.",
      tags: ["Habits", "Focus", "Routine"],
      category: "youtube",
      priority: "high"
    },
    {
      title: "I Tried Elon Musk's Time Blocking for 7 Days",
      hook: "Documentary vlog testing ultra-granular 5-minute schedule blocks and analyzing burnout vs output.",
      tags: ["Experiment", "Challenge", "TimeManagement"],
      category: "youtube",
      priority: "urgent"
    }
  ],
  gaming: [
    {
      title: "Can You Beat This Impossible Challenge Without Taking Damage?",
      hook: "High-stakes gaming run with commentary, live heart rate monitor, and intense fail cuts.",
      tags: ["Gaming", "Challenge", "NoHit"],
      category: "youtube",
      priority: "medium"
    },
    {
      title: "The Ultimate Budget Streaming & Recording Setup in 2026",
      hook: "Show how to get a $5,000 streamer look on a $300 budget using lighting hacks and free OBS plugins.",
      tags: ["Streaming", "Gear", "Budget"],
      category: "youtube",
      priority: "high"
    }
  ],
  business: [
    {
      title: "How I Built a Micro-SaaS to $5,000/mo as a Solo Creator",
      hook: "Transparent breakdown of tech stack, payment gateways, marketing channels, and customer acquisition costs.",
      tags: ["SaaS", "Entrepreneurship", "Finance"],
      category: "youtube",
      priority: "high"
    },
    {
      title: "Is Digital Nomad Life Still Worth It in 2026?",
      hook: "Realistic cost breakdown, taxes, Wi-Fi speeds, and loneliness realities across 5 countries.",
      tags: ["Lifestyle", "Finance", "Travel"],
      category: "youtube",
      priority: "medium"
    }
  ],
  creative: [
    {
      title: "How to Make Boring Videos Look Cinematic (5 Lighting Rules)",
      hook: "Step-by-step room transformation showing key light, backlight, practicals, and color temperature.",
      tags: ["Cinematography", "Lighting", "Filmmaking"],
      category: "youtube",
      priority: "high"
    },
    {
      title: "Designing YouTube Thumbnails That Get 15%+ CTR",
      hook: "Photoshop live breakdown: composition hierarchy, face expressions, 3D typography, and color contrast.",
      tags: ["Thumbnail", "Design", "Photoshop"],
      category: "thumbnail",
      priority: "urgent"
    }
  ]
};

// --- Standard YouTube Production Checklist Template ---
const YT_PRODUCTION_TEMPLATE = [
  "Hook, Target Audience & Script Outline",
  "Record 4K A-Roll (Talking Head / Intro)",
  "Capture B-Roll, Screen Recordings & Assets",
  "Rough Cut & Pacing in DaVinci / Premiere",
  "Sound Design, Kinematic BGM & Sound FX",
  "Design High-CTR Thumbnail (3 Variations)",
  "Write High-SEO Title, Description & Tags",
  "Publish, Pin Comment & Social Distribution"
];

// --- App State ---
class AppState {
  constructor() {
    this.tasks = [];
    this.currentCategory = "all";
    this.currentPriority = "all";
    this.searchQuery = "";
    this.currentView = "board"; // 'board' or 'list'
    this.listSortBy = "created"; // 'created', 'priority', 'due'
    this.draggedTaskId = null;
    this.activeSparkNiche = "tech";

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem("creator_tasks_data");
      if (stored) {
        this.tasks = JSON.parse(stored);
      } else {
        this.tasks = [...DEFAULT_TASKS];
        this.saveToStorage();
      }
    } catch (err) {
      console.error("Error reading localStorage:", err);
      this.tasks = [...DEFAULT_TASKS];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem("creator_tasks_data", JSON.stringify(this.tasks));
    } catch (err) {
      console.error("Error writing to localStorage:", err);
    }
  }

  addTask(taskData) {
    const newTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      title: taskData.title.trim(),
      category: taskData.category || "youtube",
      priority: taskData.priority || "medium",
      status: taskData.status || "todo",
      dueDate: taskData.dueDate || "",
      tags: taskData.tags || [],
      description: taskData.description || "",
      subtasks: taskData.subtasks || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.tasks.unshift(newTask);
    this.saveToStorage();
    return newTask;
  }

  updateTask(taskId, updateData) {
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      this.tasks[idx] = {
        ...this.tasks[idx],
        ...updateData,
        updatedAt: Date.now()
      };
      this.saveToStorage();
      return this.tasks[idx];
    }
    return null;
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveToStorage();
  }

  toggleTaskCompletion(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      const isDone = task.status === "done";
      task.status = isDone ? "todo" : "done";
      // If marking as done, optionally complete all subtasks
      if (!isDone && task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((s) => (s.done = true));
      }
      task.updatedAt = Date.now();
      this.saveToStorage();
      return task;
    }
    return null;
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && task.subtasks) {
      const sub = task.subtasks.find((s) => s.id === subtaskId);
      if (sub) {
        sub.done = !sub.done;
        // Check if all subtasks are done
        const allDone = task.subtasks.every((s) => s.done);
        if (allDone && task.status !== "done") {
          task.status = "done";
        } else if (!allDone && task.status === "done") {
          task.status = "in-progress";
        }
        task.updatedAt = Date.now();
        this.saveToStorage();
        return { task, sub };
      }
    }
    return null;
  }

  clearCompleted() {
    this.tasks = this.tasks.filter((t) => t.status !== "done");
    this.saveToStorage();
  }

  resetToSampleData() {
    this.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    this.saveToStorage();
  }

  getFilteredTasks() {
    return this.tasks.filter((task) => {
      // Category filter
      if (this.currentCategory !== "all" && task.category !== this.currentCategory) {
        return false;
      }
      // Priority filter
      if (this.currentPriority !== "all" && task.priority !== this.currentPriority) {
        return false;
      }
      // Search query
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
      particleCount: 75,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#38bdf8", "#fbbf24"]
    });
  } else {
    // Canvas Confetti Fallback
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
      p.vy += 0.4; // gravity
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
    <span>${type === "success" ? "✅" : "💡"}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Main Application Controller ---
document.addEventListener("DOMContentLoaded", () => {
  const state = new AppState();

  // DOM References
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("btn-clear-search");
  const categoryFilters = document.getElementById("category-filters");
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

  // Modals
  const modalTask = document.getElementById("modal-task");
  const taskForm = document.getElementById("task-form");
  const modalTitle = document.getElementById("modal-title");
  const btnOpenAddTask = document.getElementById("btn-open-add-task");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");
  const btnDeleteTask = document.getElementById("btn-delete-task");
  const btnEmptyAdd = document.getElementById("btn-empty-add");
  const btnLoadYtTemplate = document.getElementById("btn-load-yt-template");
  const btnAddSubtaskRow = document.getElementById("btn-add-subtask-row");
  const subtasksContainer = document.getElementById("subtasks-container");

  // Form Fields
  const taskIdInput = document.getElementById("task-id");
  const taskTitleInput = document.getElementById("task-title");
  const taskCategoryInput = document.getElementById("task-category");
  const taskPriorityInput = document.getElementById("task-priority");
  const taskStatusInput = document.getElementById("task-status");
  const taskDueDateInput = document.getElementById("task-due-date");
  const taskTagsInput = document.getElementById("task-tags");
  const taskDescInput = document.getElementById("task-desc");

  // Idea Spark Modal
  const modalSpark = document.getElementById("modal-spark");
  const btnQuickIdea = document.getElementById("btn-quick-idea");
  const btnCloseSpark = document.getElementById("btn-close-spark");
  const sparkNicheTabs = document.getElementById("spark-niche-tabs");
  const sparkCardsContainer = document.getElementById("spark-cards-container");

  // Header & Footer Actions
  const btnClearCompleted = document.getElementById("btn-clear-completed");
  const btnExportData = document.getElementById("btn-export-data");
  const btnImportTrigger = document.getElementById("btn-import-trigger");
  const fileImport = document.getElementById("file-import");
  const btnResetSample = document.getElementById("btn-reset-sample");

  // List View Elements
  const checklistTasks = document.getElementById("checklist-tasks");
  const listSortBtns = document.querySelectorAll(".sort-btn");

  // --- Render Functions ---

  function updateStats() {
    const stats = state.getStats();
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
    const tasks = state.getFilteredTasks();

    // Clear column containers
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

    // Calculate subtask stats
    const totalSubs = task.subtasks ? task.subtasks.length : 0;
    const doneSubs = task.subtasks ? task.subtasks.filter((s) => s.done).length : 0;
    const subtaskPercent = totalSubs > 0 ? (doneSubs / totalSubs) * 100 : 0;

    // Due date badge formatting
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
        <div class="task-checkbox-wrap" title="Mark as ${task.status === "done" ? "To Do" : "Completed"}">
          <input type="checkbox" class="custom-checkbox task-status-toggle" ${task.status === "done" ? "checked" : ""}>
        </div>
        <div class="task-main-info">
          <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-desc-preview">${escapeHtml(task.description)}</p>` : ""}
        </div>
      </div>

      <div class="badge-row">
        <span class="badge badge-category">${getCategoryEmoji(task.category)}</span>
        <span class="badge badge-priority-${task.priority}">● ${task.priority}</span>
        ${(task.tags || []).slice(0, 2).map((t) => `<span class="badge badge-category">#${escapeHtml(t)}</span>`).join("")}
      </div>

      ${
        totalSubs > 0
          ? `
        <div class="card-subtask-progress">
          <div class="card-subtask-meta">
            <span>Checklist Steps</span>
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
        <span class="edit-hint">Click to edit →</span>
      </div>
    `;

    // Checkbox toggle listener
    const checkbox = card.querySelector(".task-status-toggle");
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      const updated = state.toggleTaskCompletion(task.id);
      if (updated && updated.status === "done") {
        triggerCelebration();
        showToast("Task completed! Great progress! 🎉", "success");
      }
      renderAll();
    });

    // Card click opens edit modal
    card.addEventListener("click", () => {
      openEditTaskModal(task.id);
    });

    // Drag and Drop Events
    card.addEventListener("dragstart", (e) => {
      state.draggedTaskId = task.id;
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", task.id);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      state.draggedTaskId = null;
    });

    return card;
  }

  function renderList() {
    const tasks = state.getFilteredTasks();

    // Sort tasks
    tasks.sort((a, b) => {
      if (state.listSortBy === "priority") {
        const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      } else if (state.listSortBy === "due") {
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

      // Checkbox main toggle
      const mainCheckbox = row.querySelector(".task-status-toggle");
      mainCheckbox.addEventListener("click", (e) => {
        e.stopPropagation();
        const updated = state.toggleTaskCompletion(task.id);
        if (updated && updated.status === "done") {
          triggerCelebration();
          showToast("Task completed! 🎉", "success");
        }
        renderAll();
      });

      // Inline subtasks toggle
      row.querySelectorAll(".inline-sub-toggle").forEach((subBox) => {
        subBox.addEventListener("click", (e) => {
          e.stopPropagation();
          const subId = subBox.closest(".subtask-inline-item").dataset.subId;
          const res = state.toggleSubtask(task.id, subId);
          if (res && res.task.status === "done" && res.sub.done) {
            triggerCelebration();
          }
          renderAll();
        });
      });

      // Edit click
      row.querySelector(".edit-row-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openEditTaskModal(task.id);
      });

      checklistTasks.appendChild(row);
    });
  }

  function renderAll() {
    updateStats();
    if (state.currentView === "board") {
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

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain") || state.draggedTaskId;
      const targetStatus = column.dataset.status;

      if (taskId && targetStatus) {
        const task = state.tasks.find((t) => t.id === taskId);
        if (task && task.status !== targetStatus) {
          state.updateTask(taskId, { status: targetStatus });
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
    taskCategoryInput.value = "youtube";
    taskPriorityInput.value = "medium";
    taskStatusInput.value = defaultStatus;
    taskDueDateInput.value = "";
    taskTagsInput.value = "";
    taskDescInput.value = "";
    subtasksContainer.innerHTML = "";
    btnDeleteTask.classList.add("hidden");

    // Add 2 blank subtask rows by default
    addSubtaskRowInput("");
    addSubtaskRowInput("");

    modalTask.classList.remove("hidden");
    taskTitleInput.focus();
  }

  function openEditTaskModal(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    modalTitle.textContent = "Edit Task / Video Idea";
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskCategoryInput.value = task.category;
    taskPriorityInput.value = task.priority;
    taskStatusInput.value = task.status;
    taskDueDateInput.value = task.dueDate || "";
    taskTagsInput.value = (task.tags || []).join(", ");
    taskDescInput.value = task.description || "";

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
      <input type="text" class="form-input subtask-text-input" placeholder="e.g. Write video hook script" value="${escapeHtml(text)}">
      <button type="button" class="btn-remove-subtask" title="Remove step">✕</button>
    `;

    row.querySelector(".btn-remove-subtask").addEventListener("click", () => {
      row.remove();
    });

    subtasksContainer.appendChild(row);
  }

  // --- Subtask YouTube Template Loader ---
  btnLoadYtTemplate.addEventListener("click", () => {
    subtasksContainer.innerHTML = "";
    YT_PRODUCTION_TEMPLATE.forEach((step) => {
      addSubtaskRowInput(step);
    });
    showToast("Loaded 8 YouTube production steps!", "info");
  });

  btnAddSubtaskRow.addEventListener("click", () => {
    addSubtaskRowInput("");
  });

  // --- Modal Form Submit ---
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    // Collect subtasks
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
      state.updateTask(editId, taskData);
      showToast("Task updated successfully!", "info");
    } else {
      state.addTask(taskData);
      showToast("New idea created! Let's build it!", "success");
    }

    closeModal();
    renderAll();
  });

  // Delete Task from Modal
  btnDeleteTask.addEventListener("click", () => {
    const editId = taskIdInput.value;
    if (editId && confirm("Are you sure you want to delete this task?")) {
      state.deleteTask(editId);
      closeModal();
      renderAll();
      showToast("Task deleted", "info");
    }
  });

  // Close Modal triggers
  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);
  modalTask.addEventListener("click", (e) => {
    if (e.target === modalTask) closeModal();
  });

  // Open add task from header / empty state
  btnOpenAddTask.addEventListener("click", () => openAddTaskModal("todo"));
  btnEmptyAdd.addEventListener("click", () => openAddTaskModal("todo"));

  // Quick Add buttons on Column Headers
  document.querySelectorAll(".btn-quick-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      openAddTaskModal(btn.dataset.status);
    });
  });

  // --- YouTube Idea Sparks Modal Logic ---
  function openSparkModal() {
    renderSparkIdeas(state.activeSparkNiche);
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
          taskCategoryInput.value = selected.category || "youtube";
          taskPriorityInput.value = selected.priority || "medium";
          taskTagsInput.value = selected.tags.join(", ");
          taskDescInput.value = `Video Hook Idea:\n${selected.hook}`;

          // Auto-fill production checklist
          subtasksContainer.innerHTML = "";
          YT_PRODUCTION_TEMPLATE.forEach((step) => addSubtaskRowInput(step));
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
      state.activeSparkNiche = tab.dataset.niche;
      renderSparkIdeas(state.activeSparkNiche);
    });
  });

  // --- Filter and Search Event Handlers ---
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery) {
      clearSearchBtn.classList.remove("hidden");
    } else {
      clearSearchBtn.classList.add("hidden");
    }
    renderAll();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.classList.add("hidden");
    renderAll();
  });

  categoryFilters.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryFilters.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.currentCategory = pill.dataset.category;
      renderAll();
    });
  });

  priorityFilter.addEventListener("change", (e) => {
    state.currentPriority = e.target.value;
    renderAll();
  });

  // --- View Switcher Handlers ---
  btnViewBoard.addEventListener("click", () => {
    state.currentView = "board";
    btnViewBoard.classList.add("active");
    btnViewList.classList.remove("active");
    boardView.classList.remove("hidden");
    listView.classList.add("hidden");
    renderAll();
  });

  btnViewList.addEventListener("click", () => {
    state.currentView = "list";
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
      state.listSortBy = btn.dataset.sort;
      renderList();
    });
  });

  // --- Helper Actions: Clear Done, Export, Import, Reset ---
  btnClearCompleted.addEventListener("click", () => {
    const doneCount = state.tasks.filter((t) => t.status === "done").length;
    if (doneCount === 0) {
      showToast("No completed tasks to clear.", "info");
      return;
    }
    if (confirm(`Remove all ${doneCount} completed tasks?`)) {
      state.clearCompleted();
      renderAll();
      showToast("Completed tasks cleared!", "info");
    }
  });

  btnExportData.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `creator_tasks_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Data exported successfully as JSON!", "success");
  });

  btnImportTrigger.addEventListener("click", () => {
    fileImport.click();
  });

  fileImport.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          state.tasks = imported;
          state.saveToStorage();
          renderAll();
          showToast(`Imported ${imported.length} tasks successfully!`, "success");
        } else {
          alert("Invalid backup file format. Expected a JSON array.");
        }
      } catch (err) {
        alert("Error parsing JSON file.");
      }
      fileImport.value = "";
    };
    reader.readAsText(file);
  });

  btnResetSample.addEventListener("click", () => {
    if (confirm("Reset to starter YouTube sample ideas? This will reload the default templates.")) {
      state.resetToSampleData();
      renderAll();
      showToast("Reset to sample tasks!", "info");
    }
  });

  // --- Helper: Escape HTML string ---
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial App Render
  renderAll();
});
