import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../hooks/useApi.js';

const SESSION_ID = `zen-${Date.now()}`;

const QUICK_PROMPTS = [
  "État du sprint", "Risques critiques", "Budget ?",
  "Emails non lus", "Tâches bloquées", "Rapport client",
  "Qualité code", "Dernier déploiement",
];

export default function AIPanel({ visible, onClose, pageContext = {}, pendingPrompt }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "👋 Bonjour ! Je suis votre assistant IA Zengineering V4.1.\n\nJe peux vous aider sur n'importe quel aspect du projet : planning, risques, budget, documents, équipements, communications...\n\nQue souhaitez-vous savoir ?",
    skills: []
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useCallback(async (text) => {
    const msg = (typeof text === "string" ? text : null) || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const data = await api.post("/chat", { message: msg, sessionId: SESSION_ID, context: pageContext });
      setMessages(prev => [...prev, { role: "assistant", text: data.response, skills: data.skillsActivated || [] }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: `❌ Erreur : ${err.message}`, skills: [] }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, pageContext]);

  // Prompt déclenché depuis la palette de commandes
  useEffect(() => {
    if (pendingPrompt?.prompt) send(pendingPrompt.prompt);
  }, [pendingPrompt]);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className={`ai-panel ${visible ? "" : "hidden"}`}>
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <div className="pulse" />
          🧠 Assistant IA
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>claude-sonnet-4-6</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>×</button>
      </div>

      <div className="ai-quick-btns">
        {QUICK_PROMPTS.map(q => (
          <button key={q} className="ai-quick-btn" onClick={() => send(q)}>{q}</button>
        ))}
      </div>

      <div className="ai-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ${msg.role}`}>
            <div className="ai-msg-bubble">
              {msg.role === "assistant"
                ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                : <span>{msg.text}</span>
              }
            </div>
            {msg.skills?.length > 0 && (
              <div className="ai-skills-bar">
                {msg.skills.map((s, j) => (
                  <span key={j} className="ai-skill-tag"
                    style={{ background: s.color + "22", color: s.color, border: `1px solid ${s.color}44` }}>
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-msg assistant">
            <div className="ai-msg-bubble">
              <div className="typing-dots"><span/><span/><span/></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-area">
        <textarea
          className="ai-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Question ou action... (Entrée pour envoyer)"
          rows={1}
          onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
        />
        <button className="ai-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
          {loading ? "⏳" : "↑"}
        </button>
      </div>
    </div>
  );
}
