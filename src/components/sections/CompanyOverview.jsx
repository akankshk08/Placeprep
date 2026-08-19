import React, { useEffect } from 'react';
import { Users, DollarSign, Globe, Cpu, TrendingUp, Star, Zap, Briefcase, Code2, MessageSquare, FileText, Map, Youtube, CheckSquare } from 'lucide-react';
import { useApp, NO_FETCH_SECTIONS } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

const QUICK_SECTIONS = [
  { id: 'roles',       icon: Briefcase,     label: 'Careers & Roles',      desc: 'All jobs + per-role prep guide',     color: 'var(--pink)' },
  { id: 'hiring',      icon: Users,         label: 'Hiring Process',       desc: 'Round-by-round breakdown',           color: 'var(--accent)' },
  { id: 'practice',    icon: MessageSquare, label: 'Practice',             desc: 'Interview Q&A, coding, aptitude, mock tests', color: 'var(--yellow)' },
  { id: 'dsa',         icon: Code2,         label: 'DSA Topics',           desc: 'Company-specific DSA patterns',      color: 'var(--accent)' },
  { id: 'resume',      icon: FileText,      label: 'Resume & ATS',         desc: 'Tips and resume scoring for this company', color: 'var(--orange)' },
  { id: 'roadmap',     icon: Map,           label: 'Prep Roadmap',         desc: '12-week structured plan',            color: 'var(--pink)' },
  { id: 'videos',      icon: Youtube,       label: 'YouTube Videos',       desc: 'Curated video playlists',            color: 'var(--red)' },
  { id: 'tracker',     icon: CheckSquare,   label: 'Placement Tracker',    desc: 'Track your progress',               color: 'var(--green)' },
];

export default function CompanyOverview() {
  const { state, loadSection, setSection } = useApp();
  const s = state.sectionData['overview'];

  const handleNav = (id) => {
    setSection(id);
    if (!NO_FETCH_SECTIONS.includes(id)) loadSection(id);
  };
  useEffect(() => { loadSection('overview'); }, []);

  if (!s || s.loading) return <LoadingSection title="Company Overview" />;
  if (s.error) return <ErrorSection error={s.error} section="overview" />;

  const d = s.data;

  return (
    <div>
      {/* Banner */}
      <div className="company-banner">
        <div className="company-logo-big">{d.name?.[0] || '?'}</div>
        <div className="company-banner-info">
          <div className="company-banner-name">{d.fullName || d.name}</div>
          <div className="company-banner-tagline">{d.mission}</div>
          <div className="company-banner-tags">
            <span className="badge badge-accent">{d.industry}</span>
            {d.stockSymbol && d.stockSymbol !== 'N/A' && (
              <span className="badge badge-teal">{d.stockSymbol}</span>
            )}
            <span className="badge badge-orange">⭐ {d.glassdoorRating}</span>
            <span className="badge badge-high">💰 {d.avgPackageFresher} Fresher</span>
          </div>
        </div>
      </div>

      {/* ── Recommended Path ── */}
      <div style={{
        marginBottom: 24, padding: '13px 20px',
        background: 'rgba(79,142,247,0.05)',
        border: '1px solid rgba(79,142,247,0.15)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          🚀 Start Here:
        </div>
        {[
          { id: 'hiring',   label: 'Hiring Process' },
          { id: 'roles',    label: 'Roles Guide' },
          { id: 'roadmap',  label: 'Roadmap' },
          { id: 'subjects', label: 'Topics' },
          { id: 'practice', label: 'Practice' },
          { id: 'tracker',  label: 'Tracker' },
        ].map(({ id, label }, i, arr) => (
          <React.Fragment key={id}>
            <button onClick={() => handleNav(id)} style={{
              padding: '4px 12px', borderRadius: 99,
              border: '1px solid rgba(79,142,247,0.22)',
              background: 'rgba(79,142,247,0.08)', color: 'var(--accent)',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.08)'; }}>
              {i + 1}. {label}
            </button>
            {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '0.75rem' }}>→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>

        {[
          { icon: <Users size={20} />, value: d.employees, label: 'Employees', color: 'var(--accent)' },
          { icon: <DollarSign size={20} />, value: d.revenue, label: 'Annual Revenue', color: 'var(--teal)' },
          { icon: <TrendingUp size={20} />, value: d.marketCap, label: 'Market Cap', color: 'var(--orange)' },
          { icon: <Globe size={20} />, value: d.founded, label: 'Founded', color: 'var(--pink)' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ color: stat.color, marginBottom: 8 }}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>About</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>{d.description}</p>
          <div className="info-row">
            <span className="info-label">CEO</span>
            <span className="info-value">{d.ceo}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Headquarters</span>
            <span className="info-value">{d.headquarters}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Offices</span>
            <span className="info-value">{d.officeLocations?.join(', ')}</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={18} color="var(--accent)" /> Tech Stack
          </h3>
          <div className="chip-grid" style={{ marginBottom: 20 }}>
            {d.techStack?.map((tech) => (
              <span key={tech} className="chip active">{tech}</span>
            ))}
          </div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>CULTURE</h4>
          {d.cultureHighlights?.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Zap size={13} color="var(--teal)" style={{ flexShrink: 0 }} /> {c}
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 36 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>✅ Why Join {d.name}</h3>
          {d.whyJoin?.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <Star size={14} color="var(--yellow)" style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>📰 Recent News & Trends</h3>
          {d.recentNews?.map((n, i) => (
            <div key={i} style={{
              padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              marginBottom: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent)'
            }}>
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Navigation ── */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color="var(--accent)" /> Explore All Prep Features
        </div>
        <div className="grid-3">
          {QUICK_SECTIONS.map((sec) => (
            <div
              key={sec.id}
              className="card"
              onClick={() => handleNav(sec.id)}
              style={{ cursor: 'pointer', padding: '16px', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = sec.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: `${sec.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <sec.icon size={16} style={{ color: sec.color }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{sec.label}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: 44 }}>{sec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
