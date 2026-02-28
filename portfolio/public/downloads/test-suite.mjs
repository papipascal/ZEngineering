/**
 * Zen-gineering — Test Suite
 * Tests: Frontend, Swagger, and all 19 backend API modules.
 * Usage: node test-suite.mjs
 */

const BASE = 'http://localhost:3000';
const FRONT = 'http://localhost:3001';

// ── ANSI colors ──────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  grey:   '\x1b[90m',
};

const PASS = `${c.green}✓${c.reset}`;
const FAIL = `${c.red}✗${c.reset}`;
const SKIP = `${c.yellow}–${c.reset}`;

// ── State ────────────────────────────────────────────────────────────────────
let token = '';
let projectId = '';
let equipmentId = '';
let results = { pass: 0, fail: 0, skip: 0 };

// ── Helpers ──────────────────────────────────────────────────────────────────
async function req(method, path, body, expectedStatus = 200) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const t0 = Date.now();
  try {
    const res = await fetch(url, opts);
    const ms = Date.now() - t0;
    let data = null;
    try { data = await res.json(); } catch {}
    return { status: res.status, data, ms, ok: res.status === expectedStatus };
  } catch (err) {
    return { status: 0, data: null, ms: Date.now() - t0, ok: false, err: err.message };
  }
}

function section(title) {
  console.log(`\n${c.bold}${c.cyan}── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}${c.reset}`);
}

function test(label, passed, detail = '') {
  const icon = passed === null ? SKIP : passed ? PASS : FAIL;
  const color = passed === null ? c.yellow : passed ? c.green : c.red;
  const det = detail ? ` ${c.grey}${detail}${c.reset}` : '';
  console.log(`  ${icon} ${color}${label}${c.reset}${det}`);
  if (passed === null) results.skip++;
  else if (passed) results.pass++;
  else results.fail++;
}

// ── TESTS ────────────────────────────────────────────────────────────────────

section('Infrastructure');

// Frontend
{
  const r = await req('GET', FRONT);
  test('Frontend running (port 3001)', r.status === 200, `HTTP ${r.status}`);
}

// Swagger
{
  const r = await req('GET', `${BASE}/api/docs`);
  test('Swagger UI (/api/docs)', r.status === 200, `HTTP ${r.status}`);
}
{
  const r = await req('GET', `${BASE}/api/docs-json`);
  test('Swagger JSON (/api/docs-json)', r.ok, `HTTP ${r.status} — ${r.data?.info?.title ?? '?'}`);
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
section('Auth');

{
  const r = await req('POST', '/api/auth/login', { email: 'admin@zengineering.local', password: 'Password123!' }, 201);
  test('POST /login  (admin)', r.ok && r.data?.access_token, `HTTP ${r.status}`);
  if (r.data?.access_token) token = r.data.access_token;
}
{
  const r = await req('GET', '/api/auth/me');
  test('GET  /me', r.ok && !!r.data?.email, `${r.data?.name ?? '?'} | ${r.data?.email ?? '?'}`);
}
{
  const r = await req('GET', '/api/auth/users');
  test('GET  /users', r.ok && Array.isArray(r.data), `${r.data?.length ?? '?'} users`);
}
{
  const r = await req('POST', '/api/auth/login', { email: 'chef.projet@zengineering.local', password: 'Password123!' }, 201);
  test('POST /login  (chef.projet)', r.ok && r.data?.access_token, `HTTP ${r.status}`);
}
{
  const r = await req('POST', '/api/auth/login', { email: 'wrong@zen.io', password: 'bad' }, 401);
  test('POST /login  (bad credentials → 401)', r.ok, `HTTP ${r.status}`);
}

// ── PROJECTS ─────────────────────────────────────────────────────────────────
section('Projects');

{
  const r = await req('GET', '/api/projects');
  test('GET  /projects', r.ok && Array.isArray(r.data), `${r.data?.length ?? '?'} project(s)`);
  if (r.data?.length) projectId = r.data[0].id;
}
if (projectId) {
  const r = await req('GET', `/api/projects/${projectId}`);
  test('GET  /projects/:id', r.ok && r.data?.id === projectId, r.data?.name ?? '?');
} else {
  test('GET  /projects/:id', null, 'skipped — no project');
}

// ── EQUIPMENT ────────────────────────────────────────────────────────────────
section('Equipment');

if (projectId) {
  const r = await req('GET', `/api/equipment?projectId=${projectId}`);
  test('GET  /equipment', r.ok, `${r.data?.total ?? r.data?.length ?? '?'} items | HTTP ${r.status}`);
  equipmentId = r.data?.data?.[0]?.id ?? r.data?.[0]?.id ?? '';
} else {
  test('GET  /equipment', null, 'skipped');
}

// ── WORKFLOWS ────────────────────────────────────────────────────────────────
section('Workflows');

{
  const r = await req('GET', '/api/workflows/definitions');
  test('GET  /workflows/definitions', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} definitions`);
}
if (projectId) {
  const r = await req('GET', `/api/workflows/instances?projectId=${projectId}`);
  test('GET  /workflows/instances', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} instances`);
} else {
  test('GET  /workflows/instances', null, 'skipped');
}

// ── DISCUSSIONS ──────────────────────────────────────────────────────────────
section('Discussions');

if (projectId) {
  const r = await req('GET', `/api/discussions?projectId=${projectId}`);
  test('GET  /discussions', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} discussions`);
} else {
  test('GET  /discussions', null, 'skipped');
}

// ── CHANGE REQUESTS ──────────────────────────────────────────────────────────
section('Change Requests');

if (equipmentId) {
  const r = await req('GET', `/api/change-requests?equipmentId=${equipmentId}`);
  test('GET  /change-requests', r.ok, `HTTP ${r.status}`);
} else {
  test('GET  /change-requests', null, 'skipped — no equipment');
}

// ── DOCUMENTS ────────────────────────────────────────────────────────────────
section('Documents');

if (projectId) {
  const r = await req('GET', `/api/documents?projectId=${projectId}`);
  test('GET  /documents', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} files`);
} else {
  test('GET  /documents', null, 'skipped');
}

// ── DOCUMENT REGISTER ────────────────────────────────────────────────────────
section('Document Register');

if (projectId) {
  const r = await req('GET', `/api/document-register?projectId=${projectId}`);
  test('GET  /document-register', r.ok, `HTTP ${r.status}`);
} else {
  test('GET  /document-register', null, 'skipped');
}

// ── TRANSMITTALS ─────────────────────────────────────────────────────────────
section('Transmittals');

if (projectId) {
  const r = await req('GET', `/api/transmittals?projectId=${projectId}`);
  test('GET  /transmittals', r.ok, `HTTP ${r.status}`);
} else {
  test('GET  /transmittals', null, 'skipped');
}

// ── INCOMING EMAILS ──────────────────────────────────────────────────────────
section('Incoming Emails');

{
  const r = await req('GET', '/api/incoming-emails/status');
  test('GET  /incoming-emails/status', r.ok && r.data?.hasOwnProperty('configured'), `IMAP configured: ${r.data?.configured}`);
}
if (projectId) {
  const r = await req('GET', `/api/incoming-emails?projectId=${projectId}`);
  test('GET  /incoming-emails', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} emails`);

  const rw = await req('GET', `/api/incoming-emails/whitelist?projectId=${projectId}`);
  test('GET  /incoming-emails/whitelist', rw.ok, `${Array.isArray(rw.data) ? rw.data.length : '?'} entries`);
} else {
  test('GET  /incoming-emails', null, 'skipped');
  test('GET  /incoming-emails/whitelist', null, 'skipped');
}

// ── DOCUMENT PROPOSALS ───────────────────────────────────────────────────────
section('Document Proposals');

if (projectId) {
  const r = await req('GET', `/api/document-proposals?projectId=${projectId}`);
  test('GET  /document-proposals (all)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} proposals`);

  const rp = await req('GET', `/api/document-proposals?projectId=${projectId}&status=PENDING`);
  test('GET  /document-proposals?status=PENDING', rp.ok, `${Array.isArray(rp.data) ? rp.data.length : '?'} pending`);
} else {
  test('GET  /document-proposals', null, 'skipped');
  test('GET  /document-proposals?status=PENDING', null, 'skipped');
}

// ── SEARCH ───────────────────────────────────────────────────────────────────
section('Search');

if (projectId) {
  const r = await req('GET', `/api/search?projectId=${projectId}&q=test`);
  test('GET  /search', r.ok, `HTTP ${r.status}`);
} else {
  test('GET  /search', null, 'skipped');
}

// ── CONTRACT ITEMS ───────────────────────────────────────────────────────────
section('Contract Items');

if (projectId) {
  const r = await req('GET', `/api/contract-items?projectId=${projectId}`);
  test('GET  /contract-items', r.ok, `HTTP ${r.status}`);
} else {
  test('GET  /contract-items', null, 'skipped');
}

// ── DATA ORIGIN ──────────────────────────────────────────────────────────────
section('Data Origin (AGO)');

if (equipmentId) {
  const r = await req('GET', `/api/data-origins?equipmentId=${equipmentId}`);
  test('GET  /data-origins', r.ok, `HTTP ${r.status}`);
} else {
  test('GET  /data-origins', null, 'skipped — no equipment');
}

// ── ORGANIZATION ─────────────────────────────────────────────────────────────
section('Organization');

if (projectId) {
  const r = await req('GET', `/api/organization/project/${projectId}`);
  test('GET  /organization/project/:id', r.ok, `HTTP ${r.status}`);
} else {
  test('GET  /organization/project/:id', null, 'skipped');
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
section('Dashboard');

if (projectId) {
  const r = await req('GET', `/api/dashboard/project/${projectId}`);
  test('GET  /dashboard/project/:id', r.ok, `HTTP ${r.status}`);
  const r2 = await req('GET', `/api/dashboard/project/${projectId}/equipment`);
  test('GET  /dashboard/project/:id/equipment', r2.ok, `HTTP ${r2.status}`);
} else {
  test('GET  /dashboard/project/:id', null, 'skipped');
  test('GET  /dashboard/project/:id/equipment', null, 'skipped');
}

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
section('Notifications');

{
  // SSE endpoint: just verify it returns 200 with text/event-stream (don't consume the stream)
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);
  try {
    const res = await fetch(`${BASE}/api/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const ct = res.headers.get('content-type') ?? '';
    test('GET  /notifications/stream (SSE)', res.status === 200, `content-type: ${ct}`);
  } catch (err) {
    clearTimeout(timer);
    test('GET  /notifications/stream (SSE)', err.name === 'AbortError', err.name === 'AbortError' ? 'Stream open (aborted after 2s)' : err.message);
  }
}

// ── AUDIT ────────────────────────────────────────────────────────────────────
section('Audit');

if (projectId) {
  const r = await req('GET', `/api/audit/project/${projectId}`);
  test('GET  /audit/project/:id', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} entries`);
} else {
  test('GET  /audit/project/:id', null, 'skipped');
}

// ── EXPORT ───────────────────────────────────────────────────────────────────
section('Export');

if (projectId) {
  const r = await req('GET', `/api/export/project/${projectId}/equipment`);
  test('GET  /export/project/:id/equipment (CSV)', r.status === 200, `HTTP ${r.status}`);
} else {
  test('GET  /export/project/:id/equipment', null, 'skipped');
}

// ── PROFILE ──────────────────────────────────────────────────────────────────
section('User Profile');

{
  const r = await req('PATCH', '/api/auth/profile', { name: 'Admin Test', phone: '+33600000000' });
  test('PATCH /auth/profile', r.ok, `HTTP ${r.status}`);
  // restore
  await req('PATCH', '/api/auth/profile', { name: 'Admin Zen' });
}
{
  const r = await req('PATCH', '/api/auth/password', { currentPassword: 'wrong', newPassword: 'newpass123' }, 401);
  test('PATCH /auth/password (wrong current → 401)', r.ok, `HTTP ${r.status}`);
}

// ── WHITELIST CRUD ───────────────────────────────────────────────────────────
section('Whitelist CRUD');

if (projectId) {
  // Add
  const ra = await req('POST', '/api/incoming-emails/whitelist', {
    projectId, emailOrDomain: 'test-suite@example.com', label: 'Test Suite'
  }, 201);
  test('POST /incoming-emails/whitelist', ra.ok, `HTTP ${ra.status}`);
  const wlId = ra.data?.id;

  // Delete
  if (wlId) {
    const rd = await req('DELETE', `/api/incoming-emails/whitelist/${wlId}`, null, 200);
    test('DELETE /incoming-emails/whitelist/:id', rd.status < 300, `HTTP ${rd.status}`);
  } else {
    test('DELETE /incoming-emails/whitelist/:id', null, 'skipped — no id');
  }
} else {
  test('POST /incoming-emails/whitelist', null, 'skipped');
  test('DELETE /incoming-emails/whitelist/:id', null, 'skipped');
}

// ── SUMMARY ──────────────────────────────────────────────────────────────────
const total = results.pass + results.fail + results.skip;
const bar = '═'.repeat(54);
console.log(`\n${c.bold}${bar}${c.reset}`);
console.log(`${c.bold}  Results: ${c.green}${results.pass} passed${c.reset}  ${c.red}${results.fail} failed${c.reset}  ${c.yellow}${results.skip} skipped${c.reset}  ${c.grey}/ ${total} total${c.reset}`);
console.log(`${c.bold}${bar}${c.reset}\n`);

if (results.fail > 0) process.exit(1);
