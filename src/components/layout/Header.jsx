import React from 'react';
import { Settings, Menu, X, GraduationCap, Home } from 'lucide-react';
import { useApp, GLOBAL_SECTIONS } from '../../context/AppContext';
import CompanySearch from '../search/CompanySearch';

export default function Header() {
  const { state, toggleSettings, toggleSidebar, goHome } = useApp();
  // Sidebar (and thus its mobile toggle) renders whenever a company is picked,
  // or the active section is a standalone tool that doesn't need one.
  const showSidebarChrome = Boolean(state.company) || GLOBAL_SECTIONS.has(state.activeSection);

  return (
    <header className="header">
      {/* Left: Logo + mobile toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showSidebarChrome && (
          <button
            onClick={toggleSidebar}
            className="btn btn-ghost sidebar-toggle-btn"
            style={{ padding: '7px' }}
            id="sidebar-toggle"
            aria-label={state.sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {state.sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        <a
          className="header-logo"
          href="#"
          onClick={(e) => { e.preventDefault(); goHome(); }}
          title="Go to Home"
        >
          <div className="header-logo-icon">
            <GraduationCap size={18} color="#fff" />
          </div>
          <span className="header-logo-text">PlacePrep</span>
        </a>
      </div>

      {/* Center: Company search */}
      {state.company && <CompanySearch />}

      {/* Right: Actions */}
      <div className="header-actions">
        {state.company && (
          <div className="ai-badge header-ai-badge">
            <div className="pulse-dot" />
            AI Powered
          </div>
        )}

        {showSidebarChrome && (
          <button
            className="btn btn-ghost header-home-btn"
            onClick={goHome}
            style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 5 }}
            title="Back to Home"
          >
            <Home size={14} /> <span className="header-home-btn-label">Home</span>
          </button>
        )}

        <button
          className="btn btn-ghost"
          onClick={toggleSettings}
          style={{ padding: '7px' }}
          title="Settings / API Key"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
