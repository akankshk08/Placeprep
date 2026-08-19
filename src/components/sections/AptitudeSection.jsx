import React, { useState, useEffect } from 'react';
import { Calculator, Brain, BookOpen, ChevronDown, ChevronUp, CheckCircle, XCircle, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';
import BookmarkButton from '../ui/BookmarkButton';
import { fetchAptitude } from '../../api/gemini';

const diffColor = { Easy: 'badge-low', Medium: 'badge-medium', Hard: 'badge-high' };
const freqColor = { 'Very Common': 'badge-high', 'Common': 'badge-medium', 'Rare': 'badge-low' };

function AptitudeCard({ q, index, showAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setReveal] = useState(false);

  const isCorrect = selected !== null && selected === q.answer;

  return (
    <div className="card" style={{ marginBottom: 14, borderLeft: revealed ? `3px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}` : '3px solid var(--border-card)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
            {index + 1}
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.6 }}>{q.question}</p>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
          {q.difficulty && <span className={`badge ${diffColor[q.difficulty] || 'badge-medium'}`}>{q.difficulty}</span>}
          {q.frequency && <span className={`badge ${freqColor[q.frequency] || 'badge-medium'}`} style={{ fontSize: '0.67rem' }}>{q.frequency}</span>}
          {q.topic && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{q.topic}</span>}
          <BookmarkButton section="aptitude" sectionLabel="Aptitude Practice" question={q.question} answer={q.solution} />
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {q.options?.map((opt, i) => {
          const isThis = opt === selected || opt === q.answer && revealed;
          const isWrong = opt === selected && revealed && selected !== q.answer;
          const isRight = opt === q.answer && revealed;
          return (
            <button key={i} onClick={() => { if (!revealed) setSelected(opt); }}
              style={{
                padding: '9px 14px', borderRadius: 8, textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
                border: `1px solid ${isRight ? 'var(--green)' : isWrong ? 'var(--red)' : isThis && !revealed ? 'var(--accent)' : 'var(--border-card)'}`,
                background: isRight ? 'rgba(6,214,160,0.1)' : isWrong ? 'rgba(255,107,107,0.1)' : isThis && !revealed ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                color: isRight ? 'var(--green)' : isWrong ? 'var(--red)' : isThis && !revealed ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '0.83rem', transition: 'all 0.2s', fontWeight: isRight ? 700 : 400,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {revealed && isRight && <CheckCircle size={14} color="var(--green)" />}
              {revealed && isWrong && <XCircle size={14} color="var(--red)" />}
              {opt}
            </button>
          );
        })}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!revealed && (
          <button onClick={() => { if (selected || showAnswer) setReveal(true); }}
            disabled={!selected && !showAnswer}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: selected ? 'var(--accent)' : 'var(--bg-secondary)', color: selected ? '#fff' : 'var(--text-muted)', cursor: selected ? 'pointer' : 'not-allowed', fontSize: '0.82rem', fontWeight: 600 }}>
            {selected ? '✓ Submit Answer' : 'Select an option'}
          </button>
        )}
        {!revealed && (
          <button onClick={() => setReveal(true)}
            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
            Show Answer
          </button>
        )}
        {revealed && selected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: isCorrect ? 'rgba(6,214,160,0.1)' : 'rgba(255,107,107,0.1)', color: isCorrect ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontSize: '0.82rem' }}>
            {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
          </div>
        )}
        <button onClick={() => { setSelected(null); setReveal(false); }}
          style={{ marginLeft: 'auto', padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}>
          Reset
        </button>
      </div>

      {/* Solution */}
      {revealed && q.solution && (
        <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(108,99,255,0.07)', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>📐 Solution:</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{q.solution}</div>
        </div>
      )}
    </div>
  );
}

const tabConfig = [
  { id: 'quantitative', label: '🔢 Quantitative', icon: Calculator, color: 'var(--accent)',  desc: 'Percentages, Speed, Profit/Loss, Ratios, Permutations' },
  { id: 'logical',      label: '🧠 Logical',       icon: Brain,      color: 'var(--teal)',   desc: 'Series, Syllogism, Blood Relations, Coding-Decoding' },
  { id: 'verbal',       label: '📖 Verbal',        icon: BookOpen,   color: 'var(--yellow)', desc: 'RC, Fill in Blanks, Grammar, Synonyms/Antonyms' },
];

export default function AptitudeSection() {
  const { state } = useApp();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState('quantitative');
  const [search, setSearch]   = useState('');
  const cacheKey = `aptitude_${state.company}`;

  // ignoreRef prevents a stale request (e.g. React StrictMode's dev double-invoke,
  // or a fast company change) from overwriting fresher already-rendered data.
  const load = async (ignoreRef) => {
    setLoading(true); setError(null);
    try {
      const d = await fetchAptitude(state.company, 'Software Engineer');
      if (ignoreRef.current) return;
      setData(d);
      sessionStorage.setItem(cacheKey, JSON.stringify(d));
    } catch (e) { if (!ignoreRef.current) setError(e.message); }
    finally { if (!ignoreRef.current) setLoading(false); }
  };

  useEffect(() => {
    const ignoreRef = { current: false };
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { try { setData(JSON.parse(cached)); return; } catch (_) {} }
    load(ignoreRef);
    return () => { ignoreRef.current = true; };
  }, [state.company]);

  if (loading) return <LoadingSection title="Loading Aptitude Questions…" subtitle="Fetching company-specific test patterns" />;
  if (error)   return <ErrorSection error={error} onRetry={() => load({ current: false })} />;
  if (!data)   return null;

  const questions = data[tab] || [];
  const filtered = search ? questions.filter(q => q.question?.toLowerCase().includes(search.toLowerCase()) || q.topic?.toLowerCase().includes(search.toLowerCase())) : questions;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-purple"><Calculator size={24} /></div>
        <div>
          <h1 className="section-title">Aptitude Practice</h1>
          <p className="section-subtitle">{state.company} — {(data.quantitative?.length || 0) + (data.logical?.length || 0) + (data.verbal?.length || 0)} questions based on actual test patterns</p>
        </div>
      </div>

      {/* Company pattern banner */}
      {data.companyPattern && (
        <div style={{ padding: '14px 18px', background: 'rgba(108,99,255,0.07)', border: '1px solid var(--border-hover)', borderRadius: 12, marginBottom: 20, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>📋 {state.company} Test Format</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{data.companyPattern}</div>
          {data.testPlatform && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>🖥️ Platform: <strong>{data.testPlatform}</strong> · Cutoff: <strong>{data.cutoffInfo}</strong></div>}
        </div>
      )}

      {/* Important topics */}
      {data.importantTopics?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {data.importantTopics.map((t, i) => (
            <span key={i} style={{ padding: '4px 12px', borderRadius: 20, background: t.mustDo ? 'rgba(255,107,107,0.1)' : 'var(--bg-secondary)', border: `1px solid ${t.mustDo ? 'var(--red)' : 'var(--border-card)'}`, color: t.mustDo ? 'var(--red)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: t.mustDo ? 700 : 400 }}>
              {t.mustDo ? '🔥 ' : ''}{t.topic} {t.weight && `(${t.weight})`}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabConfig.map(t => {
          const cnt = data[t.id]?.length || 0;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', border: tab === t.id ? `1px solid ${t.color}` : '1px solid var(--border-card)', background: tab === t.id ? `color-mix(in srgb, ${t.color} 12%, transparent)` : 'var(--bg-card)', color: tab === t.id ? t.color : 'var(--text-muted)', fontWeight: tab === t.id ? 700 : 400, fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {t.label}
              <span style={{ padding: '2px 7px', borderRadius: 20, background: tab === t.id ? t.color : 'var(--bg-secondary)', color: tab === t.id ? '#fff' : 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>{cnt}</span>
            </button>
          );
        })}
        <button onClick={load} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Active tab desc */}
      <div style={{ marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: `3px solid ${tabConfig.find(t=>t.id===tab)?.color}` }}>
        {tabConfig.find(t=>t.id===tab)?.desc}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab} questions…`}
          style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Prep tips */}
      {data.prepTips?.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'rgba(255,209,102,0.06)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 10, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: 'var(--yellow)', fontSize: '0.82rem', marginBottom: 6 }}>💡 {state.company}-specific Tips</div>
          <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
            {data.prepTips.map((t, i) => <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t}</li>)}
          </ul>
        </div>
      )}

      {/* Questions */}
      {filtered.length > 0
        ? filtered.map((q, i) => <AptitudeCard key={i} q={q} index={i} showAnswer={false} />)
        : <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">No questions found</div></div>
      }
    </div>
  );
}
