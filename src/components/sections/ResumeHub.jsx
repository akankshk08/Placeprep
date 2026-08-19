import React, { useState } from 'react';
import { FileText, ScanLine } from 'lucide-react';
import ResumeTips from './ResumeTips';
import ATSAnalysis from './ATSAnalysis';

// Resume Tips and ATS Analyzer are both company-specific resume advice — previously
// two separate sidebar destinations for the same job. Resume Builder stays separate
// under "My Tools" since it's a different kind of thing (a standalone, company-agnostic
// document editor, not company-tailored advice).
const TABS = [
  { id: 'tips', label: 'Resume Tips', icon: FileText },
  { id: 'ats', label: 'ATS Score', icon: ScanLine },
];

export default function ResumeHub() {
  const [tab, setTab] = useState('tips');

  return (
    <div>
      <div className="tab-bar" style={{ maxWidth: 300, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'tips' ? <ResumeTips /> : <ATSAnalysis />}
    </div>
  );
}
