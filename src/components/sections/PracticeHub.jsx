import React, { useState } from 'react';
import { MessageSquare, Terminal, Calculator, ClipboardCheck } from 'lucide-react';
import InterviewQuestions from './InterviewQuestions';
import CodingQuestions from './CodingQuestions';
import AptitudeSection from './AptitudeSection';
import MockTestSection from './MockTestSection';

// These were previously four separate sidebar destinations for the same underlying
// job — "practice questions about this company" shown in four formats. Now one
// destination with format tabs; each tab still manages its own fetching internally.
const TABS = [
  { id: 'interviewQs', label: 'Interview Q&A', icon: MessageSquare, Component: InterviewQuestions },
  { id: 'codingQs',    label: 'Coding',         icon: Terminal,     Component: CodingQuestions },
  { id: 'aptitude',    label: 'Aptitude',       icon: Calculator,   Component: AptitudeSection },
  { id: 'mockTest',    label: 'Mock Test',      icon: ClipboardCheck, Component: MockTestSection },
];

export default function PracticeHub() {
  const [tab, setTab] = useState('interviewQs');
  const Active = TABS.find(t => t.id === tab)?.Component;

  return (
    <div>
      <div className="tab-bar" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
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
