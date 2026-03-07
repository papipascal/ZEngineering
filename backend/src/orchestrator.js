import Anthropic from "@anthropic-ai/sdk";
import { SKILL_TOOLS, executeSkill } from "./skills/index.js";
import { getProjectSummary } from "./data/mockData.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es le Chef de Projet IA de Zengineering V4.1 — une plateforme SaaS complète de gestion de projets industriels.

Tu as accès à des SKILLS SPÉCIALISÉS. Utilise-les SYSTÉMATIQUEMENT — ne jamais inventer de données.

SKILLS DISPONIBLES :
- planning_skill : Sprints, tâches, jalons, vélocité, charge équipe
- risk_skill : Risques, blocages, alertes
- code_review_skill : Qualité code, PRs, bugs, couverture
- documentation_skill : Rapports, notes de sprint, changelogs
- communication_skill : Emails client, rapports équipe
- finance_skill : Budget, coûts, forecast
- qa_skill : Tests, qualité, acceptation
- deploy_skill : Déploiements, CI/CD, environnements

RÈGLES :
1. Toujours utiliser les skills pour les données — ne jamais inventer
2. Enchaîner plusieurs skills pour une réponse complète
3. Répondre en français, structuré et professionnel
4. Identifier les skills activés
5. Utiliser des émojis pour la lisibilité
6. Si une action est demandée (ex: créer une tâche, envoyer email), confirme ce qui serait fait en conditions réelles`;

export async function orchestrate({ message, conversationHistory = [], context = {} }) {
  const summary = getProjectSummary();

  const contextStr = Object.keys(context).length > 0
    ? `\nCONTEXTE PAGE ACTIVE : ${JSON.stringify(context)}`
    : "";

  const systemWithContext = `${SYSTEM_PROMPT}\n\nCONTEXTE PROJET :\n- Projet : ${summary.name} v${summary.version}\n- Client : ${summary.client}\n- Progression : ${summary.stats.progress}%\n- Sprint actuel : ${summary.stats.currentSprint?.name || "Aucun"}\n- Budget : ${summary.stats.budgetUsed}%\n- Risques ouverts : ${summary.stats.openRisks}\n- Emails non lus : ${summary.stats.unreadEmails}${contextStr}`;

  const messages = [
    ...conversationHistory,
    { role: "user", content: message }
  ];

  const skillsActivated = [];
  let finalText = "";

  let response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemWithContext,
    tools: SKILL_TOOLS,
    messages,
  });

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(b => b.type === "tool_use");
    const toolResults = [];

    for (const toolUse of toolUseBlocks) {
      console.log(`🔧 Skill : ${toolUse.name}`, toolUse.input);
      skillsActivated.push({ name: toolUse.name, input: toolUse.input });
      const result = executeSkill(toolUse.name, toolUse.input);
      toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result, null, 2) });
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemWithContext,
      tools: SKILL_TOOLS,
      messages,
    });
  }

  finalText = response.content.filter(b => b.type === "text").map(b => b.text).join("\n");

  const newHistory = [
    ...conversationHistory,
    { role: "user", content: message },
    { role: "assistant", content: response.content }
  ];

  return { response: finalText, skillsActivated, conversationHistory: newHistory, usage: response.usage };
}
