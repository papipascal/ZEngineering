// ─── useChat Hook — Communication avec le backend ─────────────────────────
import { useState, useCallback, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const SESSION_ID = `zen-${Math.random().toString(36).slice(2, 9)}`;

export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: `**Bonjour, je suis votre Chef de Projet IA Zengineering !** 🧠\n\nJ'ai accès à l'intégralité de votre projet via mes **8 skills spécialisés**. Posez-moi n'importe quelle question :\n\n- 📅 *"État du sprint en cours ?"*\n- ⚠️ *"Quels sont les risques critiques ?"*\n- 💰 *"On est dans le budget ?"*\n- 🚀 *"Dernier déploiement ?"*\n- 💬 *"Rédige le rapport client de la semaine"*\n\nQue souhaitez-vous savoir ?`,
      skillsActivated: [],
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      abortRef.current = new AbortController();
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: SESSION_ID }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();

      const aiMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.response,
        skillsActivated: data.skillsActivated || [],
        usage: data.usage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: "error",
        content: `Erreur de connexion : ${err.message}\n\nVérifiez que le backend tourne sur le port 3001.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearHistory = useCallback(async () => {
    await fetch(`${API_URL}/api/session/${SESSION_ID}`, { method: "DELETE" }).catch(() => {});
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearHistory };
}

export function useProject() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/project`);
      const data = await res.json();
      setProject(data);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { project, loading, fetchProject };
}
