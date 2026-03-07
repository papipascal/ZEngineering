// ─── Orchestrateur Claude — Cerveau central du système ──────────────────────
import Anthropic from "@anthropic-ai/sdk";
import { SKILL_TOOLS, executeSkill } from "./skills/index.js";
import { getProjectSummary } from "./data/mockProject.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es le Chef de Projet IA de Zengineering — une plateforme SaaS de gestion de projet.

Tu as accès à des SKILLS SPÉCIALISÉS sous forme de tools. Utilise-les SYSTÉMATIQUEMENT pour répondre aux questions — ne jamais inventer de données.

SKILLS DISPONIBLES :
- planning_skill : Sprints, tâches, jalons, vélocité, affectations, charge équipe
- risk_skill : Risques projet, blocages, alertes
- code_review_skill : Qualité code, PRs, bugs, couverture tests, dette technique
- documentation_skill : Génération de rapports, notes, documentation
- communication_skill : Rédaction emails, rapports client, messages équipe
- finance_skill : Budget, coûts, forecast financier
- qa_skill : Tests, qualité, critères d'acceptation
- deploy_skill : Déploiements, CI/CD, environnements

RÈGLES :
1. Toujours utiliser les skills pour obtenir les données — ne jamais inventer
2. Tu peux enchaîner plusieurs skills pour une réponse complète
3. Répondre en français, de façon structurée et professionnelle
4. Identifier clairement quels skills ont été activés
5. Être concis mais complet
6. Utiliser des émojis pour la lisibilité
7. Si tu ne peux pas répondre avec les skills disponibles, dis-le clairement

Tu connais le projet : Zengineering V4.0 — une plateforme SaaS de gestion de projet built with React 18, NestJS, PostgreSQL, Redis, et déployé sur AWS Multi-AZ.`;

export async function orchestrate({ message, conversationHistory = [] }) {
  const summary = getProjectSummary();

  // Ajouter contexte projet au premier message
  const systemWithContext = `${SYSTEM_PROMPT}\n\nCONTEXTE PROJET ACTUEL :\n- Projet : ${summary.name} v${summary.version}\n- Progression globale : ${summary.stats.progress}%\n- Sprint actuel : ${summary.stats.currentSprint?.name || "Aucun"}\n- Budget consommé : ${summary.stats.budgetUsed}%\n- Risques ouverts : ${summary.stats.openRisks}`;

  const messages = [
    ...conversationHistory,
    { role: "user", content: message }
  ];

  const skillsActivated = [];
  let finalText = "";

  // ── Boucle Agentic : Claude → Skills → Claude ────────────────────────────
  let response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20251001",
    max_tokens: 4096,
    system: systemWithContext,
    tools: SKILL_TOOLS,
    messages,
  });

  // Loop si Claude veut utiliser des tools
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(b => b.type === "tool_use");
    const toolResults = [];

    for (const toolUse of toolUseBlocks) {
      console.log(`🔧 Skill activé : ${toolUse.name}`, toolUse.input);
      skillsActivated.push({ name: toolUse.name, input: toolUse.input });

      const result = executeSkill(toolUse.name, toolUse.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result, null, 2),
      });
    }

    // Ajouter l'échange à l'historique et relancer
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20251001",
      max_tokens: 4096,
      system: systemWithContext,
      tools: SKILL_TOOLS,
      messages,
    });
  }

  // Extraire la réponse finale
  finalText = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n");

  // Ajouter la réponse à l'historique pour la prochaine fois
  const newHistory = [
    ...conversationHistory,
    { role: "user", content: message },
    { role: "assistant", content: response.content }
  ];

  return {
    response: finalText,
    skillsActivated,
    conversationHistory: newHistory,
    usage: response.usage,
  };
}
