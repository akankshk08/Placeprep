import React, { useState } from 'react';
import { Building2, Target } from 'lucide-react';
import CompanyOverview from './CompanyOverview';
import CompanyStrategy from './CompanyStrategy';

// Company Strategy was a separate sidebar destination showing insider prep strategy for
// the same company Overview already introduces — now a tab on the same page instead of
// a second trip through the sidebar.
const TABS = [
  { id: 'overview', label: 'Overview', icon: Building2, Component: CompanyOverview },
  { id: 'strategy', label: 'Strategy', icon: Target, Component: CompanyStrategy },
];

export default function OverviewHub() {
  const [tab, setTab] = useState('overview');
  const Active = TABS.find(t => t.id === tab)?.Component;

  return (
    <div>
      <div className="tab-bar" style={{ marginBottom: 20, maxWidth: 260 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>
      {Active && <Active />}
    </div>
  );
}
