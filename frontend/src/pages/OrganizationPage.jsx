import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const DISC_COLOR = { management:"#3b82f6", frontend:"#8b5cf6", backend:"#10b981", devops:"#f59e0b", qa:"#ef4444", process:"#06b6d4", achat:"#84cc16" };
const LOAD_COLOR = (load) => load > 90 ? "var(--danger)" : load > 80 ? "var(--warning)" : "var(--success)";

export default function OrganizationPage() {
  const [team, setTeam] = useState([]);
  const [org, setOrg] = useState(null);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    api.get("/team").then(setTeam).catch(console.error);
    api.get("/organization").then(setOrg).catch(console.error);
    api.get("/vendors").then(setVendors).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>🏢 Organisation</h1>
        <p>{team.length} membres d'équipe — Fournisseurs et parties prenantes</p>
      </div>

      {org && (
        <div className="grid-2 mb-24">
          <div className="card">
            <div className="card-header"><span className="card-title">👥 Parties prenantes</span></div>
            {[
              { label:"Maître d'ouvrage", ...org.client, icon:"🏭" },
              { label:"Maître d'œuvre",   ...org.pm,     icon:"🏗️" },
            ].map((p,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:28}}>{p.icon}</span>
                <div>
                  <div style={{fontSize:11,color:"var(--text-muted)"}}>{p.label}</div>
                  <div style={{fontWeight:600}}>{p.name}</div>
                  <div style={{fontSize:13,color:"var(--text-secondary)"}}>{p.contact}</div>
                  <div style={{fontSize:12,color:"var(--accent)"}}>{p.email}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">📋 Disciplines projet</span></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {org.disciplines.map(d => (
                <span key={d} style={{padding:"6px 14px",borderRadius:20,background:DISC_COLOR[d.toLowerCase()]||"var(--border)",color:"#fff",fontSize:13,fontWeight:600}}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Équipe */}
      <div className="card mb-24" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">👤 Membres de l'équipe</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {team.map(m => (
            <div key={m.id} style={{background:"var(--bg-secondary)",borderRadius:10,padding:16,border:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:DISC_COLOR[m.discipline]||"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,color:"#fff",flexShrink:0}}>{m.avatar}</div>
                <div>
                  <div style={{fontWeight:600}}>{m.name}</div>
                  <div style={{fontSize:12,color:"var(--text-secondary)"}}>{m.role}</div>
                  <div style={{fontSize:11,color:"var(--text-muted)"}}>{m.email}</div>
                </div>
              </div>
              <div style={{marginBottom:4,display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"var(--text-muted)"}}>Charge</span>
                <span style={{fontWeight:700,color:LOAD_COLOR(m.load)}}>{m.load}% {m.load>90?"⚠️":m.load>80?"⚡":"✅"}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${m.load}%`,background:LOAD_COLOR(m.load)}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fournisseurs */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🏪 Fournisseurs</span>
          <button className="btn btn-ghost btn-sm">+ Nouveau fournisseur</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Fournisseur</th><th>Type</th><th>Statut</th><th>Contact</th><th>Contrats</th><th>Dernière commande</th><th>Note</th></tr></thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td><strong>{v.name}</strong></td>
                  <td><span className="tag">{v.type}</span></td>
                  <td><span className={`badge ${v.status==="APPROVED"?"badge-success":v.status==="UNDER_EVAL"?"badge-warning":"badge-gray"}`}>{v.status==="APPROVED"?"Approuvé":v.status==="UNDER_EVAL"?"En évaluation":v.status}</span></td>
                  <td style={{fontSize:12,color:"var(--accent)"}}>{v.contact}</td>
                  <td style={{textAlign:"center"}}>{v.contracts}</td>
                  <td style={{fontSize:12,color:"var(--text-muted)"}}>{v.lastOrder||"—"}</td>
                  <td>{v.rating ? <span style={{color:"var(--warning)"}}>{"★".repeat(Math.round(v.rating))} {v.rating}</span> : <span style={{color:"var(--text-muted)"}}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
