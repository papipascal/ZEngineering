import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const CHANNEL_COLOR = { technique:"#3b82f6", frontend:"#8b5cf6", workflow:"#10b981", bugs:"#ef4444", planning:"#f59e0b" };

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { api.get("/discussions").then(setDiscussions).catch(console.error); }, []);

  const filtered = filter === "ALL" ? discussions : discussions.filter(d => d.channel === filter);
  const channels = [...new Set(discussions.map(d => d.channel))];

  return (
    <div>
      <div className="page-header">
        <h1>💬 Discussions</h1>
        <p>{discussions.length} fils — {discussions.filter(d=>d.status==="OPEN").length} actifs</p>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        <button className={`btn btn-sm ${filter==="ALL"?"btn-primary":"btn-ghost"}`} onClick={()=>setFilter("ALL")}>Tous</button>
        {channels.map(ch=>(
          <button key={ch} className={`btn btn-sm ${filter===ch?"btn-primary":"btn-ghost"}`} onClick={()=>setFilter(ch)}
            style={filter===ch?{}:{borderColor:CHANNEL_COLOR[ch]||"var(--border)",color:CHANNEL_COLOR[ch]||"var(--text-secondary)"}}>
            #{ch}
          </button>
        ))}
        <button className="btn btn-primary btn-sm" style={{marginLeft:"auto"}}>✏️ Nouveau fil</button>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map(d => (
          <div key={d.id} className="card" style={{cursor:"pointer",borderLeft:`4px solid ${CHANNEL_COLOR[d.channel]||"var(--border)"}`}}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
            onMouseLeave={e=>e.currentTarget.style.background="var(--bg-card)"}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:CHANNEL_COLOR[d.channel]||"var(--border)",color:"#fff"}}>#{d.channel}</span>
                  <span className={`badge ${d.status==="RESOLVED"?"badge-success":"badge-info"}`}>{d.status==="RESOLVED"?"Résolu":"Ouvert"}</span>
                </div>
                <h3 style={{fontSize:15,fontWeight:600,marginBottom:6}}>{d.title}</h3>
                <div style={{fontSize:12,color:"var(--text-muted)",display:"flex",gap:16}}>
                  <span>Par {d.authorName}</span>
                  <span>{d.date}</span>
                  <span>💬 {d.replies} réponses</span>
                  {d.lastReplyName && <span>Dernière réponse : {d.lastReplyName}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button className="btn btn-ghost btn-sm">👁 Voir</button>
                <button className="btn btn-ghost btn-sm">💬 Répondre</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
