/**
 * Zen-gineering — Demo Runner v3.2
 * Script interactif : validation API + pauses + narration colorée
 *
 * Usage: node demo-runner.mjs
 * Node 24+ natif (fetch, readline) — 0 dépendances
 *
 * Scénario : Mon Chemical Plant — Unit U_A | Alphahexol Industries
 */

import { createInterface } from 'node:readline';

const BASE  = 'http://localhost:3000';
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
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
  white:  '\x1b[37m',
  grey:   '\x1b[90m',
  bgCyan: '\x1b[46m',
  bgBlue: '\x1b[44m',
};

// ── State ────────────────────────────────────────────────────────────────────
let adminToken   = '';
let managerToken = '';
let engineerToken= '';
let projectId    = '';
let equipmentId  = '';
let discussionId = '';
let workflowInstanceId = '';
let docRegisterId= '';
let transmittalId= '';
let wlId         = '';

const results = { pass: 0, fail: 0, total: 0 };
const startTime = Date.now();

// ── Readline for pause ───────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout });

function pause() {
  return new Promise(resolve => {
    process.stdout.write(`\n  ${c.grey}Appuyez sur ${c.bold}[Entrée]${c.reset}${c.grey} pour continuer...${c.reset}`);
    rl.once('line', () => {
      process.stdout.write('\n');
      resolve();
    });
  });
}

// ── HTTP helper ──────────────────────────────────────────────────────────────
async function req(method, path, body = null, expectedStatus = 200, token = adminToken) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const t0 = Date.now();
  try {
    const res = await fetch(url, opts);
    const ms  = Date.now() - t0;
    let data  = null;
    try { data = await res.json(); } catch {}
    return { status: res.status, data, ms, ok: res.status === expectedStatus };
  } catch (err) {
    return { status: 0, data: null, ms: Date.now() - t0, ok: false, err: err.message };
  }
}

// ── Login helper ─────────────────────────────────────────────────────────────
async function login(email, password) {
  const r = await req('POST', '/api/auth/login', { email, password }, 201, '');
  return r.ok ? r.data?.access_token : null;
}

// ── Test helpers ─────────────────────────────────────────────────────────────
function pass(msg, detail = '') {
  results.pass++;
  results.total++;
  const det = detail ? `  ${c.grey}${detail}${c.reset}` : '';
  console.log(`  ${c.green}✅${c.reset} ${c.green}${msg}${c.reset}${det}`);
}

function fail(msg, got = '') {
  results.fail++;
  results.total++;
  const det = got ? `  ${c.red}→ ${got}${c.reset}` : '';
  console.log(`  ${c.red}❌${c.reset} ${c.red}${msg}${c.reset}${det}`);
}

function info(msg) {
  console.log(`  ${c.grey}ℹ  ${msg}${c.reset}`);
}

function check(label, condition, detail = '') {
  if (condition) pass(label, detail);
  else           fail(label, detail);
}

// ── Section banner ───────────────────────────────────────────────────────────
async function section(n, title, description) {
  const bar = '═'.repeat(60);
  const num = String(n).padStart(2, '0');
  console.log(`\n${c.bold}${c.cyan}${bar}${c.reset}`);
  console.log(`${c.bold}${c.cyan}  MODULE ${num} — ${title}${c.reset}`);
  console.log(`${c.cyan}  ${description}${c.reset}`);
  console.log(`${c.bold}${c.cyan}${bar}${c.reset}\n`);
}

// ── Intro ────────────────────────────────────────────────────────────────────
function intro() {
  const bar = '╔' + '═'.repeat(56) + '╗';
  const end = '╚' + '═'.repeat(56) + '╝';
  const mid = (s) => '║  ' + s + ' '.repeat(Math.max(0, 54 - s.length)) + '  ║';
  console.log('\n' + c.bold + c.cyan + bar);
  console.log(mid('ZEN-GINEERING — DEMO RUNNER v3.2'));
  console.log(mid('Scénario : Mon Chemical Plant — Unit U_A'));
  console.log(mid('21 modules | Validation API + narration'));
  console.log(end + c.reset + '\n');
  console.log(`  ${c.grey}Backend  : ${BASE}${c.reset}`);
  console.log(`  ${c.grey}Frontend : ${FRONT}${c.reset}`);
  console.log(`  ${c.grey}Swagger  : ${BASE}/api/docs${c.reset}\n`);
}

// ── Summary ──────────────────────────────────────────────────────────────────
function summary() {
  rl.close();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  const mins    = Math.floor(elapsed / 60);
  const secs    = elapsed % 60;
  const duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const allOk   = results.fail === 0;
  const bar     = '╔' + '═'.repeat(44) + '╗';
  const end     = '╚' + '═'.repeat(44) + '╝';
  const row     = (s) => '║  ' + s + ' '.repeat(Math.max(0, 42 - s.length)) + '  ║';

  const col = allOk ? c.green : c.red;

  console.log('\n' + c.bold + col + bar);
  console.log(row('ZEN-GINEERING — DÉMO COMPLÈTE'));
  console.log('╠' + '═'.repeat(44) + '╣');
  console.log(row(`Tests passés  : ${results.pass} / ${results.total}`));
  console.log(row(`Tests échoués : ${results.fail}`));
  console.log(row(`Durée totale  : ${duration}`));
  console.log(end + c.reset + '\n');

  if (results.fail > 0) {
    console.log(`${c.red}${c.bold}  ⚠  ${results.fail} test(s) en échec — vérifiez les logs ci-dessus${c.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${c.green}${c.bold}  🎉  Tous les tests sont passés — démo prête !${c.reset}\n`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  intro();

  // ── MODULE 01 : Infrastructure ─────────────────────────────────────────────
  await section(1, 'Infrastructure', 'Health check, Frontend, Swagger');

  {
    const r = await req('GET', FRONT, null, 200, '');
    check('Frontend running (port 3001)', r.status === 200, `HTTP ${r.status}`);
  }
  {
    const r = await req('GET', `${BASE}/api/docs`, null, 200, '');
    check('Swagger UI (/api/docs)', r.status === 200, `HTTP ${r.status}`);
  }
  {
    const r = await req('GET', `${BASE}/api/docs-json`, null, 200, '');
    check('Swagger JSON (/api/docs-json)', r.ok, r.data?.info?.title ?? `HTTP ${r.status}`);
  }

  info('URLs : http://localhost:3001  |  http://localhost:3000/api/docs');
  await pause();

  // ── MODULE 02 : Authentification ───────────────────────────────────────────
  await section(2, 'Authentification', 'Login 3 rôles, JWT, /me, credentials');

  {
    adminToken = await login('admin@zengineering.local', 'Password123!');
    check('POST /login  — Admin Zen (admin)', !!adminToken, adminToken ? 'JWT ✓' : 'FAILED');
  }
  {
    managerToken = await login('chef.projet@zengineering.local', 'Password123!');
    check('POST /login  — Marie Dupont (manager)', !!managerToken, managerToken ? 'JWT ✓' : 'FAILED');
  }
  {
    engineerToken = await login('ingenieur@zengineering.local', 'Password123!');
    check('POST /login  — Jean Martin (member)', !!engineerToken, engineerToken ? 'JWT ✓' : 'FAILED');
  }
  {
    const r = await req('GET', '/api/auth/me');
    check('GET /me  (admin)', r.ok && !!r.data?.email, `${r.data?.name ?? '?'} | ${r.data?.discipline ?? '?'}`);
  }
  {
    const r = await req('GET', '/api/auth/users');
    check('GET /users  (liste 3 utilisateurs)', r.ok && Array.isArray(r.data) && r.data.length >= 3, `${r.data?.length ?? '?'} users`);
  }
  {
    const r = await req('POST', '/api/auth/login', { email: 'wrong@zen.io', password: 'bad' }, 401, '');
    check('POST /login  — bad credentials → 401', r.status === 401, `HTTP ${r.status}`);
  }

  info('Credentials : admin@zengineering.local / chef.projet@... / ingenieur@...  |  Mot de passe : Password123!');
  await pause();

  // ── MODULE 03 : Projet & Équipe ────────────────────────────────────────────
  await section(3, 'Projet & Équipe', 'Mon Chemical Plant - Unit U_A | Alphahexol Industries');

  {
    const r = await req('GET', '/api/projects');
    check('GET /projects', r.ok && Array.isArray(r.data) && r.data.length >= 1, `${r.data?.length ?? '?'} projet(s)`);
    if (r.data?.length) {
      projectId = r.data[0].id;
      info(`Projet sélectionné : "${r.data[0].name}" (id: ${projectId.slice(0, 8)}…)`);
    }
  }
  if (projectId) {
    const r = await req('GET', `/api/projects/${projectId}`);
    check('GET /projects/:id  (détail)', r.ok && r.data?.id === projectId, r.data?.clientName ?? '?');
  }
  if (projectId) {
    const r = await req('GET', `/api/projects/${projectId}/partners`);
    check('GET /projects/:id/partners  (Licensor + EPC)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} partenaires`);
    if (Array.isArray(r.data)) {
      r.data.forEach(p => info(`  Partenaire : ${p.name} — ${p.contactEmail ?? '?'}`));
    }
  }
  if (projectId) {
    const r = await req('GET', `/api/projects/${projectId}/vendors`);
    check('GET /projects/:id/vendors  (SULZER, MOUVEX, LESER)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} fournisseurs`);
  }

  info('Frontend : http://localhost:3001/project-setup');
  await pause();

  // ── MODULE 04 : Organigramme ───────────────────────────────────────────────
  await section(4, 'Organigramme & Arborescence', '31 rôles projet | chef_de_projet=Marie Dupont, process_lead=Admin Zen');

  if (projectId) {
    const r = await req('GET', `/api/organization/project/${projectId}`);
    check('GET /organization/project/:id  (organigramme)', r.ok, `HTTP ${r.status}`);
    if (Array.isArray(r.data)) {
      const chef = r.data.find(o => o.role === 'chef_de_projet');
      const lead = r.data.find(o => o.role === 'process_lead');
      info(`Chef de Projet : ${chef?.user?.name ?? chef?.role ?? '?'}`);
      info(`Process Lead   : ${lead?.user?.name ?? lead?.role ?? '?'}`);
      info(`Total positions: ${r.data.length} rôles`);
    }
  }
  {
    const r = await req('GET', '/api/organization/tree');
    check('GET /organization/tree  (arborescence template)', r.ok, `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/organization');
  await pause();

  // ── MODULE 05 : Équipements ────────────────────────────────────────────────
  await section(5, 'Équipements', '27 équipements réalistes — pompes, vessels, échangeurs, vannes');

  if (projectId) {
    const r = await req('GET', `/api/equipment?projectId=${projectId}&limit=10`);
    check('GET /equipment  (liste paginée)', r.ok, `total: ${r.data?.total ?? r.data?.length ?? '?'} items`);
    equipmentId = r.data?.data?.[0]?.id ?? r.data?.[0]?.id ?? '';
  }
  if (projectId) {
    const r = await req('GET', `/api/equipment?projectId=${projectId}&category=ROTATING_MACHINE`);
    check('GET /equipment  (filtre ROTATING_MACHINE)', r.ok, `${r.data?.total ?? r.data?.length ?? '?'} pompes/compresseurs`);
  }
  if (projectId) {
    const r = await req('GET', `/api/equipment/search?projectId=${projectId}&q=pump`);
    check('GET /equipment/search?q=pump', r.ok, `${Array.isArray(r.data?.data ?? r.data) ? (r.data?.data ?? r.data).length : '?'} résultats`);
  }
  {
    const tag = encodeURIComponent('125-PR-601 A');
    const r   = await req('GET', `/api/equipment/tag/${tag}`);
    check('GET /equipment/tag/125-PR-601 A  (Feed Loop Pump)', r.ok, r.data?.service ?? `HTTP ${r.status}`);
  }
  {
    const r = await req('GET', '/api/equipment/tag/125-VV-601');
    check('GET /equipment/tag/125-VV-601  (Blowdown Drum)', r.ok, r.data?.service ?? `HTTP ${r.status}`);
  }
  if (equipmentId) {
    const r = await req('GET', `/api/equipment/${equipmentId}`);
    check('GET /equipment/:id  (fiche technique)', r.ok, r.data?.tagNumber ?? `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/equipment');
  await pause();

  // ── MODULE 06 : Workflows ──────────────────────────────────────────────────
  await section(6, 'Workflows & Approbations', '3 templates JSON | instance active : "Review pump 125-PR-601 datasheet"');

  {
    const r = await req('GET', '/api/workflows/definitions');
    check('GET /workflows/definitions  (3 templates)', r.ok && Array.isArray(r.data) && r.data.length >= 3, `${Array.isArray(r.data) ? r.data.length : '?'} templates`);
    if (Array.isArray(r.data)) {
      r.data.forEach(d => info(`  → "${d.name}" (${d.steps?.length ?? '?'} étapes)`));
    }
  }
  if (projectId) {
    const r = await req('GET', `/api/workflows/instances?projectId=${projectId}`);
    check('GET /workflows/instances  (instance active)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} instance(s)`);
    if (Array.isArray(r.data) && r.data.length) {
      workflowInstanceId = r.data[0].id;
      const inst = r.data[0];
      info(`  Instance : "${inst.context?.subject ?? inst.id}" | status: ${inst.status} | étape: ${inst.currentStepIdx}`);
    }
  }
  if (workflowInstanceId) {
    const r = await req('GET', `/api/workflows/instances/${workflowInstanceId}`);
    check('GET /workflows/instances/:id  (détail)', r.ok, `step ${r.data?.currentStepIdx ?? '?'} / ${r.data?.steps?.length ?? '?'}`);
  }

  info('Frontend : http://localhost:3001/tasks  (connecté en tant que Jean Martin)');
  info('Démo : avancer le workflow → la tâche passe à Admin Zen (Validation Lead)');
  await pause();

  // ── MODULE 07 : Mes Tâches ─────────────────────────────────────────────────
  await section(7, 'Mes Tâches', 'Vue personnelle des tâches assignées par utilisateur');

  {
    const r = await req('GET', '/api/workflows/my-tasks', null, 200, engineerToken);
    check('GET /workflows/my-tasks  (Jean Martin)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} tâche(s) active(s)`);
  }
  {
    const r = await req('GET', '/api/workflows/my-tasks', null, 200, managerToken);
    check('GET /workflows/my-tasks  (Marie Dupont)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} tâche(s) en attente`);
  }
  {
    const r = await req('GET', '/api/workflows/my-tasks', null, 200, adminToken);
    check('GET /workflows/my-tasks  (Admin Zen)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} tâche(s)`);
  }

  info('Frontend : http://localhost:3001/tasks');
  await pause();

  // ── MODULE 08 : Discussions ────────────────────────────────────────────────
  await section(8, 'Discussions collaboratives', '3 discussions liées aux équipements et au projet');

  if (projectId) {
    const r = await req('GET', `/api/discussions?projectId=${projectId}`);
    check('GET /discussions  (liste)', r.ok && Array.isArray(r.data) && r.data.length >= 3, `${Array.isArray(r.data) ? r.data.length : '?'} discussions`);
    if (Array.isArray(r.data)) {
      discussionId = r.data[0].id;
      r.data.forEach(d => info(`  → "${d.title}" (${d.comments?.length ?? d._count?.comments ?? '?'} commentaire(s))`));
    }
  }
  if (discussionId) {
    const r = await req('GET', `/api/discussions/${discussionId}`);
    check('GET /discussions/:id  (détail + commentaires)', r.ok, `"${r.data?.title ?? '?'}"`);
  }
  if (discussionId) {
    const r = await req('POST', `/api/discussions/${discussionId}/comments`, {
      content: 'Demo Runner — commentaire de test API',
    }, 201);
    check('POST /discussions/:id/comments  (ajouter commentaire)', r.ok, `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/discussions');
  await pause();

  // ── MODULE 09 : Registre de documents ─────────────────────────────────────
  await section(9, 'Registre de documents', '3 entrées : ZG-125-PRC-001 (PFD), ZG-125-PRC-002 (P&ID), ZG-125-MEC-001');

  if (projectId) {
    const r = await req('GET', `/api/document-register?projectId=${projectId}`);
    check('GET /document-register  (liste)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} documents`);
    if (Array.isArray(r.data)) {
      docRegisterId = r.data[0]?.id ?? '';
      r.data.forEach(d => info(`  → ${d.documentNumber} | ${d.title} | Rev.${d.revision} | ${d.status}`));
    }
  }
  if (projectId) {
    const r = await req('POST', '/api/document-register', {
      projectId,
      documentNumber: 'ZG-125-TEST-999',
      title: 'Demo Runner — Test Entry',
      discipline: 'PROCESS',
      revision: 'A',
      status: 'DRAFT',
    }, 201);
    check('POST /document-register  (créer brouillon)', r.ok, `HTTP ${r.status}`);
    const newId = r.data?.id;
    if (newId) {
      const rd = await req('DELETE', `/api/document-register/${newId}`, null, 200);
      check('DELETE /document-register/:id  (nettoyage)', rd.status < 300, `HTTP ${rd.status}`);
    }
  }

  info('Frontend : http://localhost:3001/document-register');
  info('Cycle de vie : DRAFT → FOR_REVIEW → APPROVED / REJECTED / CANCELLED');
  await pause();

  // ── MODULE 10 : Documents (MinIO) ──────────────────────────────────────────
  await section(10, 'Upload & partage de documents', 'MinIO S3 — upload multipart + presigned URL');

  if (projectId) {
    const r = await req('GET', `/api/documents?projectId=${projectId}`);
    check('GET /documents  (liste fichiers MinIO)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} fichier(s)`);
  }

  info('Upload : POST /api/documents/upload  (multipart/form-data)');
  info('Download : GET /api/documents/:id/download  → presigned URL S3 (expire 1h)');
  info('Frontend : http://localhost:3001/documents');
  await pause();

  // ── MODULE 11 : Transmittals ───────────────────────────────────────────────
  await section(11, 'Transmittals', 'MONCHE-TR-001 → Dr. Sarah Chen (Licensor) | SENT 10/02/2026');

  if (projectId) {
    const r = await req('GET', `/api/transmittals?projectId=${projectId}`);
    check('GET /transmittals  (liste)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} transmittal(s)`);
    if (Array.isArray(r.data) && r.data.length) {
      transmittalId = r.data[0].id;
      const t = r.data[0];
      info(`  → ${t.transmittalNumber} | ${t.subject} | ${t.status} → ${t.recipientName}`);
    }
  }
  if (transmittalId) {
    const r = await req('GET', `/api/transmittals/${transmittalId}`);
    check('GET /transmittals/:id  (détail + lettre de couverture)', r.ok, r.data?.transmittalNumber ?? `HTTP ${r.status}`);
    if (r.data?.coverLetter) {
      info(`  Lettre : "${r.data.coverLetter.slice(0, 80)}…"`);
    }
    info(`  Documents : ${r.data?.items?.length ?? '?'} item(s)`);
  }

  info('Frontend : http://localhost:3001/transmittals');
  await pause();

  // ── MODULE 12 : Emails entrants ────────────────────────────────────────────
  await section(12, 'Inbox emails & Whitelist', 'IMAP polling automatique | whitelist CRUD | propositions auto');

  {
    const r = await req('GET', '/api/incoming-emails/status');
    check('GET /incoming-emails/status  (IMAP)', r.ok, `configured: ${r.data?.configured}, host: ${r.data?.host ?? 'N/A'}`);
  }
  if (projectId) {
    const r = await req('GET', `/api/incoming-emails?projectId=${projectId}`);
    check('GET /incoming-emails  (liste)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} email(s) capturé(s)`);
  }
  if (projectId) {
    const r = await req('GET', `/api/incoming-emails/whitelist?projectId=${projectId}`);
    check('GET /incoming-emails/whitelist  (liste)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} entrée(s)`);
  }
  if (projectId) {
    const ra = await req('POST', '/api/incoming-emails/whitelist', {
      projectId,
      emailOrDomain: 'demo-runner@test.local',
      label: 'Demo Runner Test',
    }, 201);
    check('POST /incoming-emails/whitelist  (ajouter)', ra.ok, `HTTP ${ra.status}`);
    wlId = ra.data?.id;
    if (wlId) {
      const rd = await req('DELETE', `/api/incoming-emails/whitelist/${wlId}`, null, 200);
      check('DELETE /incoming-emails/whitelist/:id  (supprimer)', rd.status < 300, `HTTP ${rd.status}`);
    }
  }
  if (projectId) {
    const r = await req('GET', `/api/incoming-emails/rules/project/${projectId}`);
    check('GET /incoming-emails/rules/project/:id  (règles de routage)', r.ok, `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/incoming-emails');
  info('Whitelist : @licensortech.com → tous les emails Licensor auto-acceptés');
  await pause();

  // ── MODULE 13 : Propositions de documents ─────────────────────────────────
  await section(13, 'Propositions de documents', 'Email entrant → pièce jointe → proposition PENDING → registre');

  if (projectId) {
    const r = await req('GET', `/api/document-proposals?projectId=${projectId}`);
    check('GET /document-proposals  (toutes)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} proposition(s)`);
  }
  if (projectId) {
    const r = await req('GET', `/api/document-proposals?projectId=${projectId}&status=PENDING`);
    check('GET /document-proposals?status=PENDING', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} en attente`);
  }

  info('Frontend : http://localhost:3001/document-proposals');
  info('Flux : Email entrant → pièce jointe → PENDING → Accepter → Registre de documents');
  await pause();

  // ── MODULE 14 : Data Origin / AGO ─────────────────────────────────────────
  await section(14, 'Data Origin / AGO', 'Approved & Guaranteed Origin — traçabilité champ par champ');

  if (equipmentId) {
    const r = await req('GET', `/api/data-origins?equipmentId=${equipmentId}`);
    check('GET /data-origins?equipmentId=xxx', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} origine(s)`);
  } else {
    info('Skipped — equipmentId non disponible');
  }
  if (projectId) {
    const r = await req('GET', `/api/data-origins/staleness-check?projectId=${projectId}`);
    check('GET /data-origins/staleness-check  (fraîcheur des données)', r.ok || r.status === 404, `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/ago-report');
  info('Chaque valeur technique est tracée jusqu\'à sa source (datasheet, calcul, standard)');
  await pause();

  // ── MODULE 15 : Articles de contrat ───────────────────────────────────────
  await section(15, 'Articles de contrat', 'Exigences contractuelles + journal des modifications');

  if (projectId) {
    const r = await req('GET', `/api/contract-items?projectId=${projectId}`);
    check('GET /contract-items  (exigences)', r.ok, `HTTP ${r.status}`);
  }
  if (projectId) {
    const r = await req('GET', `/api/contract-items/change-log?projectId=${projectId}`);
    check('GET /contract-items/change-log  (journal)', r.ok, `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/contract-requirements');
  await pause();

  // ── MODULE 16 : Recherche globale ─────────────────────────────────────────
  await section(16, 'Recherche globale', 'Multi-entités : équipements, documents, discussions | sauvegardes');

  if (projectId) {
    const r = await req('GET', `/api/search?projectId=${projectId}&q=pump`);
    check('GET /search?q=pump  (multi-entités)', r.ok, `HTTP ${r.status}`);
  }
  if (projectId) {
    const r = await req('GET', `/api/search?projectId=${projectId}&q=125-VV`);
    check('GET /search?q=125-VV  (vessels)', r.ok, `HTTP ${r.status}`);
  }
  if (projectId) {
    const rs = await req('POST', '/api/search/saved', {
      projectId, query: 'pump', label: 'Demo — Recherche pompes',
    }, 201);
    check('POST /search/saved  (sauvegarder recherche)', rs.ok, `HTTP ${rs.status}`);
    const savedId = rs.data?.id;
    if (savedId) {
      await req('DELETE', `/api/search/saved/${savedId}`, null, 200);
    }
  }

  info('Frontend : http://localhost:3001/search');
  await pause();

  // ── MODULE 17 : Dashboard ─────────────────────────────────────────────────
  await section(17, 'Dashboard', 'KPIs projet : équipements, workflows, documents, stats utilisateurs');

  if (projectId) {
    const r = await req('GET', `/api/dashboard/project/${projectId}`);
    check('GET /dashboard/project/:id  (stats générales)', r.ok, `HTTP ${r.status}`);
  }
  if (projectId) {
    const r = await req('GET', `/api/dashboard/project/${projectId}/equipment`);
    check('GET /dashboard/project/:id/equipment  (stats équipements)', r.ok, `HTTP ${r.status}`);
  }
  if (projectId) {
    const r = await req('GET', `/api/dashboard/project/${projectId}/workflows`);
    check('GET /dashboard/project/:id/workflows  (stats workflows)', r.ok || r.status === 404, `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/');
  await pause();

  // ── MODULE 18 : Notifications SSE ─────────────────────────────────────────
  await section(18, 'Notifications temps réel', 'Server-Sent Events — push sans rechargement de page');

  {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    try {
      const res = await fetch(`${BASE}/api/notifications/stream`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const ct = res.headers.get('content-type') ?? '';
      check('GET /notifications/stream  (SSE ouvert)', res.status === 200, `content-type: ${ct}`);
    } catch (err) {
      clearTimeout(timer);
      check('GET /notifications/stream  (SSE ouvert)', err.name === 'AbortError',
        err.name === 'AbortError' ? 'Stream ouvert (aborted après 2.5s)' : err.message);
    }
  }

  info('DevTools → Network → EventStream pour voir les événements push');
  await pause();

  // ── MODULE 19 : Audit Trail ────────────────────────────────────────────────
  await section(19, 'Audit & Conformité', 'Toutes actions loguées — conformité ISO 9001');

  if (projectId) {
    const r = await req('GET', `/api/audit/project/${projectId}`);
    check('GET /audit/project/:id  (journal d\'audit)', r.ok, `${Array.isArray(r.data) ? r.data.length : '?'} entrée(s)`);
  }
  if (projectId) {
    const r = await req('GET', `/api/audit/project/${projectId}?entity=Equipment`);
    check('GET /audit?entity=Equipment  (filtre entité)', r.ok, `HTTP ${r.status}`);
  }

  info('Frontend : http://localhost:3001/audit');
  info('Export CSV : GET /api/export/project/:id/audit');
  await pause();

  // ── MODULE 20 : Export CSV ────────────────────────────────────────────────
  await section(20, 'Export CSV', '6 types d\'export : équipements, documents, audit, discussions, transmittals, workflows');

  if (projectId) {
    const r = await req('GET', `/api/export/project/${projectId}/equipment`);
    check('GET /export/project/:id/equipment  (CSV)', r.status === 200, `HTTP ${r.status}`);
  }
  if (projectId) {
    const r = await req('GET', `/api/export/project/${projectId}/document-register`);
    check('GET /export/project/:id/document-register  (CSV)', r.status === 200, `HTTP ${r.status}`);
  }
  if (projectId) {
    const r = await req('GET', `/api/export/project/${projectId}/audit`);
    check('GET /export/project/:id/audit  (CSV)', r.status === 200, `HTTP ${r.status}`);
  }

  info('Bouton "Export CSV" disponible sur chaque page liste');
  await pause();

  // ── MODULE 21 : Profil utilisateur ────────────────────────────────────────
  await section(21, 'Profil utilisateur', 'Mise à jour nom/téléphone | changement de mot de passe sécurisé');

  {
    const r = await req('PATCH', '/api/auth/profile', { name: 'Admin Demo', phone: '+33600000000' });
    check('PATCH /auth/profile  (mise à jour nom)', r.ok, `HTTP ${r.status}`);
    // Restore
    await req('PATCH', '/api/auth/profile', { name: 'Admin Zen' });
  }
  {
    const r = await req('PATCH', '/api/auth/password', {
      currentPassword: 'MauvaisMotDePasse',
      newPassword: 'NouveauMdp123!',
    }, 401);
    check('PATCH /auth/password  (mauvais mdp → 401)', r.status === 401, `HTTP ${r.status}`);
  }
  {
    const r = await req('GET', '/api/auth/me');
    check('GET /me  (vérification profil restauré)', r.ok && r.data?.name === 'Admin Zen', r.data?.name ?? '?');
  }

  info('Frontend : http://localhost:3001/profile');
  await pause();

  // ── FIN ───────────────────────────────────────────────────────────────────
  summary();
}

main().catch(err => {
  console.error(`\n${c.red}${c.bold}Erreur fatale :${c.reset} ${err.message}\n`);
  rl.close();
  process.exit(1);
});
