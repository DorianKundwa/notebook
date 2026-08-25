/**
 * Comprehensive Automated Test Suite for CreatorTask Studio & Qwen 2.5 (3B)
 * Tests health check, Ollama AI integration, smart upload, CRUD operations, and exports.
 */

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('application/json')
            ? JSON.parse(body)
            : body;
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running CreatorTask Studio & Qwen 2.5 (3B) Test Suite...');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health returns 200 OK', async () => {
    const res = await makeRequest('GET', '/api/health');
    if (res.status !== 200 || res.data.status !== 'ok') {
      throw new Error(`Expected 200 OK, got ${res.status}`);
    }
  });

  // 2. Ollama AI Status
  await test('GET /api/ai/status verifies Qwen 2.5 (3B) is available', async () => {
    const res = await makeRequest('GET', '/api/ai/status');
    if (res.status !== 200 || !res.data.available || !res.data.modelInstalled) {
      throw new Error(`Ollama model qwen2.5:3b not detected: ${JSON.stringify(res.data)}`);
    }
  });

  // 3. AI Brainstorming Studio
  await test('POST /api/ai/brainstorm generates video concepts with Qwen 2.5', async () => {
    const res = await makeRequest('POST', '/api/ai/brainstorm', {
      topic: 'Building an App with AI Agents in 2026',
      niche: 'tech',
      format: 'longform',
      count: 2
    });
    if (res.status !== 200 || !res.data.success || !Array.isArray(res.data.ideas) || res.data.ideas.length === 0) {
      throw new Error(`AI Brainstorm failed: ${JSON.stringify(res.data)}`);
    }
    const firstIdea = res.data.ideas[0];
    if (!firstIdea.title || !firstIdea.hook) {
      throw new Error(`Idea missing title or hook`);
    }
  });

  // 4. AI In-Modal Task Enhancer
  await test('POST /api/ai/enhance optimizes draft title and notes', async () => {
    const res = await makeRequest('POST', '/api/ai/enhance', {
      title: 'learn vim',
      category: 'youtube',
      format: 'shorts'
    });
    if (res.status !== 200 || !res.data.success || !res.data.enhanced) {
      throw new Error(`AI Enhance failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.enhanced.optimizedTitle || !Array.isArray(res.data.enhanced.recommendedSubtasks)) {
      throw new Error(`Enhance missing optimized title or recommended subtasks`);
    }
  });

  // 5. Smart Upload & Script Analyzer
  await test('POST /api/ai/smart-upload parses raw document into structured task', async () => {
    const sampleScript = `# Video Outline: 3 Terminal Tools
    In this video we talk about zoxide, fzf, and tmux.
    Key points:
    1. Fast directory jumping with zoxide
    2. Interactive fuzzy search with fzf
    3. Terminal multiplexing with tmux
    Action items: record screen, test audio, export in 4k.`;

    const res = await makeRequest('POST', '/api/ai/smart-upload', {
      content: sampleScript,
      filename: 'terminal_tools.md'
    });
    if (res.status !== 200 || !res.data.success || !res.data.extractedTask) {
      throw new Error(`Smart Upload failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.extractedTask.title || !Array.isArray(res.data.extractedTask.subtasks)) {
      throw new Error(`Extracted task missing title or subtasks`);
    }
  });

  // 6. Fetch task list
  await test('GET /api/tasks returns task list', async () => {
    const res = await makeRequest('GET', '/api/tasks');
    if (res.status !== 200 || !Array.isArray(res.data.tasks)) {
      throw new Error(`Failed to fetch tasks list`);
    }
  });

  // 7. Create task
  let createdTaskId = null;
  await test('POST /api/tasks creates task with format & milestones', async () => {
    const taskPayload = {
      title: '🎬 5 AI Agents That Code Better Than Humans in 2026',
      format: 'longform',
      category: 'youtube',
      priority: 'urgent',
      status: 'todo',
      dueDate: '2026-09-10',
      tags: ['AI', 'Tech', 'Agents'],
      description: 'Tested via automated test suite.',
      subtasks: [
        { id: 'sub-t-1', text: 'Benchmark 5 AI agents on full-stack apps', done: true },
        { id: 'sub-t-2', text: 'Record screen screencast & A-roll', done: false }
      ]
    };

    const res = await makeRequest('POST', '/api/tasks', taskPayload);
    if (res.status !== 201 || !res.data.task || !res.data.task.id) {
      throw new Error(`Failed to create task`);
    }
    createdTaskId = res.data.task.id;
  });

  // 8. Markdown Export
  await test('GET /api/export/markdown produces valid markdown document', async () => {
    const res = await makeRequest('GET', '/api/export/markdown');
    if (res.status !== 200 || typeof res.data !== 'string' || !res.data.includes('# CreatorTask Studio')) {
      throw new Error(`Markdown export failed`);
    }
  });

  // 9. Delete task
  await test('DELETE /api/tasks/:id deletes task', async () => {
    const res = await makeRequest('DELETE', `/api/tasks/${createdTaskId}`);
    if (res.status !== 200) {
      throw new Error(`Failed to delete task`);
    }
  });

  console.log('====================================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
