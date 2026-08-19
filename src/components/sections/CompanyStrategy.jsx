import React, { useEffect } from 'react';
import { Target, AlertTriangle, Star, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

const impactColor = { High: 'var(--red)', Medium: 'var(--yellow)', Low: 'var(--text-muted)' };

export default function CompanyStrategy() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['strategy'];

  useEffect(() => { loadSection('strategy'); }, []);

  if (!s || s.loading) return <LoadingSection title="Company Strategy" />;
  if (s.error) return <ErrorSection error={s.error} section="strategy" />;
  const d = s.data;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-teal"><Target size={24} /></div>
        <div>
          <h1 className="section-title">Company Strategy</h1>
          <p className="section-subtitle">How to specifically crack {state.company}</p>
        </div>
      </div>

      {/* Overview */}
      {d.overview && (
        <div style={{ padding: '20px 24px', background: 'var(--grad-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 24 }}>
          <h3 style={{ marginBottom: 10 }}>🎯 Strategic Overview</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{d.overview}</p>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* What company values */}
        <div className="card">
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={18} color="var(--yellow)" /> What {state.company} Values
          </h3>
          {d.whatCompanyValues?.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < d.whatCompanyValues.length - 1 ? '1px solid var(--border-card)' : 'none' }}>
              <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>★</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Time Allocation */}
        <div className="card">
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="var(--accent)" /> Time Allocation
          </h3>
          {d.timeAllocation?.map((ta, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{ta.area}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700 }}>{ta.percentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${ta.percentage}%` }} />
              </div>
              {ta.rationale && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{ta.rationale}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes */}
      {d.commonMistakes?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
            <AlertTriangle size={18} /> Common Mistakes to Avoid
          </h3>
          {d.commonMistakes.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < d.commonMistakes.length - 1 ? '1px solid var(--border-card)' : 'none' }}>
              <div style={{ color: impactColor[m.impact] || 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, marginTop: 2, width: 40 }}>
                {m.impact}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--red)', marginBottom: 4 }}>✗ {m.mistake}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>✓ Fix: {m.fix}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid-2">
        {/* Differentiators */}
        {d.differentiators?.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>🏆 What Top Candidates Do</h3>
            {d.differentiators.map((d_, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--teal)', fontWeight: 700 }}>→</span> {d_}
              </div>
            ))}
          </div>
        )}

        {/* Insider Tips */}
        {d.insiderTips?.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>🔮 Insider Tips</h3>
            {d.insiderTips.map((tip, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--teal)' }}>
                {tip}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Red Flags */}
      {d.redFlags?.length > 0 && (
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--red-dim)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: 12, color: 'var(--red)' }}>🚩 Interview Red Flags</h3>
          {d.redFlags.map((f, i) => (
            <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--red)' }}>•</span> {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
