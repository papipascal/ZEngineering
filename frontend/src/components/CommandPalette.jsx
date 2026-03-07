import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  // Navigation
  { type: "nav", icon: "🏠", title: "Dashboard", sub: "Vue d'ensemble du projet", path: "/" },
  { type: "nav", icon: "📅", title: "Planning & Sprints", sub: "Gestion des sprints et tâches", path: "/planning" },
  { type: "nav", icon: "✅", title: "Mes Tâches", sub: "Tâches affectées", path: "/tasks" },
  { type: "nav", icon: "📄", title: "Documents", sub: "Gestion documentaire", path: "/documents" },
  { type: "nav", icon: "📤", title: "Transmittals", sub: "Envoi et suivi documents", path: "/transmittals" },
  { type: "nav", icon: "📧", title: "Emails entrants", sub: "Emails reçus classés", path: "/emails" },
  { type: "nav", icon: "💬", title: "Discussions", sub: "Canaux de discussion", path: "/discussions" },
  { type: "nav", icon: "⚠️", title: "Risques", sub: "Registre des risques", path: "/risks" },
  { type: "nav", icon: "💰", title: "Finance & Budget", sub: "Suivi budgétaire", path: "/finance" },
  { type: "nav", icon: "🔧", title: "Équipements", sub: "Gestion des équipements", path: "/equipment" },
  { type: "nav", icon: "🧪", title: "QA & Tests", sub: "Qualité et couverture", path: "/qa" },
  { type: "nav", icon: "🚀", title: "Déploiements", sub: "CI/CD et environnements", path: "/deploy" },
  { type: "nav", icon: "🏢", title: "Organisation", sub: "Équipe et organisation", path: "/organization" },
  // Actions IA
  { type: "ai", icon: "🧠", title: "État du sprint actuel", sub: "Demander à l'IA", prompt: "Quel est l'état du sprint en cours ?" },
  { type: "ai", icon: "🧠", title: "Risques critiques", sub: "Demander à l'IA", prompt: "Quels sont les risques critiques actuels ?" },
  { type: "ai", icon: "🧠", title: "Rapport client", sub: "Générer avec l'IA", prompt: "Génère le rapport client de la semaine" },
  { type: "ai", icon: "🧠", title: "Budget — état actuel", sub: "Demander à l'IA", prompt: "Quel est l'état du budget ?" },
  { type: "ai", icon: "🧠", title: "Tâches bloquées", sub: "Demander à l'IA", prompt: "Quelles sont les tâches bloquées et pourquoi ?" },
  { type: "ai", icon: "🧠", title: "Vue d'ensemble complète", sub: "Rapport complet IA", prompt: "Donne-moi une vue d'ensemble complète du projet" },
];

export default function CommandPalette({ open, onClose, onAIPrompt }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const filtered = COMMANDS.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.sub.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const execute = (cmd) => {
    onClose();
    if (cmd.type === "nav") navigate(cmd.path);
    else if (cmd.type === "ai") onAIPrompt(cmd.prompt);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && filtered[selected]) execute(filtered[selected]);
    if (e.key === "Escape") onClose();
  };

  if (!open) return null;

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-box" onClick={e => e.stopPropagation()}>
        <div className="palette-input-wrap">
          <span className="icon">⌘</span>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Naviguer, rechercher ou demander à l'IA..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={onKey}
          />
          {query && <button onClick={() => setQuery("")} style={{ background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:16 }}>×</button>}
        </div>

        <div className="palette-results">
          {filtered.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
              Aucun résultat — appuyez sur Entrée pour demander à l'IA
            </div>
          )}
          {filtered.map((cmd, i) => (
            <div key={i} className={`palette-result ${i === selected ? "selected" : ""}`}
              onClick={() => execute(cmd)}
              onMouseEnter={() => setSelected(i)}>
              <div className="r-icon">{cmd.icon}</div>
              <div>
                <div className="r-title">{cmd.title}</div>
                <div className="r-sub">
                  {cmd.type === "nav" ? "📍 " : "🧠 IA — "}
                  {cmd.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="palette-footer">
          <span className="palette-hint"><kbd>↑↓</kbd> naviguer</span>
          <span className="palette-hint"><kbd>↵</kbd> sélectionner</span>
          <span className="palette-hint"><kbd>Esc</kbd> fermer</span>
        </div>
      </div>
    </div>
  );
}
