import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Clock, Play, RefreshCw, CheckCircle, XCircle, AlertCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';
import { fetchMockTestSection, MOCK_TEST_SECTIONS } from '../../api/gemini';

// ── Timer hook ────────────────────────────────────────────
function useTimer(initialSeconds, running) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return { seconds, fmt };
}

// Normalize an "answer" field (may arrive as "B", "B)", "B) full text", or the full option text)
// down to just the leading option letter, so it can be matched reliably against option index.
function answerLetter(raw) {
  if (!raw) return '';
  const m = String(raw).trim().match(/^([A-D])\)?/i);
  return m ? m[1].toUpperCase() : '';
}

// ── Single question in test ────────────────────────────────
function TestQuestion({ q, index, answered, onAnswer, showResult }) {
  const letters = ['A', 'B', 'C', 'D'];
  const opts = q.options || [];
  const correctLetter = answerLetter(q.answer);
  const answeredLetter = answerLetter(answered) || (answered && letters[opts.indexOf(answered)]) || '';
  const isAnsweredCorrect = Boolean(answeredLetter) && answeredLetter === correctLetter;

  return (
    <div style={{ marginBottom: 20, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${answered !== undefined && showResult ? (isAnsweredCorrect ? 'rgba(6,214,160,0.4)' : 'rgba(255,107,107,0.4)') : 'var(--border-card)'}` }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: answered !== undefined && showResult ? (isAnsweredCorrect ? 'var(--green)' : 'var(--red)') : 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
          {answered !== undefined && showResult ? (isAnsweredCorrect ? '✓' : '✗') : index + 1}
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.6 }}>{q.question}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {opts.map((opt, i) => {
          const letter = letters[i] || String.fromCharCode(65 + i);
          const isSelected = answered === opt;
          const isCorrect  = showResult && letter === correctLetter;
          const isWrong    = showResult && isSelected && !isCorrect;
          return (
            <button key={i} onClick={() => !showResult && onAnswer(opt)}
              style={{ padding: '9px 14px', borderRadius: 8, textAlign: 'left', cursor: showResult ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                border: `1px solid ${isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : isSelected ? 'var(--accent)' : 'var(--border-card)'}`,
                background: isCorrect ? 'rgba(6,214,160,0.1)' : isWrong ? 'rgba(255,107,107,0.1)' : isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
                color: isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isCorrect || isSelected ? 700 : 400, fontSize: '0.83rem',
              }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>{letter}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {showResult && q.solution && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(108,99,255,0.07)', borderRadius: 8, borderLeft: '3px solid var(--accent)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          📐 <strong>Solution:</strong> {q.solution}
        </div>
      )}
    </div>
  );
}

// ── Result summary ─────────────────────────────────────────
function TestResult({ sections, answers, total, onRetry, onReview, setReview }) {
  let correct = 0, attempted = 0;
  sections.forEach((sec, si) => {
    sec.questions?.forEach(q => {
      const ans = answers[`${si}-${q.id}`];
      if (ans !== undefined) {
        attempted++;
        const correctLetter = answerLetter(q.answer);
        if (correctLetter && answerLetter(ans) === correctLetter) correct++;
      }
    });
  });
  const score   = Math.round((correct / total) * 100);
  const passed  = score >= 60;

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>{passed ? '🎉' : '📚'}</div>
      <h2 style={{ marginBottom: 8 }}>{passed ? 'Great job!' : 'Keep practicing!'}</h2>
      <div style={{ fontSize: '3rem', fontWeight: 900, color: passed ? 'var(--green)' : 'var(--red)', marginBottom: 20 }}>{score}%</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 400, margin: '0 auto 30px' }}>
        {[
          { label: 'Correct',    value: correct,          color: 'var(--green)' },
          { label: 'Wrong',      value: attempted - correct, color: 'var(--red)' },
          { label: 'Skipped',    value: total - attempted,  color: 'var(--text-muted)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
          <RotateCcw size={16} /> Retake Test
        </button>
        <button onClick={() => setReview(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
          <CheckCircle size={16} /> Review Answers
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function MockTestSection() {
  const { state }   = useApp();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmit]= useState(false);
  const [review, setReview]   = useState(false);
  const [answers, setAnswers] = useState({});
  const [activeSection, setActiveSection] = useState(0);

  const totalSeconds = 90 * 60;
  const { seconds, fmt } = useTimer(totalSeconds, started && !submitted);

  useEffect(() => { if (seconds === 0 && started && !submitted) setSubmit(true); }, [seconds]);

  const cacheKey = `mocktest_${state.company}`;

  // `ignore` guards against a stale response overwriting fresher state — e.g. if this
  // effect fires twice in quick succession (React StrictMode dev double-invoke, or a
  // fast company change), a slow first request must not clobber test data the user is
  // already answering against with a second, differently-generated set of questions.
  const load = async (ignoreRef) => {
    setLoading(true); setError(null);
    try {
      // One small request per section (instead of one big 30-question request)
      // keeps each AI response well under the token limit, avoiding truncation.
      const results = await Promise.all(
        MOCK_TEST_SECTIONS.map(cfg => fetchMockTestSection(state.company, 'Software Engineer', cfg.key))
      );
      if (ignoreRef.current) return;
      const totalQuestions = results.reduce((sum, qs) => sum + qs.length, 0);
      const d = {
        testName: `${state.company} Software Engineer Mock Test`,
        duration: '90 minutes',
        totalQuestions,
        sections: MOCK_TEST_SECTIONS.map((cfg, i) => ({ name: cfg.name, duration: cfg.duration, questions: results[i] })),
        instructions: [
          'Each question carries 1 mark; wrong answers may carry negative marking.',
          'You can switch between sections freely and revisit questions before submitting.',
        ],
        passingCriteria: '60% or above to pass',
      };
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

  const reset = () => { setStarted(false); setSubmit(false); setReview(false); setAnswers({}); setActiveSection(0); };

  if (loading) return <LoadingSection title="Generating Mock Test…" subtitle="Creating a realistic company-specific test" />;
  if (error)   return <ErrorSection error={error} onRetry={() => load({ current: false })} />;
  if (!data)   return null;

  const sections = data.sections || [];
  const allQs    = sections.flatMap(s => s.questions || []);
  const total    = allQs.length;

  // ── Results screen ─────────────────────────────────────
  if (submitted && !review) {
    return (
      <div>
        <div className="section-header">
          <div className="section-icon section-icon-orange"><ClipboardCheck size={24} /></div>
          <div><h1 className="section-title">Test Results</h1></div>
        </div>
        <TestResult sections={sections} answers={answers} total={total} onRetry={reset} setReview={setReview} />
      </div>
    );
  }

  // ── Review screen ────────────────────────────────────────
  if (review) {
    return (
      <div>
        <div className="section-header">
          <div className="section-icon section-icon-orange"><ClipboardCheck size={24} /></div>
          <div><h1 className="section-title">Answer Review</h1></div>
        </div>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 20, fontSize: '0.85rem' }}>
          <RotateCcw size={14} /> Take New Test
        </button>
        {sections.map((sec, si) => (
          <div key={si} style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12, fontSize: '1rem', color: 'var(--accent)' }}>{sec.name}</h3>
            {sec.questions?.map((q, qi) => (
              <TestQuestion key={qi} q={q} index={qi} answered={answers[`${si}-${q.id}`]} onAnswer={() => {}} showResult={true} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Pre-test / start screen ─────────────────────────────
  if (!started) {
    return (
      <div>
        <div className="section-header">
          <div className="section-icon section-icon-orange"><ClipboardCheck size={24} /></div>
          <div>
            <h1 className="section-title">Mock Test</h1>
            <p className="section-subtitle">{data.testName} — Simulates actual {state.company} placement test</p>
          </div>
        </div>

        {/* Test info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: '⏱', label: 'Duration', value: data.duration },
            { icon: '❓', label: 'Questions', value: `${total} total` },
            { icon: '📋', label: 'Sections', value: `${sections.length} sections` },
            { icon: '✅', label: 'Passing', value: '60%+' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sections breakdown */}
        <div style={{ marginBottom: 24 }}>
          {sections.map((sec, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border-card)', marginBottom: 8, background: 'var(--bg-card)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{sec.name}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>⏱ {sec.duration} · {sec.questions?.length || 0} questions</span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        {data.instructions?.length > 0 && (
          <div style={{ padding: '14px 18px', background: 'rgba(255,209,102,0.06)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 10, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: 'var(--yellow)', marginBottom: 8 }}>📋 Instructions</div>
            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
              {data.instructions.map((ins, i) => <li key={i} style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 4 }}>{ins}</li>)}
            </ul>
          </div>
        )}

        <button onClick={() => setStarted(true)}
          style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 24px rgba(108,99,255,0.4)', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}>
          <Play size={20} fill="#fff" /> Start Test
        </button>

        <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Timer starts when you click Start Test</div>
      </div>
    );
  }

  // ── Active test ──────────────────────────────────────────
  const sec = sections[activeSection] || {};
  const sectionQs = sec.questions || [];
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {/* Sticky test header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-card)', padding: '12px 0', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sections.map((s, i) => (
            <button key={i} onClick={() => setActiveSection(i)}
              style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${activeSection === i ? 'var(--accent)' : 'var(--border-card)'}`, background: activeSection === i ? 'var(--accent-dim)' : 'transparent', color: activeSection === i ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: activeSection === i ? 700 : 400 }}>
              {s.name} ({s.questions?.length || 0})
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{answeredCount}/{total}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: seconds < 300 ? 'rgba(255,107,107,0.1)' : 'var(--bg-card)', border: `1px solid ${seconds < 300 ? 'var(--red)' : 'var(--border-card)'}`, color: seconds < 300 ? 'var(--red)' : 'var(--text-primary)', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
            <Clock size={16} />{fmt(seconds)}
          </div>
          <button onClick={() => setSubmit(true)}
            style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
            Submit Test
          </button>
        </div>
      </div>

      <h3 style={{ marginBottom: 16, color: 'var(--accent)' }}>{sec.name} — {sec.duration}</h3>

      {sectionQs.map((q, i) => (
        <TestQuestion key={i} q={q} index={i} answered={answers[`${activeSection}-${q.id}`]} onAnswer={a => setAnswers(p => ({ ...p, [`${activeSection}-${q.id}`]: a }))} showResult={false} />
      ))}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button onClick={() => setActiveSection(s => Math.max(0, s - 1))} disabled={activeSection === 0}
          style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'transparent', color: activeSection === 0 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: activeSection === 0 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
          ← Previous
        </button>
        {activeSection < sections.length - 1 ? (
          <button onClick={() => setActiveSection(s => s + 1)}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
            Next Section →
          </button>
        ) : (
          <button onClick={() => setSubmit(true)}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--green)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
            Submit & Finish ✓
          </button>
        )}
      </div>
    </div>
  );
}
