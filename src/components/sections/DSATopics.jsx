import React, { useEffect, useState } from 'react';
import { Code2, ChevronDown, ChevronUp, Clock, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

const impColor  = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
const diffColor = { Easy: 'badge-low', Medium: 'badge-medium', Hard: 'badge-high' };
const freqColor = { 'Very Common': 'badge-high', 'Common': 'badge-medium', 'Rare': 'badge-low' };

function TopicAccordion({ topic }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item ${open ? 'open' : ''}`}>
      <div className="accordion-trigger" onClick={() => setOpen(!open)}>
        <div className="accordion-trigger-left">
          <span className={`badge ${impColor[topic.importance] || 'badge-medium'}`}>{topic.importance}</span>
          <span className="accordion-trigger-text">{topic.name}</span>
          {topic.frequency && (
            <span className={`badge ${freqColor[topic.frequency] || 'badge-medium'}`} style={{ fontSize: '0.68rem' }}>
              {topic.frequency}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {topic.timeToLearn && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {topic.timeToLearn}
            </span>
          )}
          <div className="accordion-chevron">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>
      </div>
      {open && (
        <div className="accordion-content">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subtopics</div>
            <div className="chip-grid">
              {topic.subtopics?.map((st) => (
                <span key={st} className="chip" style={{ fontSize: '0.75rem' }}>{st}</span>
              ))}
            </div>
          </div>
          {topic.mustDoProblems?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Must-Do Problems</div>
              {topic.mustDoProblems.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: 5,
                  fontSize: '0.82rem'
                }}>
                  <span style={{ color: 'var(--text-primary)', flex: 1 }}>{p.title}</span>
                  <span className={`badge ${diffColor[p.difficulty] || 'badge-medium'}`}>{p.difficulty}</span>
                  {p.category && <span className="badge badge-accent" style={{ fontSize: '0.67rem' }}>{p.category}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DSATopics() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['dsa'];

  useEffect(() => { loadSection('dsa'); }, []);

  if (!s || s.loading) return <LoadingSection title="DSA Topics" />;
  if (s.error) return <ErrorSection error={s.error} section="dsa" />;
  const d = s.data;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-purple"><Code2 size={24} /></div>
        <div>
          <h1 className="section-title">DSA Topics</h1>
          <p className="section-subtitle">Data Structures & Algorithms for {state.company}</p>
        </div>
      </div>

      {/* Pattern insight */}
      {d.companyPattern && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--accent-dim)',
          border: '1px solid var(--border-hover)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 24,
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7
        }}>
          <strong style={{ color: 'var(--accent)' }}>🎯 Company Pattern: </strong>{d.companyPattern}
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Focus Areas */}
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} color="var(--accent)" /> Key Focus Areas
          </h3>
          <div className="chip-grid">
            {d.focusAreas?.map((f) => (
              <span key={f} className="chip active">{f}</span>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: '0.95rem' }}>🔗 Practice Platforms</h3>
          <div className="chip-grid">
            {d.platforms?.map((p) => (
              <span key={p} className="chip">{p}</span>
            ))}
          </div>
          {d.prepTips && (
            <div style={{ marginTop: 12 }}>
              {d.prepTips?.map((tip, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--teal)', marginBottom: 4, display: 'flex', gap: 6 }}>
                  <span>→</span> {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Topics Accordion */}
      <div>
        <h3 style={{ marginBottom: 16 }}>📚 Topic-wise Breakdown</h3>
        {d.topics?.map((topic, i) => (
          <TopicAccordion key={i} topic={topic} />
        ))}
      </div>
    </div>
  );
}
