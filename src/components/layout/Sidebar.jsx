import React from 'react';
import {
  Building2, Package, Users, Briefcase, BookOpen,
  Terminal, FileText, Map, Library,
  Youtube, CheckSquare,
  Sparkles, GraduationCap, FilePlus2, Bookmark
} from 'lucide-react';
import { useApp, NO_FETCH_SECTIONS, GLOBAL_SECTIONS } from '../../context/AppContext';

const NAV_ITEMS = [
  {
    group: 'Company Intel',
    items: [
      { id: 'overview',  label: 'Company Overview',      icon: Building2,    },
      { id: 'products',  label: 'Products & Services',   icon: Package,      },
      { id: 'hiring',    label: 'Hiring Process',        icon: Users,        },
      { id: 'roles',     label: 'Careers & Roles',       icon: Briefcase,    },
    ],
  },
  {
    group: 'Learn & Practice',
    items: [
      { id: 'subjects', label: 'Topics to Prepare', icon: BookOpen,  },
      { id: 'practice', label: 'Practice',          icon: Terminal,  },
      { id: 'resume',   label: 'Resume & ATS',      icon: FileText,  },
    ],
  },
  {
    group: 'Planning',
    items: [
      { id: 'roadmap',   label: 'Prep Roadmap',    icon: Map,     },
      { id: 'resources', label: 'Resources',        icon: Library, },
      { id: 'videos',    label: 'YouTube Videos',   icon: Youtube, },
    ],
  },
  {
    group: 'My Progress',
    items: [
      { id: 'tracker', label: 'Placement Tracker', icon: CheckSquare, },
    ],
  },
  {
    group: 'My Tools',
    items: [
      { id: 'resumeBuilder', label: 'Resume Builder', icon: FilePlus2, },
      { id: 'bookmarks',     label: 'Bookmarks',       icon: Bookmark,  },
    ],
  },
  {
    group: 'AI Tools',
    items: [
      { id: 'ailearn', label: 'AI Learning Hub', icon: Sparkles, },
    ],
  },
];

export default function Sidebar() {
  const { state, setSection, loadSection, toggleSidebar } = useApp();

  const handleClick = (id) => {
    setSection(id);
    if (!NO_FETCH_SECTIONS.includes(id)) {
      loadSection(id);
    }
    if (state.sidebarOpen) toggleSidebar();
  };

  const locked = !state.company;

  return (
    <>
    <div
      className={`sidebar-overlay ${state.sidebarOpen ? 'open' : ''}`}
      onClick={toggleSidebar}
    />
    <aside className={`sidebar ${state.sidebarOpen ? 'open' : ''}`}>

      {/* Company badge */}
      {state.company ? (
        <div className="sidebar-company-badge">
          <div className="sidebar-company-label">Preparing for</div>
          <div className="sidebar-company-name">{state.company}</div>
        </div>
      ) : (
        <div style={{
          margin: '10px 12px 8px',
          padding: '11px 14px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <GraduationCap size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Search a company to start
          </span>
        </div>
      )}

      {NAV_ITEMS.map((group, gi) => (
        <div key={group.group}>
          <div className="sidebar-section">{group.group}</div>
          {group.items.map(({ id, label, icon: Icon }) => {
            const isActive = state.activeSection === id;
            const sectionState = state.sectionData[id];
            const isLoading = sectionState?.loading;
            const isLoaded  = Boolean(sectionState?.data);
            const isDisabled = locked && !GLOBAL_SECTIONS.has(id);

            return (
              <div
                key={id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => !isDisabled && handleClick(id)}
                style={{
                  opacity: isDisabled ? 0.35 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <Icon
                  className="icon"
                  size={15}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span style={{ flex: 1, fontSize: '0.82rem' }}>{label}</span>

                {/* Loading spinner */}
                {isLoading && (
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '1.5px solid rgba(79,142,247,0.3)',
                    borderTopColor: 'var(--accent)',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }} />
                )}
                {/* Loaded dot */}
                {isLoaded && !isLoading && (
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--teal)', flexShrink: 0,
                    opacity: 0.7,
                  }} />
                )}
              </div>
            );
          })}

          {/* Divider except after last group */}
          {gi < NAV_ITEMS.length - 1 && <div className="sidebar-divider" />}
        </div>
      ))}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
    </>
  );
}
