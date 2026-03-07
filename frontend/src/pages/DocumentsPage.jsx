import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const STATUS = { APPROVED:{cl:"badge-success",l:"Approuvé"}, IN_REVIEW:{cl:"badge-warning",l:"En revue"}, DRAFT:{cl:"badge-gray",l:"Brouillon"} };
const TYPE_ICON = { CDC:"📋", SPEC_TECH:"🔧", PQP:"✅", USER_MANUAL:"📖", REPORT:"📊", TEST_PLAN:"🧪", CONTRACT:"📝", PROCEDURE:"📌" };

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => { api.get("/documents").then(setDocs).catch(console.error); }, []);

  const filtered = docs.filter(d => {
    if (filter !== "ALL" && d.status !== filter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.type.includes(search.toUpperCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1>📄 Gestion Documentaire</h1>
        <p>{docs.length} documents — {docs.filter(d=>d.status==="APPROVED").length} approuvés, {docs.filter(d=>d.status==="IN_REVIEW").length} en revue</p>
      </div>

      <div className="grid-4 mb-24">
        {[{l:"Total",s:"ALL",c:"var(--accent)"},{l:"Approuvés",s:"APPROVED",c:"var(--success)"},{l:"En revue",s:"IN_REVIEW",c:"var(--warning)"},{l:"Brouillons",s:"DRAFT",c:"var(--text-muted)"}].map(({l,s,c})=>(
          <div key={s} className="kpi-card" style={{cursor:"pointer",border:`1px solid ${filter===s?"var(--accent)":"var(--border)"}`}} onClick={()=>setFilter(s)}>
            <div className="kpi-value" style={{color:c}}>{s==="ALL"?docs.length:docs.filter(d=>d.status===s).length}</div>
            <div className="kpi-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un document..."
            style={{background:"var(--bg-secondary)",border:"1px solid var(--border)",color:"var(--text-primary)",padding:"7px 12px",borderRadius:8,fontSize:13,width:280}} />
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-primary btn-sm">⬆️ Upload</button>
            <button className="btn btn-ghost btn-sm">📤 Nouveau transmittal</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Document</th><th>Type</th><th>Révision</th><th>Statut</th><th>Auteur</th><th>Date</th><th>Taille</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{TYPE_ICON[d.type]||"📄"}</span>
                      <div>
                        <div style={{fontWeight:500}}>{d.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)"}}>{d.tags?.map(t=><span key={t} className="tag">{t}</span>)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{fontSize:11,background:"var(--border)",padding:"2px 7px",borderRadius:4}}>{d.type}</span></td>
                  <td><span style={{fontWeight:600,color:"var(--accent)"}}>Rév. {d.rev}</span></td>
                  <td><span className={`badge ${STATUS[d.status]?.cl||"badge-gray"}`}>{STATUS[d.status]?.l||d.status}</span></td>
                  <td style={{color:"var(--text-secondary)"}}>{d.authorName}</td>
                  <td style={{color:"var(--text-secondary)",fontSize:12}}>{d.date}</td>
                  <td style={{color:"var(--text-muted)",fontSize:12}}>{d.size}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="btn btn-ghost btn-sm">👁</button>
                      <button className="btn btn-ghost btn-sm">⬇️</button>
                      {d.status !== "APPROVED" && <button className="btn btn-ghost btn-sm">✅</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
