// ─── Dashboard — Métriques projet en temps réel ───────────────────────────
import { useEffect } from "react";
import { useProject } from "../hooks/useChat";

const SKILL_BADGES = [
  { name:"planning_skill",     label:"Planning",   icon:"📅", color:"#0891B2" },
  { name:"risk_skill",         label:"Risk",        icon:"⚠️", color:"#DC2626" },
  { name:"code_review_skill",  label:"Code",        icon:"💻", color:"#059669" },
  { name:"documentation_skill",label:"Docs",        icon:"📄", color:"#D97706" },
  { name:"communication_skill",label:"Comms",       icon:"💬", color:"#7C3AED" },
  { name:"finance_skill",      label:"Finance",     icon:"💰", color:"#0284C7" },
  { name:"qa_skill",           label:"QA",          icon:"🧪", color:"#16A34A" },
  { name:"deploy_skill",       label:"Deploy",      icon:"🚀", color:"#EA580C" },
];

export default function Dashboard({ activeSkills = [] }) {
  const { project, loading, fetchProject } = useProject();

  useEffect(() => { fetchProject(); }, []);

  const stats = project?.stats;

  return (
    <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"1px solid var(--border)" }}>
        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:"linear-gradient(135deg, #7C3AED, #06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, letterSpacing:1, color:"var(--text)" }}>ZENGINEERING</div>
            <div style={{ fontSize:10, color:"var(--ai-light)", letterSpacing:2, marginTop:-1 }}>AI ORCHESTRATOR v4.0</div>
          </div>
        </div>

        {/* Métriques */}
        {!loading && stats && (
          <div style={{ display:"flex", gap:6 }}>
            {[
              { label:"Sprint", value: project.stats.currentSprint?.name || "—", color:"var(--cyan)" },
              { label:"Avancement", value:`${stats.progress}%`, color:"var(--green)" },
              { label:"Budget", value:`${stats.budgetUsed}%`, color: stats.budgetUsed > 80 ? "var(--amber)" : "var(--green)" },
              { label:"Risques", value: stats.openRisks, color: stats.openRisks > 2 ? "var(--red)" : "var(--green)" },
              { label:"Coverage", value:`${project.codeMetrics?.coverage}%`, color: project.codeMetrics?.coverage >= 80 ? "var(--green)" : "var(--amber)" },
            ].map(m => (
              <div key={m.label} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:6, padding:"4px 10px", textAlign:"center", minWidth:70 }}>
                <div style={{ fontSize:13, fontWeight:700, color:m.color, fontFamily:"var(--mono)" }}>{m.value}</div>
                <div style={{ fontSize:9, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5 }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Status */}
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"var(--text-dim)" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", boxShadow:"0 0 6px var(--green)" }} />
          Claude Sonnet 4.5 actif
        </div>
      </div>

      {/* Skills bar */}
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 20px", overflowX:"auto" }}>
        <span style={{ fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:1, flexShrink:0 }}>Skills :</span>
        {SKILL_BADGES.map(sk => {
          const isActive = activeSkills.some(a => a.name === sk.name);
          return (
            <div key={sk.name} style={{
              display:"flex", alignItems:"center", gap:5, padding:"3px 10px",
              borderRadius:20, border:`1px solid ${isActive ? sk.color : "var(--border)"}`,
              background: isActive ? `${sk.color}22` : "transparent",
              fontSize:11, color: isActive ? sk.color : "var(--text-muted)",
              fontWeight: isActive ? 600 : 400,
              transition:"all .3s ease",
              animation: isActive ? "skillPop .4s cubic-bezier(.34,1.56,.64,1)" : "none",
              flexShrink:0,
            }}>
              <span style={{ fontSize:12 }}>{sk.icon}</span>
              {sk.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
