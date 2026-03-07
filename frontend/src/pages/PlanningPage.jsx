import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const STATUS_COLOR = { DONE:"var(--success)", IN_PROGRESS:"var(--accent)", TODO:"var(--text-muted)", BLOCKED:"var(--danger)", PLANNED:"#6366f1" };
const STATUS_LABEL = { DONE:"Terminé", IN_PROGRESS:"En cours", TODO:"À faire", BLOCKED:"Bloqué", PLANNED:"Planifié" };

export default function PlanningPage() {
  const [sprints, setSprints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    api.get("/sprints").then(data => { setSprints(data); setSelected(data.find(s=>s.status==="IN_PROGRESS")?.id || data[0]?.id); }).catch(console.error);
  }, []);

  const sprint = sprints.find(s => s.id === selected);
  const tasks = sprint ? (filter === "ALL" ? sprint.tasks : sprint.tasks.filter(t => t.status === filter)) : [];
  const allTasks = sprints.flatMap(s => s.tasks);
  const velocity = sprints.filter(s => s.velocity).map(s => s.velocity);
  const avgVelocity = velocity.length ? Math.round(velocity.reduce((a,b)=>a+b,0)/velocity.length) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>📅 Planning & Sprints</h1>
        <p>Gestion agile — {sprints.length} sprints | Vélocité moyenne : {avgVelocity} pts</p>
      </div>

      {/* Vue sprints */}
      <div className="grid-4 mb-24">
        {sprints.map(s => {
          const done = s.tasks.filter(t=>t.status==="DONE").length;
          const pct = Math.round((done/s.tasks.length)*100);
          return (
            <div key={s.id} className="kpi-card" style={{cursor:"pointer",border:`2px solid ${selected===s.id?"var(--accent)":"var(--border)"}`}} onClick={()=>setSelected(s.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:13}}>{s.name}</span>
                <span className={`badge ${s.status==="DONE"?"badge-success":s.status==="IN_PROGRESS"?"badge-info":"badge-gray"}`}>{STATUS_LABEL[s.status]||s.status}</span>
              </div>
              <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:8}}>{s.startDate} → {s.endDate}</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
                <span>📦 {s.plannedPoints} pts</span>
                {s.velocity && <span style={{color:"var(--success)"}}>✅ {s.velocity} pts réels</span>}
              </div>
              <div className="progress-bar">
                <div className="progress-fill blue" style={{width:`${pct}%`}}/>
              </div>
              <div style={{fontSize:11,color:"var(--text-muted)",marginTop:4}}>{done}/{s.tasks.length} tâches</div>
            </div>
          );
        })}
      </div>

      {/* Détail sprint */}
      {sprint && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 {sprint.name} — Tâches</span>
            <div style={{display:"flex",gap:6}}>
              {["ALL","IN_PROGRESS","TODO","DONE","BLOCKED"].map(f => (
                <button key={f} className={`btn btn-sm ${filter===f?"btn-primary":"btn-ghost"}`} onClick={()=>setFilter(f)}>
                  {f==="ALL"?"Toutes":STATUS_LABEL[f]}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tâche</th><th>Statut</th><th>Pts</th><th>Responsable</th><th>Tags</th><th>Note</th></tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.title}</strong></td>
                    <td><span className="badge" style={{background:STATUS_COLOR[t.status]+"22",color:STATUS_COLOR[t.status]}}>{STATUS_LABEL[t.status]}</span></td>
                    <td><span style={{background:"var(--accent)",color:"#fff",padding:"2px 8px",borderRadius:12,fontSize:11}}>{t.points}</span></td>
                    <td style={{color:"var(--text-secondary)"}}>{t.assignee}</td>
                    <td>{t.tags?.map(tag=><span key={tag} className="tag">{tag}</span>)}</td>
                    <td style={{color:"var(--danger)",fontSize:12}}>{t.blockedBy||""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Burndown simplifié */}
      <div className="grid-2 mt-8" style={{marginTop:20}}>
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Vélocité par sprint</span></div>
          {sprints.filter(s=>s.velocity).map(s => (
            <div key={s.id} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span>{s.name}</span>
                <span style={{color:"var(--success)"}}>{s.velocity}/{s.plannedPoints} pts ({Math.round(s.velocity/s.plannedPoints*100)}%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill green" style={{width:`${Math.round(s.velocity/s.plannedPoints*100)}%`}}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:8,padding:"10px",background:"var(--bg-secondary)",borderRadius:8,fontSize:13}}>
            Vélocité moyenne : <strong style={{color:"var(--accent)"}}>{avgVelocity} points/sprint</strong>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">📈 Répartition tâches</span></div>
          {["DONE","IN_PROGRESS","TODO","BLOCKED"].map(st => {
            const cnt = allTasks.filter(t=>t.status===st).length;
            const pct = Math.round(cnt/allTasks.length*100);
            return (
              <div key={st} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:STATUS_COLOR[st]}}>{STATUS_LABEL[st]}</span>
                  <span>{cnt} tâches ({pct}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${pct}%`,background:STATUS_COLOR[st]}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
