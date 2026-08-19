import React, { useEffect } from 'react';
import { FileText, Check, X, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

export default function ResumeTips() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['resumeTips'];

  useEffect(() => { loadSection('resumeTips'); }, []);

  if (!s || s.loading) return <LoadingSection title="Resume Tips" />;
  if (s.error) return <ErrorSection error={s.error} section="resumeTips" />;
  const d = s.data;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-teal"><FileText size={24} /></div>
        <div>
          <h1 className="section-title">Resume Tips</h1>
          <p className="section-subtitle">Resume strategy tailored for {state.company}</p>
        </div>
      </div>

      {/* ATS Keywords */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14 }}>🔑 ATS Keywords to Include</h3>
        <div className="chip-grid">
          {d.atsKeywords?.map((kw) => (
            <span key={kw} className="badge badge-accent" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>{kw}</span>
          ))}
        </div>
      </div>

      {/* Skills to highlight */}
      {d.skillsToHighlight?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 14 }}>⭐ Skills to Highlight</h3>
          <div className="chip-grid">
            {d.skillsToHighlight.map((sk) => (
              <span key={sk} className="chip active">{sk}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Do's */}
        <div className="card">
          <h3 style={{ marginBottom: 16, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={18} /> Do's
          </h3>
          {d.dos?.map((item, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < d.dos.length - 1 ? '1px solid var(--border-card)' : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4, color: 'var(--green)' }}>✓ {item.tip}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.reason}</div>
              {item.example && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '6px 10px', background: 'var(--green-dim)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--green)' }}>
                  e.g. {item.example}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Don'ts */}
        <div className="card">
          <h3 style={{ marginBottom: 16, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <X size={18} /> Don'ts
          </h3>
          {d.donts?.map((item, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < d.donts.length - 1 ? '1px solid var(--border-card)' : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4, color: 'var(--red)' }}>✗ {item.tip}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Bullets */}
      {d.sampleBullets?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>✍️ Bullet Point Makeovers</h3>
          {d.sampleBullets.map((b, i) => (
            <div key={i} style={{ marginBottom: 16, padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗ BAD:</span>
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{b.bad}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ GOOD:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{b.good}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Tips + Format */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} color="var(--yellow)" /> Project Tips
          </h3>
          {d.projectTips?.map((tip, i) => (
            <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--accent)' }}>→</span> {tip}
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>📄 Recommended Format</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{d.resumeFormat}</p>
          {d.coverLetterTips?.length > 0 && (
            <>
              <h4 style={{ margin: '16px 0 10px', fontSize: '0.875rem' }}>📧 Cover Letter Tips</h4>
              {d.coverLetterTips.map((tip, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--teal)' }}>→</span> {tip}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
