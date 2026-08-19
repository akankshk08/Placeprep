import React, { lazy, Suspense } from 'react';
import { AppProvider, useApp, NO_FETCH_SECTIONS, GLOBAL_SECTIONS } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HomePage from './components/HomePage';
import SettingsModal from './components/ui/SettingsModal';
import AIDisclosure from './components/ui/AIDisclosure';

// Sections whose content is an ungrounded LLM completion (facts, figures, questions
// presented with no retrieval/verification step) — these get the AI-disclosure banner.
// Excludes: tracker/resumeBuilder/bookmarks (no AI content) and ailearn (already
// self-labeled as AI throughout its own UI).
const AI_GENERATED_SECTIONS = new Set([
  'overview', 'products', 'hiring', 'roles', 'subjects', 'dsa', 'os', 'dbms', 'cn',
  'practice', 'resume', 'roadmap', 'resources',
]);

// Lazy-load section components
const OverviewHub        = lazy(() => import('./components/sections/OverviewHub'));
const ProductsServices   = lazy(() => import('./components/sections/ProductsServices'));
const HiringProcess      = lazy(() => import('./components/sections/HiringProcess'));
const RoleGuide          = lazy(() => import('./components/sections/RoleGuide'));
const ImportantSubjects  = lazy(() => import('./components/sections/ImportantSubjects'));
const DSATopics          = lazy(() => import('./components/sections/DSATopics'));
const OSTopics           = lazy(() => import('./components/sections/OSTopics'));
const DBMSTopics         = lazy(() => import('./components/sections/DBMSTopics'));
const CNTopics           = lazy(() => import('./components/sections/CNTopics'));
const PracticeHub        = lazy(() => import('./components/sections/PracticeHub'));
const ResumeHub          = lazy(() => import('./components/sections/ResumeHub'));
const Roadmap            = lazy(() => import('./components/sections/Roadmap'));
const Resources          = lazy(() => import('./components/sections/Resources'));
const YouTubeVideos      = lazy(() => import('./components/sections/YouTubeVideos'));
const PlacementTracker   = lazy(() => import('./components/sections/PlacementTracker'));
const AILearningHub      = lazy(() => import('./components/sections/AILearningHub'));
const ResumeBuilder      = lazy(() => import('./components/sections/ResumeBuilder'));
const Bookmarks          = lazy(() => import('./components/sections/Bookmarks'));

const SECTION_MAP = {
  overview:     OverviewHub,
  products:     ProductsServices,
  hiring:       HiringProcess,
  roles:        RoleGuide,
  subjects:     ImportantSubjects,
  dsa:          DSATopics,
  os:           OSTopics,
  dbms:         DBMSTopics,
  cn:           CNTopics,
  practice:     PracticeHub,
  resume:       ResumeHub,
  roadmap:      Roadmap,
  resources:    Resources,
  videos:       YouTubeVideos,
  tracker:      PlacementTracker,
  ailearn:      AILearningHub,
  resumeBuilder: ResumeBuilder,
  bookmarks:    Bookmarks,
};

const SECTION_HEADERS = {
  overview:     { title: 'Company Overview',        icon: '🏢' },
  products:     { title: 'Products & Services',     icon: '📦' },
  hiring:       { title: 'Hiring Process',          icon: '👥' },
  roles:        { title: 'Role-wise Guide',         icon: '💼' },
  subjects:     { title: 'Important Subjects',      icon: '📚' },
  dsa:          { title: 'DSA Topics',              icon: '⚡' },
  os:           { title: 'OS Topics',               icon: '🖥️' },
  dbms:         { title: 'DBMS Topics',             icon: '🗄️' },
  cn:           { title: 'CN Topics',               icon: '🌐' },
  practice:     { title: 'Practice',                icon: '🎯' },
  resume:       { title: 'Resume',                  icon: '📄' },
  roadmap:      { title: 'Prep Roadmap',            icon: '🗺️' },
  resources:    { title: 'Resources',               icon: '📖' },
  videos:       { title: 'YouTube Videos',          icon: '▶️' },
  tracker:      { title: 'Placement Tracker',       icon: '✅' },
  ailearn:      { title: 'AI Learning Hub',          icon: '🤖' },
  resumeBuilder: { title: 'Resume Builder',          icon: '📝' },
  bookmarks:    { title: 'Bookmarks',                icon: '🔖' },
};

function SectionFallback() {
  return (
    <div className="spinner-wrap" style={{ marginTop: 80 }}>
      <div className="spinner" />
      <div style={{ fontSize: '0.875rem' }}>Loading section…</div>
    </div>
  );
}

function SectionNavBar() {
  const { state, setSection, loadSection } = useApp();

  const goBack = () => {
    const prev = 'overview';
    setSection(prev);
    if (!NO_FETCH_SECTIONS.includes(prev)) loadSection(prev);
  };

  if (!state.company || state.activeSection === 'overview') return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 28px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: 'rgba(8,12,20,0.6)',
      flexShrink: 0,
    }}>
      <button
        onClick={goBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'transparent',
          color: 'var(--text-muted)', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 500,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
      >
        ← Back
      </button>
      <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>/</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{state.company}</span>
        {state.activeSection !== 'overview' && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>›</span>
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
              {SECTION_HEADERS[state.activeSection]?.title}
            </span>
          </>
        )}
      </span>
    </div>
  );
}

function MainContent() {
  const { state } = useApp();

  // A company must be picked to browse company-specific sections, but a handful of
  // personal tools (resume builder, bookmarks, AI learning hub) work standalone.
  if (!state.company && !GLOBAL_SECTIONS.has(state.activeSection)) {
    return (
      <main className="main-content" style={{ marginLeft: 0 }}>
        <HomePage />
      </main>
    );
  }

  const SectionComponent = SECTION_MAP[state.activeSection];

  return (
    <>
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <SectionNavBar />
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {AI_GENERATED_SECTIONS.has(state.activeSection) && <AIDisclosure />}
          <Suspense fallback={<SectionFallback />}>
            {SectionComponent && <SectionComponent />}
          </Suspense>
        </div>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="app-layout">
        <Header />
        <div className="main-layout">
          <AppContent />
        </div>
      </div>
    </AppProvider>
  );
}

function AppContent() {
  const { state } = useApp();
  return (
    <>
      <MainContent />
      {state.settingsOpen && <SettingsModal />}
    </>
  );
}
