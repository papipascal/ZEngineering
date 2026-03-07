import { Router } from "express";
import { orchestrate } from "../orchestrator.js";
import { PROJECT, getProjectSummary } from "../data/mockData.js";

const router = Router();
const sessions = new Map();

// ── IA Chat ──────────────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  const { message, sessionId = "default", context = {} } = req.body;
  if (!message) return res.status(400).json({ error: "Message requis" });
  const history = sessions.get(sessionId) || [];
  try {
    const result = await orchestrate({ message, conversationHistory: history, context });
    sessions.set(sessionId, result.conversationHistory);
    res.json({
      response: result.response,
      skillsActivated: result.skillsActivated.map(s => ({ name: s.name, ...skillMeta(s.name) })),
      usage: result.usage,
      sessionId,
    });
  } catch (err) {
    console.error("❌ Orchestrateur:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/session/:id", (req, res) => { sessions.delete(req.params.id); res.json({ cleared: true }); });
router.get("/health", (req, res) => res.json({ status: "ok", version: "4.1.0", timestamp: new Date().toISOString() }));

// ── Projet ──────────────────────────────────────────────────────────────────
router.get("/project", (req, res) => res.json(getProjectSummary()));
router.get("/project/full", (req, res) => res.json(PROJECT));

// ── Planning ─────────────────────────────────────────────────────────────────
router.get("/sprints", (req, res) => res.json(PROJECT.sprints));
router.get("/sprints/:id", (req, res) => {
  const sprint = PROJECT.sprints.find(s => s.id === req.params.id);
  sprint ? res.json(sprint) : res.status(404).json({ error: "Sprint non trouvé" });
});

// ── Tâches ───────────────────────────────────────────────────────────────────
router.get("/tasks", (req, res) => {
  const { status, assignee, sprint } = req.query;
  let tasks = PROJECT.sprints.flatMap(s => s.tasks.map(t => ({ ...t, sprintId: s.id, sprintName: s.name })));
  if (status)   tasks = tasks.filter(t => t.status === status);
  if (assignee) tasks = tasks.filter(t => t.assignee === assignee);
  if (sprint)   tasks = tasks.filter(t => t.sprintId === sprint);
  res.json(tasks.map(t => ({ ...t, assigneeName: PROJECT.team.find(m => m.id === t.assignee)?.name })));
});

// ── Risques ───────────────────────────────────────────────────────────────────
router.get("/risks", (req, res) => {
  const risks = PROJECT.risks.map(r => ({ ...r, ownerName: PROJECT.team.find(m => m.id === r.owner)?.name }));
  res.json(risks);
});

// ── Budget ────────────────────────────────────────────────────────────────────
router.get("/budget", (req, res) => {
  const b = PROJECT.budget;
  res.json({ ...b, percentUsed: Math.round((b.spent / b.total) * 100), remaining: b.total - b.spent });
});

// ── Documents ────────────────────────────────────────────────────────────────
router.get("/documents", (req, res) => {
  const { status, type } = req.query;
  let docs = PROJECT.documents.map(d => ({ ...d, authorName: PROJECT.team.find(m => m.id === d.author)?.name }));
  if (status) docs = docs.filter(d => d.status === status);
  if (type)   docs = docs.filter(d => d.type === type);
  res.json(docs);
});

// ── Transmittals ─────────────────────────────────────────────────────────────
router.get("/transmittals", (req, res) => {
  const transmittals = PROJECT.transmittals.map(t => ({
    ...t, fromName: PROJECT.team.find(m => m.id === t.from)?.name,
    linkedDocs: t.docs.map(docId => PROJECT.documents.find(d => d.id === docId)?.title)
  }));
  res.json(transmittals);
});

// ── Emails ────────────────────────────────────────────────────────────────────
router.get("/emails", (req, res) => {
  const { status } = req.query;
  let emails = PROJECT.emails;
  if (status) emails = emails.filter(e => e.status === status);
  res.json(emails);
});
router.patch("/emails/:id/read", (req, res) => {
  const email = PROJECT.emails.find(e => e.id === req.params.id);
  if (email) { email.status = "READ"; res.json(email); }
  else res.status(404).json({ error: "Email non trouvé" });
});

// ── Discussions ───────────────────────────────────────────────────────────────
router.get("/discussions", (req, res) => {
  const discussions = PROJECT.discussions.map(d => ({
    ...d,
    authorName: PROJECT.team.find(m => m.id === d.author)?.name,
    lastReplyName: PROJECT.team.find(m => m.id === d.lastReply)?.name,
  }));
  res.json(discussions);
});

// ── Équipements ───────────────────────────────────────────────────────────────
router.get("/equipment", (req, res) => {
  const { status, criticality } = req.query;
  let eq = PROJECT.equipment;
  if (status)      eq = eq.filter(e => e.status === status);
  if (criticality) eq = eq.filter(e => e.criticality === criticality);
  res.json(eq);
});
router.get("/equipment/:id", (req, res) => {
  const eq = PROJECT.equipment.find(e => e.id === req.params.id);
  if (!eq) return res.status(404).json({ error: "Équipement non trouvé" });
  const parts = PROJECT.spareParts.filter(p => p.equipment === eq.id);
  res.json({ ...eq, spareParts: parts });
});

// ── Pièces de rechange ────────────────────────────────────────────────────────
router.get("/spare-parts", (req, res) => {
  const parts = PROJECT.spareParts.map(p => ({
    ...p, equipmentTag: PROJECT.equipment.find(e => e.id === p.equipment)?.tag
  }));
  res.json(parts);
});

// ── Fournisseurs ──────────────────────────────────────────────────────────────
router.get("/vendors", (req, res) => res.json(PROJECT.vendors));

// ── Équipe ────────────────────────────────────────────────────────────────────
router.get("/team", (req, res) => res.json(PROJECT.team));

// ── Metrics Code ─────────────────────────────────────────────────────────────
router.get("/metrics", (req, res) => res.json(PROJECT.codeMetrics));

// ── Déploiements ─────────────────────────────────────────────────────────────
router.get("/deployments", (req, res) => {
  const deps = PROJECT.deployments.map(d => ({ ...d, deployerName: PROJECT.team.find(m => m.id === d.by)?.name }));
  res.json(deps);
});

// ── Organisation ──────────────────────────────────────────────────────────────
router.get("/organization", (req, res) => res.json(PROJECT.organization));

// ── Helpers ───────────────────────────────────────────────────────────────────
function skillMeta(name) {
  const meta = {
    planning_skill:      { label: "Planning",       icon: "📅", color: "#0891B2" },
    risk_skill:          { label: "Risques",         icon: "⚠️", color: "#DC2626" },
    code_review_skill:   { label: "Code Review",     icon: "💻", color: "#059669" },
    documentation_skill: { label: "Documentation",   icon: "📄", color: "#D97706" },
    communication_skill: { label: "Communication",   icon: "💬", color: "#7C3AED" },
    finance_skill:       { label: "Finance",         icon: "💰", color: "#0284C7" },
    qa_skill:            { label: "QA",              icon: "🧪", color: "#16A34A" },
    deploy_skill:        { label: "Deploy",          icon: "🚀", color: "#EA580C" },
  };
  return meta[name] || { label: name, icon: "⚙️", color: "#6B7280" };
}

export default router;
