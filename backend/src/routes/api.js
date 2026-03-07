// ─── Routes API ───────────────────────────────────────────────────────────────
import { Router } from "express";
import { orchestrate } from "../orchestrator.js";
import { getProjectSummary } from "../data/mockProject.js";

const router = Router();

// Sessions de conversation en mémoire (en prod → Redis)
const sessions = new Map();

// ── POST /api/chat ─────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  const { message, sessionId = "default" } = req.body;
  if (!message) return res.status(400).json({ error: "Message requis" });

  const history = sessions.get(sessionId) || [];

  try {
    const result = await orchestrate({ message, conversationHistory: history });
    sessions.set(sessionId, result.conversationHistory);

    res.json({
      response: result.response,
      skillsActivated: result.skillsActivated.map(s => ({
        name: s.name,
        label: skillLabel(s.name),
        icon: skillIcon(s.name),
        color: skillColor(s.name),
      })),
      usage: result.usage,
      sessionId,
    });
  } catch (err) {
    console.error("❌ Erreur orchestrateur:", err.message);
    res.status(500).json({ error: err.message || "Erreur lors de l'appel à Claude" });
  }
});

// ── GET /api/project ───────────────────────────────────────────────────────
router.get("/project", (req, res) => {
  res.json(getProjectSummary());
});

// ── DELETE /api/session/:id ────────────────────────────────────────────────
router.delete("/session/:id", (req, res) => {
  sessions.delete(req.params.id);
  res.json({ cleared: true });
});

// ── GET /api/health ────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.json({ status: "ok", version: "4.0.0", timestamp: new Date().toISOString() });
});

// ── Helpers ────────────────────────────────────────────────────────────────
function skillLabel(name) {
  const labels = {
    planning_skill: "Planning", risk_skill: "Risk", code_review_skill: "Code Review",
    documentation_skill: "Documentation", communication_skill: "Communication",
    finance_skill: "Finance", qa_skill: "QA", deploy_skill: "Deploy",
  };
  return labels[name] || name;
}

function skillIcon(name) {
  const icons = {
    planning_skill: "📅", risk_skill: "⚠️", code_review_skill: "💻",
    documentation_skill: "📄", communication_skill: "💬",
    finance_skill: "💰", qa_skill: "🧪", deploy_skill: "🚀",
  };
  return icons[name] || "⚙️";
}

function skillColor(name) {
  const colors = {
    planning_skill: "#0891B2", risk_skill: "#DC2626", code_review_skill: "#059669",
    documentation_skill: "#D97706", communication_skill: "#7C3AED",
    finance_skill: "#0284C7", qa_skill: "#16A34A", deploy_skill: "#EA580C",
  };
  return colors[name] || "#6B7280";
}

export default router;
