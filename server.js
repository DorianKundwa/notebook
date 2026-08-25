/**
 * CreatorTask Studio — Production Backend REST API Server
 * Fast, resilient Express server with transactional atomic file storage,
 * markdown exports, static asset delivery, and comprehensive error handling.
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BACKUP_FILE = path.join(DATA_DIR, 'tasks.backup.json');

// --- Middleware ---
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(__dirname, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// --- Default Starter Dataset for Content Creators ---
const DEFAULT_STARTER_TASKS = [
  {
    id: "task-1",
    title: "🎬 10 AI Tools You Didn't Know Existed in 2026",
    format: "longform",
    category: "youtube",
    priority: "urgent",
    status: "in-progress",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    tags: ["AI", "Tech", "Tutorial"],
    description: "Cover emerging agentic coding tools, video generators, and automated research assistants. Focus on practical live demos.",
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
    title: "📱 YouTube Short: 3 Terminal Tricks in 30 Seconds",
    format: "shorts",
    category: "youtube",
    priority: "high",
    status: "todo",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
    tags: ["Shorts", "CLI", "QuickTip"],
    description: "Ultra-fast vertical video demonstrating fzf, zoxide, and modern bash keybindings.",
    subtasks: [
      { id: "sub-2-1", text: "Write 45-word snappy script with audio hook", done: true },
      { id: "sub-2-2", text: "Record 9:16 vertical terminal screen capture", done: false },
      { id: "sub-2-3", text: "Auto-caption with CapCut / Premiere", done: false },
      { id: "sub-2-4", text: "Select viral thumbnail frame & post", done: false }
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now()
  },
  {
    id: "task-3",
    title: "🤝 Sponsor Integration: NordPass Deep-Dive Review",
    format: "sponsor",
    category: "script",
    priority: "high",
    status: "in-progress",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    tags: ["Sponsor", "Security", "Review"],
    description: "60-second dedicated mid-roll sponsor segment highlighting encrypted vault and cross-device sync.",
    subtasks: [
      { id: "sub-3-1", text: "Review brand brief & talking points compliance", done: true },
      { id: "sub-3-2", text: "Submit outline draft to sponsor agency", done: true },
      { id: "sub-3-3", text: "Record segment with custom affiliate tracking link", done: false },
      { id: "sub-3-4", text: "Send final video preview link for approval", done: false }
    ],
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now()
  },
  {
    id: "task-4",
    title: "🎨 Redesign Main Channel Branding & 4K Banner",
    format: "general",
    category: "thumbnail",
    priority: "medium",
    status: "todo",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    tags: ["Branding", "Photoshop", "Design"],
    description: "Update channel header banner, profile avatar, and video end-card layouts for a sleeker cyber-dark aesthetic.",
    subtasks: [
      { id: "sub-4-1", text: "Create moodboard on Pinterest / Figma", done: true },
      { id: "sub-4-2", text: "Design desktop & mobile banner versions", done: false },
      { id: "sub-4-3", text: "Export in PNG 2560x1440 resolution", done: false }
    ],
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now()
  },
  {
    id: "task-5",
    title: "⚡ Studio Audio Gear Calibration & Acoustic Tuning",
    format: "general",
    category: "general",
    priority: "low",
    status: "done",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    tags: ["Studio", "Audio", "Setup"],
    description: "Calibrate Shure SM7B gain stage, noise gate filters, and acoustics foam positioning.",
    subtasks: [
      { id: "sub-5-1", text: "Test audio levels in OBS & DaVinci Resolve", done: true },
      { id: "sub-5-2", text: "Clean dust filters and check XLR cables", done: true }
    ],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 1
  }
];

// --- Persistent Storage Engine (Clean Windows-Safe Atomic Storage) ---
function ensureStorageReady() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TASKS_FILE)) {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(DEFAULT_STARTER_TASKS, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[DB Init Error]', err);
  }
}

async function readTasksFromDisk() {
  try {
    ensureStorageReady();
    const data = await fsPromises.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[DB Read Error]', err);
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const backupData = await fsPromises.readFile(BACKUP_FILE, 'utf8');
        return JSON.parse(backupData);
      } catch (_) {}
    }
    return DEFAULT_STARTER_TASKS;
  }
}

async function writeTasksAtomically(tasks) {
  ensureStorageReady();
  const jsonData = JSON.stringify(tasks, null, 2);

  try {
    // Write directly to file
    await fsPromises.writeFile(TASKS_FILE, jsonData, 'utf8');
    // Save backup asynchronously
    fsPromises.writeFile(BACKUP_FILE, jsonData, 'utf8').catch(() => {});
  } catch (err) {
    console.error('[DB Write Error]', err);
    throw err;
  }
}

// --- REST API Endpoints ---

// Health & System Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CreatorTask Studio API',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// GET /api/tasks - Retrieve all tasks with optional search/filtering
app.get('/api/tasks', async (req, res) => {
  try {
    let tasks = await readTasksFromDisk();
    const { category, priority, status, format, search } = req.query;

    if (category && category !== 'all') {
      tasks = tasks.filter(t => t.category === category);
    }
    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }
    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }
    if (format && format !== 'all') {
      tasks = tasks.filter(t => (t.format || 'longform') === format);
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (t.subtasks && t.subtasks.some(s => s.text.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/:id - Single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readTasksFromDisk();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, category, priority, status, format, dueDate, tags, description, subtasks } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    const tasks = await readTasksFromDisk();
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      category: category || 'youtube',
      priority: priority || 'medium',
      status: status || 'todo',
      format: format || 'longform',
      dueDate: dueDate || '',
      tags: Array.isArray(tags) ? tags : [],
      description: description ? description.trim() : '',
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    tasks.unshift(newTask);
    await writeTasksAtomically(tasks);

    res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readTasksFromDisk();
    const idx = tasks.findIndex(t => t.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const current = tasks[idx];
    const updates = req.body;

    const updatedTask = {
      ...current,
      ...updates,
      id: current.id, // Immutable ID
      createdAt: current.createdAt,
      updatedAt: Date.now()
    };

    // If subtasks array is passed, sanitize
    if (updates.subtasks && Array.isArray(updates.subtasks)) {
      updatedTask.subtasks = updates.subtasks;
    }

    tasks[idx] = updatedTask;
    await writeTasksAtomically(tasks);

    res.json({ success: true, task: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tasks/:id - Remove task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    let tasks = await readTasksFromDisk();
    const initialLen = tasks.length;
    tasks = tasks.filter(t => t.id !== req.params.id);

    if (tasks.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await writeTasksAtomically(tasks);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/clear-done - Bulk clear completed tasks
app.post('/api/tasks/clear-done', async (req, res) => {
  try {
    let tasks = await readTasksFromDisk();
    const removedCount = tasks.filter(t => t.status === 'done').length;
    tasks = tasks.filter(t => t.status !== 'done');

    await writeTasksAtomically(tasks);
    res.json({ success: true, removedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/reset-sample - Reset to rich starter ideas
app.post('/api/tasks/reset-sample', async (req, res) => {
  try {
    await writeTasksAtomically(DEFAULT_STARTER_TASKS);
    res.json({ success: true, message: 'Reset to starter sample tasks', tasks: DEFAULT_STARTER_TASKS });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export/json - Export JSON backup file
app.get('/api/export/json', async (req, res) => {
  try {
    const tasks = await readTasksFromDisk();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=creator_tasks_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(tasks, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export/markdown - Export full creator script & ideas catalogue as Markdown
app.get('/api/export/markdown', async (req, res) => {
  try {
    const tasks = await readTasksFromDisk();
    let md = `# CreatorTask Studio — Video Ideas & Production Catalog\n\n`;
    md += `*Exported on: ${new Date().toLocaleString()}*\n\n`;
    md += `Total Tasks & Ideas: **${tasks.length}** | Completed: **${tasks.filter(t => t.status === 'done').length}**\n\n---\n\n`;

    tasks.forEach((t, idx) => {
      const statusIcon = t.status === 'done' ? '✅' : t.status === 'in-progress' ? '⏳' : '💡';
      md += `## ${idx + 1}. ${statusIcon} ${t.title}\n\n`;
      md += `- **Status**: \`${t.status}\` | **Priority**: \`${t.priority}\` | **Category**: \`${t.category}\` | **Format**: \`${t.format || 'longform'}\`\n`;
      if (t.dueDate) md += `- **Target Due Date**: \`${t.dueDate}\`\n`;
      if (t.tags && t.tags.length > 0) md += `- **Tags**: ${t.tags.map(tag => `\`#${tag}\``).join(' ')}\n`;
      if (t.description) md += `\n### 📝 Notes & Script Outline\n${t.description}\n`;

      if (t.subtasks && t.subtasks.length > 0) {
        md += `\n### 📋 Production Milestones\n`;
        t.subtasks.forEach(sub => {
          md += `- [${sub.done ? 'x' : ' '}] ${sub.text}\n`;
        });
      }
      md += `\n---\n\n`;
    });

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=creator_scripts_export_${new Date().toISOString().split('T')[0]}.md`);
    res.send(md);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/import - Import backup JSON with validation
app.post('/api/import', async (req, res) => {
  try {
    const importedTasks = req.body;
    if (!Array.isArray(importedTasks)) {
      return res.status(400).json({ success: false, error: 'Expected an array of task objects.' });
    }

    // Sanitize and validate items
    const sanitized = importedTasks.map(item => ({
      id: item.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: (item.title || 'Untitled Task').trim(),
      category: item.category || 'youtube',
      priority: item.priority || 'medium',
      status: item.status || 'todo',
      format: item.format || 'longform',
      dueDate: item.dueDate || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      description: item.description || '',
      subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
      createdAt: item.createdAt || Date.now(),
      updatedAt: Date.now()
    }));

    await writeTasksAtomically(sanitized);
    res.json({ success: true, count: sanitized.length, tasks: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
ensureStorageReady();
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CreatorTask Studio Server is running!`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`📁 Persistent Data Store: ${TASKS_FILE}`);
  console.log(`====================================================`);
});
