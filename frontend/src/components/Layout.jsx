import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import AIPanel from './AIPanel.jsx';
import CommandPalette from './CommandPalette.jsx';

const NAV = [
  { section: "PROJET" },
  { path: "/",              icon: "🏠", label: "Dashboard" },
  { path: "/planning",      icon: "📅", label: "Planning" },
  { path: "/tasks",         icon: "✅", label: "Mes Tâches" },
  { path: "/risks",         icon: "⚠️", label: "Risques" },
  { path: "/finance",       icon: "💰", label: "Finance" },
  { section: "DOCUMENTS" },
  { path: "/documents",     icon: "📄", label: "Documents" },
  { path: "/transmittals",  icon: "📤", label: "Transmittals" },
  { path: "/emails",        icon: "📧", label: "Emails", badge: "emails" },
  { path: "/discussions",   icon: "💬", label: "Discussions" },
  { section: "TECHNIQUE" },
  { path: "/equipment",     icon: "🔧", label: "Équipements" },
  { path: "/qa",            icon: "🧪", label: "QA & Tests" },
  { path: "/deploy",        icon: "🚀", label: "Déploiements" },
  { section: "ORGANISATION" },
  { path: "/organization",  icon: "🏢", label: "Organisation" },
];

export default function Layout({ projectData }) {
  const [aiOpen, setAiOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pendingAIPrompt, setPendingAIPrompt] = useState(null);
  const location = useLocation();

  const unreadEmails = projectData?.stats?.unreadEmails || 0;

  // Ctrl+K → ouvrir palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAIPrompt = useCallback((prompt) => {
    setAiOpen(true);
    setPendingAIPrompt({ prompt, ts: Date.now() });
  }, []);

  const pageTitle = NAV.find(n => n.path === location.pathname)?.label || "Zengineering";

  // Context page pour l'IA
  const pageContext = { currentPage: location.pathname, pageTitle };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span>⚙️</span>
          <div>
            <div>Zengineering</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>V4.1 — IA Orchestrator</div>
          </div>
        </div>

        {NAV.map((item, i) => {
          if (item.section) return (
            <div key={i} className="sidebar-section">
              <div className="sidebar-section-title">{item.section}</div>
            </div>
          );
          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/"}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.badge === "emails" && unreadEmails > 0 && (
                <span className="nav-badge">{unreadEmails}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Main + AI ── */}
      <div className="main-area">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-title">{pageTitle}</div>
          <div className="top-bar-right">
            <button className="cmd-btn" onClick={() => setPaletteOpen(true)}>
              🔍 Rechercher / Naviguer <kbd>Ctrl+K</kbd>
            </button>
            <button className="ai-toggle-btn" onClick={() => setAiOpen(p => !p)}>
              🧠 {aiOpen ? "Masquer IA" : "Assistant IA"}
            </button>
            <div className="avatar-btn">AM</div>
          </div>
        </div>

        {/* Content + AI Panel */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div className="page-content">
            <Outlet context={{ projectData, onAIPrompt: handleAIPrompt }} />
          </div>
          <AIPanel
            visible={aiOpen}
            onClose={() => setAiOpen(false)}
            pageContext={pageContext}
            pendingPrompt={pendingAIPrompt}
          />
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAIPrompt={handleAIPrompt}
      />
    </div>
  );
}
