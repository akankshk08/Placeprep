// ============================================================
// AI Learning Hub — deep, structured lessons for placement prep
// Splits each lesson into two focused AI calls (core teaching +
// practice/interview material) so neither response risks hitting
// the model's output-token limit and getting truncated/shallow —
// the same fix that solved Mock Test's truncation bug.
// ============================================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles, Search, Send, BookOpen, Brain, Code2, Layers,
  Star, Zap, Globe,
  RotateCcw, Copy, CheckCheck, Lightbulb, Target, Trophy,
  ArrowRight, Hash, Cpu, Database, Network, X, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, MapPin, Compass, Youtube, ClipboardList, ExternalLink,
} from 'lucide-react';
import { fetchRaw } from '../../api/gemini';
import { useApp, GLOBAL_SECTIONS } from '../../context/AppContext';
import { CURATED_RESOURCES } from './YouTubeVideos';
import { findExactVideo } from '../../data/curatedVideoIndex';

// ── Match a lesson to a real curated playlist, so the video (a better
// medium for most of this) can be surfaced above the AI-generated text
// instead of the AI guessing a video that may not exist. ─────────────
const LESSON_CATEGORY_TO_PLAYLIST_CATEGORY = {
  algorithm: 'DSA',
  'data-structure': 'DSA',
  'database-concept': 'DBMS',
  'os-concept': 'OS',
  'networking-concept': 'CN',
  'system-design': 'System Design',
};
const LANGUAGE_HINTS = [
  { re: /\bjava\b(?!\s*script)/i, cat: 'Java' },
  { re: /\bpython\b/i, cat: 'Python' },
  { re: /c\+\+/i, cat: 'C++' },
  { re: /javascript|\bjs\b/i, cat: 'JavaScript' },
  { re: /\breact\b/i, cat: 'React' },
  { re: /\baws\b|cloud practitioner/i, cat: 'AWS' },
  { re: /docker|devops|ci\/cd|kubernetes/i, cat: 'DevOps' },
  { re: /\boop\b|polymorphism|inheritance|encapsulation|abstraction/i, cat: 'OOPS' },
  { re: /aptitude|quant|reasoning/i, cat: 'Aptitude' },
];

function resolvePlaylistCategory(lessonCategory, topic) {
  let cat = LESSON_CATEGORY_TO_PLAYLIST_CATEGORY[lessonCategory];
  if (!cat) {
    const hint = LANGUAGE_HINTS.find(h => h.re.test(topic || ''));
    cat = hint?.cat;
  }
  return cat || null;
}

// Prefer an exact, single video for the topic (from a hand-verified index of
// real videos within the playlist); fall back to the whole playlist when no
// specific video is indexed for it yet.
function findVideoMatch(lessonCategory, topic) {
  const cat = resolvePlaylistCategory(lessonCategory, topic);
  if (!cat) return null;
  const playlist = CURATED_RESOURCES.find(r => r.category === cat) || null;
  const exact = findExactVideo(cat, topic);
  if (exact) {
    return {
      title: exact.title,
      channel: playlist?.channel || '',
      description: `Exact video from ${playlist?.title || cat} — matched to this topic.`,
      url: `https://www.youtube.com/watch?v=${exact.vid}`,
      exact: true,
    };
  }
  if (!playlist) return null;
  return { ...playlist, exact: false };
}

// ── Suggested topics — placement-relevant only ──────────────────
const TOPIC_SEEDS = [
  { icon: Code2,     label: 'Binary Search',        color: '#f97316', cat: 'DSA' },
  { icon: Layers,    label: 'Dynamic Programming',  color: '#f97316', cat: 'DSA' },
  { icon: Hash,      label: 'Linked List',          color: '#f97316', cat: 'DSA' },
  { icon: Network,   label: 'Graph Traversal (BFS/DFS)', color: '#f97316', cat: 'DSA' },
  { icon: Database,  label: 'DBMS Normalization',   color: '#f59e0b', cat: 'DBMS' },
  { icon: Database,  label: 'SQL Joins',            color: '#f59e0b', cat: 'DBMS' },
  { icon: Cpu,       label: 'Process vs Thread',    color: '#ec4899', cat: 'OS' },
  { icon: Cpu,       label: 'Deadlock',             color: '#ec4899', cat: 'OS' },
  { icon: Globe,     label: 'TCP vs UDP',           color: '#06b6d4', cat: 'CN' },
  { icon: Globe,     label: 'OSI Model',            color: '#06b6d4', cat: 'CN' },
  { icon: Brain,     label: 'OOP — Polymorphism',   color: '#8b5cf6', cat: 'OOP' },
  { icon: Layers,    label: 'System Design Basics', color: '#60a5fa', cat: 'System Design' },
];

// ── Which site sections make sense to jump to, per topic category ──
const CATEGORY_STUDY_LINKS = {
  algorithm:            [{ id: 'dsa', label: 'DSA Topics' }, { id: 'codingQs', label: 'Coding Questions' }],
  'data-structure':      [{ id: 'dsa', label: 'DSA Topics' }, { id: 'codingQs', label: 'Coding Questions' }],
  'database-concept':    [{ id: 'dbms', label: 'DBMS Topics' }],
  'os-concept':          [{ id: 'os', label: 'OS Topics' }],
  'networking-concept':  [{ id: 'cn', label: 'CN Topics' }],
  'system-design':       [{ id: 'roadmap', label: 'Prep Roadmap' }],
  'language-feature':    [{ id: 'codingQs', label: 'Coding Questions' }],
  other:                 [],
};

// ── Prompt builders ──────────────────────────────────────────────
function buildCorePrompt(topic) {
  return `You are an expert placement mentor and teacher preparing a BTech engineering student for technical interviews.
Teach "${topic}" thoroughly, like a great professor explaining it for the first time — not a dictionary definition.

Return ONLY valid JSON (no markdown fences, no text outside the JSON):
{
  "topic": "${topic}",
  "category": "algorithm | data-structure | database-concept | os-concept | networking-concept | language-feature | system-design | other",
  "definition": "clear, precise definition — 2-3 sentences",
  "whyItMatters": "why this concept/technique exists and what problem it solves — 2-3 sentences",
  "analogy": "a vivid, memorable real-life analogy that makes the concept click",
  "howItWorks": ["step 1, a full explanatory sentence", "step 2", "step 3", "step 4", "step 5"],
  "timeComplexity": "Big-O with a one-sentence reason, OR null if not applicable to this topic",
  "spaceComplexity": "Big-O with a one-sentence reason, OR null if not applicable",
  "advantages": ["advantage 1", "advantage 2", "advantage 3"],
  "disadvantages": ["disadvantage 1", "disadvantage 2"],
  "example": { "scenario": "a concrete example scenario", "walkthrough": "how the concept applies here, step by step" },
  "dryRun": { "input": "a specific example input", "trace": ["step with actual values", "next step with actual values", "..."], "output": "final result" },
  "code": { "language": "C++, or SQL/pseudocode if more appropriate for this topic", "snippet": "complete, correct, well-commented code" }
}
Rules:
- If "${topic}" is an algorithm or data structure: timeComplexity, spaceComplexity, code, and dryRun are REQUIRED (not null) — give real, correct complexity analysis and working code.
- If "${topic}" is a conceptual/theory topic (a DBMS/OS/CN idea, a design principle, a language feature with no single "run"): set timeComplexity/spaceComplexity to null, set dryRun to null if a step-by-step trace genuinely doesn't apply, and use "code" for a short SQL query or pseudocode illustration if relevant — else null.
- howItWorks needs at least 4 real steps. example and advantages/disadvantages must not be thin one-liners — this is a lesson, not a glossary entry.`;
}

function buildPracticePrompt(topic) {
  return `You are a placement mentor. For the topic "${topic}", generate interview and practice material for a BTech
student preparing for technical interviews.
Return ONLY valid JSON (no markdown fences):
{
  "commonMistakes": [{"mistake": "a specific mistake students make", "why": "why it happens / why it's wrong", "fix": "how to avoid it"}],
  "whenToUse": ["scenario where this is the right choice", "another scenario", "a third scenario"],
  "interviewQuestions": [{"question": "an interview question about this topic", "answer": "a complete, well-explained answer — a student should be able to answer well in an interview having read only this"}],
  "practiceQuestions": [{"question": "a practice problem or exercise", "hint": "a nudge in the right direction without giving the answer away", "difficulty": "Easy/Medium/Hard"}],
  "relatedTopics": ["a topic to study next or alongside this one", "another related topic", "a third", "a fourth"]
}
Provide at least 3 commonMistakes, 3 whenToUse scenarios, 5 interviewQuestions (ranging basic to advanced), 5 practiceQuestions, and 4 relatedTopics.`;
}

function buildQuickPrompt(topic) {
  return `You are a placement mentor giving a fast pre-interview revision summary for "${topic}" — for someone who has
studied it before and needs a sharp refresher, not a first lesson. Be concise but high-signal.
Return ONLY valid JSON (no markdown fences):
{
  "topic": "${topic}",
  "oneLiner": "the topic captured in one precise sentence",
  "keyPoints": ["sharp point 1", "sharp point 2", "sharp point 3", "sharp point 4", "sharp point 5"],
  "complexity": "Big-O summary if applicable, else null",
  "mustRemember": ["the fact most likely to trip someone up", "a second one", "a third"],
  "quickExample": "one short concrete example or code line if useful, else null"
}`;
}

// ── Parsing helper ───────────────────────────────────────────────
function parseJSON(text) {
  const strip = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(strip); } catch { return null; }
}

// ── Fetch a full lesson (2 parallel calls, merged) ────────────────
async function fetchLesson(topic) {
  const [coreRaw, practiceRaw] = await Promise.all([
    fetchRaw(buildCorePrompt(topic)),
    fetchRaw(buildPracticePrompt(topic)),
  ]);
  const core = parseJSON(coreRaw);
  const practice = parseJSON(practiceRaw);
  if (!core && !practice) throw new Error('Could not parse the lesson. Please retry.');
  return { ...(core || {}), ...(practice || {}) };
}

async function fetchQuick(topic) {
  const raw = await fetchRaw(buildQuickPrompt(topic));
  const parsed = parseJSON(raw);
  if (!parsed) throw new Error('Could not parse the summary. Please retry.');
  return parsed;
}

// ── Small building blocks ────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };
  return (
    <button onClick={copy}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7,
        border: '1px solid var(--border-card)', background: 'transparent',
        color: copied ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem',
        transition: 'all 0.2s' }}>
      {copied ? <CheckCheck size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function LessonSection({ icon: Icon, title, color, children }) {
  return (
    <div style={{ marginBottom: 16, borderRadius: 14, border: `1px solid ${color}25`, background: 'var(--bg-card)', padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon size={15} color={color} />
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function AccordionQA({ items, color, questionKey = 'question', answerKey = 'answer', numbered = true }) {
  const [open, setOpen] = useState({});
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className={`accordion-item ${open[i] ? 'open' : ''}`} style={{ marginBottom: 8 }}>
          <div className="accordion-trigger" onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}>
            <div className="accordion-trigger-left">
              {numbered && <span style={{ color, fontWeight: 800, fontSize: '0.8rem', minWidth: 18 }}>{i + 1}.</span>}
              <span className="accordion-trigger-text" style={{ fontSize: '0.85rem' }}>{item[questionKey]}</span>
            </div>
            {open[i] ? <ChevronUp size={14} className="accordion-chevron" /> : <ChevronDown size={14} className="accordion-chevron" />}
          </div>
          {open[i] && (
            <div className="accordion-content">
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>{item[answerKey]}</div>
              {item.hint && !item[answerKey] && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>💡 {item.hint}</div>
              )}
              {item.difficulty && (
                <span className={`badge ${item.difficulty === 'Easy' ? 'badge-low' : item.difficulty === 'Hard' ? 'badge-high' : 'badge-medium'}`} style={{ marginTop: 8, display: 'inline-block' }}>
                  {item.difficulty}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Full lesson renderer ─────────────────────────────────────────
function LessonCard({ data, color }) {
  const { state, setSection } = useApp();
  const studyLinks = CATEGORY_STUDY_LINKS[data.category] || [];
  const video = findVideoMatch(data.category, data.topic);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px', borderRadius: 14, marginBottom: 16,
        background: `linear-gradient(135deg, ${color}12, ${color}06)`, border: `1px solid ${color}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{data.topic}</h2>
          <CopyBtn text={JSON.stringify(data, null, 2)} />
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>{data.definition}</p>
      </div>

      {/* Real video first — a good curated video teaches this better than
          generated text, especially for anything visual/step-by-step.
          Prefers an exact single video for the topic; falls back to the
          whole playlist when no specific video is indexed yet. */}
      {video && (
        <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 14,
            marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.55)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Youtube size={22} color="#ef4444" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                {video.exact ? 'Exact video for this topic — watch it' : 'Best way to learn this — watch it'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                {video.title} {video.channel && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {video.channel}</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{video.description}</div>
            </div>
            <ExternalLink size={16} color="#f87171" style={{ flexShrink: 0 }} />
          </div>
        </a>
      )}

      {/* Everything below is AI-generated reference material — code, complexity,
          practice questions — not a substitute for the video above. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: video ? '4px 0 14px' : '0 0 14px' }}>
        <ClipboardList size={13} color="var(--text-muted)" />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
          AI Reference Notes{video ? ' — read after the video' : ''}
        </span>
      </div>

      <LessonSection icon={Lightbulb} title="Why It Matters" color={color}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{data.whyItMatters}</p>
      </LessonSection>

      {data.analogy && (
        <LessonSection icon={Compass} title="Real-Life Analogy" color={color}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>{data.analogy}</p>
        </LessonSection>
      )}

      {data.howItWorks?.length > 0 && (
        <LessonSection icon={Layers} title="How It Works — Step by Step" color={color}>
          {data.howItWorks.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <span style={{ color, fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step}</span>
            </div>
          ))}
        </LessonSection>
      )}

      {(data.timeComplexity || data.spaceComplexity) && (
        <div className="grid-2" style={{ marginBottom: 16 }}>
          {data.timeComplexity && (
            <div className="stat-card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time Complexity</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{data.timeComplexity}</div>
            </div>
          )}
          {data.spaceComplexity && (
            <div className="stat-card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Space Complexity</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{data.spaceComplexity}</div>
            </div>
          )}
        </div>
      )}

      {(data.advantages?.length > 0 || data.disadvantages?.length > 0) && (
        <div className="grid-2" style={{ marginBottom: 16 }}>
          {data.advantages?.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle2 size={14} /> Advantages
              </div>
              {data.advantages.map((a, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>→ {a}</div>
              ))}
            </div>
          )}
          {data.disadvantages?.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--red)', fontWeight: 700, fontSize: '0.85rem' }}>
                <AlertTriangle size={14} /> Disadvantages
              </div>
              {data.disadvantages.map((d, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>→ {d}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.example && (
        <LessonSection icon={Target} title="Example" color={color}>
          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 6 }}>{data.example.scenario}</div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{data.example.walkthrough}</p>
        </LessonSection>
      )}

      {data.dryRun && (
        <LessonSection icon={Zap} title="Dry Run" color={color}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}><strong>Input:</strong> {data.dryRun.input}</div>
          {data.dryRun.trace?.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, padding: '7px 10px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <span style={{ color, fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{step}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.82rem', color: 'var(--green)', marginTop: 8 }}><strong>Output:</strong> {data.dryRun.output}</div>
        </LessonSection>
      )}

      {data.code && (
        <LessonSection icon={Code2} title={`Code${data.code.language ? ` (${data.code.language})` : ''}`} color={color}>
          <pre className="code-block" style={{ margin: 0 }}>{data.code.snippet}</pre>
        </LessonSection>
      )}

      {data.commonMistakes?.length > 0 && (
        <LessonSection icon={AlertTriangle} title="Common Mistakes to Avoid" color={color}>
          {data.commonMistakes.map((m, i) => (
            <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--red)', marginBottom: 3 }}>{m.mistake}</div>
              <div style={{ fontSize: '0.79rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.why}</div>
              <div style={{ fontSize: '0.79rem', color: 'var(--green)' }}>Fix: {m.fix}</div>
            </div>
          ))}
        </LessonSection>
      )}

      {data.whenToUse?.length > 0 && (
        <LessonSection icon={MapPin} title="When to Use It" color={color}>
          {data.whenToUse.map((w, i) => (
            <div key={i} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>→ {w}</div>
          ))}
        </LessonSection>
      )}

      {data.interviewQuestions?.length > 0 && (
        <LessonSection icon={Trophy} title="Common Interview Questions" color={color}>
          <AccordionQA items={data.interviewQuestions} color={color} />
        </LessonSection>
      )}

      {data.practiceQuestions?.length > 0 && (
        <LessonSection icon={Target} title="Practice Questions" color={color}>
          <AccordionQA items={data.practiceQuestions} color={color} questionKey="question" answerKey="hint" />
        </LessonSection>
      )}

      {/* Continue studying — connects the lesson back to the rest of the site */}
      {(studyLinks.length > 0 || data.relatedTopics?.length > 0) && (
        <div style={{ padding: '16px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 12 }}>
            🧭 Continue Studying
          </div>
          {studyLinks.length > 0 && (
            <div style={{ marginBottom: data.relatedTopics?.length ? 14 : 0 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Practice this on PlacePrep
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {studyLinks.map(link => (
                  <button key={link.id}
                    disabled={!state.company}
                    onClick={() => setSection(link.id)}
                    title={!state.company ? 'Search a company first to unlock this' : ''}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                      border: `1px solid ${state.company ? color + '40' : 'var(--border-card)'}`,
                      background: state.company ? `${color}12` : 'var(--bg-secondary)',
                      color: state.company ? color : 'var(--text-muted)',
                      cursor: state.company ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600 }}>
                    {link.label} <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {data.relatedTopics?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Related Topics — click to learn
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.relatedTopics.map((t, i) => (
                  <span key={i} className="chip" data-related-topic={t} style={{ cursor: 'pointer' }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Quick revision renderer ───────────────────────────────────────
function QuickCard({ data, color }) {
  return (
    <div style={{ padding: '20px', borderRadius: 14, background: 'var(--bg-card)', border: `1px solid ${color}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{data.topic}</h2>
        <CopyBtn text={JSON.stringify(data, null, 2)} />
      </div>
      <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{data.oneLiner}</p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color, marginBottom: 8 }}>Key Points</div>
        {data.keyPoints?.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            <Star size={12} color={color} style={{ flexShrink: 0, marginTop: 3 }} /> {p}
          </div>
        ))}
      </div>

      {data.complexity && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, fontSize: '0.82rem' }}>
          <strong>Complexity:</strong> {data.complexity}
        </div>
      )}

      {data.quickExample && (
        <pre className="code-block" style={{ marginBottom: 16 }}>{data.quickExample}</pre>
      )}

      {data.mustRemember?.length > 0 && (
        <div style={{ padding: '14px', borderRadius: 12, background: 'var(--yellow-dim)', border: '1px solid rgba(245,200,66,0.25)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--yellow)', marginBottom: 8 }}>⚡ Must Remember</div>
          {data.mustRemember.map((m, i) => (
            <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>• {m}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── History pill ──────────────────────────────────────────────────
function HistoryPill({ item, onClick, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 99,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', cursor: 'pointer',
      fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
      onClick={() => onClick(item)}>
      <Hash size={11} />
      {item.length > 30 ? item.slice(0, 30) + '…' : item}
      <button onClick={e => { e.stopPropagation(); onRemove(item); }}
        style={{ marginLeft: 4, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        <X size={10} />
      </button>
    </div>
  );
}

function TypingDots({ color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: color, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
    </div>
  );
}

// ── Main AI Learning Hub Page ──────────────────────────────────────
export default function AILearningHub() {
  const { state, clearAILearnTopic } = useApp();
  const [query, setQuery]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [currentTopic, setTopic]  = useState('');
  const [activeColor, setColor]   = useState('#f97316');
  const [mode, setMode]           = useState('learn');
  const [history, setHistory]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('ai_learn_history') || '[]'); } catch { return []; }
  });
  const inputRef = useRef(null);

  const saveHistory = (topic) => {
    const updated = [topic, ...history.filter(h => h !== topic)].slice(0, 12);
    setHistory(updated);
    localStorage.setItem('ai_learn_history', JSON.stringify(updated));
  };

  const removeHistory = (topic) => {
    const updated = history.filter(h => h !== topic);
    setHistory(updated);
    localStorage.setItem('ai_learn_history', JSON.stringify(updated));
  };

  const handleSearch = useCallback(async (topicOverride, modeOverride) => {
    const topic = (topicOverride || query).trim();
    if (!topic) return;
    const activeMode = modeOverride || mode;

    const seed = TOPIC_SEEDS.find(s => s.label === topic);
    const col = seed?.color || '#f97316';

    setLoading(true);
    setError(null);
    setResult(null);
    setTopic(topic);
    setColor(col);
    setQuery(topic);
    saveHistory(topic);

    try {
      const data = activeMode === 'quick' ? await fetchQuick(topic) : await fetchLesson(topic);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed to generate content. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [query, mode, history]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); }
  };

  // A "deep dive" link elsewhere (e.g. a role's Topics to Prepare) can land here
  // with a topic pre-selected — run it once, then clear so revisiting doesn't re-trigger.
  useEffect(() => {
    if (state.aiLearnPendingTopic) {
      handleSearch(state.aiLearnPendingTopic);
      clearAILearnTopic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.aiLearnPendingTopic]);

  // Clicking a "related topic" chip re-runs the search for that topic
  const handleResultClick = (e) => {
    const chip = e.target.closest('[data-related-topic]');
    if (chip) handleSearch(chip.getAttribute('data-related-topic'));
  };

  const MODES = [
    { id: 'learn', icon: BookOpen, label: 'Full Lesson',    desc: 'Deep, structured teaching' },
    { id: 'quick', icon: Zap,      label: 'Quick Revision', desc: 'Fast refresher before an interview' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          borderRadius: 99, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)',
          fontSize: '0.75rem', color: 'var(--orange)', fontWeight: 700, marginBottom: 16 }}>
          <Sparkles size={13} /> AI Learning Hub
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 10, lineHeight: 1.2 }}>
          Master Any{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--orange), var(--yellow))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Placement Topic
          </span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 540, margin: '0 auto' }}>
          Finds you a real curated video where one exists, plus AI-generated reference notes —
          code, complexity, common mistakes, and interview questions to study alongside it.
        </p>
      </div>

      {/* ── Mode selector ── */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {MODES.map(m => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                borderRadius: 12, border: `1px solid ${active ? 'var(--orange)' : 'var(--border-card)'}`,
                background: active ? 'rgba(249,115,22,0.12)' : 'var(--bg-card)',
                color: active ? 'var(--orange)' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: active ? 700 : 500, fontSize: '0.83rem' }}>
              <Icon size={14} /> {m.label}
              <span style={{ fontSize: '0.7rem', color: active ? 'var(--orange)' : 'var(--text-muted)' }}>— {m.desc}</span>
            </button>
          );
        })}
      </div>

      {/* ── Search bar ── */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 16,
          border: `2px solid ${loading ? 'var(--orange)' : 'var(--border-hover)'}`,
          background: 'var(--bg-card)', overflow: 'hidden',
          boxShadow: loading ? '0 0 0 3px rgba(249,115,22,0.15)' : '0 4px 24px rgba(0,0,0,0.2)' }}>
          <Search size={18} style={{ marginLeft: 18, color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Type any placement topic — Binary Search, Normalization, TCP vs UDP…"
            autoComplete="off"
            style={{ flex: 1, padding: '16px 14px', background: 'transparent', border: 'none',
              color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            style={{ margin: '8px', padding: '10px 20px', borderRadius: 10, border: 'none',
              background: loading || !query.trim() ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--orange), #ea580c)',
              color: loading || !query.trim() ? 'var(--text-muted)' : '#fff',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            {loading ? <TypingDots color="#f97316" /> : <><Send size={15} /> Learn</>}
          </button>
        </div>
      </div>

      {/* ── History ── */}
      {history.length > 0 && !result && !loading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {history.map(h => (
              <HistoryPill key={h} item={h} onClick={t => { setQuery(t); handleSearch(t); }} onRemove={removeHistory} />
            ))}
          </div>
        </div>
      )}

      {/* ── Suggested topics ── */}
      {!result && !loading && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Popular Placement Topics
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {TOPIC_SEEDS.map(({ icon: Icon, label, color, cat }) => (
              <button key={label} onClick={() => { setQuery(label); handleSearch(label); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  borderRadius: 12, border: `1px solid ${color}25`, background: `${color}08`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${color}60`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = `${color}25`; }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{label}</div>
                  <div style={{ fontSize: '0.68rem', color, marginTop: 2 }}>{cat}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border-card)', marginBottom: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px',
              background: `linear-gradient(135deg, ${activeColor}20, ${activeColor}08)`,
              border: `2px solid ${activeColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={26} color={activeColor} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <TypingDots color={activeColor} />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            {mode === 'quick' ? 'Building your quick revision for' : 'Building your full lesson on'} "{currentTopic}"
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {mode === 'quick' ? 'Summarizing the essentials…' : 'Explanation, dry run, code, and practice questions — this can take a moment.'}
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--red)' }}>⚠️ {error}</div>
          <button onClick={() => handleSearch(currentTopic)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
              border: '1px solid rgba(239,68,68,0.35)', background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            <RotateCcw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Result ── */}
      {result && !loading && (
        <div onClick={handleResultClick}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <button onClick={() => { setResult(null); setQuery(''); setError(null); setTimeout(() => inputRef.current?.focus(), 100); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                border: '1px solid var(--border-card)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
              ← New Search
            </button>
            <button
              onClick={() => handleSearch(currentTopic, mode === 'learn' ? 'quick' : 'learn')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
              {mode === 'learn' ? <><Zap size={12} /> Switch to Quick Revision</> : <><BookOpen size={12} /> Switch to Full Lesson</>}
            </button>
          </div>

          {mode === 'quick'
            ? <QuickCard data={result} color={activeColor} />
            : <LessonCard data={result} color={activeColor} />}
        </div>
      )}
    </div>
  );
}
