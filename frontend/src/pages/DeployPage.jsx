import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const ENV_COLOR = { prod:"var(--danger)", staging:"var(--warning)", dev:"var(--success)" };
const STATUS_BADGE = { SUCCESS:"badge-success", FAILED:"badge-danger", RUNNING:"badge-warning" };

export default function DeployPage() {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => { api.get("/deployments").then(setDeployments).catch(console.error); }, []);

  const PIPELINE = [
    {name:"Build",status:"success",duration:"1m12s"},{name:"Tests",status:"success",duration:"2m34s"},
    {name:"Security Scan",status:"success",duration:"0m28s"},{name:"Deploy Staging",status:"success",duration:"0m58s"},
    {name:"Smoke Tests",status:"success",duration:"0m22s"},
  ];

  return (
    <div>
      <div className="page-header">
        <h1>🚀 Déploiements & CI/CD</h1>
        <p>Gestion des environnements — Pipeline : ✅ HEALTHY</p>
      </div>

      {/* Environnements */}
      <div className="grid-3 mb-24">
        {deployments.map(d => (
          <div key={d.id} className="card" style={{borderTop:`3px solid ${ENV_COLOR[d.env]||"var(--border)"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontWeight:700,fontSize:16,textTransform:"uppercase",color:ENV_COLOR[d.env]}}>{d.env}</span>
              <span className={`badge ${STATUS_BADGE[d.status]}`}>{d.status}</span>
            </div>
            <div style={{marginBottom:8}}>
              <span style={{fontSize:22,fontWeight:700}}>{d.version}</span>
            </div>
            <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:4}}>🕐 {d.date}</div>
            <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:4}}>👤 {d.deployerName}</div>
            <div style={{fontSize:12,color:"var(--text-muted)"}}>⏱️ {d.duration}</div>
            <div style={{marginTop:12,display:"flex",gap:6}}>
              <button className="btn btn-ghost btn-sm">📋 Logs</button>
              {d.env !== "prod" && <button className="btn btn-ghost btn-sm">🚀 Promouvoir</button>}
              {d.env === "prod" && <button className="btn btn-ghost btn-sm" style={{color:"var(--danger)",borderColor:"var(--danger)"}}>↩️ Rollback</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="card mb-24" style={{marginBottom:20}}>
        <div className="card-header">
          <span className="card-title">⚙️ Pipeline CI/CD — Dernier run</span>
          <div style={{fontSize:12,color:"var(--text-muted)"}}>2026-03-01 14:32 · Durée totale : 5m34s</div>
        </div>
        <div style={{display:"flex",gap:0,alignItems:"center"}}>
          {PIPELINE.map((stage, i) => (
            <React.Fragment key={stage.name}>
              <div style={{flex:1,textAlign:"center",padding:"12px 8px"}}>
                <div style={{fontSize:24,marginBottom:4}}>{stage.status==="success"?"✅":"❌"}</div>
                <div style={{fontSize:12,fontWeight:600}}>{stage.name}</div>
                <div style={{fontSize:11,color:"var(--text-muted)"}}>{stage.duration}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div style={{color:"var(--success)",fontSize:20,padding:"0 4px"}}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Historique */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Historique des déploiements</span>
          <button className="btn btn-primary btn-sm">🚀 Déclencher deploy</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Environnement</th><th>Version</th><th>Date</th><th>Déployé par</th><th>Durée</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {deployments.map(d => (
                <tr key={d.id}>
                  <td><span style={{fontWeight:700,color:ENV_COLOR[d.env],textTransform:"uppercase"}}>{d.env}</span></td>
                  <td><code style={{background:"var(--bg-secondary)",padding:"2px 8px",borderRadius:6,fontSize:12}}>{d.version}</code></td>
                  <td style={{fontSize:12,color:"var(--text-secondary)"}}>{d.date}</td>
                  <td style={{color:"var(--text-secondary)"}}>{d.deployerName}</td>
                  <td style={{fontSize:12,color:"var(--text-muted)"}}>{d.duration}</td>
                  <td><span className={`badge ${STATUS_BADGE[d.status]}`}>{d.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm">📋 Logs</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"12px 0 0",fontSize:12,color:"var(--text-muted)"}}>
          🗓️ Prochain déploiement prévu : Sprint 4 completion — ~12 mars 2026
        </div>
      </div>
    </div>
  );
}
