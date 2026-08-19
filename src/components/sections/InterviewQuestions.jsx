import React, { useEffect, useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Search, Copy, CheckCheck, ExternalLink, Code2, Brain, Users, Cpu, Plus, RefreshCw, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';
import { fetchSection, fetchMoreQuestions } from '../../api/gemini';
import BookmarkButton from '../ui/BookmarkButton';

const diffColor = { Easy: 'badge-low', Medium: 'badge-medium', Hard: 'badge-high' };
const freqColor = { 'Very Common': 'badge-high', 'Common': 'badge-medium', 'Rare': 'badge-low' };

function QCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAnswer = () => {
    navigator.clipboard.writeText(q.answer || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="question-card" style={{ position: 'relative', marginBottom: 20 }}>
      <div style={{ position: 'absolute', top: -10, left: 16, width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        {index + 1}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <p className="question-text" style={{ flex: 1, paddingTop: 4, fontSize: '0.93rem', lineHeight: 1.6 }}>{q.question}</p>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          {q.difficulty && <span className={`badge ${diffColor[q.difficulty] || 'badge-medium'}`}>{q.difficulty}</span>}
          {q.frequency && <span className={`badge ${freqColor[q.frequency] || 'badge-medium'}`} style={{ fontSize: '0.67rem' }}>{q.frequency}</span>}
          {q.topic && <span className="badge badge-accent" style={{ fontSize: '0.67rem' }}>{q.topic}</span>}
          {q.trait && <span className="badge badge-teal" style={{ fontSize: '0.67rem' }}>{q.trait}</span>}
          <BookmarkButton section="interviewQs" sectionLabel="Interview Questions" question={q.question} answer={q.answer} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button className="answer-toggle" style={{ flex: 1 }} onClick={() => setOpen(!open)}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {open ? 'Hide Answer' : 'View Model Answer'}
        </button>
        {q.leetcodeLink && (
          <a href={q.leetcodeLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,161,22,0.35)', background: 'rgba(255,161,22,0.08)', color: '#FFA116', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
              <Code2 size={13} /> LeetCode
            </button>
          </a>
        )}
        {open && (
          <button onClick={copyAnswer} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>
            {copied ? <><CheckCheck size={12} color="var(--green)" /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        )}
      </div>

      {open && (
        <div className="answer-text" style={{ marginTop: 12 }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85 }}>{q.answer}</div>
          {q.tip && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,209,102,0.08)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--yellow)', borderLeft: '3px solid var(--yellow)' }}>
              💡 <strong>Tip:</strong> {q.tip}
            </div>
          )}
          {q.why && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(108,99,255,0.08)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' }}>
              🎯 <strong>Why they ask:</strong> {q.why}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const tabConfig = [
  { id: 'technical',      label: 'Technical',      icon: Cpu,           color: 'var(--accent)',  desc: 'OOP · OS · DBMS · CN · Core CS Concepts',  keys: ['technical'] },
  { id: 'dsa',            label: 'DSA / Coding',   icon: Code2,         color: '#FFA116',        desc: 'Actual coding problems asked at this company', keys: ['dsa'] },
  { id: 'systemDesign',   label: 'System Design',  icon: Brain,         color: 'var(--teal)',    desc: 'High-level and low-level design questions',    keys: ['systemDesign', 'system_design'] },
  { id: 'hr',             label: 'HR',             icon: Users,         color: 'var(--green)',   desc: 'Company-tailored HR and motivational questions', keys: ['hr'] },
  { id: 'behavioral',     label: 'Behavioral',     icon: MessageSquare, color: 'var(--yellow)', desc: 'STAR format situational questions',             keys: ['behavioral', 'situational'] },
  { id: 'advanced',       label: 'Advanced',       icon: Layers,        color: '#e879f9',        desc: 'Expert-level technical and role-specific',      keys: ['advanced_technical', 'role_specific'] },
];

// Merge questions from multiple keys
function pickQuestions(data, keys) {
  let arr = [];
  keys.forEach(k => { if (Array.isArray(data[k])) arr = [...arr, ...data[k]]; });
  return arr;
}

export default function InterviewQuestions() {
  const { state, dispatch } = useApp();
  const s = state.sectionData['interviewQs'];
  const [tab, setTab]           = useState('technical');
  const [search, setSearch]     = useState('');
  const [extraData, setExtra]   = useState({});   // merged extra batches
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loaded2, setLoaded2]   = useState(false);
  const [loaded3, setLoaded3]   = useState(false);

  // Force fresh fetch — clear cache and reload
  const forceReload = () => {
    dispatch({ type: 'SECTION_LOADING', section: 'interviewQs' });
    fetchSection(state.company, 'interviewQs')
      .then(data => dispatch({ type: 'SECTION_SUCCESS', section: 'interviewQs', data }))
      .catch(err => dispatch({ type: 'SECTION_ERROR', section: 'interviewQs', error: err.message }));
  };

  useEffect(() => {
    if (!s?.data && !s?.loading) forceReload();
  }, []);

  // Load extra batch
  const loadMore = async (batch) => {
    if (batch === 2) { setLoading2(true); }
    else             { setLoading3(true); }
    try {
      const d = await fetchMoreQuestions(state.company, 'Software Engineer', batch);
      setExtra(prev => {
        const merged = { ...prev };
        Object.entries(d).forEach(([k, v]) => {
          if (Array.isArray(v)) merged[k] = [...(merged[k] || []), ...v];
        });
        return merged;
      });
      if (batch === 2) setLoaded2(true);
      else             setLoaded3(true);
    } catch (e) {
      console.error('Load more failed', e);
    }
    if (batch === 2) setLoading2(false);
    else             setLoading3(false);
  };

  if (!s || s.loading) return <LoadingSection title="Loading Interview Questions…" subtitle="Fetching company-specific questions from reports" />;
  if (s.error) return <ErrorSection error={s.error} section="interviewQs" onRetry={forceReload} />;

  const base = s.data || {};

  // Build combined data (base + extra)
  const combined = { ...base };
  Object.entries(extraData).forEach(([k, v]) => {
    combined[k] = [...(combined[k] || []), ...v];
  });

  // Count across all categories
  const getCount = (t) => pickQuestions(combined, t.keys).length;
  const total = tabConfig.reduce((n, t) => n + getCount(t), 0);

  const activeTab = tabConfig.find(t => t.id === tab);
  const questions = pickQuestions(combined, activeTab?.keys || []);
  const filtered  = search ? questions.filter(q => q.question?.toLowerCase().includes(search.toLowerCase())) : questions;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-yellow"><MessageSquare size={24} /></div>
        <div>
          <h1 className="section-title">Interview Questions</h1>
          <p className="section-subtitle">
            {state.company} — <strong style={{ color: 'var(--accent)' }}>{total} questions</strong> from placed candidates
          </p>
        </div>
      </div>

      {/* Source credibility banner */}
      <div style={{ padding: '12px 16px', background: 'rgba(6,214,160,0.06)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 10, marginBottom: 20, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span>✅ Sourced from <strong style={{ color: 'var(--teal)' }}>Glassdoor, AmbitionBox, LeetCode Discuss, InterviewBit</strong> — real questions by placed candidates</span>
        <button onClick={forceReload} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabConfig.map(t => {
          const Icon = t.icon;
          const cnt  = getCount(t);
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 10, cursor: 'pointer', border: tab === t.id ? `1px solid ${t.color}` : '1px solid var(--border-card)', background: tab === t.id ? `color-mix(in srgb, ${t.color} 12%, transparent)` : 'var(--bg-card)', color: tab === t.id ? t.color : 'var(--text-muted)', fontWeight: tab === t.id ? 700 : 400, fontSize: '0.83rem', transition: 'all 0.2s' }}>
              <Icon size={13} />
              {t.label}
              <span style={{ padding: '2px 7px', borderRadius: 20, background: tab === t.id ? t.color : 'var(--bg-secondary)', color: tab === t.id ? '#fff' : 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Active tab description */}
      {activeTab && (
        <div style={{ marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: `3px solid ${activeTab.color}` }}>
          <strong style={{ color: activeTab.color }}>{activeTab.label}</strong> · {activeTab.desc} · {questions.length} questions for {state.company}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab} questions…`}
          style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Questions */}
      {filtered.length > 0
        ? filtered.map((q, i) => <QCard key={i} q={q} index={i} />)
        : (
          <div className="empty-state">
            <div className="empty-state-icon">{search ? '🔍' : '📭'}</div>
            <div className="empty-state-title">{search ? 'No matches' : 'No questions in this category yet'}</div>
            {!search && <div className="empty-state-desc">Try loading more questions below</div>}
          </div>
        )
      }

      {/* ── Load More buttons ──────────────────────────────── */}
      <div style={{ marginTop: 32, padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 6 }}>Want more questions?</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Load additional batches with advanced, situational and role-specific questions from {state.company} interviews
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>

          <button onClick={() => !loaded2 && !loading2 && loadMore(2)} disabled={loaded2 || loading2}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: `1px solid ${loaded2 ? 'var(--green)' : 'var(--accent)'}`, background: loaded2 ? 'rgba(6,214,160,0.1)' : 'var(--accent-dim)', color: loaded2 ? 'var(--green)' : 'var(--accent)', cursor: loaded2 ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.9rem', opacity: loading2 ? 0.7 : 1 }}>
            {loading2 ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</> : loaded2 ? <>✅ Batch 2 Loaded (+30 questions)</> : <><Plus size={16} /> Load More Questions (Batch 2)</>}
          </button>

          <button onClick={() => !loaded3 && !loading3 && loadMore(3)} disabled={loaded3 || loading3}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: `1px solid ${loaded3 ? 'var(--green)' : '#e879f9'}`, background: loaded3 ? 'rgba(6,214,160,0.1)' : 'rgba(232,121,249,0.08)', color: loaded3 ? 'var(--green)' : '#e879f9', cursor: loaded3 ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.9rem', opacity: loading3 ? 0.7 : 1 }}>
            {loading3 ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</> : loaded3 ? <>✅ Batch 3 Loaded (+26 questions)</> : <><Plus size={16} /> Load Advanced Questions (Batch 3)</>}
          </button>
        </div>

        {(loaded2 || loaded3) && (
          <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--teal)', fontWeight: 700 }}>
            ✅ Total: {total} questions loaded — Check the "Advanced" tab for new content!
          </div>
        )}
      </div>
    </div>
  );
}
