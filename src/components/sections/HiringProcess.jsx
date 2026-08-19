import React, { useEffect } from 'react';
import { Users, Clock, AlertCircle, Lightbulb, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

const diffColor = { Easy: 'badge-low', Medium: 'badge-medium', Hard: 'badge-high' };

export default function HiringProcess() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['hiring'];

  useEffect(() => { loadSection('hiring'); }, []);

  if (!s || s.loading) return <LoadingSection title="Hiring Process" />;
  if (s.error) return <ErrorSection error={s.error} section="hiring" />;
  const d = s.data;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-orange"><Users size={24} /></div>
        <div>
          <h1 className="section-title">Hiring Process</h1>
          <p className="section-subtitle">End-to-end recruitment pipeline at {state.company}</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Process Type', value: d.processType, icon: '🏫' },
          { label: 'Total Rounds', value: d.totalRounds, icon: '🔄' },
          { label: 'Avg Duration', value: d.avgDuration, icon: '⏱️' },
          { label: 'Preferred Colleges', value: d.preferredColleges, icon: '🎓' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize: '1rem', WebkitTextFillColor: 'var(--text-primary)' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rounds */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>📋 Interview Rounds</h3>
        <div className="hiring-steps">
          {d.rounds?.map((round, i) => (
            <div key={i} className="hiring-step">
              <div className="hiring-step-num">{round.roundNum}</div>
              <div className="hiring-step-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div className="hiring-step-title">{round.name}</div>
                  <span className={`badge ${diffColor[round.difficulty] || 'badge-medium'}`}>{round.difficulty}</span>
                  <span className="badge badge-teal">
                    <Clock size={11} /> {round.duration}
                  </span>
                  {round.eliminationRate && (
                    <span className="badge badge-orange">Elim: {round.eliminationRate}</span>
                  )}
                </div>
                <p className="hiring-step-desc">{round.description}</p>
                {round.tips?.length > 0 && (
                  <div className="hiring-step-tags">
                    {round.tips.map((t, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--teal)' }}>
                        <Lightbulb size={12} /> {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Salary */}
        <div className="card">
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={18} color="var(--teal)" /> Salary Bands
          </h3>
          {d.salaryBands?.map((s, i) => (
            <div key={i} style={{
              padding: '14px', background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)', marginBottom: 8
            }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.role}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>{s.ctc}</div>
              {s.base && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Base: {s.base} | Bonus: {s.bonus}</div>}
            </div>
          ))}
        </div>

        {/* Insider Tips */}
        <div className="card">
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} color="var(--yellow)" /> Insider Tips
          </h3>
          {d.insiderTips?.map((tip, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 0',
              borderBottom: i < d.insiderTips.length - 1 ? '1px solid var(--border-card)' : 'none'
            }}>
              <span style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: '1rem' }}>💡</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
