import React, { useEffect, useState, useRef } from 'react';
import {
  Briefcase, ArrowLeft, ChevronDown, ChevronUp, Clock, AlertTriangle,
  Code2, Copy, CheckCheck, Plus, RefreshCw, Search, BookOpen, Globe,
  ExternalLink, Youtube, Brain, Users, Cpu, MessageSquare, Layers,
  Calculator, Target, TrendingUp, Star, Award, Zap, CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchRoleDetail, fetchCategoryBatch } from '../../api/gemini';
import LoadingSection from '../ui/LoadingSection';
import TopicLearningPage from './TopicLearningPage';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Overview',       icon: Target,      color: '#7c3aed' },
  { id: 'technical',   label: 'Technical',      icon: Cpu,         color: '#3b82f6' },
  { id: 'dsa',         label: 'DSA / Coding',   icon: Code2,       color: '#f59e0b' },
  { id: 'aptitude',    label: 'Aptitude',       icon: Calculator,  color: '#10b981' },
  { id: 'hr',          label: 'HR',             icon: Users,       color: '#06b6d4' },
  { id: 'behavioral',  label: 'Behavioral',     icon: MessageSquare, color:'#f97316' },
  { id: 'systemDesign',label: 'System Design',  icon: Brain,       color: '#8b5cf6' },
  { id: 'roleSpecific',label: 'Role-Specific',  icon: Layers,      color: '#ec4899' },
  { id: 'process',     label: 'Interview Rounds',icon: Award,      color: '#14b8a6' },
  { id: 'roadmap',     label: 'Roadmap',        icon: TrendingUp,  color: '#a855f7' },
  { id: 'resources',   label: 'Resources',      icon: BookOpen,    color: '#6366f1' },
];

const diffBg = {
  Easy:   { bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.3)', text:'#10b981' },
  Medium: { bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.3)', text:'#f59e0b' },
  Hard:   { bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.3)',  text:'#ef4444' },
};
const freqBg = {
  'Very Common': { bg:'rgba(239,68,68,0.1)', text:'#ef4444' },
  'Common':      { bg:'rgba(245,158,11,0.1)',text:'#f59e0b' },
  'Rare':        { bg:'rgba(99,102,241,0.1)',text:'#818cf8' },
};

// ─────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────
function DiffBadge({ d }) {
  const s = diffBg[d]; if (!s) return null;
  return <span style={{ padding:'2px 8px', borderRadius:20, background:s.bg, border:`1px solid ${s.border}`, color:s.text, fontSize:'0.68rem', fontWeight:700 }}>{d}</span>;
}
function FreqBadge({ f }) {
  const s = freqBg[f]; if (!s) return null;
  return <span style={{ padding:'2px 8px', borderRadius:20, background:s.bg, color:s.text, fontSize:'0.65rem', fontWeight:600 }}>{f}</span>;
}
function TopicBadge({ t, color='#7c3aed' }) {
  if (!t) return null;
  return <span style={{ padding:'2px 8px', borderRadius:20, background:`${color}18`, border:`1px solid ${color}40`, color, fontSize:'0.67rem', fontWeight:600 }}>{t}</span>;
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text||''); setDone(true); setTimeout(()=>setDone(false),2000); };
  return (
    <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:6, border:'1px solid #ffffff18', background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:'0.72rem' }}>
      {done ? <><CheckCheck size={11} color="#10b981" /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
}

function LoadMoreBtn({ onClick, loading, total, batchNum }) {
  return (
    <div style={{ textAlign:'center', marginTop:32, padding:'24px', background:'linear-gradient(135deg,#1e1b4b18,#312e8118)', borderRadius:16, border:'1px solid #7c3aed30' }}>
      <div style={{ fontSize:'0.82rem', color:'#94a3b8', marginBottom:12 }}>
        Showing <strong style={{ color:'#e2e8f0' }}>{total} questions</strong>
        {batchNum > 1 && <span style={{ color:'#7c3aed' }}> across {batchNum} batches</span>}
      </div>
      <button onClick={onClick} disabled={loading}
        style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:12, border:'1px solid #7c3aed60', background: loading ? '#1e1b4b' : 'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', cursor: loading ? 'default':'pointer', fontWeight:700, fontSize:'0.9rem', boxShadow: loading ? 'none':'0 4px 20px #7c3aed40', transition:'all 0.2s', opacity: loading ? 0.7 : 1 }}>
        {loading ? <><RefreshCw size={16} style={{ animation:'spin 1s linear infinite' }} /> Generating…</> : <><Plus size={16} /> Load 20 More Questions</>}
      </button>
      <div style={{ marginTop:8, fontSize:'0.72rem', color:'#64748b' }}>Click as many times as you need — each batch has fresh questions</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUESTION CARDS
// ─────────────────────────────────────────────────────────────
function QCard({ q, index, accent='#7c3aed' }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:'#0f0f1a', border:`1px solid ${open ? accent+'60' : '#ffffff12'}`, borderRadius:14, padding:'18px 20px', marginBottom:12, transition:'all 0.2s', boxShadow: open ? `0 0 0 1px ${accent}30` : 'none' }}>
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        {/* Number */}
        <div style={{ width:28, height:28, borderRadius:8, background:`${accent}20`, border:`1px solid ${accent}40`, color:accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:800, flexShrink:0 }}>{index+1}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:600, fontSize:'0.93rem', color:'#e2e8f0', lineHeight:1.65, margin:0, marginBottom:8 }}>{q.question}</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {q.difficulty && <DiffBadge d={q.difficulty} />}
            {q.frequency  && <FreqBadge f={q.frequency} />}
            {q.topic      && <TopicBadge t={q.topic} color={accent} />}
            {q.trait      && <TopicBadge t={q.trait} color='#06b6d4' />}
            {q.category   && <TopicBadge t={q.category} color='#10b981' />}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
        <button onClick={()=>setOpen(o=>!o)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:8, border:`1px solid ${accent}50`, background: open ? `${accent}18` : 'transparent', color: open ? accent : '#94a3b8', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, flex:1, justifyContent:'center', transition:'all 0.15s' }}>
          {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          {open ? 'Hide Answer' : 'View Model Answer'}
        </button>
        {q.leetcodeLink && (
          <a href={q.leetcodeLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
            <button style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8, border:'1px solid #f59e0b50', background:'#f59e0b12', color:'#f59e0b', cursor:'pointer', fontSize:'0.78rem', fontWeight:700 }}>
              <Code2 size={12}/> LeetCode
            </button>
          </a>
        )}
        {open && <CopyBtn text={q.answer} />}
      </div>

      {/* Answer */}
      {open && (
        <div style={{ marginTop:16, padding:'16px', background:'#1a1a2e', borderRadius:10, border:'1px solid #ffffff0a' }}>
          <div style={{ fontSize:'0.87rem', color:'#cbd5e1', lineHeight:1.85, whiteSpace:'pre-wrap' }}>{q.answer}</div>
          {q.hint && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'#f59e0b10', borderRadius:8, borderLeft:'3px solid #f59e0b', fontSize:'0.8rem', color:'#fbbf24' }}>
              💡 <strong>Hint:</strong> {q.hint}
            </div>
          )}
          {q.tip && (
            <div style={{ marginTop:10, padding:'10px 14px', background:'#10b98110', borderRadius:8, borderLeft:'3px solid #10b981', fontSize:'0.8rem', color:'#6ee7b7' }}>
              ✅ <strong>Tip:</strong> {q.tip}
            </div>
          )}
          {q.why && (
            <div style={{ marginTop:10, padding:'10px 14px', background:`${accent}10`, borderRadius:8, borderLeft:`3px solid ${accent}`, fontSize:'0.8rem', color:'#a5b4fc' }}>
              🎯 <strong>Why they ask:</strong> {q.why}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Aptitude MCQ Card
function AptCard({ q, index }) {
  const [sel, setSel]     = useState(null);
  const [shown, setShown] = useState(false);
  const correct = sel === q.answer;
  return (
    <div style={{ background:'#0f0f1a', border:`1px solid ${shown ? (correct ? '#10b98150' : '#ef444450') : '#ffffff12'}`, borderRadius:14, padding:'18px 20px', marginBottom:12 }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:'#10b98120', color:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:800, flexShrink:0 }}>Q{index+1}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:600, color:'#e2e8f0', fontSize:'0.92rem', lineHeight:1.6, margin:0, marginBottom:6 }}>{q.question}</p>
          <TopicBadge t={q.category} color='#10b981' />
        </div>
        <DiffBadge d={q.difficulty} />
      </div>

      {/* Options */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        {(q.options||[]).map((opt, i) => {
          const letter = ['A','B','C','D'][i] || String.fromCharCode(65+i);
          const isChosen  = sel === opt;
          const isCorrect = shown && opt === q.answer;
          const isWrong   = shown && isChosen && !isCorrect;
          return (
            <button key={i} onClick={()=>!shown && setSel(opt)}
              style={{ padding:'10px 14px', borderRadius:10, textAlign:'left', cursor: shown ? 'default':'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.2s',
                border:`1px solid ${isCorrect ? '#10b98160' : isWrong ? '#ef444460' : isChosen ? '#7c3aed60' : '#ffffff12'}`,
                background: isCorrect ? '#10b98114' : isWrong ? '#ef444414' : isChosen ? '#7c3aed14' : '#1a1a2e',
                color: isCorrect ? '#6ee7b7' : isWrong ? '#fca5a5' : isChosen ? '#a5b4fc' : '#94a3b8',
                fontWeight: isChosen || isCorrect ? 700 : 400, fontSize:'0.83rem'
              }}>
              <span style={{ width:22, height:22, borderRadius:'50%', background: isCorrect ? '#10b981' : isWrong ? '#ef4444' : isChosen ? '#7c3aed' : '#ffffff18', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.67rem', fontWeight:800, flexShrink:0 }}>{letter}</span>
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:8 }}>
        {!shown && sel && (
          <button onClick={()=>setShown(true)} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:'#7c3aed', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.8rem' }}>
            Check Answer ✓
          </button>
        )}
        {shown && q.solution && (
          <div style={{ flex:1, padding:'10px 14px', background:'#1e1b4b', borderRadius:8, fontSize:'0.8rem', color:'#a5b4fc', borderLeft:'3px solid #7c3aed' }}>
            📐 <strong>Solution:</strong> {q.solution}
          </div>
        )}
        {!sel && !shown && (
          <button onClick={()=>setShown(true)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #ffffff15', background:'transparent', color:'#64748b', cursor:'pointer', fontSize:'0.75rem' }}>
            Skip & Show Answer
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GENERIC QUESTION TAB (lazy-loads on first visit + unlimited Load More)
// ─────────────────────────────────────────────────────────────
function QuestionTab({ initial, company, role, category, accent, CardComponent }) {
  const [questions, setQ] = useState(initial || []);
  const [batch, setBatch]       = useState(initial?.length > 0 ? 1 : 0);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const didFetch = useRef(false);

  // Auto-fetch batch 1 if no initial questions provided
  useEffect(() => {
    if (!didFetch.current && questions.length === 0) {
      didFetch.current = true;
      loadBatch(1);
    }
  }, []);

  const loadBatch = async (batchNum) => {
    setLoading(true);
    try {
      const more = await fetchCategoryBatch(company, role, category, batchNum);
      if (Array.isArray(more) && more.length > 0) {
        setQ(prev => [...prev, ...more]);
        setBatch(batchNum);
      }
    } catch(e) { console.error('Load failed:', e); }
    setLoading(false);
  };

  const loadMore = () => loadBatch(batch + 1);

  const Card = CardComponent || QCard;
  const filtered = search ? questions.filter(q => q.question?.toLowerCase().includes(search.toLowerCase())) : questions;

  return (
    <div>
      {/* Search */}
      <div style={{ position:'relative', marginBottom:20 }}>
        <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748b' }} />
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search questions…"
          style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:10, border:'1px solid #ffffff15', background:'#0f0f1a', color:'#e2e8f0', fontSize:'0.87rem', outline:'none', boxSizing:'border-box' }} />
      </div>

      {/* Loading state */}
      {loading && questions.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${accent}`, borderTopColor:'transparent', margin:'0 auto 16px', animation:'spin 0.8s linear infinite' }} />
          <div style={{ color:'#64748b', fontSize:'0.87rem' }}>Fetching questions from AI…</div>
        </div>
      )}

      {!loading && filtered.length === 0 && questions.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 20px', color:'#64748b' }}>
          📭 No questions loaded — click Load More below
        </div>
      )}

      {filtered.length > 0 && filtered.map((q, i) => <Card key={i} q={q} index={i} accent={accent} />)}

      {!search && (
        <LoadMoreBtn onClick={loadMore} loading={loading && questions.length > 0} total={questions.length} batchNum={batch} />
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────
function OverviewTab({ d, company, role }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const stats = [
    { label:'Salary Range',   value: d.salaryRange,    icon:'💰', color:'#10b981' },
    { label:'Openings/Year',  value: d.openingsCount,  icon:'📋', color:'#3b82f6' },
    { label:'Remote Policy',  value: d.remotePolicy,   icon:'🏢', color:'#8b5cf6' },
  ].filter(s => s.value);

  // If a topic card was clicked, show the full learning page
  if (selectedTopic) {
    return (
      <TopicLearningPage
        topic={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return (
    <div>
      {/* Overview text */}
      {d.overview && (
        <div style={{ padding:'20px', background:'linear-gradient(135deg,#7c3aed12,#6d28d912)', borderRadius:14, border:'1px solid #7c3aed30', marginBottom:24, fontSize:'0.9rem', color:'#cbd5e1', lineHeight:1.8 }}>
          {d.overview}
        </div>
      )}

      {/* Key stats */}
      {stats.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding:'20px 16px', background:'#0f0f1a', borderRadius:14, border:'1px solid #ffffff10', textAlign:'center' }}>
              <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontWeight:800, fontSize:'1.05rem', color:s.color, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:'0.72rem', color:'#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Topics to prepare — clickable cards */}
      {d.topicsToPrepare?.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, color:'#e2e8f0', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'#7c3aed' }}>📚</span> Topics to Prepare
          </h3>
          <div style={{ fontSize:'0.75rem', color:'#64748b', marginBottom:12 }}>
            💡 Click any topic to learn with AI notes, resources &amp; quizzes
          </div>
          <div style={{ display:'grid', gap:10 }}>
            {d.topicsToPrepare.map((t, i) => {
              const imp = { High:'#ef4444', Medium:'#f59e0b', Low:'#10b981' }[t.importance] || '#6366f1';
              // Build a topic object matching what TopicLearningPage expects
              const topicObj = {
                name: t.subject,
                importance: t.importance,
                reason: t.specificTopics?.join(' · '),
                prepTime: t.timeNeeded,
                topics: t.specificTopics || [],
              };
              return (
                <div
                  key={i}
                  onClick={() => setSelectedTopic(topicObj)}
                  style={{
                    padding:'14px 18px', background:'#0f0f1a', borderRadius:12,
                    border:`1px solid ${imp}30`, display:'flex', justifyContent:'space-between',
                    alignItems:'center', cursor:'pointer', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${imp}70`;
                    e.currentTarget.style.background = `${imp}08`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 4px 16px ${imp}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${imp}30`;
                    e.currentTarget.style.background = '#0f0f1a';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:'#e2e8f0', marginBottom:4 }}>{t.subject}</div>
                    <div style={{ fontSize:'0.78rem', color:'#64748b' }}>{t.specificTopics?.join(' · ')}</div>
                    <div style={{ marginTop:8, fontSize:'0.72rem', color:'#7c3aed', fontWeight:600 }}>
                      📖 Start Learning →
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:imp, padding:'2px 10px', borderRadius:20, background:`${imp}15`, marginBottom:4 }}>{t.importance}</div>
                    <div style={{ fontSize:'0.7rem', color:'#64748b' }}>⏱ {t.timeNeeded}</div>
                    <div style={{ marginTop:6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insider tips + Common mistakes */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        {d.insiderTips?.length > 0 && (
          <div style={{ padding:'20px', background:'#0f0f1a', borderRadius:14, border:'1px solid #10b98130' }}>
            <h4 style={{ color:'#10b981', marginBottom:12, fontSize:'0.88rem', fontWeight:700 }}>🔮 Insider Tips</h4>
            {d.insiderTips.map((t, i) => <div key={i} style={{ fontSize:'0.82rem', color:'#94a3b8', padding:'8px 10px', background:'#10b98108', borderRadius:8, marginBottom:6, borderLeft:'2px solid #10b981' }}>{t}</div>)}
          </div>
        )}
        {d.commonMistakes?.length > 0 && (
          <div style={{ padding:'20px', background:'#0f0f1a', borderRadius:14, border:'1px solid #ef444430' }}>
            <h4 style={{ color:'#ef4444', marginBottom:12, fontSize:'0.88rem', fontWeight:700, display:'flex', gap:6, alignItems:'center' }}><AlertTriangle size={14}/> Common Mistakes</h4>
            {d.commonMistakes.map((m, i) => <div key={i} style={{ fontSize:'0.82rem', color:'#94a3b8', padding:'8px 10px', background:'#ef444408', borderRadius:8, marginBottom:6, borderLeft:'2px solid #ef4444' }}>✗ {m}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INTERVIEW PROCESS TAB
// ─────────────────────────────────────────────────────────────
function ProcessTab({ d }) {
  return (
    <div>
      {d.interviewProcess?.overview && (
        <div style={{ padding:'18px 20px', background:'#7c3aed12', borderRadius:12, border:'1px solid #7c3aed30', marginBottom:24, fontSize:'0.88rem', color:'#cbd5e1', lineHeight:1.8 }}>
          🎯 {d.interviewProcess.overview}
        </div>
      )}
      {d.interviewProcess?.rounds?.map((round, i) => (
        <div key={i} style={{ display:'flex', gap:16, marginBottom:20 }}>
          {/* Step number */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.9rem', boxShadow:'0 4px 12px #7c3aed40' }}>
              {round.roundNum}
            </div>
            {i < (d.interviewProcess.rounds.length - 1) && <div style={{ width:2, flex:1, background:'linear-gradient(#7c3aed40,transparent)', marginTop:8 }} />}
          </div>
          {/* Content */}
          <div style={{ flex:1, background:'#0f0f1a', borderRadius:14, border:'1px solid #ffffff10', padding:'18px 20px', marginBottom:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, flexWrap:'wrap', gap:8 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:'0.97rem', color:'#e2e8f0', marginBottom:6 }}>{round.name}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {round.duration && <span style={{ fontSize:'0.72rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/> {round.duration}</span>}
                  {round.platform && <span style={{ fontSize:'0.72rem', color:'#7c3aed', background:'#7c3aed15', padding:'2px 8px', borderRadius:10 }}>{round.platform}</span>}
                  {round.difficulty && <DiffBadge d={round.difficulty} />}
                </div>
              </div>
            </div>
            <p style={{ fontSize:'0.85rem', color:'#94a3b8', lineHeight:1.7, marginBottom:10 }}>{round.description}</p>
            {round.whatToExpect?.length > 0 && (
              <div style={{ marginBottom:8 }}>
                {round.whatToExpect.map((e, j) => <div key={j} style={{ fontSize:'0.82rem', color:'#cbd5e1', display:'flex', gap:6, marginBottom:5 }}><span style={{ color:'#10b981' }}>→</span> {e}</div>)}
              </div>
            )}
            {round.tips?.map((t, j) => <div key={j} style={{ fontSize:'0.79rem', color:'#fbbf24', display:'flex', gap:5, marginBottom:4 }}>💡 {t}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROADMAP TAB
// ─────────────────────────────────────────────────────────────
function RoadmapTab({ d, role }) {
  const { setSection } = useApp();
  return (
    <div>
      {/* This used to regenerate its own thin, throwaway roadmap here — duplicating (and
          worse than) the real Prep Roadmap section. It now just points there instead. */}
      <div style={{ padding:'22px 24px', background:'linear-gradient(135deg,#7c3aed15,#6d28d908)', borderRadius:16, border:'1px solid #7c3aed35', marginBottom:24, display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'#7c3aed20', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <TrendingUp size={20} color="#a5b4fc" />
        </div>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.92rem', marginBottom:4 }}>Full 12-Week Prep Roadmap</div>
          <div style={{ fontSize:'0.82rem', color:'#94a3b8', lineHeight:1.6 }}>
            A real week-by-week plan — programming basics, DSA, CS subjects, projects, resume, and interview prep — with progress tracking.
          </div>
        </div>
        <button onClick={() => setSection('roadmap')}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:10, border:'none', background:'#7c3aed', color:'#fff', fontWeight:700, fontSize:'0.83rem', cursor:'pointer', flexShrink:0 }}>
          Open Roadmap <ArrowLeft size={14} style={{ transform:'rotate(180deg)' }} />
        </button>
      </div>

      {d.skillsToHighlight?.length > 0 && (
        <div style={{ padding:'16px 20px', background:'#0f0f1a', borderRadius:14, border:'1px solid #ffffff10', marginBottom:20 }}>
          <div style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:10 }}>⭐ Skills to highlight on your resume for {role}:</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {d.skillsToHighlight.map(sk => <span key={sk} style={{ padding:'4px 12px', borderRadius:20, background:'#7c3aed18', border:'1px solid #7c3aed40', color:'#a5b4fc', fontSize:'0.78rem', fontWeight:600 }}>{sk}</span>)}
          </div>
        </div>
      )}
      {d.resumeTips?.length > 0 && (
        <div style={{ padding:'20px', background:'#0f0f1a', borderRadius:14, border:'1px solid #ffffff10' }}>
          <h4 style={{ color:'#10b981', marginBottom:12, fontSize:'0.88rem' }}>📄 Resume Tips for This Role</h4>
          {d.resumeTips.map((t, i) => <div key={i} style={{ fontSize:'0.83rem', color:'#94a3b8', display:'flex', gap:8, marginBottom:8 }}><span style={{ color:'#7c3aed' }}>→</span> {t}</div>)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RESOURCES TAB
// ─────────────────────────────────────────────────────────────
function ResourcesTab() {
  const { setSection } = useApp();
  // This used to ask the AI to invent resource URLs — including YouTube "search" links
  // that never opened the actual video, and guessed GeeksforGeeks/Glassdoor URLs that
  // often 404'd. It now points to the site's real, hand-verified resource sections
  // instead of generating a fresh, unreliable list every time.
  const cards = [
    { id: 'videos',    icon: '▶️', color: '#ef4444', title: 'Curated Video Playlists', desc: '18 hand-verified real YouTube playlists — DSA, CS core, languages, system design, and more.' },
    { id: 'resources', icon: '📚', color: '#06b6d4', title: 'Websites, Courses & Repos', desc: 'Practice platforms, courses, and GitHub repos for this company\'s prep.' },
  ];
  return (
    <div>
      {cards.map(c => (
        <button key={c.id} onClick={() => setSection(c.id)}
          style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:16, padding:'20px 22px', borderRadius:14,
            background:'#0f0f1a', border:'1px solid #ffffff10', marginBottom:12, cursor:'pointer', transition:'border-color 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=`${c.color}50`}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#ffffff10'}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>{c.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.92rem', marginBottom:4 }}>{c.title}</div>
            <div style={{ fontSize:'0.82rem', color:'#94a3b8', lineHeight:1.6 }}>{c.desc}</div>
          </div>
          <ExternalLink size={16} color="#64748b" />
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROLE DETAIL PAGE (the big redesigned page)
// ─────────────────────────────────────────────────────────────
function RoleDetailPage({ company, role, onBack }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const tabBarRef = useRef(null);

  const load = () => {
    setLoading(true); setError(null);
    fetchRoleDetail(company, role)
      .then(d  => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [company, role]);

  // Scroll active tab into view
  useEffect(() => {
    if (tabBarRef.current) {
      const active = tabBarRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block:'nearest', inline:'center', behavior:'smooth' });
    }
  }, [activeTab]);

  if (loading) return (
    <div>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:10, border:'1px solid #ffffff15', background:'transparent', color:'#94a3b8', cursor:'pointer', marginBottom:24, fontSize:'0.85rem', fontWeight:600 }}>
        <ArrowLeft size={16}/> Back to Roles
      </button>
      <LoadingSection title={`${role} at ${company}`} subtitle="Generating role overview, interview process, and prep guide…" />
    </div>
  );

  if (error) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:10, border:'1px solid #ffffff15', background:'transparent', color:'#94a3b8', cursor:'pointer', margin:'0 auto 32px', fontSize:'0.85rem' }}>
        <ArrowLeft size={16}/> Back to Roles
      </button>
      <div style={{ fontSize:'2rem', marginBottom:12 }}>⚠️</div>
      <div style={{ color:'#ef4444', fontWeight:600, marginBottom:8 }}>Failed to load</div>
      <div style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:24 }}>{error}</div>
      <button onClick={load} style={{ padding:'11px 24px', borderRadius:10, border:'none', background:'#7c3aed', color:'#fff', cursor:'pointer', fontWeight:700 }}>Retry</button>
    </div>
  );

  const d = data;
  // Each question tab (Technical/DSA/HR/Behavioral/System Design/Role-Specific/Aptitude)
  // fetches its own questions on first view via fetchCategoryBatch — kept as separate,
  // smaller requests rather than one giant call, so none of them risk truncation.
  const QUESTION_CATEGORIES = ['technical', 'dsa', 'hr', 'behavioral', 'systemDesign', 'roleSpecific', 'aptitude'];

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>

      {/* ── BACK BUTTON ── */}
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:10, border:'1px solid #ffffff15', background:'transparent', color:'#94a3b8', cursor:'pointer', marginBottom:24, fontSize:'0.85rem', fontWeight:600, transition:'all 0.15s' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='#7c3aed60';e.currentTarget.style.color='#a5b4fc';}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='#ffffff15';e.currentTarget.style.color='#94a3b8';}}>
        <ArrowLeft size={16}/> Back to Roles
      </button>

      {/* ── ROLE HERO BANNER ── */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#1e1b4b90,#0f0f1a)', borderRadius:20, border:'1px solid #7c3aed40', padding:'32px 36px', marginBottom:28, position:'relative', overflow:'hidden' }}>
        {/* Background glow */}
        <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,#7c3aed30,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle,#6d28d920,transparent 70%)', pointerEvents:'none' }} />

        <div style={{ display:'flex', gap:20, alignItems:'flex-start', position:'relative' }}>
          {/* Icon */}
          <div style={{ width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 8px 24px #7c3aed50' }}>
            <Briefcase size={28} color="#fff" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.78rem', color:'#7c3aed', fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>{company}</div>
            <h1 style={{ fontSize:'1.7rem', fontWeight:900, color:'#f1f5f9', margin:'0 0 10px', lineHeight:1.2 }}>{role}</h1>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {d.salaryRange && <span style={{ padding:'5px 14px', borderRadius:20, background:'#10b98118', border:'1px solid #10b98140', color:'#6ee7b7', fontSize:'0.82rem', fontWeight:700 }}>💰 {d.salaryRange}</span>}
              {d.remotePolicy && <span style={{ padding:'5px 14px', borderRadius:20, background:'#3b82f618', border:'1px solid #3b82f640', color:'#93c5fd', fontSize:'0.82rem', fontWeight:600 }}>{d.remotePolicy}</span>}
            </div>
          </div>
          <button onClick={load} title="Refresh" style={{ padding:'8px', borderRadius:10, border:'1px solid #ffffff15', background:'transparent', color:'#64748b', cursor:'pointer', flexShrink:0 }}>
            <RefreshCw size={16}/>
          </button>
        </div>

        {/* Mini stat row */}
        <div style={{ display:'flex', gap:24, marginTop:24, paddingTop:20, borderTop:'1px solid #ffffff10', flexWrap:'wrap' }}>
          {[
            { label:'Question Categories', value:`${QUESTION_CATEGORIES.length}` },
            { label:'Interview Rounds', value: d.interviewProcess?.totalRounds ? `${d.interviewProcess.totalRounds} rounds` : 'Multi-round' },
            { label:'Prep Time Needed', value:'8-12 weeks' },
            { label:'Difficulty', value: d.openingsCount ? 'Competitive' : 'Moderate' },
          ].map((s,i) => (
            <div key={i}>
              <div style={{ fontSize:'1.1rem', fontWeight:800, color:'#e2e8f0' }}>{s.value}</div>
              <div style={{ fontSize:'0.72rem', color:'#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div ref={tabBarRef} style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:24, scrollbarWidth:'none' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} data-active={active} onClick={()=>setActiveTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:10, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, border:`1px solid ${active ? t.color+'70' : '#ffffff15'}`, background: active ? `${t.color}18` : '#0f0f1a', color: active ? t.color : '#64748b', fontWeight: active ? 700 : 400, fontSize:'0.82rem', transition:'all 0.2s', boxShadow: active ? `0 2px 12px ${t.color}30` : 'none' }}>
              <Icon size={14}/> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'overview'     && <OverviewTab d={d} company={company} role={role} />}
      {activeTab === 'process'      && <ProcessTab d={d} />}
      {activeTab === 'roadmap'      && <RoadmapTab d={d} role={role} />}
      {activeTab === 'resources'    && <ResourcesTab />}

      {activeTab === 'technical'    && (
        <QuestionTab key="technical"   company={company} role={role} category="technical"   accent="#3b82f6" />
      )}
      {activeTab === 'dsa'          && (
        <QuestionTab key="dsa"         company={company} role={role} category="dsa"         accent="#f59e0b" />
      )}
      {activeTab === 'hr'           && (
        <QuestionTab key="hr"          company={company} role={role} category="hr"          accent="#06b6d4" />
      )}
      {activeTab === 'behavioral'   && (
        <QuestionTab key="behavioral"  company={company} role={role} category="behavioral"  accent="#f97316" />
      )}
      {activeTab === 'systemDesign' && (
        <QuestionTab key="systemDesign" company={company} role={role} category="systemDesign" accent="#8b5cf6" />
      )}
      {activeTab === 'roleSpecific' && (
        <QuestionTab key="roleSpecific" company={company} role={role} category="roleSpecific" accent="#ec4899" />
      )}
      {activeTab === 'aptitude'     && (
        <QuestionTab key="aptitude"    company={company} role={role} category="aptitude"   accent="#10b981" CardComponent={AptCard} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROLE CARD (list view)
// ─────────────────────────────────────────────────────────────
function RoleCard({ role, onClick }) {
  const [hovered, setHovered] = useState(false);
  const deptColors = { Engineering:'#7c3aed', Data:'#3b82f6', ML:'#f59e0b', QA:'#10b981', DevOps:'#06b6d4', Design:'#ec4899', Finance:'#f97316', Marketing:'#8b5cf6' };
  const color = deptColors[role.department] || '#7c3aed';

  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{ background: hovered ? '#1a1a2e' : '#0f0f1a', borderRadius:16, border:`1px solid ${hovered ? color+'60' : '#ffffff12'}`, padding:'22px 24px', cursor:'pointer', transition:'all 0.2s', boxShadow: hovered ? `0 8px 30px ${color}20` : 'none', transform: hovered ? 'translateY(-2px)' : 'none' }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
            <span style={{ padding:'3px 10px', borderRadius:20, background:`${color}18`, border:`1px solid ${color}40`, color, fontSize:'0.7rem', fontWeight:700 }}>{role.department}</span>
            {role.difficulty && (
              <span style={{ padding:'3px 10px', borderRadius:20, background: role.difficulty==='High' ? '#ef444415' : '#f59e0b15', color: role.difficulty==='High' ? '#fca5a5':'#fcd34d', fontSize:'0.7rem', fontWeight:600 }}>
                {role.difficulty} Competition
              </span>
            )}
          </div>
          <h3 style={{ fontWeight:800, fontSize:'1.05rem', color:'#f1f5f9', marginBottom:6 }}>{role.title}</h3>
          <p style={{ fontSize:'0.82rem', color:'#64748b', lineHeight:1.6, marginBottom:12 }}>{role.description}</p>
        </div>
        <div style={{ textAlign:'right', flexShrink:0, marginLeft:16 }}>
          <div style={{ fontWeight:900, fontSize:'1.15rem', color:'#10b981' }}>{role.avgCTC}</div>
          <div style={{ fontSize:'0.68rem', color:'#64748b' }}>Avg Package</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        {role.skills?.slice(0,5).map(sk => <span key={sk} style={{ padding:'3px 10px', borderRadius:8, background:'#ffffff08', color:'#94a3b8', fontSize:'0.74rem' }}>{sk}</span>)}
        {role.skills?.length > 5 && <span style={{ padding:'3px 10px', borderRadius:8, background:'#ffffff08', color:'#64748b', fontSize:'0.74rem' }}>+{role.skills.length-5} more</span>}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:14, fontSize:'0.74rem', color:'#64748b' }}>
          {role.remotePolicy && <span>🏢 {role.remotePolicy}</span>}
          {role.openings     && <span>📋 {role.openings} Openings</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, color:color, fontSize:'0.82rem', fontWeight:700 }}>
          Start Prep <Zap size={14} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROLE LIST
// ─────────────────────────────────────────────────────────────
function RoleList({ data, company, onSelect }) {
  const [search, setSearch] = useState('');
  const roles = data.roles || [];
  const filtered = search ? roles.filter(r => r.title?.toLowerCase().includes(search.toLowerCase()) || r.department?.toLowerCase().includes(search.toLowerCase())) : roles;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:'0.78rem', color:'#7c3aed', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>{company}</div>
        <h1 style={{ fontSize:'1.8rem', fontWeight:900, color:'#f1f5f9', marginBottom:8 }}>Choose a Role to Prepare</h1>
        <p style={{ color:'#64748b', fontSize:'0.88rem', lineHeight:1.7 }}>
          Select any role to get <strong style={{ color:'#94a3b8' }}>100+ questions, mock tests, aptitude practice, roadmap</strong> and everything tailored specifically for that role at {company}.
        </p>
      </div>

      {/* Overview */}
      {data.overview && (
        <div style={{ padding:'16px 20px', background:'linear-gradient(135deg,#7c3aed10,#6d28d910)', borderRadius:12, border:'1px solid #7c3aed25', marginBottom:24, fontSize:'0.86rem', color:'#94a3b8', lineHeight:1.7 }}>
          🏢 {data.overview}
        </div>
      )}

      {/* Search */}
      <div style={{ position:'relative', marginBottom:20 }}>
        <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748b' }} />
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={`Search roles at ${company}…`}
          style={{ width:'100%', padding:'11px 14px 11px 38px', borderRadius:12, border:'1px solid #ffffff15', background:'#0f0f1a', color:'#e2e8f0', fontSize:'0.87rem', outline:'none', boxSizing:'border-box' }} />
      </div>

      {/* Role grid */}
      <div style={{ display:'grid', gap:14 }}>
        {filtered.map((r, i) => (
          <RoleCard key={i} role={r} onClick={() => onSelect(r.title)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px', color:'#64748b' }}>🔍 No roles found for "{search}"</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export default function RoleGuide() {
  const { state } = useApp();
  const s = state.sectionData['roles'];
  const [selectedRole, setSelectedRole] = useState(null);

  if (!s?.data && !s?.loading) return null;
  if (s?.loading) return <LoadingSection title="Roles" subtitle="Loading available roles at this company…" />;
  if (s?.error) return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'#64748b' }}>
      <div style={{ fontSize:'2rem', marginBottom:12 }}>⚠️</div>
      <div style={{ color:'#ef4444', marginBottom:8 }}>Failed to load roles</div>
      <div style={{ fontSize:'0.85rem' }}>{s.error}</div>
    </div>
  );

  if (selectedRole) {
    return <RoleDetailPage company={state.company} role={selectedRole} onBack={() => setSelectedRole(null)} />;
  }

  return <RoleList data={s.data || {}} company={state.company} onSelect={setSelectedRole} />;
}
