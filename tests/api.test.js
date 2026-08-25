/**
 * Comprehensive Automated Test Suite for CreatorTask Studio & Qwen 2.5 (3B)
 * Tests health check, Ollama AI integration, smart upload, viral vault, CRUD operations, and exports.
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
  console.log('🧪 Running CreatorTask Studio, Vault & Qwen 2.5 Test Suite...');
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

  // 3. Viral Vault Listing
  await test('GET /api/vault returns 7 categories with 105 total topics', async () => {
    const res = await makeRequest('GET', '/api/vault');
    if (res.status !== 200 || !res.data.success || !res.data.vault?.categories) {
      throw new Error(`Failed to load vault categories: ${JSON.stringify(res.data)}`);
    }
    const cats = res.data.vault.categories;
    if (!cats.top_ctr || !cats.stages_of || !cats.conspiracies) {
      throw new Error(`Missing expected vault categories`);
    }
  });

  // 4. Viral Vault Category Import
  await test('POST /api/vault/import imports Top CTR pack into tasks database', async () => {
    const res = await makeRequest('POST', '/api/vault/import', {
      categoryKey: 'top_ctr',
      mode: 'append'
    });
    if (res.status !== 200 || !res.data.success || res.data.importedCount !== 15) {
      throw new Error(`Failed to import top_ctr pack: ${JSON.stringify(res.data)}`);
    }
  });

  // 5. Smart Upload Multi-Topic Detection
  await test('POST /api/ai/smart-upload detects numbered lists from uploaded script', async () => {
    const sampleScript = `
    1. The 7 Stages of Becoming a Mafia Boss
    2. The 6 Stages of Becoming a Hitman
    3. The 8 Stages of Becoming a Cult Leader
    `;

    const res = await makeRequest('POST', '/api/ai/smart-upload', {
      content: sampleScript,
      filename: 'stages_notes.txt',
      bulkImport: true
    });
    if (res.status !== 200 || !res.data.success || res.data.count !== 3) {
      throw new Error(`Multi-topic detection failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 6. Task Creation & Validation
  let createdTaskId = null;
  await test('POST /api/tasks creates task with subtasks', async () => {
    const res = await makeRequest('POST', '/api/tasks', {
      title: '🎬 Test Debugging Task for Automated Verification',
      category: 'youtube',
      priority: 'high',
      status: 'todo',
      format: 'longform',
      description: 'Verifying automated CRUD lifecycle and error recovery.',
      subtasks: [
        { id: 'sub-debug-1', text: 'Step 1: Test validation', done: true },
        { id: 'sub-debug-2', text: 'Step 2: Check persistence', done: false }
      ]
    });

    if (res.status !== 201 || !res.data.success || !res.data.task?.id) {
      throw new Error(`Task creation failed: ${JSON.stringify(res.data)}`);
    }
    createdTaskId = res.data.task.id;
  });

  // 7. Task Validation Error Handling
  await test('POST /api/tasks rejects empty title with 400 Bad Request', async () => {
    const res = await makeRequest('POST', '/api/tasks', {
      title: '   ',
      category: 'youtube'
    });
    if (res.status !== 400 || res.data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 8. Task Update
  await test('PUT /api/tasks/:id updates status and subtasks', async () => {
    if (!createdTaskId) throw new Error('No task ID available from previous test');
    const res = await makeRequest('PUT', `/api/tasks/${createdTaskId}`, {
      status: 'done',
      title: '🎬 Test Debugging Task (Updated)'
    });
    if (res.status !== 200 || !res.data.success || res.data.task.status !== 'done') {
      throw new Error(`Task update failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 9. Fetch & Search Tasks with Defensive Query
  await test('GET /api/tasks?search=Test returns created test task', async () => {
    const res = await makeRequest('GET', '/api/tasks?search=Debugging');
    if (res.status !== 200 || !Array.isArray(res.data.tasks) || res.data.tasks.length === 0) {
      throw new Error(`Search failed to find test task`);
    }
  });

  // 10. Delete Task
  await test('DELETE /api/tasks/:id removes task from database', async () => {
    if (!createdTaskId) throw new Error('No task ID available from previous test');
    const res = await makeRequest('DELETE', `/api/tasks/${createdTaskId}`);
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Task delete failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 11. Markdown Export
  await test('GET /api/export/markdown produces valid markdown document', async () => {
    const res = await makeRequest('GET', '/api/export/markdown');
    if (res.status !== 200 || typeof res.data !== 'string' || !res.data.includes('# CreatorTask Studio')) {
      throw new Error(`Markdown export failed`);
    }
  });

  // 12. JSON Export
  await test('GET /api/export/json returns valid JSON array backup', async () => {
    const res = await makeRequest('GET', '/api/export/json');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`JSON export failed`);
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
