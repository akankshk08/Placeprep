import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';
import TopicLearningPage from './TopicLearningPage';

const importanceColor = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

export default function ImportantSubjects() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['subjects'];

  // Track which topic was clicked for drill-down
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => { loadSection('subjects'); }, []);

  // If a topic is selected, render the drill-down learning page
  if (selectedTopic) {
    return (
      <TopicLearningPage
        topic={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  if (!s || s.loading) return <LoadingSection title="Important Subjects" />;
  if (s.error) return <ErrorSection error={s.error} section="subjects" />;
  const d = s.data;
  const subjects = d.subjects || [];

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-yellow"><BookOpen size={24} /></div>
        <div>
          <h1 className="section-title">Important Subjects</h1>
          <p className="section-subtitle">Priority subjects for {state.company} placements</p>
        </div>
      </div>

      {d.overallTip && (
        <div style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, var(--yellow-dim), var(--accent-dim))',
          border: '1px solid rgba(255,209,102,0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 24,
          fontSize: '0.875rem',
          color: 'var(--yellow)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          💡 <strong>Key Tip:</strong>&nbsp; {d.overallTip}
        </div>
      )}

      {/* Weight bars */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>📊 Subject Importance Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...subjects].sort((a, b) => b.weightage - a.weightage).map((sub, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sub.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${importanceColor[sub.importance]}`}>{sub.importance}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{sub.weightage}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${sub.weightage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject cards — now clickable */}
      <div style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        💡 Click any subject card to start learning with AI-powered subtopics, notes, and quizzes
      </div>
      <div className="grid-2">
        {subjects.map((sub, i) => (
          <div
            key={i}
            className="card"
            onClick={() => setSelectedTopic(sub)}
            style={{ cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,109,255,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: '1rem' }}>{sub.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`badge ${importanceColor[sub.importance]}`}>{sub.importance}</span>
                <ChevronRight size={15} color="var(--text-muted)" />
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>{sub.reason}</p>
            {sub.prepTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--teal)', marginBottom: 10 }}>
                <Clock size={12} /> Prep Time: {sub.prepTime}
              </div>
            )}
            <div className="chip-grid">
              {sub.topics?.map((t) => (
                <span key={t} className="chip" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>{t}</span>
              ))}
            </div>
            {/* Click hint */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-card)',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent)' }}>
              <BookOpen size={11} /> Start Learning →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
