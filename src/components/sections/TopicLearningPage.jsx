import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, BookOpen, Brain, Play, CheckCircle, Clock,
  ChevronDown, ChevronUp, ExternalLink, Youtube, FileText,
  Github, Zap, Globe, Star, RefreshCw, CheckCheck,
  Trophy, AlertCircle, RotateCcw, Target, Loader2,
  XCircle, Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  fetchSubtopics,
  fetchSubtopicResources,
  fetchSubtopicQuiz,
} from '../../api/topicLearning';

// ── Progress storage helpers ───────────────────────────────────
const STORAGE_KEY = 'pp_topic_progress';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function getCompletedSubtopics(company, topicName) {
  const p = loadProgress();
  return p?.[company]?.[topicName] || [];
}
function markSubtopicComplete(company, topicName, subtopicName) {
  const p = loadProgress();
  if (!p[company]) p[company] = {};
  if (!p[company][topicName]) p[company][topicName] = [];
  if (!p[company][topicName].includes(subtopicName)) {
    p[company][topicName].push(subtopicName);
    saveProgress(p);
  }
}

// ── Importance badge color ─────────────────────────────────────
const impColor = {
  High:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   text: '#ef4444' },
  Medium: { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  text: '#f59e0b' },
  Low:    { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)',  text: '#818cf8' },
};

function ImpBadge({ imp }) {
  const s = impColor[imp] || impColor.Low;
  return (
    <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
      background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {imp}
    </span>
  );
}

// ── Small spinner ─────────────────────────────────────────────
function Spinner({ size = 16, color = 'var(--accent)' }) {
  return <Loader2 size={size} color={color} style={{ animation: 'spin 0.8s linear infinite' }} />;
}

// ── Resource Panel ─────────────────────────────────────────────
function ResourcePanel({ company, topic, subtopic }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    fetchSubtopicResources(company, topic, subtopic)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [company, topic, subtopic]);

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <Spinner size={24} /> <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching best resources…</div>
    </div>
  );
  if (error) return (
    <div style={{ padding: 20, color: 'var(--red)', fontSize: '0.85rem' }}>
      <AlertCircle size={16} style={{ display: 'inline', marginRight: 6 }} /> {error}
    </div>
  );
  if (!data) return null;

  const sections = [
    { key: 'officialDocs',     label: 'Official Documentation', icon: FileText,  color: '#3b82f6' },
    { key: 'youtubeVideos',    label: 'YouTube Tutorials',      icon: Youtube,   color: '#ef4444' },
    { key: 'articles',         label: 'Best Articles',          icon: BookOpen,  color: '#f59e0b' },
    { key: 'githubRepos',      label: 'GitHub Repositories',    icon: Github,    color: '#a78bfa' },
    { key: 'cheatSheets',      label: 'Cheat Sheets',           icon: Zap,       color: '#10b981' },
    { key: 'interactiveSites', label: 'Interactive Practice',   icon: Globe,     color: '#06b6d4' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sections.map(({ key, label, icon: Icon, color }) => {
        const items = data[key] || [];
        if (!items.length) return null;
        return (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                    background: 'var(--bg-secondary)', borderRadius: 10,
                    border: '1px solid var(--border-card)', textDecoration: 'none',
                    transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 3 }}>
                      {item.title}
                      {item.channel && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {item.channel}</span>}
                      {item.source && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {item.source}</span>}
                      {item.stars && <span style={{ color: '#f59e0b', fontWeight: 400, fontSize: '0.75rem' }}> ⭐ {item.stars}</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.description}</div>
                    {item.duration && <div style={{ marginTop: 4, fontSize: '0.72rem', color: color }}><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{item.duration}</div>}
                  </div>
                  <ExternalLink size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Quiz Panel ────────────────────────────────────────────────
function QuizPanel({ company, topic, subtopic, onComplete }) {
  const [quiz, setQuiz]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]       = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    fetchSubtopicQuiz(company, topic, subtopic)
      .then(d => { setQuiz(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [company, topic, subtopic]);

  const handleAnswer = (qId, val) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach(q => {
      const ans = answers[q.id];
      if (q.type === 'mcq' || q.type === 'scenario') {
        if (ans === q.correct) correct++;
      } else if (q.type === 'truefalse') {
        if (ans === q.correct) correct++;
      } else if (q.type === 'fillinblank') {
        if (ans?.toLowerCase().trim() === q.correct?.toLowerCase().trim()) correct++;
      } else if (q.type === 'interview') {
        correct++; // self-assessed — always give credit
      }
    });
    setScore(correct);
    setSubmitted(true);
    if (correct >= Math.floor(quiz.questions.length * 0.6)) {
      onComplete();
    }
  };

  const resetQuiz = () => { setAnswers({}); setSubmitted(false); setScore(null); };

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <Spinner size={24} />
      <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generating quiz questions…</div>
    </div>
  );
  if (error) return <div style={{ padding: 20, color: 'var(--red)', fontSize: '0.85rem' }}><AlertCircle size={16} style={{ display: 'inline', marginRight: 6 }} />{error}</div>;
  if (!quiz) return null;

  const total = quiz.questions.length;
  const pct = submitted ? Math.round((score / total) * 100) : 0;
  const passed = submitted && score >= Math.floor(total * 0.6);

  return (
    <div>
      {/* Score result */}
      {submitted && (
        <div style={{ marginBottom: 24, padding: 24, borderRadius: 16,
          background: passed ? 'rgba(6,214,160,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${passed ? 'rgba(6,214,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
          textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: passed ? 'var(--green)' : 'var(--red)', marginBottom: 6 }}>
            {score}/{total}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
            {passed ? '🎉 Well Done! Subtopic Marked Complete' : '📖 Keep Practicing'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Score: {pct}% &nbsp;·&nbsp; {passed ? `Need ≥60% to pass — you made it!` : `Need ≥60% to pass — retry below`}
          </div>
          {!passed && (
            <button onClick={resetQuiz}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10,
                border: '1px solid var(--border-hover)', background: 'transparent', color: 'var(--text-primary)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              <RotateCcw size={14} /> Retry Quiz
            </button>
          )}
        </div>
      )}

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {quiz.questions.map((q, qi) => {
          const userAns = answers[q.id];
          const isCorrect = submitted && (() => {
            if (q.type === 'mcq' || q.type === 'scenario') return userAns === q.correct;
            if (q.type === 'truefalse') return userAns === q.correct;
            if (q.type === 'fillinblank') return userAns?.toLowerCase().trim() === q.correct?.toLowerCase().trim();
            if (q.type === 'interview') return true;
            return false;
          })();

          const typeBadge = {
            mcq: { label: 'MCQ', color: '#7c3aed' },
            truefalse: { label: 'True / False', color: '#3b82f6' },
            fillinblank: { label: 'Fill in Blank', color: '#f59e0b' },
            scenario: { label: 'Scenario', color: '#10b981' },
            interview: { label: 'Interview', color: '#ec4899' },
          }[q.type] || { label: q.type, color: 'var(--accent)' };

          const borderColor = submitted
            ? (isCorrect ? 'rgba(6,214,160,0.35)' : 'rgba(239,68,68,0.35)')
            : 'var(--border-card)';

          return (
            <div key={q.id} style={{ padding: '16px 18px', background: 'var(--bg-secondary)',
              borderRadius: 12, border: `1px solid ${borderColor}` }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: `${typeBadge.color}18`, color: typeBadge.color }}>
                  {typeBadge.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Q{qi + 1}</span>
                {submitted && (
                  isCorrect
                    ? <CheckCircle size={14} color="var(--green)" />
                    : q.type !== 'interview' ? <XCircle size={14} color="var(--red)" /> : <CheckCircle size={14} color="var(--green)" />
                )}
              </div>

              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                {q.question}
              </div>

              {/* MCQ / Scenario options */}
              {(q.type === 'mcq' || q.type === 'scenario') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, oi) => {
                    const selected = userAns === oi;
                    const isRight = submitted && oi === q.correct;
                    const isWrong = submitted && selected && oi !== q.correct;
                    return (
                      <button key={oi} onClick={() => handleAnswer(q.id, oi)}
                        disabled={submitted}
                        style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 9, cursor: submitted ? 'default' : 'pointer',
                          border: `1px solid ${isRight ? 'rgba(6,214,160,0.5)' : isWrong ? 'rgba(239,68,68,0.5)' : selected ? 'var(--accent)' : 'var(--border-card)'}`,
                          background: isRight ? 'rgba(6,214,160,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : selected ? 'rgba(124,109,255,0.1)' : 'var(--bg-card)',
                          color: isRight ? 'var(--green)' : isWrong ? 'var(--red)' : selected ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '0.83rem', fontWeight: selected ? 600 : 400, transition: 'all 0.15s' }}>
                        <span style={{ fontWeight: 700, marginRight: 8 }}>{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False */}
              {q.type === 'truefalse' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {[true, false].map(val => {
                    const selected = userAns === val;
                    const isRight = submitted && val === q.correct;
                    const isWrong = submitted && selected && val !== q.correct;
                    return (
                      <button key={String(val)} onClick={() => handleAnswer(q.id, val)}
                        disabled={submitted}
                        style={{ flex: 1, padding: '10px', borderRadius: 9, cursor: submitted ? 'default' : 'pointer',
                          border: `1px solid ${isRight ? 'rgba(6,214,160,0.5)' : isWrong ? 'rgba(239,68,68,0.5)' : selected ? 'var(--accent)' : 'var(--border-card)'}`,
                          background: isRight ? 'rgba(6,214,160,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : selected ? 'rgba(124,109,255,0.1)' : 'var(--bg-card)',
                          color: isRight ? 'var(--green)' : isWrong ? 'var(--red)' : selected ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.15s' }}>
                        {val ? '✓ True' : '✗ False'}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the blank */}
              {q.type === 'fillinblank' && (
                <div>
                  <input type="text"
                    value={userAns || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    disabled={submitted}
                    placeholder="Type your answer…"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 9,
                      border: `1px solid ${submitted ? (isCorrect ? 'rgba(6,214,160,0.5)' : 'rgba(239,68,68,0.5)') : 'var(--border-hover)'}`,
                      background: 'var(--bg-card)', color: 'var(--text-primary)',
                      fontSize: '0.85rem', outline: 'none', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  {submitted && !isCorrect && (
                    <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--green)' }}>
                      Correct answer: <strong>{q.correct}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Interview style */}
              {q.type === 'interview' && (
                <div>
                  <textarea
                    value={userAns || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    disabled={submitted}
                    placeholder="Write your answer here…"
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 9,
                      border: '1px solid var(--border-hover)', background: 'var(--bg-card)',
                      color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
                      resize: 'vertical', lineHeight: 1.6 }}
                  />
                  {submitted && (
                    <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(124,109,255,0.08)', border: '1px solid rgba(124,109,255,0.2)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>Model Answer:</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.correct}</div>
                      {q.keyPoints && (
                        <ul style={{ marginTop: 6, paddingLeft: 16, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                          {q.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation after submit */}
              {submitted && q.explanation && q.type !== 'interview' && (
                <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8,
                  background: isCorrect ? 'rgba(6,214,160,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${isCorrect ? 'rgba(6,214,160,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: isCorrect ? 'var(--green)' : 'var(--red)' }}>
                    {isCorrect ? '✅ Correct! ' : '❌ Incorrect. '}
                  </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button onClick={handleSubmit}
            disabled={Object.keys(answers).length < Math.floor(total * 0.5)}
            style={{ padding: '13px 36px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--accent), #6d28d9)',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124,109,255,0.4)', transition: 'all 0.2s',
              opacity: Object.keys(answers).length < Math.floor(total * 0.5) ? 0.5 : 1 }}>
            <Trophy size={16} style={{ display: 'inline', marginRight: 8 }} />
            Submit Quiz
          </button>
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer at least {Math.floor(total * 0.5)} questions before submitting
          </div>
        </div>
      )}
    </div>
  );
}

// ── Single Subtopic Card ───────────────────────────────────────
function SubtopicCard({ company, topic, subtopic, isCompleted, onComplete }) {
  const { openAILearnTopic } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // null | 'resources' | 'quiz'

  const handleComplete = useCallback(() => {
    markSubtopicComplete(company, topic, subtopic.name);
    onComplete(subtopic.name);
  }, [company, topic, subtopic.name, onComplete]);

  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${isCompleted ? 'rgba(6,214,160,0.35)' : 'var(--border-card)'}`,
      background: isCompleted ? 'rgba(6,214,160,0.04)' : 'var(--bg-card)',
      overflow: 'hidden', transition: 'all 0.2s',
      marginBottom: 10,
    }}>
      {/* Header row — click to expand */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12, background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {isCompleted
            ? <CheckCircle size={18} color="var(--green)" style={{ flexShrink: 0 }} />
            : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-hover)', flexShrink: 0 }} />
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isCompleted ? 'var(--green)' : 'var(--text-primary)' }}>
              {subtopic.name}
            </div>
            {subtopic.description && (
              <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {subtopic.description}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {subtopic.importance && <ImpBadge imp={subtopic.importance} />}
          {subtopic.estimatedTime && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Clock size={11} /> {subtopic.estimatedTime}
            </span>
          )}
          {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-card)', padding: '16px 18px' }}>

          {/* Action buttons */}
          {activePanel === null && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
              <button onClick={() => setActivePanel('resources')}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                  borderRadius: 10, border: '1px solid rgba(59,130,246,0.4)',
                  background: 'rgba(59,130,246,0.08)', color: '#93c5fd',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Globe size={15} /> Learn from Resources
              </button>
              <button onClick={() => openAILearnTopic(subtopic.name)}
                title="Opens a full deep-dive lesson in AI Learning Hub"
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                  borderRadius: 10, border: '1px solid rgba(124,109,255,0.4)',
                  background: 'rgba(124,109,255,0.08)', color: 'var(--accent)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Brain size={15} /> Deep Dive in AI Learning Hub
              </button>
              {isCompleted && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                  borderRadius: 10, background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.3)',
                  color: 'var(--green)', fontSize: '0.83rem', fontWeight: 600 }}>
                  <CheckCheck size={14} /> Completed
                </span>
              )}
            </div>
          )}

          {/* Back button when panel is open */}
          {activePanel !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={() => setActivePanel(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  borderRadius: 8, border: '1px solid var(--border-card)', background: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>
                <ArrowLeft size={13} /> Back
              </button>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activePanel === 'resources' && '📚 Learning Resources'}
                {activePanel === 'quiz'      && '📝 Quiz'}
              </span>

              {/* Switch to quiz */}
              {activePanel === 'resources' && (
                <button onClick={() => setActivePanel('quiz')}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                    borderRadius: 8, border: '1px solid rgba(124,109,255,0.4)', background: 'rgba(124,109,255,0.1)',
                    color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Play size={12} /> Test Your Understanding
                </button>
              )}
            </div>
          )}

          {activePanel === 'quiz' && !isCompleted && (
            <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(124,109,255,0.08)', border: '1px solid rgba(124,109,255,0.25)',
              fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              🎯 Would you like to test your understanding of <strong style={{ color: 'var(--accent)' }}>{subtopic.name}</strong>?
              Score ≥60% to mark this subtopic as complete.
            </div>
          )}

          {/* Panels */}
          {activePanel === 'resources' && <ResourcePanel company={company} topic={topic} subtopic={subtopic.name} />}
          {activePanel === 'quiz'      && <QuizPanel     company={company} topic={topic} subtopic={subtopic.name} onComplete={handleComplete} />}
        </div>
      )}
    </div>
  );
}

// ── Main Topic Learning Page ───────────────────────────────────
export default function TopicLearningPage({ topic, onBack }) {
  const { state } = useApp();
  const company = state.company;

  const [subtopics, setSubtopics]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [completed, setCompleted]   = useState(() => getCompletedSubtopics(company, topic.name));

  useEffect(() => {
    setLoading(true); setError(null);
    fetchSubtopics(company, topic.name)
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.subtopics || []);
        setSubtopics(arr);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [company, topic.name]);

  const handleComplete = useCallback((subtopicName) => {
    setCompleted(prev => prev.includes(subtopicName) ? prev : [...prev, subtopicName]);
  }, []);

  const pct = subtopics.length > 0 ? Math.round((completed.length / subtopics.length) * 100) : 0;
  const impColor2 = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px',
          borderRadius: 10, border: '1px solid var(--border-card)', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem',
          fontWeight: 600, marginBottom: 24, transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
      >
        <ArrowLeft size={15} /> Back to Subjects
      </button>

      {/* Topic header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-dim)',
              border: '1px solid var(--border-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={19} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{topic.name}</h2>
              {topic.importance && (
                <span className={`badge ${impColor2[topic.importance] || 'badge-medium'}`} style={{ marginTop: 2 }}>{topic.importance}</span>
              )}
            </div>
          </div>
          {topic.reason && <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', maxWidth: 600 }}>{topic.reason}</p>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: pct === 100 ? 'var(--green)' : 'var(--accent)' }}>{pct}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completed.length}/{subtopics.length} completed</div>
        </div>
      </div>

      {/* Progress bar */}
      {subtopics.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="progress-bar" style={{ height: 10, borderRadius: 99 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>✅ {completed.length} Completed</span>
            <span>📖 {subtopics.length - completed.length} Remaining</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Spinner size={28} />
          <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Loading subtopics for {topic.name}…
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: 24, borderRadius: 14, background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)', textAlign: 'center' }}>
          <AlertCircle size={24} color="var(--red)" style={{ marginBottom: 10 }} />
          <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>Failed to load subtopics</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{error}</div>
        </div>
      )}

      {/* Subtopic list */}
      {!loading && !error && (
        <div>
          <div style={{ marginBottom: 14, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={13} /> Click any subtopic to expand learning options
          </div>
          {subtopics.map((sub, i) => (
            <SubtopicCard
              key={i}
              company={company}
              topic={topic.name}
              subtopic={sub}
              isCompleted={completed.includes(sub.name)}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
