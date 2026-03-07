import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { api } from '../hooks/useApi.js';

function statusBadge(s) {
  const map = { DONE:"badge-success",IN_PROGRESS:"badge-info",TODO:"badge-gray",BLOCKED:"badge-danger",PLANNED:"badge-gray",APPROVED:"badge-success",IN_REVIEW:"badge-warning",DRAFT:"badge-gray",OPEN:"badge-danger",WATCH:"badge-warning",CLOSED:"badge-success",OPERATIONAL:"badge-success",MAINTENANCE:"badge-warning",OUT_OF_SERVICE:"badge-danger" };
  const label = { DONE:"Terminé",IN_PROGRESS:"En cours",TODO:"À faire",BLOCKED:"Bloqué",PLANNED:"Planifié",APPROVED:"Approuvé",IN_REVIEW:"En revue",DRAFT:"Brouillon",OPEN:"Ouvert",WATCH:"Surveiller",CLOSED:"Fermé",OPERATIONAL:"Opérationnel",MAINTENANCE:"Maintenance",OUT_OF_SERVICE:"Hors service" };
  return <span className={`badge ${map[s]||"badge-gray"}`}>{label[s]||s}</span>;
}

export default function DashboardPage() {
  const ctx = useOutletContext();
  const [data, setData] = useState(null);
  const [risks, setRisks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    api.get("/project/full").then(setData).catch(console.error);
    api.get("/risks").then(r => setRisks(r.filter(x => x.status === "OPEN").slice(0,4))).catch(console.error);
    api.get("/tasks?status=IN_PROGRESS").then(t => setTasks(t.slice(0,5))).catch(console.error);
    api.get("/emails?status=UNREAD").then(setEmails).catch(console.error);
  }, []);

  if (!data) return <div style={{color:"var(--text-muted)",padding:40}}>Chargement...</div>;

  const allTasks = data.sprints.flatMap(s => s.tasks);
  const done = allTasks.filter(t => t.status === "DONE").length;
  const progress = Math.round((done / allTasks.length) * 100);
  const budgetPct = Math.round((data.budget.spent / data.budget.total) * 100);
  const currentSprint = data.sprints.find(s => s.status === "IN_PROGRESS");
  const openRisks = risks.length;

  return (
    <div>
      <div className="page-header">
        <h1>🏠 Dashboard Projet</h1>
        <p>{data.name} — {data.client} | Cible : {data.targetDate}</p>
      </div>

      {/* KPIs */}
      <div className="grid-4 mb-24">
        {[
          { label:"Progression globale", value:`${progress}%`, sub:`${done}/${allTasks.length} tâches`, color:"var(--accent)", progress },
          { label:"Budget consommé",     value:`${budgetPct}%`, sub:`${(data.budget.spent/1000).toFixed(0)}k€ / ${(data.budget.total/1000).toFixed(0)}k€`, color: budgetPct>80?"var(--warning)":"var(--success)", progress:budgetPct },
          { label:"Risques ouverts",     value:openRisks, sub:"risques actifs", color:openRisks>2?"var(--danger)":"var(--warning)", progress:null },
          { label:"Emails non lus",      value:emails.length, sub:"à traiter", color:"var(--info)", progress:null },
        ].map((kpi,i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value" style={{color:kpi.color}}>{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-trend text-muted">{kpi.sub}</div>
            {kpi.progress != null && (
              <div style={{marginTop:10}}>
                <div className="progress-bar">
                  <div className="progress-fill blue" style={{width:`${kpi.progress}%`,background:kpi.color}}/>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Sprint en cours */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📅 Sprint en cours</span>
            <Link to="/planning" style={{fontSize:12,color:"var(--accent)"}}>Voir tout →</Link>
          </div>
          {currentSprint ? (
            <>
              <div style={{marginBottom:12}}>
                <strong>{currentSprint.name}</strong>
                <span style={{marginLeft:8,fontSize:12,color:"var(--text-muted)"}}>{currentSprint.startDate} → {currentSprint.endDate}</span>
              </div>
              <div style={{display:"flex",gap:16,marginBottom:14}}>
                {["DONE","IN_PROGRESS","TODO","BLOCKED"].map(st => {
                  const cnt = currentSprint.tasks.filter(t=>t.status===st).length;
                  const colors = {DONE:"var(--success)",IN_PROGRESS:"var(--accent)",TODO:"var(--text-muted)",BLOCKED:"var(--danger)"};
                  const labels = {DONE:"Terminées",IN_PROGRESS:"En cours",TODO:"À faire",BLOCKED:"Bloquées"};
                  return <div key={st} style={{textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:700,color:colors[st]}}>{cnt}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)"}}>{labels[st]}</div>
                  </div>;
                })}
              </div>
              <div className="progress-bar">
                <div className="progress-fill blue"
                  style={{width:`${Math.round(currentSprint.tasks.filter(t=>t.status==="DONE").length/currentSprint.tasks.length*100)}%`}}/>
              </div>
            </>
          ) : <div className="text-muted">Aucun sprint actif</div>}
        </div>

        {/* Risques */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Risques ouverts</span>
            <Link to="/risks" style={{fontSize:12,color:"var(--accent)"}}>Voir tout →</Link>
          </div>
          {risks.map(r => (
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:18}}>{r.probability==="HIGH"?"🔴":"🟡"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500}}>{r.title}</div>
                <div style={{fontSize:11,color:"var(--text-muted)"}}>{r.ownerName} — échéance {r.dueDate}</div>
              </div>
            </div>
          ))}
          {risks.length === 0 && <div className="text-muted">Aucun risque ouvert ✅</div>}
        </div>

        {/* Tâches en cours */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">✅ Tâches en cours</span>
            <Link to="/tasks" style={{fontSize:12,color:"var(--accent)"}}>Voir tout →</Link>
          </div>
          {tasks.map(t => (
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:11,background:"var(--accent)",color:"#fff",padding:"2px 7px",borderRadius:12}}>{t.points}pt</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13}}>{t.title}</div>
                <div style={{fontSize:11,color:"var(--text-muted)"}}>{t.assigneeName} — {t.sprintName}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Emails non lus */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📧 Emails non lus</span>
            <Link to="/emails" style={{fontSize:12,color:"var(--accent)"}}>Voir tout →</Link>
          </div>
          {emails.map(e => (
            <div key={e.id} style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <span style={{fontSize:11,fontWeight:700,color:e.priority==="HIGH"?"var(--danger)":e.priority==="MEDIUM"?"var(--warning)":"var(--text-muted)"}}>{e.priority}</span>
                <span style={{fontSize:13,fontWeight:500}}>{e.subject}</span>
              </div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>{e.from} — {e.date}</div>
            </div>
          ))}
          {emails.length === 0 && <div className="text-muted">Aucun email non lu ✅</div>}
        </div>
      </div>

      {/* Phases */}
      <div className="card">
        <div className="card-header"><span className="card-title">🗓️ Phases du projet</span></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {data.organization.phases.map((p,i) => (
            <div key={i} style={{flex:1,minWidth:180,background:"var(--bg-secondary)",borderRadius:8,padding:"12px 16px",border:"1px solid var(--border)"}}>
              <div style={{marginBottom:6}}>{statusBadge(p.status)}</div>
              <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{p.name}</div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>{p.start} → {p.end}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
