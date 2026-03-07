// ─── Définition des 8 Skills comme Tools Anthropic ──────────────────────────
import { PROJECT, getProjectSummary } from "../data/mockData.js";

// ── Définitions des tools pour Claude ────────────────────────────────────────
export const SKILL_TOOLS = [
  {
    name: "planning_skill",
    description: "Gère la planification du projet Zengineering : sprints, tâches, jalons, vélocité, affectations. Utilise ce skill pour tout ce qui concerne l'organisation, la planification, les sprints, les timelines, la charge équipe.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get_sprint_status", "list_tasks", "get_team_load", "get_velocity", "get_backlog", "get_timeline"],
          description: "L'action de planification à effectuer"
        },
        sprint_id: { type: "string", description: "ID du sprint (optionnel)" },
        assignee_id: { type: "string", description: "ID du membre (optionnel)" }
      },
      required: ["action"]
    }
  },
  {
    name: "risk_skill",
    description: "Identifie, analyse et gère les risques projet. Utilise ce skill pour tout ce qui concerne les risques, alertes, problèmes, blocages, dérives.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list_risks", "get_critical_risks", "get_blocked_tasks", "risk_summary"],
          description: "L'action de gestion des risques"
        }
      },
      required: ["action"]
    }
  },
  {
    name: "code_review_skill",
    description: "Analyse la qualité du code, les métriques, les PRs ouvertes, les bugs. Utilise ce skill pour tout ce qui concerne la qualité code, les pull requests, la dette technique, les bugs.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get_code_metrics", "get_open_prs", "get_bug_report", "get_coverage", "get_tech_debt"],
          description: "L'action d'analyse code"
        }
      },
      required: ["action"]
    }
  },
  {
    name: "documentation_skill",
    description: "Génère et gère la documentation projet : comptes-rendus, notes de sprint, documentation technique. Utilise ce skill pour générer des docs, rapports, résumés.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["generate_sprint_report", "generate_standup_notes", "generate_tech_summary", "generate_changelog"],
          description: "Le type de documentation à générer"
        },
        sprint_id: { type: "string", description: "ID du sprint concerné (optionnel)" }
      },
      required: ["action"]
    }
  },
  {
    name: "communication_skill",
    description: "Rédige des communications : rapports client, emails, messages Slack, présentations de statut. Utilise ce skill pour tout ce qui concerne les communications externes ou internes.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["draft_client_report", "draft_team_update", "draft_status_email", "draft_stakeholder_summary"],
          description: "Le type de communication à rédiger"
        },
        audience: {
          type: "string",
          enum: ["client", "team", "management", "dsi"],
          description: "Le destinataire de la communication"
        }
      },
      required: ["action", "audience"]
    }
  },
  {
    name: "finance_skill",
    description: "Suit le budget, les coûts, les forecasts. Utilise ce skill pour tout ce qui concerne le budget, les dépenses, les coûts, le forecast financier.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get_budget_status", "get_forecast", "get_cost_breakdown", "get_burn_rate"],
          description: "L'action financière"
        }
      },
      required: ["action"]
    }
  },
  {
    name: "qa_skill",
    description: "Gère la qualité et les tests : couverture, bugs, validation, critères d'acceptation. Utilise ce skill pour tout ce qui concerne les tests, la QA, la validation.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get_test_coverage", "get_bug_list", "get_quality_score", "get_acceptance_criteria"],
          description: "L'action QA"
        }
      },
      required: ["action"]
    }
  },
  {
    name: "deploy_skill",
    description: "Gère les déploiements : historique, statut, pipeline CI/CD, environnements. Utilise ce skill pour tout ce qui concerne les déploiements, releases, CI/CD.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get_deploy_history", "get_pipeline_status", "get_environments", "get_last_release"],
          description: "L'action de déploiement"
        }
      },
      required: ["action"]
    }
  }
];

// ── Exécution des Skills ──────────────────────────────────────────────────────
export function executeSkill(skillName, input) {
  const summary = getProjectSummary();

  switch (skillName) {
    case "planning_skill": return executePlanningSkill(input, summary);
    case "risk_skill":     return executeRiskSkill(input, summary);
    case "code_review_skill": return executeCodeSkill(input, summary);
    case "documentation_skill": return executeDocSkill(input, summary);
    case "communication_skill": return executeCommSkill(input, summary);
    case "finance_skill":  return executeFinanceSkill(input, summary);
    case "qa_skill":       return executeQASkill(input, summary);
    case "deploy_skill":   return executeDeploySkill(input, summary);
    default: return { error: `Skill inconnu : ${skillName}` };
  }
}

// ── Planning Skill ────────────────────────────────────────────────────────────
function executePlanningSkill({ action, sprint_id }, summary) {
  switch (action) {
    case "get_sprint_status": {
      const sprint = sprint_id
        ? PROJECT.sprints.find(s => s.id === sprint_id)
        : summary.stats.currentSprint;
      if (!sprint) return { error: "Sprint non trouvé" };
      const done   = sprint.tasks.filter(t => t.status === "DONE").length;
      const total  = sprint.tasks.length;
      return {
        sprint: sprint.name, status: sprint.status,
        period: `${sprint.startDate} → ${sprint.endDate}`,
        tasks: { total, done, inProgress: sprint.tasks.filter(t => t.status === "IN_PROGRESS").length,
                 todo: sprint.tasks.filter(t => t.status === "TODO").length,
                 blocked: sprint.tasks.filter(t => t.status === "BLOCKED").length },
        points: { planned: sprint.plannedPoints, velocity: sprint.velocity },
        completion: `${Math.round((done / total) * 100)}%`,
        taskDetails: sprint.tasks.map(t => ({
          title: t.title, status: t.status, points: t.points,
          assignee: PROJECT.team.find(m => m.id === t.assignee)?.name
        }))
      };
    }
    case "list_tasks": {
      const sprint = summary.stats.currentSprint;
      return { sprint: sprint?.name, tasks: sprint?.tasks.map(t => ({
        ...t, assigneeName: PROJECT.team.find(m => m.id === t.assignee)?.name
      })) };
    }
    case "get_team_load":
      return { team: PROJECT.team.map(m => ({ name: m.name, role: m.role, load: `${m.load}%`,
               alert: m.load > 90 ? "⚠️ Surcharge" : m.load > 80 ? "⚡ Charge élevée" : "✅ OK" })) };
    case "get_velocity":
      return { sprints: PROJECT.sprints.filter(s => s.velocity).map(s => ({
               sprint: s.name, planned: s.plannedPoints, actual: s.velocity,
               efficiency: `${Math.round((s.velocity / s.plannedPoints) * 100)}%` })),
               averageVelocity: Math.round(PROJECT.sprints.filter(s => s.velocity)
                 .reduce((a, s) => a + s.velocity, 0) / PROJECT.sprints.filter(s => s.velocity).length) };
    case "get_backlog":
      return { backlog: PROJECT.sprints.filter(s => s.status === "PLANNED")
               .flatMap(s => s.tasks).map(t => ({ ...t, assigneeName: PROJECT.team.find(m => m.id === t.assignee)?.name })) };
    case "get_timeline":
      return { project: PROJECT.name, start: PROJECT.startDate, target: PROJECT.targetDate,
               sprints: PROJECT.sprints.map(s => ({ name: s.name, status: s.status,
               period: `${s.startDate} → ${s.endDate}`, points: s.plannedPoints })) };
  }
}

// ── Risk Skill ────────────────────────────────────────────────────────────────
function executeRiskSkill({ action }, summary) {
  switch (action) {
    case "list_risks":
      return { risks: PROJECT.risks, total: PROJECT.risks.length,
               open: PROJECT.risks.filter(r => r.status === "OPEN").length };
    case "get_critical_risks":
      return { critical: PROJECT.risks.filter(r => r.probability === "HIGH" && r.status === "OPEN")
               .map(r => ({ ...r, ownerName: PROJECT.team.find(m => m.id === r.owner)?.name })) };
    case "get_blocked_tasks":
      const blocked = PROJECT.sprints.flatMap(s => s.tasks).filter(t => t.status === "BLOCKED");
      return { blocked, count: blocked.length,
               details: blocked.map(t => ({ task: t.title, blockedBy: t.blockedBy,
               assignee: PROJECT.team.find(m => m.id === t.assignee)?.name })) };
    case "risk_summary":
      return { summary: {
        total: PROJECT.risks.length,
        byStatus: { open: PROJECT.risks.filter(r => r.status === "OPEN").length,
                    watch: PROJECT.risks.filter(r => r.status === "WATCH").length,
                    closed: PROJECT.risks.filter(r => r.status === "CLOSED").length },
        highPriority: PROJECT.risks.filter(r => r.probability === "HIGH" || r.impact === "HIGH").length,
        recommendation: summary.stats.openRisks > 2 ? "⚠️ Niveau de risque élevé — revue immédiate recommandée" : "✅ Risques sous contrôle"
      }};
  }
}

// ── Code Skill ────────────────────────────────────────────────────────────────
function executeCodeSkill({ action }, summary) {
  const m = PROJECT.codeMetrics;
  switch (action) {
    case "get_code_metrics":
      return { coverage: `${m.coverage}%`, openPRs: m.openPRs, mergedThisWeek: m.mergedThisWeek,
               openBugs: m.openBugs, criticalBugs: m.criticalBugs, technicalDebt: m.technicalDebt,
               coverageStatus: m.coverage >= 80 ? "✅ Bon" : m.coverage >= 70 ? "⚡ Acceptable" : "⚠️ Insuffisant" };
    case "get_open_prs":
      return { count: m.openPRs, merged_this_week: m.mergedThisWeek,
               note: m.openPRs > 4 ? "⚠️ Beaucoup de PRs en attente — reviewer mobilisation recommandée" : "✅ OK" };
    case "get_bug_report":
      return { total: m.openBugs, critical: m.criticalBugs,
               priority: m.criticalBugs > 0 ? "🔴 Bug critique en cours — traitement prioritaire requis" : "✅ Aucun bug critique" };
    case "get_coverage":
      return { coverage: m.coverage, target: 85, gap: 85 - m.coverage,
               status: m.coverage >= 85 ? "✅ Objectif atteint" : `⚠️ ${85 - m.coverage}% manquants pour atteindre l'objectif` };
    case "get_tech_debt":
      return { debt: m.technicalDebt, level: "MEDIUM", mainAreas: ["Tests E2E manquants", "Documentation API incomplète", "Quelques any TypeScript à typer"] };
  }
}

// ── Documentation Skill ───────────────────────────────────────────────────────
function executeDocSkill({ action, sprint_id }, summary) {
  const sprint = sprint_id
    ? PROJECT.sprints.find(s => s.id === sprint_id)
    : summary.stats.currentSprint;

  switch (action) {
    case "generate_sprint_report":
      const done = sprint.tasks.filter(t => t.status === "DONE");
      const blocked = sprint.tasks.filter(t => t.status === "BLOCKED");
      return {
        document: "RAPPORT DE SPRINT",
        sprint: sprint.name, period: `${sprint.startDate} → ${sprint.endDate}`,
        sections: {
          completed: done.map(t => `✅ ${t.title}`),
          inProgress: sprint.tasks.filter(t => t.status === "IN_PROGRESS").map(t => `🔄 ${t.title}`),
          blocked: blocked.map(t => `🚫 ${t.title} (bloqué par: ${t.blockedBy})`),
          nextSteps: ["Débloquer les tâches en attente", "Review code metrics", "Préparer sprint planning S4"]
        }
      };
    case "generate_standup_notes":
      return {
        document: "NOTES DAILY STANDUP",
        date: new Date().toLocaleDateString("fr-FR"),
        team: PROJECT.team.map(m => ({
          name: m.name, done: "Avancement sur tâches Sprint 3",
          todo: "Continuation", blockers: m.load > 90 ? "Surcharge à résoudre" : "Aucun"
        }))
      };
    case "generate_tech_summary":
      return {
        document: "SYNTHÈSE TECHNIQUE",
        version: PROJECT.version,
        techStack: { frontend: "React 18 + TypeScript + Tailwind", backend: "NestJS + GraphQL", db: "PostgreSQL + Redis", infra: "AWS EKS + Multi-AZ" },
        metrics: PROJECT.codeMetrics,
        deployments: PROJECT.deployments
      };
    case "generate_changelog":
      return {
        document: "CHANGELOG V4",
        entries: PROJECT.sprints.filter(s => s.status === "DONE").flatMap(s =>
          s.tasks.filter(t => t.status === "DONE").map(t => ({ sprint: s.name, feature: t.title, points: t.points }))
        )
      };
  }
}

// ── Communication Skill ───────────────────────────────────────────────────────
function executeCommSkill({ action, audience }, summary) {
  const s = summary.stats;
  switch (action) {
    case "draft_client_report":
      return {
        document: "RAPPORT CLIENT",
        subject: `Zengineering V4 — Rapport d'avancement — ${new Date().toLocaleDateString("fr-FR")}`,
        body: `Bonjour,\n\nVoici l'avancement du projet Zengineering V4 cette semaine.\n\n📊 AVANCEMENT GLOBAL\n• Progression : ${s.progress}% des tâches complétées\n• Sprint en cours : ${s.currentSprint?.name}\n• Budget consommé : ${s.budgetUsed}% (${PROJECT.budget.spent.toLocaleString("fr-FR")}€ / ${PROJECT.budget.total.toLocaleString("fr-FR")}€)\n\n✅ LIVRÉ CETTE SEMAINE\n• ${PROJECT.codeMetrics.mergedThisWeek} pull requests mergées\n• Déploiement staging réussi le ${PROJECT.codeMetrics.lastDeploy}\n\n⚠️ POINTS D'ATTENTION\n• ${s.openRisks} risques ouverts en cours de mitigation\n• ${PROJECT.codeMetrics.openBugs} bugs ouverts (${PROJECT.codeMetrics.criticalBugs} critique)\n\nProchaine étape : Démo Sprint 3 vendredi prochain.\n\nCordialement,\nL'équipe Zengineering`
      };
    case "draft_team_update":
      return {
        document: "MESSAGE ÉQUIPE",
        channel: "#zengineering-team",
        body: `👋 *Update hebdo — Zengineering V4*\n\n📈 Avancement sprint 3 : ${s.progress}% global\n🔀 PRs mergées cette semaine : ${PROJECT.codeMetrics.mergedThisWeek}\n🐛 Bugs ouverts : ${PROJECT.codeMetrics.openBugs} (${PROJECT.codeMetrics.criticalBugs} critique)\n⚠️ Tâche bloquée : voir t18 — débloquer en priorité\n\n💪 Belle semaine à tous !`
      };
    case "draft_status_email":
      return {
        document: "EMAIL STATUT",
        to: audience === "dsi" ? "dsi@client.com" : "stakeholders@client.com",
        subject: `[Zengineering V4] Statut projet — Semaine ${Math.ceil(new Date().getDate() / 7)}`,
        body: `Statut : 🟡 EN COURS\nAvancement : ${s.progress}%\nBudget : ${s.budgetUsed}% consommé\nRisques ouverts : ${s.openRisks}\nProchain jalon : Fin Sprint 3 — 26/02/2026`
      };
    case "draft_stakeholder_summary":
      return {
        document: "SYNTHÈSE STAKEHOLDERS",
        executive_summary: `Le projet Zengineering V4 avance à ${s.progress}% de complétion avec un budget sous contrôle à ${s.budgetUsed}%. La qualité code est à ${PROJECT.codeMetrics.coverage}% de couverture. ${s.openRisks} risques sont en cours de mitigation.`,
        rag_status: s.budgetUsed > 90 ? "🔴 RED" : s.openRisks > 3 ? "🟡 AMBER" : "🟢 GREEN"
      };
  }
}

// ── Finance Skill ─────────────────────────────────────────────────────────────
function executeFinanceSkill({ action }, summary) {
  const b = PROJECT.budget;
  const burnRate = b.spent / PROJECT.sprints.filter(s => s.status === "DONE").length;
  const remainingSprints = PROJECT.sprints.filter(s => s.status !== "DONE").length;
  switch (action) {
    case "get_budget_status":
      return { total: b.total, spent: b.spent, remaining: b.total - b.spent,
               percentUsed: `${summary.stats.budgetUsed}%`,
               status: summary.stats.budgetUsed > 90 ? "🔴 Critique" : summary.stats.budgetUsed > 70 ? "🟡 Attention" : "🟢 OK" };
    case "get_forecast":
      const forecast = b.spent + burnRate * remainingSprints;
      return { currentSpend: b.spent, estimatedFinal: Math.round(forecast), budget: b.total,
               delta: Math.round(forecast - b.total),
               onBudget: forecast <= b.total,
               message: forecast <= b.total ? `✅ Projet dans le budget (+${Math.round(b.total - forecast)}€ de marge)` : `⚠️ Dépassement estimé de ${Math.round(forecast - b.total)}€` };
    case "get_burn_rate":
      return { burnRatePerSprint: Math.round(burnRate), remainingSprints,
               remainingBudget: b.total - b.spent, projectedEnd: `${new Date(Date.now() + remainingSprints * 14 * 24 * 3600000).toLocaleDateString("fr-FR")}` };
    case "get_cost_breakdown":
      return { breakdown: { development: Math.round(b.spent * 0.65), infrastructure: Math.round(b.spent * 0.18),
               tooling: Math.round(b.spent * 0.07), management: Math.round(b.spent * 0.10) } };
  }
}

// ── QA Skill ──────────────────────────────────────────────────────────────────
function executeQASkill({ action }, summary) {
  const m = PROJECT.codeMetrics;
  switch (action) {
    case "get_test_coverage":
      return { coverage: `${m.coverage}%`, target: "85%", gap: `${85 - m.coverage}%`,
               status: m.coverage >= 85 ? "✅ Objectif atteint" : `⚠️ Objectif non atteint — ${85 - m.coverage}% manquants` };
    case "get_bug_list":
      return { total: m.openBugs, critical: m.criticalBugs, high: 3, medium: 4,
               recommendation: m.criticalBugs > 0 ? "🔴 Bug critique actif — résolution immédiate requise" : "✅ Pas de bug critique" };
    case "get_quality_score":
      const score = Math.round((m.coverage * 0.4) + ((100 - m.openBugs * 5) * 0.3) + ((100 - m.criticalBugs * 20) * 0.3));
      return { score: Math.max(0, score), grade: score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D",
               components: { coverage: m.coverage, bugFreeScore: 100 - m.openBugs * 5, criticalBugScore: 100 - m.criticalBugs * 20 } };
    case "get_acceptance_criteria":
      return { sprint: summary.stats.currentSprint?.name,
               criteria: ["Coverage tests ≥ 85%", "0 bug critique en prod", "Performance P95 < 200ms", "Accessibilité WCAG AA validée", "Review code approuvée par lead dev"] };
  }
}

// ── Deploy Skill ──────────────────────────────────────────────────────────────
function executeDeploySkill({ action }, summary) {
  switch (action) {
    case "get_deploy_history":
      return { deployments: PROJECT.deployments.map(d => ({
               ...d, deployer: PROJECT.team.find(m => m.id === d.by)?.name })) };
    case "get_pipeline_status":
      return { status: "HEALTHY", lastRun: "2026-03-01T14:32:00Z", duration: "4m 23s",
               stages: { build: "✅", test: "✅", security_scan: "✅", deploy_staging: "✅", smoke_tests: "✅" } };
    case "get_environments":
      return { environments: PROJECT.deployments.map(d => ({
               env: d.env, version: d.version, lastDeploy: d.date, status: d.status })) };
    case "get_last_release":
      const prod = PROJECT.deployments.find(d => d.env === "prod");
      return { version: prod?.version, date: prod?.date, status: prod?.status,
               nextRelease: "Sprint 4 completion — ~12 mars 2026" };
  }
}
