import React, { useEffect, useState } from 'react';
import { Monitor, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

const impColor = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

function TopicCard({ topic }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item ${open ? 'open' : ''}`}>
      <div className="accordion-trigger" onClick={() => setOpen(!open)}>
        <div className="accordion-trigger-left">
          <span className={`badge ${impColor[topic.importance] || 'badge-medium'}`}>{topic.importance}</span>
          <span className="accordion-trigger-text">{topic.name}</span>
        </div>
        <div className="accordion-chevron">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
      </div>
      {open && (
        <div className="accordion-content">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subtopics</div>
            <div className="chip-grid">
              {topic.subtopics?.map((st) => <span key={st} className="chip" style={{ fontSize: '0.75rem' }}>{st}</span>)}
            </div>
          </div>
          {topic.conceptsToMaster?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concepts to Master</div>
              {topic.conceptsToMaster.map((c, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--teal)', marginBottom: 4, display: 'flex', gap: 6 }}>
                  <span>→</span> {c}
                </div>
              ))}
            </div>
          )}
          {topic.keyQuestions?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Frequently Asked Questions</div>
              {topic.keyQuestions.map((q, i) => (
                <div key={i} style={{
                  padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 5,
                  borderLeft: '2px solid var(--accent)'
                }}>
                  Q: {q}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OSTopics() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['os'];

  useEffect(() => { loadSection('os'); }, []);

  if (!s || s.loading) return <LoadingSection title="OS Topics" />;
  if (s.error) return <ErrorSection error={s.error} section="os" />;
  const d = s.data;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-teal"><Monitor size={24} /></div>
        <div>
          <h1 className="section-title">Operating Systems</h1>
          <p className="section-subtitle">OS preparation for {state.company}</p>
        </div>
      </div>

      {d.companyFocus && (
        <div style={{ padding: '14px 18px', background: 'var(--teal-dim)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: '0.875rem', color: 'var(--teal)' }}>
          🖥️ <strong>Company Focus: </strong><span style={{ color: 'var(--text-secondary)' }}>{d.companyFocus}</span>
        </div>
      )}

      {d.prepTips?.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: '0.95rem' }}>💡 Prep Tips</h3>
          {d.prepTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--teal)' }}>→</span> {tip}
            </div>
          ))}
        </div>
      )}

      {d.topics?.map((topic, i) => <TopicCard key={i} topic={topic} />)}
    </div>
  );
}
