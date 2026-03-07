// ─── Données Mock Complètes — Zengineering V4.1 ──────────────────────────────

export const PROJECT = {
  id: "zen-v4",
  name: "Zengineering SaaS",
  version: "4.0.0",
  client: "Industrie Nouvelle SA",
  startDate: "2025-11-01",
  targetDate: "2026-04-30",
  status: "IN_PROGRESS",
  description: "Plateforme SaaS de gestion de projets industriels multi-métiers",

  // ── Équipe ──────────────────────────────────────────────────────────────────
  team: [
    { id: "u1", name: "Alice Martin",    role: "Chef de Projet",    load: 85, email: "alice@zen.io",   avatar: "AM", discipline: "management" },
    { id: "u2", name: "Bob Leclerc",     role: "Lead Dev Frontend", load: 92, email: "bob@zen.io",     avatar: "BL", discipline: "frontend" },
    { id: "u3", name: "Claire Dupont",   role: "Lead Dev Backend",  load: 78, email: "claire@zen.io",  avatar: "CD", discipline: "backend" },
    { id: "u4", name: "David Morin",     role: "DevOps",            load: 65, email: "david@zen.io",   avatar: "DM", discipline: "devops" },
    { id: "u5", name: "Emma Bernard",    role: "QA Engineer",       load: 80, email: "emma@zen.io",    avatar: "EB", discipline: "qa" },
    { id: "u6", name: "François Petit",  role: "Ingénieur Process", load: 70, email: "francois@zen.io",avatar: "FP", discipline: "process" },
    { id: "u7", name: "Gérard Blanc",    role: "Acheteur",          load: 60, email: "gerard@zen.io",  avatar: "GB", discipline: "achat" },
  ],

  // ── Sprints & Tâches ────────────────────────────────────────────────────────
  sprints: [
    {
      id: "s1", name: "Sprint 1", status: "DONE",
      startDate: "2025-11-01", endDate: "2025-11-14",
      plannedPoints: 40, velocity: 38,
      tasks: [
        { id: "t1",  title: "Setup infrastructure AWS",         status: "DONE",        points: 8,  assignee: "u4", tags: ["infra"] },
        { id: "t2",  title: "Auth JWT + rôles",                 status: "DONE",        points: 10, assignee: "u3", tags: ["backend","auth"] },
        { id: "t3",  title: "Design system + composants base",  status: "DONE",        points: 8,  assignee: "u2", tags: ["frontend"] },
        { id: "t4",  title: "CI/CD pipeline GitHub Actions",    status: "DONE",        points: 6,  assignee: "u4", tags: ["devops"] },
        { id: "t5",  title: "Tests unitaires auth",             status: "DONE",        points: 6,  assignee: "u5", tags: ["qa"] },
      ]
    },
    {
      id: "s2", name: "Sprint 2", status: "DONE",
      startDate: "2025-11-15", endDate: "2025-11-28",
      plannedPoints: 45, velocity: 42,
      tasks: [
        { id: "t6",  title: "Module Équipements CRUD",          status: "DONE",        points: 10, assignee: "u3", tags: ["backend"] },
        { id: "t7",  title: "Interface liste équipements",      status: "DONE",        points: 8,  assignee: "u2", tags: ["frontend"] },
        { id: "t8",  title: "Module Documents upload/versionning",status: "DONE",      points: 12, assignee: "u3", tags: ["backend","documents"] },
        { id: "t9",  title: "Workflow validation documents",    status: "DONE",        points: 8,  assignee: "u1", tags: ["workflow"] },
        { id: "t10", title: "Tests intégration équipements",    status: "DONE",        points: 7,  assignee: "u5", tags: ["qa"] },
      ]
    },
    {
      id: "s3", name: "Sprint 3", status: "IN_PROGRESS",
      startDate: "2026-02-12", endDate: "2026-02-26",
      plannedPoints: 52, velocity: null,
      tasks: [
        { id: "t11", title: "Module Transmittals",              status: "IN_PROGRESS", points: 12, assignee: "u3", tags: ["backend","comm"] },
        { id: "t12", title: "Interface Transmittals",           status: "IN_PROGRESS", points: 10, assignee: "u2", tags: ["frontend","comm"] },
        { id: "t13", title: "Intégration email IMAP",           status: "IN_PROGRESS", points: 8,  assignee: "u3", tags: ["mail"] },
        { id: "t14", title: "Dashboard métriques temps réel",   status: "TODO",        points: 8,  assignee: "u2", tags: ["frontend"] },
        { id: "t15", title: "Module Achats fournisseurs",       status: "TODO",        points: 10, assignee: "u7", tags: ["achat"] },
        { id: "t16", title: "Tests E2E Sprint 3",               status: "TODO",        points: 4,  assignee: "u5", tags: ["qa"] },
        { id: "t17", title: "Correction bug upload PDF > 10MB", status: "BLOCKED",     points: 5,  assignee: "u3", tags: ["bug"], blockedBy: "Limitation S3 à configurer" },
        { id: "t18", title: "Rapport AGO automatique",          status: "BLOCKED",     points: 3,  assignee: "u1", tags: ["reporting"], blockedBy: "Données comptables manquantes" },
      ]
    },
    {
      id: "s4", name: "Sprint 4", status: "PLANNED",
      startDate: "2026-03-01", endDate: "2026-03-14",
      plannedPoints: 55, velocity: null,
      tasks: [
        { id: "t19", title: "Module Planning Gantt",            status: "TODO",        points: 15, assignee: "u2", tags: ["frontend","planning"] },
        { id: "t20", title: "Notifications temps réel WebSocket",status: "TODO",       points: 10, assignee: "u3", tags: ["backend","realtime"] },
        { id: "t21", title: "Export multi-formats PDF/Excel",   status: "TODO",        points: 12, assignee: "u6", tags: ["export"] },
        { id: "t22", title: "Module Pièces de rechange",        status: "TODO",        points: 8,  assignee: "u6", tags: ["spare-parts"] },
        { id: "t23", title: "Tests performance et charge",      status: "TODO",        points: 10, assignee: "u5", tags: ["qa","perf"] },
      ]
    },
    {
      id: "s5", name: "Sprint 5", status: "PLANNED",
      startDate: "2026-03-15", endDate: "2026-03-28",
      plannedPoints: 50, velocity: null,
      tasks: [
        { id: "t24", title: "Module Inspections qualité",       status: "TODO",        points: 12, assignee: "u5", tags: ["qa","inspection"] },
        { id: "t25", title: "Tableau de bord direction",        status: "TODO",        points: 10, assignee: "u1", tags: ["reporting"] },
        { id: "t26", title: "Intégration SSO entreprise",       status: "TODO",        points: 14, assignee: "u4", tags: ["auth","devops"] },
        { id: "t27", title: "Documentation API complète",       status: "TODO",        points: 8,  assignee: "u3", tags: ["docs"] },
        { id: "t28", title: "UAT client final",                 status: "TODO",        points: 6,  assignee: "u1", tags: ["uat"] },
      ]
    },
  ],

  // ── Risques ─────────────────────────────────────────────────────────────────
  risks: [
    { id: "r1", title: "Dérive délai Sprint 3",          probability: "HIGH",   impact: "HIGH",   status: "OPEN",   owner: "u1", mitigation: "Réduction scope, priorisation", dueDate: "2026-02-26" },
    { id: "r2", title: "Surcharge Bob Leclerc (92%)",    probability: "HIGH",   impact: "MEDIUM", status: "OPEN",   owner: "u1", mitigation: "Redistribution tâches frontend", dueDate: "2026-03-07" },
    { id: "r3", title: "Bug upload PDF non résolu",       probability: "MEDIUM", impact: "HIGH",   status: "OPEN",   owner: "u3", mitigation: "Config S3 multi-part upload", dueDate: "2026-03-10" },
    { id: "r4", title: "Données comptables manquantes",  probability: "LOW",    impact: "MEDIUM", status: "WATCH",  owner: "u7", mitigation: "Contact service comptabilité client", dueDate: "2026-03-15" },
    { id: "r5", title: "Dépendance lib tierces obsolètes",probability: "LOW",   impact: "LOW",    status: "WATCH",  owner: "u4", mitigation: "Audit dépendances planifié S4", dueDate: "2026-03-20" },
    { id: "r6", title: "Performance API < cible 200ms",  probability: "MEDIUM", impact: "HIGH",   status: "OPEN",   owner: "u3", mitigation: "Optimisation requêtes, mise en cache Redis", dueDate: "2026-03-15" },
  ],

  // ── Budget ───────────────────────────────────────────────────────────────────
  budget: {
    total: 480000,
    spent: 312000,
    breakdown: {
      development: 204000,
      infrastructure: 56000,
      tooling: 22000,
      management: 30000,
    },
    byMonth: [
      { month: "Nov 25", planned: 80000, actual: 78000 },
      { month: "Déc 25", planned: 80000, actual: 82000 },
      { month: "Jan 26", planned: 80000, actual: 76000 },
      { month: "Fév 26", planned: 80000, actual: 76000 },
    ]
  },

  // ── Code Metrics ─────────────────────────────────────────────────────────────
  codeMetrics: {
    coverage: 74,
    openPRs: 5,
    mergedThisWeek: 8,
    openBugs: 7,
    criticalBugs: 1,
    technicalDebt: "18h",
    lastDeploy: "2026-03-01",
    linesOfCode: 28400,
    commits30d: 142,
  },

  // ── Déploiements ─────────────────────────────────────────────────────────────
  deployments: [
    { id: "d1", env: "prod",    version: "3.2.1", date: "2026-02-15", status: "SUCCESS", by: "u4", duration: "4m12s" },
    { id: "d2", env: "staging", version: "3.3.0", date: "2026-03-01", status: "SUCCESS", by: "u4", duration: "3m48s" },
    { id: "d3", env: "dev",     version: "3.4.0-rc1", date: "2026-03-06", status: "SUCCESS", by: "u3", duration: "2m55s" },
  ],

  // ── Documents ────────────────────────────────────────────────────────────────
  documents: [
    { id: "doc1",  title: "Cahier des Charges Fonctionnel",   type: "CDC",          status: "APPROVED", rev: "B", date: "2025-11-15", author: "u1", size: "2.4 MB", tags: ["contractuel"] },
    { id: "doc2",  title: "Architecture Technique V4",         type: "SPEC_TECH",    status: "APPROVED", rev: "A", date: "2025-11-20", author: "u3", size: "1.8 MB", tags: ["technique"] },
    { id: "doc3",  title: "Plan Qualité Projet",               type: "PQP",          status: "APPROVED", rev: "A", date: "2025-12-01", author: "u5", size: "0.9 MB", tags: ["qualite"] },
    { id: "doc4",  title: "Schéma BDD PostgreSQL",             type: "SPEC_TECH",    status: "IN_REVIEW", rev: "C", date: "2026-01-10", author: "u3", size: "0.5 MB", tags: ["technique"] },
    { id: "doc5",  title: "Manuel Utilisateur v1",             type: "USER_MANUAL",  status: "DRAFT",    rev: "A", date: "2026-02-05", author: "u1", size: "3.1 MB", tags: ["docs"] },
    { id: "doc6",  title: "Rapport Avancement Sprint 2",       type: "REPORT",       status: "APPROVED", rev: "A", date: "2025-11-28", author: "u1", size: "0.4 MB", tags: ["reporting"] },
    { id: "doc7",  title: "Spécification API REST",            type: "SPEC_TECH",    status: "IN_REVIEW", rev: "B", date: "2026-02-20", author: "u3", size: "1.2 MB", tags: ["technique","api"] },
    { id: "doc8",  title: "Plan de Tests Sprint 3",            type: "TEST_PLAN",    status: "DRAFT",    rev: "A", date: "2026-02-12", author: "u5", size: "0.7 MB", tags: ["qa"] },
    { id: "doc9",  title: "Contrat Maintenance v1",            type: "CONTRACT",     status: "APPROVED", rev: "A", date: "2025-11-01", author: "u7", size: "1.5 MB", tags: ["contractuel"] },
    { id: "doc10", title: "Procédure Déploiement Production",  type: "PROCEDURE",    status: "APPROVED", rev: "B", date: "2026-01-20", author: "u4", size: "0.6 MB", tags: ["devops"] },
  ],

  // ── Transmittals ─────────────────────────────────────────────────────────────
  transmittals: [
    { id: "tr1", ref: "ZEN-TRM-001", subject: "Envoi CDC pour validation client", from: "u1", to: "client@industrie.fr", date: "2025-11-16", status: "ACKNOWLEDGED", docs: ["doc1"], response: "Approuvé avec commentaires" },
    { id: "tr2", ref: "ZEN-TRM-002", subject: "Spécification technique architecture",from: "u3", to: "client@industrie.fr", date: "2025-11-21", status: "PENDING",       docs: ["doc2","doc7"], response: null },
    { id: "tr3", ref: "ZEN-TRM-003", subject: "Rapport avancement mensuel Janvier", from: "u1", to: "direction@industrie.fr", date: "2026-02-01", status: "ACKNOWLEDGED", docs: ["doc6"], response: "OK, continuer" },
    { id: "tr4", ref: "ZEN-TRM-004", subject: "Plan qualité pour audit",            from: "u5", to: "audit@certif.fr", date: "2026-02-10", status: "PENDING",       docs: ["doc3","doc8"], response: null },
  ],

  // ── Emails entrants ───────────────────────────────────────────────────────────
  emails: [
    { id: "em1", from: "client@industrie.fr", subject: "Questions sur le CDC section 3.2", date: "2026-02-18", status: "UNREAD", priority: "HIGH",   linkedDoc: "doc1", excerpt: "Nous avons quelques questions concernant les spécifications de la section 3.2..." },
    { id: "em2", from: "fournisseur@aws.com",  subject: "Renouvellement contrat S3 - Offre",date: "2026-02-20", status: "READ",   priority: "MEDIUM", linkedDoc: null,   excerpt: "Votre contrat AWS S3 arrive à expiration le 31 mars 2026..." },
    { id: "em3", from: "audit@certif.fr",      subject: "Planification audit ISO 9001",     date: "2026-03-01", status: "UNREAD", priority: "HIGH",   linkedDoc: "doc3", excerpt: "Nous vous proposons d'organiser l'audit de certification le 15 avril..." },
    { id: "em4", from: "direction@industrie.fr",subject: "Budget Q1 validé",                date: "2026-03-03", status: "READ",   priority: "LOW",    linkedDoc: null,   excerpt: "Le budget Q1 a été validé en comité de direction. Vous pouvez continuer..." },
    { id: "em5", from: "client@industrie.fr",  subject: "Demande démo sprint 3",            date: "2026-03-05", status: "UNREAD", priority: "MEDIUM", linkedDoc: null,   excerpt: "Pourriez-vous organiser une démonstration des livrables Sprint 3 la semaine prochaine?" },
  ],

  // ── Discussions ───────────────────────────────────────────────────────────────
  discussions: [
    { id: "disc1", title: "Architecture WebSocket notifications",  channel: "technique",  author: "u3", date: "2026-03-01", replies: 8,  status: "OPEN",   lastReply: "u2" },
    { id: "disc2", title: "Choix librairie Gantt frontend",        channel: "frontend",   author: "u2", date: "2026-03-02", replies: 12, status: "OPEN",   lastReply: "u1" },
    { id: "disc3", title: "Process validation documents client",   channel: "workflow",   author: "u1", date: "2026-02-28", replies: 5,  status: "RESOLVED",lastReply: "u5" },
    { id: "disc4", title: "Bug upload PDF — analyse root cause",   channel: "bugs",       author: "u3", date: "2026-03-04", replies: 15, status: "OPEN",   lastReply: "u4" },
    { id: "disc5", title: "Priorisation Sprint 4",                 channel: "planning",   author: "u1", date: "2026-03-06", replies: 3,  status: "OPEN",   lastReply: "u2" },
  ],

  // ── Équipements ───────────────────────────────────────────────────────────────
  equipment: [
    { id: "eq1",  tag: "P-101",    name: "Pompe centrifuge principale",     type: "Pompe",          status: "OPERATIONAL", location: "Bâtiment A - Zone 1", supplier: "Flowserve",    lastMaintenance: "2026-01-15", nextMaintenance: "2026-07-15", criticality: "HIGH" },
    { id: "eq2",  tag: "V-201",    name: "Vanne de régulation débit",       type: "Vanne",          status: "OPERATIONAL", location: "Bâtiment A - Zone 2", supplier: "Emerson",      lastMaintenance: "2025-12-01", nextMaintenance: "2026-06-01", criticality: "HIGH" },
    { id: "eq3",  tag: "FI-301",   name: "Débitmètre électromagnétique",    type: "Instrumentation",status: "MAINTENANCE", location: "Ligne 1",             supplier: "Endress+H",    lastMaintenance: "2026-02-10", nextMaintenance: "2026-08-10", criticality: "MEDIUM" },
    { id: "eq4",  tag: "TIC-401",  name: "Contrôleur température boucle 1", type: "Contrôle",       status: "OPERATIONAL", location: "Salle de contrôle",   supplier: "Yokogawa",     lastMaintenance: "2025-11-20", nextMaintenance: "2026-05-20", criticality: "HIGH" },
    { id: "eq5",  tag: "E-501",    name: "Échangeur thermique tubulaire",   type: "Échangeur",      status: "OPERATIONAL", location: "Bâtiment B",          supplier: "Alfa Laval",   lastMaintenance: "2026-01-30", nextMaintenance: "2026-07-30", criticality: "MEDIUM" },
    { id: "eq6",  tag: "C-601",    name: "Compresseur air instruments",     type: "Compresseur",    status: "OUT_OF_SERVICE",location: "Utilités",           supplier: "Atlas Copco",  lastMaintenance: "2026-02-01", nextMaintenance: "2026-03-15", criticality: "CRITICAL" },
    { id: "eq7",  tag: "PSV-701",  name: "Soupape de sécurité haute pression",type: "Sécurité",     status: "OPERATIONAL", location: "Bâtiment A - Zone 3", supplier: "Leser",        lastMaintenance: "2025-10-15", nextMaintenance: "2026-04-15", criticality: "CRITICAL" },
  ],

  // ── Pièces de rechange ───────────────────────────────────────────────────────
  spareParts: [
    { id: "sp1",  ref: "SP-P101-001", name: "Garniture mécanique pompe P-101", equipment: "eq1", qty: 2, minQty: 1, unit: "pièce", location: "Magasin A-03", supplier: "Flowserve" },
    { id: "sp2",  ref: "SP-V201-001", name: "Joint siège vanne V-201",         equipment: "eq2", qty: 5, minQty: 2, unit: "pièce", location: "Magasin A-03", supplier: "Emerson"   },
    { id: "sp3",  ref: "SP-C601-001", name: "Filtre à air compresseur C-601",  equipment: "eq6", qty: 0, minQty: 3, unit: "pièce", location: "Magasin B-01", supplier: "Atlas Copco", alert: "STOCK_VIDE" },
    { id: "sp4",  ref: "SP-C601-002", name: "Courroie compresseur C-601",      equipment: "eq6", qty: 1, minQty: 2, unit: "pièce", location: "Magasin B-01", supplier: "Atlas Copco", alert: "STOCK_BAS" },
  ],

  // ── Fournisseurs ─────────────────────────────────────────────────────────────
  vendors: [
    { id: "v1", name: "Flowserve France",   type: "Équipementier", status: "APPROVED", contact: "j.pierre@flowserve.com", contracts: 2, lastOrder: "2025-12-10", rating: 4.5 },
    { id: "v2", name: "Emerson Automation", type: "Instrumentation",status: "APPROVED", contact: "sales@emerson.fr",       contracts: 3, lastOrder: "2026-01-15", rating: 4.8 },
    { id: "v3", name: "Atlas Copco France", type: "Utilités",       status: "APPROVED", contact: "service@atlascopco.fr",  contracts: 1, lastOrder: "2025-11-20", rating: 4.2 },
    { id: "v4", name: "CloudNord SAS",      type: "IT/Cloud",       status: "UNDER_EVAL",contact: "contact@cloudnord.fr",  contracts: 0, lastOrder: null,         rating: null },
  ],

  // ── Organisation ─────────────────────────────────────────────────────────────
  organization: {
    client: { name: "Industrie Nouvelle SA", contact: "M. Duplessis", email: "m.duplessis@industrie.fr", role: "Maître d'ouvrage" },
    pm: { name: "Zengineering SARL", contact: "Alice Martin", email: "alice@zen.io", role: "Maître d'œuvre" },
    disciplines: ["Management", "Frontend", "Backend", "DevOps", "QA", "Process", "Achats"],
    phases: [
      { name: "Phase 1 — Fondations",   status: "DONE",        start: "2025-11-01", end: "2025-11-28" },
      { name: "Phase 2 — Core Modules", status: "IN_PROGRESS", start: "2025-12-01", end: "2026-02-28" },
      { name: "Phase 3 — Intégrations", status: "PLANNED",     start: "2026-03-01", end: "2026-03-31" },
      { name: "Phase 4 — UAT & Go-Live",status: "PLANNED",     start: "2026-04-01", end: "2026-04-30" },
    ]
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getProjectSummary() {
  const allTasks = PROJECT.sprints.flatMap(s => s.tasks);
  const currentSprint = PROJECT.sprints.find(s => s.status === "IN_PROGRESS");
  const doneTasks = allTasks.filter(t => t.status === "DONE").length;
  const openRisks = PROJECT.risks.filter(r => r.status === "OPEN").length;
  const budgetUsed = Math.round((PROJECT.budget.spent / PROJECT.budget.total) * 100);
  const unreadEmails = PROJECT.emails.filter(e => e.status === "UNREAD").length;

  return {
    name: PROJECT.name,
    version: PROJECT.version,
    client: PROJECT.client,
    status: PROJECT.status,
    stats: {
      progress: Math.round((doneTasks / allTasks.length) * 100),
      currentSprint,
      openRisks,
      budgetUsed,
      unreadEmails,
      totalTasks: allTasks.length,
      doneTasks,
      teamSize: PROJECT.team.length,
      openDocuments: PROJECT.documents.filter(d => d.status !== "APPROVED").length,
      equipmentIssues: PROJECT.equipment.filter(e => e.status !== "OPERATIONAL").length,
    }
  };
}
