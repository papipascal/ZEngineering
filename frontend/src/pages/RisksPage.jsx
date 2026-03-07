import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const PROB_COLOR = { HIGH:"var(--danger)", MEDIUM:"var(--warning)", LOW:"var(--success)" };
const STATUS_BADGE = { OPEN:"badge-danger", WATCH:"badge-warning", CLOSED:"badge-success" };

export default function RisksPage() {
  const [risks, setRisks] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { api.get("/risks").then(setRisks).catch(console.error); }, []);

  const filtered = filter === "ALL" ? risks : risks.filter(r => r.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1>⚠️ Registre des Risques</h1>
        <p>{risks.length} risques identifiés — {risks.filter(r=>r.status==="OPEN").length} ouverts</p>
      </div>

      <div className="grid-4 mb-24">
        {[{l:"Ouverts",s:"OPEN",c:"var(--danger)"},{l:"Surveillance",s:"WATCH",c:"var(--warning)"},{l:"Fermés",s:"CLOSED",c:"var(--success)"},{l:"Total",s:"ALL",c:"var(--accent)"}].map(({l,s,c}) => (
          <div key={s} className="kpi-card" style={{cursor:"pointer",border:`1px solid ${filter===s?"var(--accent)":"var(--border)"}`}} onClick={()=>setFilter(s)}>
            <div className="kpi-value" style={{color:c}}>{s==="ALL"?risks.length:risks.filter(r=>r.status===s).length}</div>
            <div className="kpi-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Matrice risques */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header"><span className="card-title">🗺️ Matrice Probabilité × Impact</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {["HIGH","MEDIUM","LOW"].map(prob =>
              ["HIGH","MEDIUM","LOW"].map(imp => {
                const matching = risks.filter(r=>r.probability===prob&&r.impact===imp&&r.status==="OPEN");
                const bg = matching.length > 0 ? (prob==="HIGH"&&imp==="HIGH"?"rgba(239,68,68,0.3)":prob==="HIGH"||imp==="HIGH"?"rgba(245,158,11,0.2)":"rgba(16,185,129,0.1)") : "var(--bg-secondary)";
                return (
                  <div key={`${prob}-${imp}`} style={{background:bg,borderRadius:6,padding:"8px",textAlign:"center",border:"1px solid var(--border)"}}>
                    <div style={{fontSize:18,fontWeight:700}}>{matching.length||"·"}</div>
                    <div style={{fontSize:9,color:"var(--text-muted)"}}>P:{prob[0]} / I:{imp[0]}</div>
                  </div>
                );
              })
            )}
          </div>
          <div style={{marginTop:8,fontSize:11,color:"var(--text-muted)"}}>Lignes=Probabilité (H→L) / Colonnes=Impact (H→L)</div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Répartition</span></div>
          {["HIGH","MEDIUM","LOW"].map(p => {
            const cnt = risks.filter(r=>r.probability===p).length;
            return (
              <div key={p} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                  <span style={{color:PROB_COLOR[p]}}>Probabilité {p}</span>
                  <span>{cnt} risque(s)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${risks.length?cnt/risks.length*100:0}%`,background:PROB_COLOR[p]}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste */}
      <div className="card">
        <div className="card-header"><span className="card-title">📋 Liste des risques</span>
          <div style={{display:"flex",gap:6}}>
            {["ALL","OPEN","WATCH","CLOSED"].map(f=><button key={f} className={`btn btn-sm ${filter===f?"btn-primary":"btn-ghost"}`} onClick={()=>setFilter(f)}>{f==="ALL"?"Tous":f}</button>)}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Risque</th><th>Proba</th><th>Impact</th><th>Statut</th><th>Responsable</th><th>Mitigation</th><th>Échéance</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.title}</strong></td>
                  <td><span className="badge" style={{background:PROB_COLOR[r.probability]+"22",color:PROB_COLOR[r.probability]}}>{r.probability}</span></td>
                  <td><span className="badge" style={{background:PROB_COLOR[r.impact]+"22",color:PROB_COLOR[r.impact]}}>{r.impact}</span></td>
                  <td><span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                  <td style={{color:"var(--text-secondary)"}}>{r.ownerName}</td>
                  <td style={{fontSize:12,color:"var(--text-secondary)"}}>{r.mitigation}</td>
                  <td style={{fontSize:12}}>{r.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
