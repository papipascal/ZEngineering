// ─── Message Component ─────────────────────────────────────────────────────
import ReactMarkdown from "react-markdown";

export default function Message({ msg }) {
  const isUser = msg.role === "user";
  const isError = msg.role === "error";

  return (
    <div className="fade-up" style={{
      display:"flex", flexDirection:"column",
      alignItems: isUser ? "flex-end" : "flex-start",
      marginBottom:16,
    }}>
      {/* Skill badges (si IA et skills activés) */}
      {!isUser && msg.skillsActivated?.length > 0 && (
        <div style={{ display:"flex", gap:4, marginBottom:6, marginLeft:40, flexWrap:"wrap" }}>
          {msg.skillsActivated.map((sk, i) => (
            <span key={i} className="skill-pop" style={{
              animationDelay: `${i * 60}ms`,
              display:"inline-flex", alignItems:"center", gap:4,
              fontSize:10, padding:"2px 8px", borderRadius:12,
              border:`1px solid ${sk.color}`, color:sk.color,
              background:`${sk.color}18`, fontWeight:600,
            }}>
              {sk.icon} {sk.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ display:"flex", gap:10, alignItems:"flex-start", maxWidth:"80%", width: isUser ? "auto" : "100%" }}>
        {/* Avatar IA */}
        {!isUser && (
          <div className="ai-glow" style={{
            width:32, height:32, borderRadius:8, flexShrink:0, marginTop:2,
            background:"linear-gradient(135deg, #7C3AED, #06B6D4)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
          }}>🧠</div>
        )}

        {/* Bubble */}
        <div style={{
          background: isUser
            ? "linear-gradient(135deg, #1565C0, #0D47A1)"
            : isError ? "#1A0808" : "var(--surface2)",
          border: `1px solid ${isUser ? "#1565C044" : isError ? "var(--red)" : "var(--border)"}`,
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          padding:"12px 16px",
          flex:1,
        }}>
          {isUser ? (
            <p style={{ fontSize:14, color:"var(--text)", lineHeight:1.6 }}>{msg.content}</p>
          ) : (
            <div className="markdown" style={{ fontSize:13.5 }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Avatar User */}
        {isUser && (
          <div style={{
            width:32, height:32, borderRadius:8, flexShrink:0, marginTop:2,
            background:"var(--surface3)", border:"1px solid var(--border2)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:15,
          }}>👤</div>
        )}
      </div>

      {/* Timestamp + usage */}
      <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:4, marginLeft: isUser ? 0 : 42 }}>
        {msg.timestamp?.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}
        {msg.usage && ` · ${msg.usage.input_tokens + msg.usage.output_tokens} tokens`}
      </div>
    </div>
  );
}

// ── Typing indicator ─────────────────────────────────────────────────────────
export function TypingIndicator({ activeSkills = [] }) {
  return (
    <div className="fade-up" style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", marginBottom:16 }}>
      {activeSkills.length > 0 && (
        <div style={{ display:"flex", gap:4, marginBottom:6, marginLeft:40, flexWrap:"wrap" }}>
          {activeSkills.map((sk, i) => (
            <span key={i} style={{
              fontSize:10, padding:"2px 8px", borderRadius:12,
              border:`1px solid ${sk.color}`, color:sk.color,
              background:`${sk.color}18`, fontWeight:600,
              animation:"pulse 1s ease infinite",
              animationDelay:`${i * 150}ms`,
            }}>
              {sk.icon} {sk.label} en cours…
            </span>
          ))}
        </div>
      )}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div className="ai-glow" style={{
          width:32, height:32, borderRadius:8, flexShrink:0,
          background:"linear-gradient(135deg, #7C3AED, #06B6D4)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
        }}>🧠</div>
        <div style={{
          background:"var(--surface2)", border:"1px solid var(--border)",
          borderRadius:"4px 16px 16px 16px", padding:"12px 18px",
          display:"flex", gap:5, alignItems:"center",
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:7, height:7, borderRadius:"50%", background:"var(--ai-light)",
              animation:`dotBlink 1.2s ease infinite`,
              animationDelay:`${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
