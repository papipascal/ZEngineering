import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

const STATUS_COLOR = { OPERATIONAL:"var(--success)", MAINTENANCE:"var(--warning)", OUT_OF_SERVICE:"var(--danger)" };
const STATUS_LABEL = { OPERATIONAL:"Opérationnel", MAINTENANCE:"Maintenance", OUT_OF_SERVICE:"Hors service" };
const CRIT_COLOR = { CRITICAL:"var(--danger)", HIGH:"var(--warning)", MEDIUM:"var(--accent)", LOW:"var(--success)" };

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/equipment").then(setEquipment).catch(console.error);
    api.get("/spare-parts").then(setSpareParts).catch(console.error);
  }, []);

  const filtered = filter === "ALL" ? equipment : equipment.filter(e => e.status === filter);
  const alerts = spareParts.filter(p => p.alert);

  return (
    <div>
      <div className="page-header">
        <h1>🔧 Équipements</h1>
        <p>{equipment.length} équipements — {equipment.filter(e=>e.status==="OUT_OF_SERVICE").length} hors service, {alerts.length} alertes pièces</p>
      </div>

      {alerts.length > 0 && (
        <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid var(--danger)",borderRadius:8,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:20}}>🚨</span>
          <div>
            <strong style={{color:"var(--danger)"}}>Alertes stock pièces de rechange</strong>
            <div style={{fontSize:13,marginTop:2}}>{alerts.map(p=>`${p.ref} (${p.name}) — ${p.alert==="STOCK_VIDE"?"STOCK VIDE":"STOCK BAS"}`).join(" · ")}</div>
          </div>
        </div>
      )}

      <div className="grid-4 mb-24">
        {[{l:"Total",s:"ALL",c:"var(--accent)"},{l:"Opérationnels",s:"OPERATIONAL",c:"var(--success)"},{l:"Maintenance",s:"MAINTENANCE",c:"var(--warning)"},{l:"Hors service",s:"OUT_OF_SERVICE",c:"var(--danger)"}].map(({l,s,c})=>(
          <div key={s} className="kpi-card" style={{cursor:"pointer",border:`1px solid ${filter===s?"var(--accent)":"var(--border)"}`}} onClick={()=>setFilter(s)}>
            <div className="kpi-value" style={{color:c}}>{s==="ALL"?equipment.length:equipment.filter(e=>e.status===s).length}</div>
            <div className="kpi-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">🏭 Liste équipements</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tag</th><th>Nom</th><th>Type</th><th>Statut</th><th>Criticité</th><th>Prochain entretien</th></tr></thead>
              <tbody>
                {filtered.map(eq => (
                  <tr key={eq.id} style={{cursor:"pointer"}} onClick={()=>setSelected(selected===eq.id?null:eq.id)}>
                    <td><strong style={{color:"var(--accent)",fontFamily:"monospace"}}>{eq.tag}</strong></td>
                    <td>{eq.name}</td>
                    <td><span className="tag">{eq.type}</span></td>
                    <td><span className="badge" style={{background:STATUS_COLOR[eq.status]+"22",color:STATUS_COLOR[eq.status]}}>{STATUS_LABEL[eq.status]}</span></td>
                    <td><span className="badge" style={{background:CRIT_COLOR[eq.criticality]+"22",color:CRIT_COLOR[eq.criticality]}}>{eq.criticality}</span></td>
                    <td style={{fontSize:12,color:new Date(eq.nextMaintenance)<new Date()?"var(--danger)":"var(--text-secondary)"}}>{eq.nextMaintenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🔩 Pièces de rechange</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Référence</th><th>Pièce</th><th>Équip.</th><th>Qté</th><th>Min</th><th>Alerte</th></tr></thead>
              <tbody>
                {spareParts.map(p => (
                  <tr key={p.id}>
                    <td><span style={{fontSize:11,fontFamily:"monospace",color:"var(--text-muted)"}}>{p.ref}</span></td>
                    <td style={{fontSize:13}}>{p.name}</td>
                    <td><span className="tag">{p.equipmentTag}</span></td>
                    <td><strong style={{color:p.qty===0?"var(--danger)":p.qty<p.minQty?"var(--warning)":"var(--success)"}}>{p.qty}</strong></td>
                    <td style={{color:"var(--text-muted)"}}>{p.minQty}</td>
                    <td>{p.alert ? <span className={`badge ${p.alert==="STOCK_VIDE"?"badge-danger":"badge-warning"}`}>{p.alert.replace("_"," ")}</span> : <span style={{color:"var(--text-muted)"}}>OK</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
