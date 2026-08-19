import React, { useState } from 'react';
import { CheckSquare, Flame, Trophy, Code2, Monitor, Database, Network, FileText, Target, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TRACKER_DATA = {
  dsa: {
    label: 'DSA Topics',
    icon: Code2,
    color: 'var(--accent)',
    items: [
      'Arrays & Strings', 'Two Pointers', 'Sliding Window', 'Prefix Sum',
      'Linked Lists', 'Stacks & Queues', 'Binary Search', 'Recursion & Backtracking',
      'Trees (BFS/DFS)', 'Graphs (BFS/DFS)', 'Dynamic Programming (1D)', 'Dynamic Programming (2D)',
      'Greedy Algorithms', 'Heaps & Priority Queues', 'Tries', 'Union-Find / DSU',
      'Segment Trees', 'Bit Manipulation', 'Math & Number Theory', 'Sorting Algorithms',
    ],
  },
  os: {
    label: 'Operating Systems',
    icon: Monitor,
    color: 'var(--teal)',
    items: [
      'Process & Thread Basics', 'CPU Scheduling Algorithms', 'Process Synchronization',
      'Deadlocks', 'Memory Management', 'Virtual Memory & Paging',
      'File Systems', 'I/O Management', 'Inter-process Communication',
    ],
  },
  dbms: {
    label: 'DBMS',
    icon: Database,
    color: 'var(--orange)',
    items: [
      'ER Diagrams', 'Relational Model', 'SQL Basics', 'Advanced SQL & Joins',
      'Normalization (1NF-BCNF)', 'Transactions & ACID', 'Concurrency Control',
      'Indexing & B-Trees', 'NoSQL Basics',
    ],
  },
  cn: {
    label: 'Computer Networks',
    icon: Network,
    color: 'var(--pink)',
    items: [
      'OSI & TCP/IP Model', 'HTTP / HTTPS', 'TCP vs UDP',
      'DNS & DHCP', 'IP Addressing & Subnetting', 'Routing Algorithms',
      'Socket Programming', 'Load Balancing Basics', 'Firewalls & Security',
    ],
  },
  resume: {
    label: 'Resume & Applications',
    icon: FileText,
    color: 'var(--yellow)',
    items: [
      'Resume Draft (1 page)', 'Quantify all bullet points', 'ATS keyword optimization',
      'LinkedIn profile updated', 'GitHub projects polished', 'Portfolio website ready',
      'Cover letter template', 'Reference list prepared',
    ],
  },
  interviews: {
    label: 'Interview Practice',
    icon: Target,
    color: 'var(--green)',
    items: [
      'Mock interview #1', 'Mock interview #2', 'Mock interview #3',
      '50 Easy LeetCode problems', '50 Medium LeetCode problems', '20 Hard LeetCode problems',
      'System design basics', 'HR questions practiced', 'Behavioral questions (STAR method)',
      'Company-specific research done',
    ],
  },
};

function TrackerSection({ id, section }) {
  const { state, toggleTracker } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const Icon = section.icon;

  const completed = section.items.filter((item) => state.tracker.completed.includes(`${id}_${item}`));
  const progress = Math.round((completed.length / section.items.length) * 100);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: collapsed ? 0 : 16 }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${section.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} style={{ color: section.color }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{section.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completed.length}/{section.items.length} completed</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: section.color }}>{progress}%</div>
          </div>
          <div style={{ width: 60 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%`, background: section.color }} />
            </div>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div>
          {section.items.map((item) => {
            const key = `${id}_${item}`;
            const done = state.tracker.completed.includes(key);
            return (
              <div key={item} className={`check-item ${done ? 'done' : ''}`} onClick={() => toggleTracker(key)}>
                <div className={`check-box ${done ? 'done' : ''}`}>
                  {done && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
                </div>
                <span className="check-text">{item}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PlacementTracker() {
  const { state } = useApp();

  const allItems = Object.entries(TRACKER_DATA).flatMap(([id, s]) => s.items.map((item) => `${id}_${item}`));
  const totalDone = allItems.filter((key) => state.tracker.completed.includes(key)).length;
  const totalAll = allItems.length;
  const overallProgress = Math.round((totalDone / totalAll) * 100);

  const sectionProgress = Object.entries(TRACKER_DATA).map(([id, s]) => {
    const done = s.items.filter((item) => state.tracker.completed.includes(`${id}_${item}`)).length;
    return { label: s.label, done, total: s.items.length, color: s.color };
  });

  return (
    <div>
      <div className="section-header">
        <div className="section-icon" style={{ background: 'rgba(6,214,160,0.12)', color: 'var(--green)' }}>
          <CheckSquare size={24} />
        </div>
        <div>
          <h1 className="section-title">Placement Tracker</h1>
          <p className="section-subtitle">Track your preparation progress</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="card-gradient" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Overall ring */}
          <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-card-hover)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallProgress / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--teal)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {overallProgress}%
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Flame size={20} color="var(--orange)" />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Overall Progress</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              {totalDone} of {totalAll} tasks completed
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={20} color="var(--yellow)" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                {overallProgress >= 80 ? 'Champion' : overallProgress >= 50 ? 'Intermediate' : overallProgress >= 25 ? 'Starter' : 'Beginner'}
              </span>
            </div>
            <div className="ai-badge">
              <div className="pulse-dot" />
              {state.company ? `Preparing for ${state.company}` : 'No company selected'}
            </div>
          </div>
        </div>
      </div>

      {/* Section mini bars */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BarChart3 size={18} color="var(--accent)" />
          <h3 style={{ fontSize: '1rem' }}>Progress by Category</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sectionProgress.map((sp) => (
            <div key={sp.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{sp.label}</span>
                <span style={{ fontSize: '0.78rem', color: sp.color, fontWeight: 700 }}>{sp.done}/{sp.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(sp.done / sp.total) * 100}%`, background: sp.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist sections */}
      {Object.entries(TRACKER_DATA).map(([id, section]) => (
        <TrackerSection key={id} id={id} section={section} />
      ))}
    </div>
  );
}
