/**
 * Automated Test Suite for CreatorTask Studio REST API
 * Tests health check, CRUD operations, format tags, filtering, export endpoints, and database integrity.
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
  console.log('🧪 Running CreatorTask Studio API Test Suite...');
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

  // 2. Fetch all tasks
  let initialCount = 0;
  await test('GET /api/tasks returns task list', async () => {
    const res = await makeRequest('GET', '/api/tasks');
    if (res.status !== 200 || !Array.isArray(res.data.tasks)) {
      throw new Error(`Failed to fetch tasks list`);
    }
    initialCount = res.data.tasks.length;
  });

  // 3. Create a new task with format & milestones
  let createdTaskId = null;
  await test('POST /api/tasks creates task with format & subtasks', async () => {
    const taskPayload = {
      title: '🧪 Automated Test Video: 5 Secret Coding Hacks',
      format: 'shorts',
      category: 'youtube',
      priority: 'high',
      status: 'todo',
      dueDate: '2026-09-01',
      tags: ['Test', 'Automation'],
      description: 'Test outline created via automated test runner.',
      subtasks: [
        { id: 'sub-test-1', text: 'Step 1: Write short hook', done: true },
        { id: 'sub-test-2', text: 'Step 2: Record vertical screen', done: false }
      ]
    };

    const res = await makeRequest('POST', '/api/tasks', taskPayload);
    if (res.status !== 201 || !res.data.task || !res.data.task.id) {
      throw new Error(`Failed to create task`);
    }
    createdTaskId = res.data.task.id;
    if (res.data.task.format !== 'shorts') {
      throw new Error(`Expected format to be 'shorts'`);
    }
  });

  // 4. Retrieve single task
  await test('GET /api/tasks/:id retrieves created task', async () => {
    const res = await makeRequest('GET', `/api/tasks/${createdTaskId}`);
    if (res.status !== 200 || res.data.task.id !== createdTaskId) {
      throw new Error(`Failed to fetch single task`);
    }
  });

  // 5. Update task status & subtasks
  await test('PUT /api/tasks/:id updates status and milestones', async () => {
    const updatePayload = {
      status: 'done',
      priority: 'urgent',
      subtasks: [
        { id: 'sub-test-1', text: 'Step 1: Write short hook', done: true },
        { id: 'sub-test-2', text: 'Step 2: Record vertical screen', done: true }
      ]
    };

    const res = await makeRequest('PUT', `/api/tasks/${createdTaskId}`, updatePayload);
    if (res.status !== 200 || res.data.task.status !== 'done') {
      throw new Error(`Failed to update task`);
    }
  });

  // 6. Test Format Filtering
  await test('GET /api/tasks?format=shorts filters by format', async () => {
    const res = await makeRequest('GET', '/api/tasks?format=shorts');
    if (res.status !== 200 || !res.data.tasks.every(t => (t.format || 'longform') === 'shorts')) {
      throw new Error(`Format filter failed`);
    }
  });

  // 7. Markdown Export Generation
  await test('GET /api/export/markdown produces valid markdown document', async () => {
    const res = await makeRequest('GET', '/api/export/markdown');
    if (res.status !== 200 || typeof res.data !== 'string' || !res.data.includes('# CreatorTask Studio')) {
      throw new Error(`Markdown export failed`);
    }
  });

  // 8. Delete task
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

// Auto-run when executed directly
if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
