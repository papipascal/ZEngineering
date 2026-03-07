// ─── Données mock du projet Zengineering ────────────────────────────────────
// En production, ces données viendraient de PostgreSQL

export const PROJECT = {
  id: "zen-001",
  name: "Zengineering SaaS V4",
  version: "4.0.0",
  startDate: "2026-01-15",
  targetDate: "2026-12-31",
  status: "IN_PROGRESS",
  budget: { total: 280000, spent: 98500, currency: "EUR" },
  team: [
    { id: "u1", name: "Sophie Martin",   role: "Product Manager",    avatar: "SM", load: 85 },
    { id: "u2", name: "Lucas Bernard",   role: "Lead Developer",     avatar: "LB", load: 92 },
    { id: "u3", name: "Emma Dubois",     role: "Frontend Developer", avatar: "ED", load: 78 },
    { id: "u4", name: "Noah Petit",      role: "Backend Developer",  avatar: "NP", load: 88 },
    { id: "u5", name: "Chloé Leroy",    role: "QA Engineer",        avatar: "CL", load: 65 },
    { id: "u6", name: "Antoine Moreau", role: "DevOps Engineer",    avatar: "AM", load: 70 },
  ],
  sprints: [
    {
      id: "s1", name: "Sprint 1", status: "DONE",
      startDate: "2026-01-15", endDate: "2026-01-29",
      velocity: 42, plannedPoints: 40,
      tasks: [
        { id: "t1",  title: "Setup VPC AWS + subnets",          status: "DONE",    points: 8,  assignee: "u6" },
        { id: "t2",  title: "Auth Service — OAuth2/JWT",         status: "DONE",    points: 13, assignee: "u4" },
        { id: "t3",  title: "Frontend scaffold React 18",        status: "DONE",    points: 5,  assignee: "u3" },
        { id: "t4",  title: "CI/CD pipeline GitHub Actions",     status: "DONE",    points: 8,  assignee: "u6" },
        { id: "t5",  title: "Design system Tailwind + shadcn",   status: "DONE",    points: 8,  assignee: "u3" },
      ]
    },
    {
      id: "s2", name: "Sprint 2", status: "DONE",
      startDate: "2026-01-29", endDate: "2026-02-12",
      velocity: 38, plannedPoints: 45,
      tasks: [
        { id: "t6",  title: "User Service CRUD + RBAC",          status: "DONE",    points: 13, assignee: "u4" },
        { id: "t7",  title: "Dashboard home page UI",            status: "DONE",    points: 8,  assignee: "u3" },
        { id: "t8",  title: "PostgreSQL schema v1",              status: "DONE",    points: 8,  assignee: "u2" },
        { id: "t9",  title: "Redis cache layer setup",           status: "DONE",    points: 5,  assignee: "u4" },
        { id: "t10", title: "E2E tests Playwright setup",        status: "IN_PROGRESS", points: 5, assignee: "u5" },
        { id: "t11", title: "Kafka MSK cluster config",          status: "DONE",    points: 6,  assignee: "u6" },
      ]
    },
    {
      id: "s3", name: "Sprint 3", status: "IN_PROGRESS",
      startDate: "2026-02-12", endDate: "2026-02-26",
      velocity: null, plannedPoints: 52,
      tasks: [
        { id: "t12", title: "Core Business API — endpoints v1",  status: "IN_PROGRESS", points: 13, assignee: "u2" },
        { id: "t13", title: "Notification Service email/SMS",    status: "IN_PROGRESS", points: 8,  assignee: "u4" },
        { id: "t14", title: "File Upload Service + S3",          status: "TODO",    points: 8,  assignee: "u2" },
        { id: "t15", title: "Elasticsearch integration",         status: "TODO",    points: 8,  assignee: "u4" },
        { id: "t16", title: "Project settings UI page",          status: "IN_PROGRESS", points: 5, assignee: "u3" },
        { id: "t17", title: "API documentation OpenAPI",         status: "TODO",    points: 5,  assignee: "u2" },
        { id: "t18", title: "Performance tests k6",             status: "BLOCKED", points: 5,  assignee: "u5", blockedBy: "t12" },
      ]
    },
    {
      id: "s4", name: "Sprint 4", status: "PLANNED",
      startDate: "2026-02-26", endDate: "2026-03-12",
      velocity: null, plannedPoints: 50,
      tasks: [
        { id: "t19", title: "Analytics Service + dashboard",    status: "TODO",    points: 13, assignee: "u2" },
        { id: "t20", title: "Multi-tenant Row Level Security",  status: "TODO",    points: 13, assignee: "u4" },
        { id: "t21", title: "Mobile responsive UI",             status: "TODO",    points: 8,  assignee: "u3" },
        { id: "t22", title: "WAF + Shield configuration",       status: "TODO",    points: 8,  assignee: "u6" },
        { id: "t23", title: "Client reporting module",          status: "TODO",    points: 8,  assignee: "u3" },
      ]
    }
  ],
  risks: [
    { id: "r1", title: "Retard Core Business API",       probability: "HIGH",   impact: "HIGH",   status: "OPEN",   owner: "u2", mitigation: "Pair programming + daily sync" },
    { id: "r2", title: "Dépassement budget infra AWS",   probability: "MEDIUM", impact: "MEDIUM", status: "OPEN",   owner: "u6", mitigation: "FinOps review hebdomadaire" },
    { id: "r3", title: "Dette technique tests E2E",      probability: "HIGH",   impact: "LOW",    status: "OPEN",   owner: "u5", mitigation: "Sprint dédié QA en S5" },
    { id: "r4", title: "Complexité multi-tenant",        probability: "MEDIUM", impact: "HIGH",   status: "WATCH",  owner: "u2", mitigation: "PoC Row Level Security S3" },
    { id: "r5", title: "Disponibilité Antoine DevOps",   probability: "LOW",    impact: "HIGH",   status: "CLOSED", owner: "u1", mitigation: "Backup identifié externalisé" },
  ],
  codeMetrics: {
    coverage: 74,
    openPRs: 5,
    mergedThisWeek: 11,
    openBugs: 8,
    criticalBugs: 1,
    technicalDebt: "2d 4h",
    lastDeploy: "2026-02-28",
    deployEnv: "staging",
  },
  deployments: [
    { id: "d1", env: "dev",     version: "4.0.0-dev.38",    date: "2026-03-01", status: "SUCCESS", by: "u6" },
    { id: "d2", env: "staging", version: "4.0.0-staging.12", date: "2026-02-28", status: "SUCCESS", by: "u6" },
    { id: "d3", env: "prod",    version: "4.0.0-beta.2",    date: "2026-02-20", status: "SUCCESS", by: "u1" },
  ],
};

export function getProjectSummary() {
  const allTasks = PROJECT.sprints.flatMap(s => s.tasks);
  const doneTasks = allTasks.filter(t => t.status === "DONE").length;
  const totalPoints = PROJECT.sprints.reduce((s, sp) => s + sp.plannedPoints, 0);
  const donePoints = PROJECT.sprints
    .filter(s => s.status === "DONE")
    .reduce((s, sp) => s + sp.velocity, 0);

  return {
    ...PROJECT,
    stats: {
      totalTasks: allTasks.length,
      doneTasks,
      progress: Math.round((doneTasks / allTasks.length) * 100),
      pointProgress: Math.round((donePoints / totalPoints) * 100),
      budgetUsed: Math.round((PROJECT.budget.spent / PROJECT.budget.total) * 100),
      openRisks: PROJECT.risks.filter(r => r.status === "OPEN").length,
      currentSprint: PROJECT.sprints.find(s => s.status === "IN_PROGRESS"),
    }
  };
}
