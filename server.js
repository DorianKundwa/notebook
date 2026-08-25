/**
 * CreatorTask Studio — Production Backend REST API Server
 * Fast, resilient Express server with transactional atomic file storage,
 * markdown exports, static asset delivery, and local Ollama Qwen 2.5 (3B) AI integration.
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

const DATA_DIR = path.join(__dirname, 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BACKUP_FILE = path.join(DATA_DIR, 'tasks.backup.json');

// --- Middleware ---
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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

// --- Persistent Storage Engine ---
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

// In-memory cache for ultra-fast <1ms responses
let tasksCache = null;

async function readTasksFromDisk() {
  if (tasksCache !== null) {
    return tasksCache;
  }

  try {
    ensureStorageReady();
    const data = await fsPromises.readFile(TASKS_FILE, 'utf8');
    tasksCache = JSON.parse(data);
    return tasksCache;
  } catch (err) {
    console.error('[DB Read Error]', err);
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const backupData = await fsPromises.readFile(BACKUP_FILE, 'utf8');
        tasksCache = JSON.parse(backupData);
        return tasksCache;
      } catch (_) {}
    }
    tasksCache = DEFAULT_STARTER_TASKS;
    return tasksCache;
  }
}

async function writeTasksAtomically(tasks) {
  ensureStorageReady();
  tasksCache = tasks; // update in-memory cache instantly
  const jsonData = JSON.stringify(tasks, null, 2);

  try {
    await fsPromises.writeFile(TASKS_FILE, jsonData, 'utf8');
    fsPromises.writeFile(BACKUP_FILE, jsonData, 'utf8').catch(() => {});
  } catch (err) {
    console.error('[DB Write Error]', err);
    throw err;
  }
}

// --- Ollama Qwen 2.5 (3B) Client Engine ---
async function queryOllama(prompt, options = {}) {
  const payload = {
    model: options.model || OLLAMA_MODEL,
    prompt: prompt,
    stream: false,
    format: options.format !== undefined ? options.format : 'json',
    options: {
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      num_predict: options.num_predict || 700,
      ...options.extra
    }
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data = await res.json();
    return data.response;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Helper to extract JSON from LLM output (Handles objects, arrays, and markdown blocks)
function extractJsonFromText(text) {
  if (!text) throw new Error('Empty response from AI engine.');
  if (typeof text === 'object') return text;
  if (typeof text !== 'string') text = String(text);

  try {
    return JSON.parse(text);
  } catch (e) {
    // Try regex for ```json ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (_) {}
    }
    // Try finding outer { ... }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (_) {}
    }
    // Try finding outer [ ... ]
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      } catch (_) {}
    }
    throw new Error('Could not parse valid JSON from AI response.');
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

// --- AI Endpoints (Powered by Qwen 2.5:3b) ---

// GET /api/ai/status - Check Ollama connection & model availability
app.get('/api/ai/status', async (req, res) => {
  try {
    const checkRes = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!checkRes.ok) {
      return res.json({
        available: false,
        error: `Ollama service returned HTTP ${checkRes.status}`
      });
    }

    const data = await checkRes.json();
    const modelFound = (data.models || []).find(m => m.name.startsWith('qwen2.5:3b') || m.name === OLLAMA_MODEL);

    res.json({
      available: true,
      model: OLLAMA_MODEL,
      modelInstalled: !!modelFound,
      models: data.models ? data.models.map(m => m.name) : []
    });
  } catch (err) {
    res.json({
      available: false,
      error: `Could not connect to Ollama at ${OLLAMA_HOST}: ${err.message}`
    });
  }
});

// POST /api/ai/brainstorm - Generate video ideas & outlines with Qwen 2.5
app.post('/api/ai/brainstorm', async (req, res) => {
  try {
    const { topic, niche, format, count } = req.body;
    const requestedTopic = topic || 'Modern Web Development & AI Tools';
    const requestedFormat = format || 'longform';
    const requestedNiche = niche || 'tech';
    const requestedCount = count || 3;

    const prompt = `You are an elite YouTube creator and content strategist.
Brainstorm ${requestedCount} viral, high-retention video concepts for the niche "${requestedNiche}" about the topic: "${requestedTopic}".
Format: "${requestedFormat}" (options: longform, shorts, sponsor, podcast).

You MUST respond strictly with a valid JSON array of objects. Do NOT include markdown commentary outside JSON.
Each object must have this exact structure:
[
  {
    "title": "Compelling high-CTR title (with emoji)",
    "format": "${requestedFormat}",
    "category": "youtube",
    "priority": "high",
    "hook": "15-second intro retention hook script",
    "description": "2-3 paragraphs of script talking points, key demo concepts, and pacing notes",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "thumbnailIdea": "Visual description of thumbnail (facial expression, 3D text overlay, contrast colors)",
    "subtasks": [
      "Milestone 1",
      "Milestone 2",
      "Milestone 3",
      "Milestone 4",
      "Milestone 5"
    ]
  }
]`;

    const aiResponse = await queryOllama(prompt, { temperature: 0.75 });
    const parsedIdeas = extractJsonFromText(aiResponse);

    res.json({
      success: true,
      model: OLLAMA_MODEL,
      ideas: Array.isArray(parsedIdeas) ? parsedIdeas : [parsedIdeas]
    });
  } catch (err) {
    console.error('[AI Brainstorm Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/enhance - Enhance existing task title, notes, and milestones
app.post('/api/ai/enhance', async (req, res) => {
  try {
    const { title, description, category, format } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Task title is required to enhance.' });
    }

    const prompt = `You are a professional YouTube producer.
I have a video task draft:
Title: "${title}"
Format: "${format || 'longform'}"
Category: "${category || 'youtube'}"
Notes: "${description || ''}"

Please enhance and optimize this into a production-ready video plan.
You MUST reply strictly with a JSON object in this format (no conversational text):
{
  "optimizedTitle": "Catchy, high-CTR improved title with emoji",
  "hook": "15-second opening retention hook for the video intro",
  "enhancedDescription": "Detailed structured outline: Key talking points, A-roll segments, B-roll recommendations, and call to action",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "priority": "urgent",
  "recommendedSubtasks": [
    "Specific milestone 1",
    "Specific milestone 2",
    "Specific milestone 3",
    "Specific milestone 4",
    "Specific milestone 5",
    "Specific milestone 6"
  ]
}`;

    const aiResponse = await queryOllama(prompt, { temperature: 0.7 });
    const enhancedData = extractJsonFromText(aiResponse);

    res.json({
      success: true,
      model: OLLAMA_MODEL,
      enhanced: enhancedData
    });
  } catch (err) {
    console.error('[AI Enhance Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to detect bulleted or numbered topics in text
function extractTopicListFromText(text) {
  const lines = text.split(/\r?\n/);
  const topics = [];
  const linePattern = /^\s*(?:(?:\d+[\.\)\-:]|\*|\-|\•|🔥|🧠|☠️|👁️|🌎|🚨)\s+)+(.*)$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(linePattern);
    if (match && match[1]) {
      const cleanTitle = match[1].replace(/^[#\*\-_\s]+|[#\*\-_\s]+$/g, '').trim();
      if (cleanTitle.length > 3 && !cleanTitle.toLowerCase().startsWith('stages of') && !cleanTitle.toLowerCase().startsWith('conspiracies') && !cleanTitle.toLowerCase().startsWith('psychological') && !cleanTitle.toLowerCase().startsWith('dark history') && !cleanTitle.toLowerCase().startsWith('mysteries') && !cleanTitle.toLowerCase().startsWith('what if')) {
        topics.push(cleanTitle);
      }
    }
  }
  return topics;
}

// POST /api/ai/smart-upload - Analyze uploaded raw document/script/notes and convert to structured task
app.post('/api/ai/smart-upload', async (req, res) => {
  try {
    const { content, filename, bulkImport } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ success: false, error: 'File content is empty.' });
    }

    // Detect individual topic lines from document
    const detectedTopics = extractTopicListFromText(content);

    // If bulkImport requested directly, convert detected list into tasks
    if (bulkImport && detectedTopics.length > 0) {
      const currentTasks = await readTasksFromDisk();
      const newTasks = detectedTopics.map((title, i) => ({
        id: `task-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        title: title.trim(),
        format: 'longform',
        category: 'youtube',
        priority: 'high',
        status: 'todo',
        tags: ['SmartUpload', 'ImportedIdea'],
        description: `Imported from uploaded document "${filename || 'script_notes.txt'}".`,
        subtasks: [
          { id: `sub-${Date.now()}-${i}-1`, text: 'Hook, Script & Angle', done: false },
          { id: `sub-${Date.now()}-${i}-2`, text: 'Record A-Roll & B-Roll', done: false },
          { id: `sub-${Date.now()}-${i}-3`, text: 'Edit & Sound Design', done: false },
          { id: `sub-${Date.now()}-${i}-4`, text: 'Design High-CTR Thumbnail', done: false },
          { id: `sub-${Date.now()}-${i}-5`, text: 'Publish & Community Post', done: false }
        ],
        createdAt: Date.now() + i,
        updatedAt: Date.now()
      }));

      const merged = [...newTasks, ...currentTasks];
      await writeTasksAtomically(merged);

      return res.json({
        success: true,
        bulk: true,
        count: newTasks.length,
        tasks: merged
      });
    }

    // Limit text sample to prevent token overflow if huge file
    const sampleText = content.substring(0, 8000);

    const prompt = `You are an AI assistant for content creators.
Analyze the following document/script notes (Filename: "${filename || 'uploaded_doc.txt'}"):

--- BEGIN DOCUMENT ---
${sampleText}
--- END DOCUMENT ---

Extract the core concept and transform it into a structured video project task with concrete production steps.
Reply strictly with a JSON object:
{
  "title": "Strong title reflecting the content (with emoji)",
  "format": "longform or shorts or sponsor or podcast",
  "category": "youtube or script or thumbnail or editing or general",
  "priority": "high or medium or urgent",
  "summary": "Key summary and talking points from the document",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "subtasks": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ...",
    "Step 5: ..."
  ]
}`;

    const aiResponse = await queryOllama(prompt, { temperature: 0.5 });
    const parsedTask = extractJsonFromText(aiResponse);

    res.json({
      success: true,
      model: OLLAMA_MODEL,
      detectedTopics: detectedTopics,
      extractedTask: parsedTask
    });
  } catch (err) {
    console.error('[AI Smart Upload Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Viral YouTube Vault Endpoints ---

// GET /api/vault - Get all viral idea packs
app.get('/api/vault', async (req, res) => {
  try {
    const vaultPath = path.join(__dirname, 'data', 'all_viral_ideas.json');
    if (fs.existsSync(vaultPath)) {
      const raw = await fsPromises.readFile(vaultPath, 'utf8');
      return res.json({ success: true, vault: JSON.parse(raw) });
    }
    res.status(404).json({ success: false, error: 'Vault dataset not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/vault/import - Import curated category or all 105 ideas
app.post('/api/vault/import', async (req, res) => {
  try {
    const { categoryKey, mode } = req.body; // mode: 'append' (default) or 'replace'
    const vaultPath = path.join(__dirname, 'data', 'all_viral_ideas.json');
    if (!fs.existsSync(vaultPath)) {
      return res.status(404).json({ success: false, error: 'Vault dataset not found' });
    }

    const raw = await fsPromises.readFile(vaultPath, 'utf8');
    const vaultData = JSON.parse(raw);
    let itemsToImport = [];

    if (!categoryKey || categoryKey === 'all') {
      Object.values(vaultData.categories).forEach(cat => {
        itemsToImport.push(...cat.items);
      });
    } else if (vaultData.categories[categoryKey]) {
      itemsToImport = vaultData.categories[categoryKey].items;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid category key' });
    }

    const newTasks = itemsToImport.map((item, i) => ({
      id: `vault-task-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      format: item.format || 'longform',
      category: item.category || 'youtube',
      priority: item.priority || (categoryKey === 'top_ctr' ? 'urgent' : 'high'),
      status: 'todo',
      tags: item.tags || ['ViralVault'],
      description: item.description || `Curated high-CTR video concept from the Viral YouTube Vault.`,
      subtasks: [
        { id: `sub-v-${Date.now()}-${i}-1`, text: 'Hook, Target Audience & Script Outline', done: false },
        { id: `sub-v-${Date.now()}-${i}-2`, text: 'Record 4K A-Roll (Talking Head / Intro)', done: false },
        { id: `sub-v-${Date.now()}-${i}-3`, text: 'Capture B-Roll, Screen Recordings & Assets', done: false },
        { id: `sub-v-${Date.now()}-${i}-4`, text: 'Rough Cut & Pacing in DaVinci / Premiere', done: false },
        { id: `sub-v-${Date.now()}-${i}-5`, text: 'Sound Design, Kinematic BGM & Sound FX', done: false },
        { id: `sub-v-${Date.now()}-${i}-6`, text: 'Design High-CTR Thumbnail (3 Variations)', done: false },
        { id: `sub-v-${Date.now()}-${i}-7`, text: 'Write High-SEO Title, Description & Tags', done: false },
        { id: `sub-v-${Date.now()}-${i}-8`, text: 'Publish, Pin Comment & Social Distribution', done: false }
      ],
      createdAt: Date.now() + i,
      updatedAt: Date.now()
    }));

    let finalTasks;
    if (mode === 'replace') {
      finalTasks = newTasks;
    } else {
      const currentTasks = await readTasksFromDisk();
      finalTasks = [...newTasks, ...currentTasks];
    }

    await writeTasksAtomically(finalTasks);
    res.json({
      success: true,
      importedCount: newTasks.length,
      totalTasks: finalTasks.length,
      tasks: finalTasks
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Standard Task CRUD Endpoints ---

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
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (Array.isArray(t.tags) && t.tags.some(tag => tag && String(tag).toLowerCase().includes(q))) ||
        (Array.isArray(t.subtasks) && t.subtasks.some(s => s && s.text && String(s.text).toLowerCase().includes(q)))
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
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: Date.now()
    };

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
  console.log(`🤖 AI Engine: Ollama (${OLLAMA_MODEL}) at ${OLLAMA_HOST}`);
  console.log(`📁 Persistent Data Store: ${TASKS_FILE}`);
  console.log(`====================================================`);
});
