import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const STATUS = { ACKNOWLEDGED:{cl:"badge-success",l:"Accusé réception"}, PENDING:{cl:"badge-warning",l:"En attente"}, REJECTED:{cl:"badge-danger",l:"Rejeté"} };

export default function TransmittalsPage() {
  const [transmittals, setTransmittals] = useState([]);
  const [compose, setCompose] = useState(false);

  useEffect(() => { api.get("/transmittals").then(setTransmittals).catch(console.error); }, []);

  return (
    <div>
      <div className="page-header">
        <h1>📤 Transmittals</h1>
        <p>Envoi et suivi des documents — {transmittals.length} transmittals | {transmittals.filter(t=>t.status==="PENDING").length} en attente de réponse</p>
      </div>

      <div className="grid-4 mb-24">
        {[{l:"Total",v:transmittals.length,c:"var(--accent)"},{l:"Accusé réception",v:transmittals.filter(t=>t.status==="ACKNOWLEDGED").length,c:"var(--success)"},{l:"En attente",v:transmittals.filter(t=>t.status==="PENDING").length,c:"var(--warning)"},{l:"Docs envoyés",v:transmittals.reduce((a,t)=>a+t.docs.length,0),c:"var(--info)"}].map((k,i)=>(
          <div key={i} className="kpi-card">
            <div className="kpi-value" style={{color:k.c}}>{k.v}</div>
            <div className="kpi-label">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Liste des transmittals</span>
          <button className="btn btn-primary btn-sm" onClick={()=>setCompose(true)}>✏️ Nouveau transmittal</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Référence</th><th>Objet</th><th>De</th><th>À</th><th>Date</th><th>Statut</th><th>Documents</th><th>Réponse</th></tr></thead>
            <tbody>
              {transmittals.map(t => (
                <tr key={t.id}>
                  <td><strong style={{color:"var(--accent)"}}>{t.ref}</strong></td>
                  <td>{t.subject}</td>
                  <td style={{color:"var(--text-secondary)",fontSize:12}}>{t.fromName}</td>
                  <td style={{color:"var(--text-secondary)",fontSize:12}}>{t.to}</td>
                  <td style={{color:"var(--text-muted)",fontSize:12}}>{t.date}</td>
                  <td><span className={`badge ${STATUS[t.status]?.cl||"badge-gray"}`}>{STATUS[t.status]?.l||t.status}</span></td>
                  <td>{t.linkedDocs?.map((d,i)=><span key={i} className="tag">{d}</span>)}</td>
                  <td style={{fontSize:12,color:t.response?"var(--success)":"var(--text-muted)"}}>{t.response||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {compose && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setCompose(false)}>
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:28,width:500}} onClick={e=>e.stopPropagation()}>
            <h3 style={{marginBottom:16}}>✏️ Nouveau Transmittal</h3>
            {["Destinataire","Objet","Documents joints"].map(lbl=>(
              <div key={lbl} style={{marginBottom:14}}>
                <label style={{fontSize:12,color:"var(--text-muted)",display:"block",marginBottom:4}}>{lbl}</label>
                <input style={{width:"100%",background:"var(--bg-secondary)",border:"1px solid var(--border)",color:"var(--text-primary)",padding:"8px 12px",borderRadius:8,fontSize:13}} />
              </div>
            ))}
            <textarea style={{width:"100%",background:"var(--bg-secondary)",border:"1px solid var(--border)",color:"var(--text-primary)",padding:"8px 12px",borderRadius:8,fontSize:13,minHeight:80}} placeholder="Message..."/>
            <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setCompose(false)}>Annuler</button>
              <button className="btn btn-primary">📤 Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
