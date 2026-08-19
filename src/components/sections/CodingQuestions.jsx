import React, { useEffect, useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, ExternalLink, Search, Code2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';
import BookmarkButton from '../ui/BookmarkButton';

const diffColor  = { Easy: 'badge-low', Medium: 'badge-medium', Hard: 'badge-high' };
const diffBg     = { Easy: 'rgba(6,214,160,0.08)', Medium: 'rgba(255,209,102,0.08)', Hard: 'rgba(255,107,107,0.08)' };
const freqColor  = { 'Very Common': 'badge-high', 'Common': 'badge-medium', 'Rare': 'badge-low' };

function CodingCard({ q, index }) {
  const [open, setOpen] = useState(false);

  const leetcodeUrl = `https://leetcode.com/problems/${q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}/`;
  const gfgUrl      = `https://www.geeksforgeeks.org/search/?query=${encodeURIComponent(q.title)}`;

  return (
    <div className="card" style={{ marginBottom: 14, borderLeft: `3px solid ${q.difficulty === 'Easy' ? 'var(--green)' : q.difficulty === 'Hard' ? 'var(--red)' : 'var(--yellow)'}` }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: diffBg[q.difficulty] || 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 800, color: q.difficulty === 'Easy' ? 'var(--green)' : q.difficulty === 'Hard' ? 'var(--red)' : 'var(--yellow)',
            flexShrink: 0,
          }}>
            {index + 1}
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{q.title}</h3>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span className={`badge ${diffColor[q.difficulty] || 'badge-medium'}`}>{q.difficulty}</span>
          {q.frequency && <span className={`badge ${freqColor[q.frequency] || 'badge-medium'}`} style={{ fontSize: '0.67rem' }}>{q.frequency}</span>}
          {q.category && <span className="badge badge-accent" style={{ fontSize: '0.67rem' }}>{q.category}</span>}
          <BookmarkButton section="codingQs" sectionLabel="Coding Questions" question={q.title} answer={q.description} />
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{q.description}</p>

      {/* Tags */}
      {q.tags?.length > 0 && (
        <div className="chip-grid" style={{ marginBottom: 12 }}>
          {q.tags.map(t => <span key={t} className="chip" style={{ fontSize: '0.7rem' }}>{t}</span>)}
        </div>
      )}

      {/* Sample IO */}
      {(q.sampleInput || q.sampleOutput) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {q.sampleInput && (
            <div style={{ background: 'var(--bg-base)', borderRadius: 8, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Input</div>
              <div style={{ color: 'var(--green)' }}>{q.sampleInput}</div>
            </div>
          )}
          {q.sampleOutput && (
            <div style={{ background: 'var(--bg-base)', borderRadius: 8, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</div>
              <div style={{ color: 'var(--accent)' }}>{q.sampleOutput}</div>
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="answer-toggle" style={{ flex: 1 }} onClick={() => setOpen(!open)}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {open ? 'Hide Approach' : 'View Hint & Approach'}
        </button>
        <a href={leetcodeUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,161,22,0.35)', background: 'rgba(255,161,22,0.08)', color: '#FFA116', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            <Code2 size={13} /> LeetCode
          </button>
        </a>
        <a href={gfgUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(43,166,63,0.35)', background: 'rgba(43,166,63,0.08)', color: '#2BA63F', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            <ExternalLink size={13} /> GFG
          </button>
        </a>
      </div>

      {/* Approach panel */}
      {open && (
        <div className="answer-text" style={{ marginTop: 12 }}>
          {q.constraints && (
            <div style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Constraints: </strong>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: 'var(--yellow)' }}>{q.constraints}</span>
            </div>
          )}
          {q.hint && (
            <div style={{ marginBottom: 10, padding: '10px 14px', background: 'rgba(255,209,102,0.07)', borderRadius: 8, color: 'var(--yellow)', borderLeft: '3px solid var(--yellow)' }}>
              💡 <strong>Hint:</strong> {q.hint}
            </div>
          )}
          {q.approach && (
            <div style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--teal)' }}>🔧 Approach: </strong>
              <span style={{ color: 'var(--text-secondary)' }}>{q.approach}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', padding: '10px 0', borderTop: '1px solid var(--border-card)', marginTop: 8 }}>
            {q.timeComplexity  && <span style={{ color: 'var(--accent)' }}>⏱ Time: <strong>{q.timeComplexity}</strong></span>}
            {q.spaceComplexity && <span style={{ color: 'var(--orange)' }}>💾 Space: <strong>{q.spaceComplexity}</strong></span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CodingQuestions() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['codingQs'];
  const [catFilter, setCatFilter]   = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [search, setSearch]         = useState('');

  useEffect(() => { loadSection('codingQs'); }, []);

  if (!s || s.loading) return <LoadingSection title="Loading Coding Questions…" />;
  if (s.error)         return <ErrorSection error={s.error} section="codingQs" />;

  const qs = s.data?.questions || [];
  const categories  = ['All', ...new Set(qs.map(q => q.category).filter(Boolean))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filtered = qs.filter(q => {
    const matchCat  = catFilter  === 'All' || q.category   === catFilter;
    const matchDiff = diffFilter === 'All' || q.difficulty  === diffFilter;
    const matchSrc  = !search    || q.title?.toLowerCase().includes(search.toLowerCase()) || q.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDiff && matchSrc;
  });

  const counts = { Easy: qs.filter(q => q.difficulty === 'Easy').length, Medium: qs.filter(q => q.difficulty === 'Medium').length, Hard: qs.filter(q => q.difficulty === 'Hard').length };

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-purple"><Terminal size={24} /></div>
        <div>
          <h1 className="section-title">Coding Questions</h1>
          <p className="section-subtitle">{state.company} · {qs.length} problems · Click LeetCode/GFG to solve</p>
        </div>
      </div>

      {/* Coding pattern */}
      {s.data?.codingPattern && (
        <div style={{ padding: '14px 18px', background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          🎯 <strong style={{ color: 'var(--accent)' }}>Test Pattern: </strong>{s.data.codingPattern}
        </div>
      )}

      {/* Difficulty overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[['Easy', 'var(--green)', '😊'], ['Medium', 'var(--yellow)', '😤'], ['Hard', 'var(--red)', '🔥']].map(([d, c, emoji]) => (
          <div key={d} onClick={() => setDiffFilter(diffFilter === d ? 'All' : d)}
            style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: `1px solid ${diffFilter === d ? c : 'var(--border-card)'}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '1.2rem' }}>{emoji}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: c }}>{counts[d]}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search problems…"
          style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Category chips */}
      <div className="chip-grid" style={{ marginBottom: 20 }}>
        {categories.map(c => <span key={c} className={`chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</span>)}
      </div>

      {/* Cards */}
      {filtered.length > 0
        ? filtered.map((q, i) => <CodingCard key={i} q={q} index={qs.indexOf(q)} />)
        : <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">No problems match your filters</div></div>
      }
    </div>
  );
}
