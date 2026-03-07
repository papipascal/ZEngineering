import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const PRIORITY_COLOR = { HIGH:"var(--danger)", MEDIUM:"var(--warning)", LOW:"var(--text-muted)" };

export default function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { api.get("/emails").then(setEmails).catch(console.error); }, []);

  const markRead = async (id) => {
    await api.patch(`/emails/${id}/read`, {});
    setEmails(prev => prev.map(e => e.id === id ? { ...e, status: "READ" } : e));
  };

  const unread = emails.filter(e => e.status === "UNREAD");
  const sel = emails.find(e => e.id === selected);

  return (
    <div>
      <div className="page-header">
        <h1>📧 Emails Entrants</h1>
        <p>{emails.length} emails — <span style={{color:"var(--warning)"}}>{unread.length} non lus</span></p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"360px 1fr",gap:16,height:"calc(100vh - 220px)"}}>
        {/* Liste */}
        <div className="card" style={{padding:0,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:600,fontSize:13}}>Boîte de réception</span>
            <span className="badge badge-warning">{unread.length} non lus</span>
          </div>
          <div style={{overflow:"auto",flex:1}}>
            {emails.map(e => (
              <div key={e.id}
                onClick={() => { setSelected(e.id); if(e.status==="UNREAD") markRead(e.id); }}
                style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",cursor:"pointer",background:selected===e.id?"var(--bg-hover)":e.status==="UNREAD"?"rgba(59,130,246,0.05)":"transparent",borderLeft:`3px solid ${selected===e.id?"var(--accent)":e.status==="UNREAD"?"var(--accent)":"transparent"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:e.status==="UNREAD"?700:400}}>{e.from.split("@")[0]}</span>
                  <span style={{fontSize:11,color:"var(--text-muted)"}}>{e.date}</span>
                </div>
                <div style={{fontSize:13,fontWeight:e.status==="UNREAD"?600:400,marginBottom:2}}>{e.subject}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:10,fontWeight:700,color:PRIORITY_COLOR[e.priority]}}>{e.priority}</span>
                  {e.status==="UNREAD" && <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block"}}/>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détail */}
        <div className="card">
          {sel ? (
            <>
              <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid var(--border)"}}>
                <h2 style={{marginBottom:8}}>{sel.subject}</h2>
                <div style={{display:"flex",gap:16,fontSize:13,color:"var(--text-secondary)"}}>
                  <span>De : <strong>{sel.from}</strong></span>
                  <span>Date : {sel.date}</span>
                  <span className="badge" style={{background:PRIORITY_COLOR[sel.priority]+"22",color:PRIORITY_COLOR[sel.priority]}}>{sel.priority}</span>
                </div>
              </div>
              <div style={{fontSize:14,lineHeight:1.7,color:"var(--text-primary)",marginBottom:20}}>
                {sel.excerpt}
                <br/><br/>
                <span style={{color:"var(--text-muted)",fontSize:12}}>
                  [Aperçu — intégration IMAP complète disponible en production]
                </span>
              </div>
              {sel.linkedDoc && (
                <div style={{padding:12,background:"var(--bg-secondary)",borderRadius:8,marginBottom:16}}>
                  <span style={{fontSize:12,color:"var(--text-muted)"}}>📎 Document lié : </span>
                  <span style={{fontSize:12,color:"var(--accent)"}}>{sel.linkedDoc}</span>
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-primary btn-sm">↩️ Répondre</button>
                <button className="btn btn-ghost btn-sm">📎 Lier à un document</button>
                <button className="btn btn-ghost btn-sm">📋 Créer une tâche</button>
                <button className="btn btn-ghost btn-sm">🗄️ Archiver</button>
              </div>
            </>
          ) : (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:8,color:"var(--text-muted)"}}>
              <span style={{fontSize:48}}>📧</span>
              <span>Sélectionnez un email</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
