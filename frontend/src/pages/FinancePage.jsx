import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

export default function FinancePage() {
  const [budget, setBudget] = useState(null);

  useEffect(() => { api.get("/budget").then(setBudget).catch(console.error); }, []);
  if (!budget) return <div style={{color:"var(--text-muted)",padding:40}}>Chargement...</div>;

  const remaining = budget.total - budget.spent;
  const burnRate = Math.round(budget.spent / 4);
  const remainingSprints = 3;
  const forecast = budget.spent + burnRate * remainingSprints;
  const onBudget = forecast <= budget.total;
  const fmt = n => (n/1000).toFixed(0) + "k€";

  return (
    <div>
      <div className="page-header">
        <h1>💰 Finance & Budget</h1>
        <p>Suivi budgétaire — {budget.percentUsed}% consommé</p>
      </div>

      <div className="grid-4 mb-24">
        {[
          { label:"Budget total",    value:fmt(budget.total),  color:"var(--accent)" },
          { label:"Dépensé",         value:fmt(budget.spent),  color:budget.percentUsed>80?"var(--warning)":"var(--success)" },
          { label:"Restant",         value:fmt(remaining),     color:"var(--text-primary)" },
          { label:"Forecast final",  value:fmt(forecast),      color:onBudget?"var(--success)":"var(--danger)" },
        ].map((k,i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value" style={{color:k.color}}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Consommation globale</span></div>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
              <span>Dépensé</span>
              <strong style={{color:budget.percentUsed>80?"var(--warning)":"var(--success)"}}>{budget.percentUsed}%</strong>
            </div>
            <div className="progress-bar" style={{height:12}}>
              <div className="progress-fill" style={{width:`${budget.percentUsed}%`,background:budget.percentUsed>80?"var(--warning)":"var(--success)"}}/>
            </div>
          </div>
          <div style={{padding:16,background:"var(--bg-secondary)",borderRadius:8,marginTop:12}}>
            <div style={{fontSize:13,marginBottom:4}}>
              {onBudget
                ? <span style={{color:"var(--success)"}}>✅ Projet dans le budget</span>
                : <span style={{color:"var(--danger)"}}>⚠️ Dépassement estimé de {fmt(forecast-budget.total)}</span>
              }
            </div>
            <div style={{fontSize:12,color:"var(--text-muted)"}}>Burn rate : {fmt(burnRate)}/sprint | {remainingSprints} sprints restants</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🗂️ Répartition par poste</span></div>
          {Object.entries(budget.breakdown).map(([key, val]) => {
            const labels = { development:"Développement", infrastructure:"Infrastructure", tooling:"Outillage", management:"Management" };
            const pct = Math.round(val/budget.spent*100);
            return (
              <div key={key} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                  <span>{labels[key]||key}</span>
                  <span>{fmt(val)} <span style={{color:"var(--text-muted)"}}>({pct}%)</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill blue" style={{width:`${pct}%`}}/>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">📅 Budget par mois</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mois</th><th>Planifié</th><th>Réel</th><th>Écart</th></tr></thead>
              <tbody>
                {budget.byMonth.map((m,i) => {
                  const delta = m.actual - m.planned;
                  return (
                    <tr key={i}>
                      <td>{m.month}</td>
                      <td>{fmt(m.planned)}</td>
                      <td>{fmt(m.actual)}</td>
                      <td style={{color:delta>0?"var(--danger)":"var(--success)"}}>{delta>0?"+":""}{fmt(delta)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🔮 Forecast</span></div>
          <div style={{padding:20,textAlign:"center"}}>
            <div style={{fontSize:48,fontWeight:700,color:onBudget?"var(--success)":"var(--danger)",marginBottom:8}}>{fmt(forecast)}</div>
            <div style={{fontSize:14,color:"var(--text-secondary)",marginBottom:16}}>Estimation finale du projet</div>
            <div style={{display:"flex",justifyContent:"center",gap:40}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700}}>{fmt(budget.total)}</div><div style={{fontSize:12,color:"var(--text-muted)"}}>Budget</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:onBudget?"var(--success)":"var(--danger)"}}>{fmt(Math.abs(budget.total-forecast))}</div><div style={{fontSize:12,color:"var(--text-muted)"}}>{onBudget?"Marge":"Dépassement"}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
