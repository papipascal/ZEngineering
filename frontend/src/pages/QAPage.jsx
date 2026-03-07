import React, { useState, useEffect } from 'react';
import { api } from '../hooks/useApi.js';

export default function QAPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { api.get("/metrics").then(setMetrics).catch(console.error); }, []);
  if (!metrics) return <div style={{color:"var(--text-muted)",padding:40}}>Chargement...</div>;

  const coverageStatus = metrics.coverage >= 85 ? "success" : metrics.coverage >= 70 ? "warning" : "danger";
  const qualityScore = Math.max(0, Math.round((metrics.coverage * 0.4) + ((100 - metrics.openBugs * 5) * 0.3) + ((100 - metrics.criticalBugs * 20) * 0.3)));
  const grade = qualityScore >= 80 ? "A" : qualityScore >= 70 ? "B" : qualityScore >= 60 ? "C" : "D";
  const gradeColor = { A:"var(--success)", B:"var(--accent)", C:"var(--warning)", D:"var(--danger)" }[grade];

  return (
    <div>
      <div className="page-header">
        <h1>🧪 QA & Tests</h1>
        <p>Qualité du code — Note globale : {grade} | Score : {qualityScore}/100</p>
      </div>

      <div className="grid-4 mb-24">
        {[
          { label:"Couverture tests",    value:`${metrics.coverage}%`, sub:"cible 85%", color:`var(--${coverageStatus})` },
          { label:"Bugs ouverts",        value:metrics.openBugs,        sub:`${metrics.criticalBugs} critique(s)`, color:metrics.criticalBugs>0?"var(--danger)":"var(--warning)" },
          { label:"PRs ouvertes",        value:metrics.openPRs,         sub:`${metrics.mergedThisWeek} mergées/semaine`, color:"var(--accent)" },
          { label:"Score qualité",       value:`${qualityScore}/100`,   sub:`Note : ${grade}`, color:gradeColor },
        ].map((k,i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value" style={{color:k.color}}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-trend text-muted">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Couverture de tests</span></div>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
              <span>Couverture actuelle</span>
              <strong style={{color:`var(--${coverageStatus})`}}>{metrics.coverage}%</strong>
            </div>
            <div className="progress-bar" style={{height:12}}>
              <div className="progress-fill" style={{width:`${metrics.coverage}%`,background:`var(--${coverageStatus})`}}/>
            </div>
            <div style={{fontSize:11,color:"var(--text-muted)",marginTop:4}}>Objectif : 85% | Écart : {85-metrics.coverage}%</div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:6}}>Décomposition indicative</div>
            {[{l:"Tests unitaires",v:82},{l:"Tests d'intégration",v:65},{l:"Tests E2E",v:45}].map(t=>(
              <div key={t.l} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span>{t.l}</span><span>{t.v}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${t.v}%`,background:t.v>=80?"var(--success)":t.v>=60?"var(--warning)":"var(--danger)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🐛 Bugs</span></div>
          <div style={{display:"flex",gap:24,marginBottom:20}}>
            {[{l:"Critiques",v:metrics.criticalBugs,c:"var(--danger)"},{l:"Majeurs",v:3,c:"var(--warning)"},{l:"Mineurs",v:metrics.openBugs-metrics.criticalBugs-3,c:"var(--text-muted)"}].map(b=>(
              <div key={b.l} style={{textAlign:"center"}}>
                <div style={{fontSize:32,fontWeight:700,color:b.c}}>{b.v}</div>
                <div style={{fontSize:12,color:"var(--text-muted)"}}>{b.l}</div>
              </div>
            ))}
          </div>
          {metrics.criticalBugs > 0 && (
            <div style={{padding:12,background:"rgba(239,68,68,0.1)",borderRadius:8,border:"1px solid var(--danger)",fontSize:13}}>
              🔴 <strong>Bug critique actif</strong> — résolution prioritaire requise
            </div>
          )}
          <div style={{marginTop:12}}>
            <div className="card-title" style={{marginBottom:10}}>Critères d'acceptation Sprint 3</div>
            {["Coverage ≥ 85%","0 bug critique en prod","Performance P95 < 200ms","Accessibilité WCAG AA","Review approuvée lead dev"].map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,fontSize:13}}>
                <span style={{color:i<2?"var(--danger)":"var(--success)"}}>{i<2?"❌":"✅"}</span>
                <span style={{color:i<2?"var(--text-primary)":"var(--text-secondary)"}}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🔀 Pull Requests</span></div>
          <div style={{display:"flex",justifyContent:"space-around",marginBottom:16}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:32,fontWeight:700,color:"var(--warning)"}}>{metrics.openPRs}</div><div style={{fontSize:12,color:"var(--text-muted)"}}>Ouvertes</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:32,fontWeight:700,color:"var(--success)"}}>{metrics.mergedThisWeek}</div><div style={{fontSize:12,color:"var(--text-muted)"}}>Mergées/semaine</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:32,fontWeight:700,color:"var(--accent)"}}>{metrics.commits30d}</div><div style={{fontSize:12,color:"var(--text-muted)"}}>Commits/30j</div></div>
          </div>
          {metrics.openPRs > 4 && <div style={{padding:10,background:"rgba(245,158,11,0.1)",borderRadius:8,fontSize:12,border:"1px solid var(--warning)"}}>⚠️ Beaucoup de PRs en attente — mobilisation reviewers recommandée</div>}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">📈 Dette technique</span></div>
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:48,fontWeight:700,color:"var(--warning)",marginBottom:8}}>{metrics.technicalDebt}</div>
            <div style={{fontSize:14,color:"var(--text-secondary)",marginBottom:16}}>estimées pour résorber la dette</div>
          </div>
          <div style={{fontSize:13}}>
            {["Tests E2E manquants (8h)","Documentation API incomplète (5h)","Types TypeScript à affiner (3h)","Refactoring composants (2h)"].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{color:"var(--warning)"}}>⚡</span>{item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
