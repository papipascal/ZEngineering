// ─── Zengineering V4 — App Principal ─────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { useChat } from "./hooks/useChat";
import Dashboard from "./components/Dashboard";
import Message, { TypingIndicator } from "./components/Message";

// Suggestions rapides
const QUICK_PROMPTS = [
  { icon:"📅", label:"Sprint en cours",         prompt:"Quel est l'état du sprint en cours ?" },
  { icon:"⚠️", label:"Risques critiques",        prompt:"Quels sont les risques critiques du projet ?" },
  { icon:"💰", label:"Budget",                   prompt:"Quel est l'état du budget ? Sommes-nous dans les clous ?" },
  { icon:"💻", label:"Qualité code",             prompt:"Quel est l'état de la qualité du code et des bugs ?" },
  { icon:"🚀", label:"Déploiements",             prompt:"Quel est le statut des déploiements ?" },
  { icon:"💬", label:"Rapport client",           prompt:"Rédige un rapport d'avancement pour le client" },
  { icon:"👥", label:"Charge équipe",            prompt:"Quelle est la charge de l'équipe actuellement ?" },
  { icon:"📊", label:"Vue complète",             prompt:"Donne-moi une vue d'ensemble complète du projet : sprint, budget, risques et code." },
];

export default function App() {
  const { messages, isLoading, sendMessage, clearHistory } = useChat();
  const [input, setInput] = useState("");
  const [lastSkills, setLastSkills] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, isLoading]);

  // Derniers skills actifs
  useEffect(() => {
    const last = [...messages].reverse().find(m => m.role === "assistant" && m.skillsActivated?.length > 0);
    setLastSkills(last?.skillsActivated || []);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      {/* Dashboard top */}
      <Dashboard activeSkills={isLoading ? [] : lastSkills} />

      {/* Messages zone */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", display:"flex", flexDirection:"column" }}>
        <div style={{ maxWidth:900, width:"100%", margin:"0 auto", flex:1 }}>
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && !isLoading && (
        <div style={{ padding:"0 20px 12px", maxWidth:900, width:"100%", margin:"0 auto", alignSelf:"center" }}>
          <p style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Suggestions rapides</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {QUICK_PROMPTS.map(q => (
              <button key={q.prompt} onClick={() => sendMessage(q.prompt)} style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 12px", borderRadius:20, border:"1px solid var(--border)",
                background:"var(--surface2)", color:"var(--text-dim)",
                fontSize:12, cursor:"pointer", transition:"all .2s",
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "var(--ai-light)"; e.currentTarget.style.color = "var(--ai-light)"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}
              >
                <span>{q.icon}</span>{q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{
        background:"var(--surface)", borderTop:"1px solid var(--border)",
        padding:"14px 20px", flexShrink:0,
      }}>
        <div style={{ maxWidth:900, width:"100%", margin:"0 auto", display:"flex", gap:10, alignItems:"flex-end" }}>
          {/* Clear button */}
          <button onClick={clearHistory} title="Effacer la conversation" style={{
            width:40, height:40, borderRadius:8, border:"1px solid var(--border)",
            background:"var(--surface2)", color:"var(--text-muted)", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0,
          }}>🗑️</button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Posez votre question sur le projet Zengineering… (Entrée pour envoyer)"
            disabled={isLoading}
            rows={1}
            style={{
              flex:1, background:"var(--surface2)", border:`1px solid ${input ? "var(--ai)" : "var(--border)"}`,
              borderRadius:12, padding:"10px 16px", color:"var(--text)", fontSize:14,
              fontFamily:"var(--font)", resize:"none", outline:"none",
              transition:"border-color .2s", lineHeight:1.5,
              maxHeight:120, overflowY:"auto",
            }}
          />

          {/* Send button */}
          <button onClick={handleSend} disabled={isLoading || !input.trim()} style={{
            width:40, height:40, borderRadius:8, flexShrink:0,
            background: input.trim() && !isLoading ? "var(--ai)" : "var(--surface3)",
            border: `1px solid ${input.trim() && !isLoading ? "var(--ai)" : "var(--border)"}`,
            color: input.trim() && !isLoading ? "white" : "var(--text-muted)",
            cursor: input.trim() && !isLoading ? "pointer" : "default",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            transition:"all .2s",
          }}>
            {isLoading
              ? <div style={{ width:16, height:16, border:"2px solid var(--ai-light)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
              : "↑"}
          </button>
        </div>

        {/* Footer info */}
        <div style={{ maxWidth:900, margin:"8px auto 0", textAlign:"center", fontSize:10, color:"var(--text-muted)" }}>
          Claude Sonnet 4.5 · 8 Skills IA · Zengineering V4.0
          · <span style={{ color:"var(--ai-light)" }}>Ctrl+L pour effacer</span>
        </div>
      </div>
    </div>
  );
}
