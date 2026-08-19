import React, { useEffect, useState } from 'react';
import { Library, ExternalLink, BookOpen, Github, Star, Filter, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

const levelColor = { Beginner: 'badge-low', Intermediate: 'badge-medium', Advanced: 'badge-high' };

const tabConfig = [
  { id: 'websites',  label: '🌐 Websites',    emoji: '🌐', color: 'var(--teal)',   bgColor: 'var(--teal-dim)' },
  { id: 'courses',   label: '🎓 Courses',     emoji: '🎓', color: 'var(--orange)', bgColor: 'var(--orange-dim)' },
  { id: 'books',     label: '📚 Books',       emoji: '📖', color: 'var(--accent)', bgColor: 'var(--accent-dim)' },
  { id: 'repos',     label: '🐙 GitHub',      emoji: '⭐', color: '#e879f9',       bgColor: 'rgba(232,121,249,0.08)' },
  { id: 'practice',  label: '🔥 Practice',    emoji: '🔥', color: 'var(--yellow)', bgColor: 'var(--yellow-dim)' },
];

function ResourceLink({ href, children }) {
  return (
    <a href={href || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      {children}
    </a>
  );
}

function WebsiteCard({ w }) {
  return (
    <ResourceLink href={w.url}>
      <div className="resource-item" style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
        <div className="resource-item-left">
          <div className="resource-icon" style={{ background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: '1.2rem' }}>🌐</div>
          <div>
            <div className="resource-name">{w.name}</div>
            <div className="resource-desc">{w.description}{w.subject ? ` · ${w.subject}` : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <span className={`badge ${w.free ? 'badge-low' : 'badge-accent'}`}>{w.free ? 'FREE' : 'PAID'}</span>
          <ExternalLink size={14} color="var(--text-muted)" />
        </div>
      </div>
    </ResourceLink>
  );
}

function CourseCard({ c }) {
  return (
    <ResourceLink href={c.url}>
      <div className="card" style={{ marginBottom: 10, cursor: 'pointer', transition: 'transform 0.15s ease' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🎓</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.platform}{c.subject ? ` · ${c.subject}` : ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
            <span className={`badge ${c.free ? 'badge-low' : 'badge-accent'}`}>{c.free ? 'FREE' : 'PAID'}</span>
            {c.level && <span className={`badge ${levelColor[c.level] || 'badge-medium'}`} style={{ fontSize: '0.67rem' }}>{c.level}</span>}
          </div>
        </div>
        {c.duration && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Clock size={12} /> {c.duration}
          </div>
        )}
      </div>
    </ResourceLink>
  );
}

function BookCard({ b }) {
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 48, height: 60, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{b.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>by {b.author}{b.subject ? ` · ${b.subject}` : ''}</div>
          {b.why && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{b.why}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
          {b.level && <span className={`badge ${levelColor[b.level] || 'badge-medium'}`}>{b.level}</span>}
          <span className={`badge ${b.free ? 'badge-low' : 'badge-accent'}`}>{b.free ? 'FREE' : 'PAID'}</span>
        </div>
      </div>
    </div>
  );
}

function RepoCard({ r }) {
  return (
    <ResourceLink href={r.url}>
      <div className="card" style={{ marginBottom: 10, cursor: 'pointer', transition: 'transform 0.15s ease' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,121,249,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Github size={20} color="#e879f9" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{r.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.5 }}>{r.description}</div>
            {r.stars && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--yellow)' }}>
                <Star size={11} fill="var(--yellow)" /> {r.stars} stars
              </div>
            )}
          </div>
          <ExternalLink size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        </div>
      </div>
    </ResourceLink>
  );
}

function PracticeCard({ p }) {
  return (
    <ResourceLink href={p.url}>
      <div className="resource-item" style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}>
        <div className="resource-item-left">
          <div className="resource-icon" style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', fontSize: '1.2rem' }}>🔥</div>
          <div>
            <div className="resource-name">{p.name}</div>
            <div className="resource-desc">{p.description}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {p.focus && <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{p.focus}</span>}
          <ExternalLink size={14} color="var(--text-muted)" />
        </div>
      </div>
    </ResourceLink>
  );
}

export default function Resources() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['resources'];
  const [tab, setTab]       = useState('websites');
  const [freeOnly, setFree] = useState(false);

  useEffect(() => { loadSection('resources'); }, []);

  if (!s || s.loading) return <LoadingSection title="Loading Resources…" />;
  if (s.error)         return <ErrorSection error={s.error} section="resources" />;
  const d = s.data;

  const counts = {
    websites: d.websites?.length    || 0,
    courses:  d.courses?.length     || 0,
    books:    d.books?.length       || 0,
    repos:    d.githubRepos?.length || 0,
    practice: d.practiceLinks?.length || 0,
  };

  const filterFree = (arr) => freeOnly ? arr?.filter(x => x.free !== false) : arr;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-yellow"><Library size={24} /></div>
        <div>
          <h1 className="section-title">Learning Resources</h1>
          <p className="section-subtitle">Curated prep material for {state.company}</p>
        </div>
      </div>

      {/* Tab bar + Free filter toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabConfig.map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: '0.83rem',
                border: tab === t.id ? `1px solid ${t.color}` : '1px solid var(--border-card)',
                background: tab === t.id ? `color-mix(in srgb, ${t.color} 10%, transparent)` : 'var(--bg-card)',
                color: tab === t.id ? t.color : 'var(--text-muted)',
                fontWeight: tab === t.id ? 700 : 400, transition: 'all 0.2s',
              }}>
              {t.label}
              <span style={{ padding: '1px 6px', borderRadius: 10, background: tab === t.id ? t.color : 'var(--bg-secondary)', color: tab === t.id ? '#fff' : 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>

        <button onClick={() => setFree(!freeOnly)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${freeOnly ? 'var(--green)' : 'var(--border-card)'}`, background: freeOnly ? 'var(--green-dim)' : 'var(--bg-card)', color: freeOnly ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: freeOnly ? 700 : 400, transition: 'all 0.2s' }}>
          <Filter size={13} /> {freeOnly ? 'FREE only ✓' : 'Show all'}
        </button>
      </div>

      {/* Content */}
      {tab === 'websites' && (filterFree(d.websites) || []).map((w, i) => <WebsiteCard key={i} w={w} />)}
      {tab === 'courses'  && (filterFree(d.courses)  || []).map((c, i) => <CourseCard  key={i} c={c} />)}
      {tab === 'books'    && (d.books || []).map((b, i) => <BookCard key={i} b={b} />)}
      {tab === 'repos'    && (d.githubRepos    || []).map((r, i) => <RepoCard    key={i} r={r} />)}
      {tab === 'practice' && (d.practiceLinks || []).map((p, i) => <PracticeCard key={i} p={p} />)}

      {/* Empty state */}
      {((tab === 'websites' && !d.websites?.length) || (tab === 'courses' && !d.courses?.length) ||
        (tab === 'books' && !d.books?.length) || (tab === 'repos' && !d.githubRepos?.length) ||
        (tab === 'practice' && !d.practiceLinks?.length)) && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No resources in this category</div>
        </div>
      )}
    </div>
  );
}
