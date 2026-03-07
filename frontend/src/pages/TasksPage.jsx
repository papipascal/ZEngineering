import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const STATUS_COLOR = { DONE:"var(--success)", IN_PROGRESS:"var(--accent)", TODO:"var(--text-muted)", BLOCKED:"var(--danger)" };
const STATUS_LABEL = { DONE:"Terminé", IN_PROGRESS:"En cours", TODO:"À faire", BLOCKED:"Bloqué" };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => { api.get("/tasks").then(setTasks).catch(console.error); }, []);

  const filtered = tasks.filter(t => {
    if (filter !== "ALL" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.assigneeName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { ALL: tasks.length, IN_PROGRESS: tasks.filter(t=>t.status==="IN_PROGRESS").length, TODO: tasks.filter(t=>t.status==="TODO").length, BLOCKED: tasks.filter(t=>t.status==="BLOCKED").length, DONE: tasks.filter(t=>t.status==="DONE").length };

  return (
    <div>
      <div className="page-header">
        <h1>✅ Gestion des Tâches</h1>
        <p>{tasks.length} tâches au total — {counts.BLOCKED} bloquées, {counts.IN_PROGRESS} en cours</p>
      </div>

      <div className="grid-4 mb-24">
        {[{s:"IN_PROGRESS",l:"En cours",c:"var(--accent)"},{s:"TODO",l:"À faire",c:"var(--text-muted)"},{s:"BLOCKED",l:"Bloquées",c:"var(--danger)"},{s:"DONE",l:"Terminées",c:"var(--success)"}].map(({s,l,c}) => (
          <div key={s} className="kpi-card" style={{cursor:"pointer",borderColor:filter===s?"var(--accent)":"var(--border)",border:`1px solid ${filter===s?"var(--accent)":"var(--border)"}`}} onClick={()=>setFilter(s)}>
            <div className="kpi-value" style={{color:c}}>{counts[s]}</div>
            <div className="kpi-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher une tâche..."
              style={{background:"var(--bg-secondary)",border:"1px solid var(--border)",color:"var(--text-primary)",padding:"7px 12px",borderRadius:8,fontSize:13,width:260}} />
            <button className={`btn btn-sm ${filter==="ALL"?"btn-primary":"btn-ghost"}`} onClick={()=>setFilter("ALL")}>Toutes ({counts.ALL})</button>
          </div>
          <div style={{fontSize:12,color:"var(--text-muted)"}}>{filtered.length} résultat(s)</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tâche</th><th>Sprint</th><th>Statut</th><th>Pts</th><th>Responsable</th><th>Tags</th><th>Blocage</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong></td>
                  <td style={{color:"var(--text-secondary)",fontSize:12}}>{t.sprintName}</td>
                  <td><span className="badge" style={{background:STATUS_COLOR[t.status]+"22",color:STATUS_COLOR[t.status]}}>{STATUS_LABEL[t.status]}</span></td>
                  <td><span style={{background:"var(--bg-secondary)",padding:"2px 8px",borderRadius:10,fontSize:11}}>{t.points}pt</span></td>
                  <td style={{color:"var(--text-secondary)"}}>{t.assigneeName||t.assignee}</td>
                  <td>{t.tags?.map(tag=><span key={tag} className="tag">{tag}</span>)}</td>
                  <td style={{color:"var(--danger)",fontSize:12}}>{t.blockedBy||<span style={{color:"var(--text-muted)"}}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
