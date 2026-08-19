import React from 'react';
import { Zap, Code2, Building2, FileText, Target, Youtube, CheckSquare, Key, AlertCircle, FilePlus2, Bookmark, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CompanySearch from './search/CompanySearch';

const POPULAR = [
  { name: 'Amazon', emoji: '📦' }, { name: 'Microsoft', emoji: '🪟' },
  { name: 'Google', emoji: '🔍' }, { name: 'Meta', emoji: '👾' },
  { name: 'TCS', emoji: '🏢' }, { name: 'Infosys', emoji: '💻' },
  { name: 'Nvidia', emoji: '🎮' }, { name: 'Qualcomm', emoji: '📡' },
  { name: 'Flipkart', emoji: '🛒' }, { name: 'Goldman Sachs', emoji: '💰' },
  { name: 'Adobe', emoji: '🎨' }, { name: 'Wipro', emoji: '🌐' },
];

const HOW_IT_WORKS = [
  { title: 'Search a company', desc: 'Type any company — big tech, service, startup, anyone.' },
  { title: 'AI builds your prep plan', desc: 'Company-specific questions, topics, and a week-by-week roadmap, generated on the spot.' },
  { title: 'Practice until ready', desc: 'Solve, bookmark, track progress — one place instead of ten tabs.' },
];

const FEATURES = [
  { icon: Building2, label: 'Company Intel', desc: 'Overview, products, hiring process', color: 'var(--accent)' },
  { icon: Code2, label: 'DSA + CS Core', desc: 'DSA, OS, DBMS, CN topics', color: 'var(--orange)' },
  { icon: FileText, label: 'Interview Prep', desc: 'Questions with model answers', color: 'var(--yellow)' },
  { icon: Target, label: 'ATS Analyzer', desc: 'Score your resume for the role', color: 'var(--pink)' },
  { icon: Youtube, label: 'Video Resources', desc: 'Curated, verified YouTube playlists', color: '#ef4444' },
  { icon: CheckSquare, label: 'Progress Tracker', desc: 'Track your prep journey', color: 'var(--teal)' },
];

export default function HomePage() {
  const { setCompany, toggleSettings, setSection } = useApp();

  // Key is pre-configured in .env — no warning needed unless overridden
  const hasKey = !!(localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY);
  const lastCompany = localStorage.getItem('pp_last_company');

  return (
    <div className="home-page">

      {/* ── Continue where you left off ── */}
      {lastCompany && (
        <div style={{
          width: '100%', maxWidth: 680,
          marginBottom: 20,
          padding: '13px 20px',
          background: 'rgba(79,142,247,0.07)',
          border: '1px solid rgba(79,142,247,0.18)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1rem' }}>👋</span>
            Continue preparing for{' '}
            <strong style={{ color: 'var(--accent)' }}>{lastCompany}</strong>?
          </div>
          <button
            onClick={() => setCompany(lastCompany)}
            style={{
              padding: '7px 18px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #4f8ef7, #3b7de8)',
              color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            Continue →
          </button>
        </div>
      )}

      {/* ── API Key Warning (only if truly missing) ── */}
      {!hasKey && (
        <div style={{
          width: '100%', maxWidth: 680,
          marginBottom: 28,
          padding: '14px 20px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            🔑 Add a Gemini API key to enable AI features.
          </div>
          <button
            onClick={toggleSettings}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
            Set API Key
          </button>
        </div>
      )}

      {/* Hero badge */}
      <div className="home-hero-badge">
        <div className="pulse-dot" />
        <Zap size={13} /> AI-Powered Placement Prep
      </div>

      {/* Headline */}
      <h1 className="home-hero-title">
        Crack Any Company's{' '}
        <span className="highlight">Placement</span>{' '}
        with AI
      </h1>

      <p className="home-hero-sub">
        Enter any company name — get a complete prep guide covering DSA, interview questions,
        resume tips, ATS analysis, videos and a personalized roadmap.
      </p>

      {/* Search */}
      <CompanySearch isHome={true} />

      {/* How it works — the short version of "why this exists" */}
      <div className="home-how" style={{ maxWidth: 780, width: '100%', alignSelf: 'center' }}>
        {HOW_IT_WORKS.map((s, i) => (
          <div className="home-how-step" key={s.title}>
            <div className="home-how-num">{i + 1}</div>
            <div>
              <div className="home-how-title">{s.title}</div>
              <div className="home-how-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Popular companies */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
          Popular Companies
        </div>
        <div className="home-popular">
          {POPULAR.map((c) => (
            <div key={c.name} className="home-popular-tag" onClick={() => setCompany(c.name)}>
              <span>{c.emoji}</span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Standalone tools — no company needed */}
      <div style={{ maxWidth: 560, width: '100%', marginBottom: 44 }}>
        <div className="grid-2">
          <button className="feature-tile" style={{ '--tile-color': 'var(--teal)' }} onClick={() => setSection('resumeBuilder')}>
            <div className="feature-tile-icon">
              <FilePlus2 size={20} />
            </div>
            <div className="feature-tile-body">
              <div className="feature-tile-title">
                Resume Builder
                <ArrowRight size={14} className="feature-tile-arrow" />
              </div>
              <div className="feature-tile-desc">Build &amp; download as PDF</div>
            </div>
          </button>
          <button className="feature-tile" style={{ '--tile-color': 'var(--orange)' }} onClick={() => setSection('bookmarks')}>
            <div className="feature-tile-icon">
              <Bookmark size={20} />
            </div>
            <div className="feature-tile-body">
              <div className="feature-tile-title">
                Bookmarks
                <ArrowRight size={14} className="feature-tile-arrow" />
              </div>
              <div className="feature-tile-desc">Saved questions &amp; notes</div>
            </div>
          </button>
        </div>
      </div>

      {/* Feature grid — descriptive only: these live inside a company's workspace,
          so they're not clickable here. Search a company above to unlock them. */}
      <div style={{ maxWidth: 820, width: '100%' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
          🔒 Unlocked Once You Search a Company
        </div>
        <div className="grid-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="feature-tile feature-tile-static" style={{ '--tile-color': f.color }}>
              <div className="feature-tile-icon">
                <f.icon size={20} />
              </div>
              <div className="feature-tile-body">
                <div className="feature-tile-title">{f.label}</div>
                <div className="feature-tile-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
