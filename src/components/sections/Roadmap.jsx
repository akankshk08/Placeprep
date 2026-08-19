import React, { useEffect, useState } from 'react';
import { Map, Calendar, CheckCircle, ChevronDown, ChevronUp, Youtube, ExternalLink, Code2, MessagesSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

const phaseColors = ['var(--accent)', 'var(--teal)', 'var(--orange)', 'var(--pink)', 'var(--yellow)', 'var(--green)'];

// Real, verified resource links per phase — not AI-generated. An LLM cannot reliably
// know real video/playlist IDs, so these were hand-verified on YouTube (same library
// used in the Video Resources section) rather than asked of the model.
const PHASE_RESOURCES = {
  1: [
    { label: 'C++ Tutorials — CodeWithHarry', url: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL' },
    { label: 'Python for Beginners — CodeWithHarry', url: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg' },
    { label: 'Java + DSA — Kunal Kushwaha', url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ' },
    { label: 'OOP Concepts (C++) — Neso Academy', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRhoD7JxXd_untFzygrlOCbT' },
  ],
  2: [
    { label: "Striver's A2Z DSA Course", url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz' },
  ],
  3: [
    { label: 'Operating System — Gate Smashers', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p' },
    { label: 'DBMS — Gate Smashers', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y' },
    { label: 'Computer Networks — Gate Smashers', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_' },
  ],
  4: [
    { label: 'Build 4 Full Stack Projects — freeCodeCamp', url: 'https://www.youtube.com/watch?v=MDZC8VDZnV8' },
  ],
  5: [
    { label: 'Ultimate Resume Guide — Apna College', url: 'https://www.youtube.com/watch?v=y3R9e2L8I9E' },
  ],
  6: [
    { label: 'How to Crack Technical Interviews', url: 'https://www.youtube.com/watch?v=qV8aVoYQ6Lk' },
    { label: '40 HR Interview Questions — upGrad', url: 'https://www.youtube.com/watch?v=zIm_k9j0C50' },
  ],
};

function ResourceLinks({ phaseNum }) {
  const links = PHASE_RESOURCES[phaseNum];
  if (!links?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        📚 Recommended Resources
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {links.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', textDecoration: 'none' }}>
            <Youtube size={14} color="#FF0000" />
            <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.label}</span>
            <ExternalLink size={11} color="var(--text-muted)" />
          </a>
        ))}
      </div>
    </div>
  );
}

function ChecklistItem({ id, label, color }) {
  const { state, toggleTracker } = useApp();
  const done = state.tracker.completed.includes(id);
  return (
    <div onClick={() => toggleTracker(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer',
        color: done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: done ? 'line-through' : 'none' }}>
      <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${done ? 'var(--teal)' : color + '50'}`, background: done ? 'var(--teal)' : 'transparent' }}>
        {done && <CheckCircle size={10} color="#fff" />}
      </div>
      {label}
    </div>
  );
}

function DailyPlanCard({ day, color, dayIndex, idPrefix }) {
  const [open, setOpen] = useState(dayIndex === 0);

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${color}30`, background: 'var(--bg-card)', marginBottom: 8, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', color, flexShrink: 0 }}>
            {day.day?.replace('Day ', 'D')}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{day.topic}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>⏰ {day.deadline}</div>
          </div>
        </div>
        {open ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${color}20` }}>
          <div style={{ display: 'grid', gap: 8, margin: '14px 0' }}>
            {[
              { label: '🌅 Morning', task: day.morningTask, bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)' },
              { label: '☀️ Afternoon', task: day.afternoonTask, bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.2)' },
              { label: '🌙 Evening', task: day.eveningTask, bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.2)' },
            ].map(({ label, task, bg, border }) => task && (
              <div key={label} style={{ padding: '10px 14px', borderRadius: 10, background: bg, border: `1px solid ${border}` }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{task}</div>
              </div>
            ))}
          </div>

          {day.checklist?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ✅ Daily Checklist
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {day.checklist.map((item, i) => (
                  <ChecklistItem key={i} id={`${idPrefix}-d${dayIndex}-c${i}`} label={item} color={color} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Phase 4: Projects — beginner/intermediate/advanced lists
function ProjectsPhaseBody({ phase }) {
  const groups = [
    { label: 'Beginner', items: phase.beginnerProjects, color: 'var(--green)' },
    { label: 'Intermediate', items: phase.intermediateProjects, color: 'var(--yellow)' },
    { label: 'Advanced', items: phase.advancedProjects, color: 'var(--red)' },
  ];
  return (
    <div className="grid-3">
      {groups.map(g => g.items?.length > 0 && (
        <div key={g.label} className="card">
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: g.color, marginBottom: 10 }}>{g.label}</div>
          {g.items.map((p, i) => (
            <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>→ {p}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Phase 5: Resume — ATS tips + mistakes
function ResumePhaseBody({ phase }) {
  return (
    <div className="grid-2">
      {phase.atsOptimizationTips?.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--green)', marginBottom: 10 }}>✅ ATS Optimization</div>
          {phase.atsOptimizationTips.map((t, i) => <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>→ {t}</div>)}
        </div>
      )}
      {phase.resumeMistakesToAvoid?.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--red)', marginBottom: 10 }}>⚠️ Mistakes to Avoid</div>
          {phase.resumeMistakesToAvoid.map((t, i) => <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>→ {t}</div>)}
        </div>
      )}
    </div>
  );
}

// Phase 6: Interview Prep — HR / behavioral / technical / mock plan
function InterviewPhaseBody({ phase }) {
  const blocks = [
    { label: 'HR Question Topics', items: phase.hrQuestionTopics, icon: MessagesSquare, color: 'var(--teal)' },
    { label: 'Behavioral Question Topics', items: phase.behavioralQuestionTopics, icon: MessagesSquare, color: 'var(--accent)' },
    { label: 'Technical Round Tips', items: phase.technicalRoundTips, icon: Code2, color: 'var(--orange)' },
    { label: 'Mock Interview Plan', items: phase.mockInterviewPlan, icon: CheckCircle, color: 'var(--green)' },
  ];
  return (
    <div className="grid-2">
      {blocks.map(b => b.items?.length > 0 && (
        <div key={b.label} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color: b.color, marginBottom: 10 }}>
            <b.icon size={14} /> {b.label}
          </div>
          {b.items.map((t, i) => <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>→ {t}</div>)}
        </div>
      ))}
    </div>
  );
}

function PhaseCard({ phase, index, company }) {
  const [expanded, setExpanded] = useState(index === 0);
  const color = phaseColors[index % phaseColors.length];
  const idPrefix = `roadmap-${company}-p${phase.phase}`;

  return (
    <div style={{ marginBottom: 16, borderRadius: 16, border: `1px solid ${color}25`, overflow: 'hidden' }}>
      <button onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, background: `${color}08`, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color, flexShrink: 0 }}>
            {phase.phase}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>
              Phase {phase.phase}: {phase.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {phase.weeks}</span>
              {phase.hoursPerDay && <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>⏱ {phase.hoursPerDay}h/day</span>}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-card)',
            margin: '16px 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            🎯 <strong style={{ color: 'var(--text-primary)' }}>Goal:</strong> {phase.goal}
          </div>

          {phase.topics?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Key Topics
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {phase.topics.map((t, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', background: `${color}10`, border: `1px solid ${color}25`, color }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {phase.keyConceptsPerSubject?.length > 0 && (
            <div className="grid-3" style={{ marginBottom: 16 }}>
              {phase.keyConceptsPerSubject.map((s, i) => (
                <div key={i} className="card">
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color, marginBottom: 8 }}>{s.subject}</div>
                  {s.mustKnow?.map((m, mi) => <div key={mi} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>→ {m}</div>)}
                </div>
              ))}
            </div>
          )}

          <ResourceLinks phaseNum={phase.phase} />

          {phase.title === 'Projects' && <ProjectsPhaseBody phase={phase} />}
          {phase.title === 'Resume Building' && <ResumePhaseBody phase={phase} />}
          {phase.title === 'Interview Preparation' && <InterviewPhaseBody phase={phase} />}

          {phase.dailyPlan?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                📋 Day-by-Day Breakdown
              </div>
              {phase.dailyPlan.map((day, i) => (
                <DailyPlanCard key={i} day={day} color={color} dayIndex={i} idPrefix={idPrefix} />
              ))}
            </div>
          )}

          {phase.milestone && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', color: 'var(--teal)',
              padding: '10px 14px', background: 'var(--teal-dim)', borderRadius: 10 }}>
              <CheckCircle size={15} /> <strong>Milestone:</strong> {phase.milestone}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Static Fallback Roadmap — always displayed so the page never goes blank ──
const STATIC_ROADMAP = {
  totalWeeks: 12,
  weeklySchedule: {
    Monday: 'DSA — Arrays, Strings, Two Pointers',
    Tuesday: 'CS Core — OS / DBMS / CN',
    Wednesday: 'DSA — Trees, Graphs, DP',
    Thursday: 'System Design + Project Work',
    Friday: 'Mock Test + Interview Q&A',
    Saturday: 'Resume, ATS Scan + Weak Area Revision',
    Sunday: 'Rest / Light Revision (1-2 hrs max)',
  },
  examDayTips: [
    'Sleep 8 hours the night before — no last-minute cramming.',
    'Re-read your own projects; interviewers often start there.',
    'For coding: state the approach before writing any code.',
    'For HR: prepare 3 STAR stories covering leadership, failure, and teamwork.',
    'Ask at least one thoughtful question at the end of each round.',
  ],
  phases: [
    {
      phase: 1,
      title: 'Programming Foundation',
      weeks: 'Week 1–2',
      goal: 'Get fluent in one language (C++/Java/Python) and master OOP.',
      hoursPerDay: 3,
      topics: ['Core language syntax & I/O', 'OOP — classes, inheritance, polymorphism', 'Recursion basics', 'Time & Space complexity intuition'],
      milestone: 'Able to write clean recursive solutions and explain time complexity.',
      dailyPlan: [
        { day: 'Day 1', topic: 'Language Basics + I/O', deadline: 'End of day', morningTask: 'Choose your language. Complete syntax crash course (variables, loops, functions).', afternoonTask: 'Solve 5 easy HackerRank warmup problems.', eveningTask: 'Revise: write a program from scratch without help.', checklist: ['Chose language', 'Completed warmup problems', 'Understood I/O methods'] },
        { day: 'Day 2', topic: 'OOP — Classes & Objects', deadline: 'End of day', morningTask: 'Study classes, constructors, access modifiers.', afternoonTask: 'Build a simple Bank Account class with deposit/withdraw.', eveningTask: 'Explain encapsulation in your own words.', checklist: ['Understood class vs object', 'Coded Bank Account', 'Explained encapsulation'] },
        { day: 'Day 3', topic: 'Inheritance & Polymorphism', deadline: 'End of day', morningTask: 'Study single and multilevel inheritance.', afternoonTask: 'Implement runtime polymorphism via method overriding.', eveningTask: 'Draw a class hierarchy for a real-world scenario.', checklist: ['Inheritance coded', 'Polymorphism coded', 'Real-world mapping done'] },
        { day: 'Day 4', topic: 'Recursion Fundamentals', deadline: 'End of day', morningTask: 'Understand the call stack with diagrams.', afternoonTask: 'Solve: factorial, fibonacci, sum of array using recursion.', eveningTask: 'Solve a power of 2 check recursively.', checklist: ['Call stack understood', '3 recursive problems solved', 'Base case pattern clear'] },
        { day: 'Day 5', topic: 'Time & Space Complexity', deadline: 'End of day', morningTask: 'Study Big O: O(1), O(n), O(n²), O(log n).', afternoonTask: 'Analyse complexity of your last 5 solutions.', eveningTask: 'Write complexity for 10 common code patterns.', checklist: ['Big O notation understood', 'Analysed past code', '10 patterns done'] },
        { day: 'Day 6', topic: 'STL / Collections Review', deadline: 'End of day', morningTask: 'Study built-in data structures: ArrayList, HashMap, Set, Stack.', afternoonTask: 'Solve 3 problems using collections.', eveningTask: 'Summarise when to use each collection.', checklist: ['Collections learnt', '3 problems solved', 'Summary written'] },
      ],
    },
    {
      phase: 2,
      title: 'Data Structures & Algorithms',
      weeks: 'Week 3–7',
      goal: 'Develop strong DSA fundamentals — the core of every technical round.',
      hoursPerDay: 4,
      topics: ['Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Binary Search', 'Trees & BST', 'Graphs (BFS/DFS)', 'Dynamic Programming', 'Heaps & Greedy'],
      milestone: 'Solve medium-level LeetCode problems within 30 minutes.',
      dailyPlan: [
        { day: 'Day 1', topic: 'Arrays — Two Pointers & Sliding Window', deadline: 'End of day', morningTask: 'Study two-pointer technique with diagrams.', afternoonTask: 'Solve: Two Sum, Container With Most Water, Max Subarray.', eveningTask: 'Sliding window: Longest Substring Without Repeating.', checklist: ['Two pointer understood', '3 array problems solved', 'Sliding window solved'] },
        { day: 'Day 2', topic: 'Linked Lists', deadline: 'End of day', morningTask: 'Build a singly linked list from scratch.', afternoonTask: 'Solve: Reverse LL, Detect Cycle, Find Middle.', eveningTask: 'Merge two sorted lists.', checklist: ['LL built from scratch', '3 LL problems', 'Merge sorted'] },
        { day: 'Day 3', topic: 'Stacks & Queues', deadline: 'End of day', morningTask: 'Implement Stack and Queue using arrays.', afternoonTask: 'Solve: Valid Parentheses, Min Stack, Next Greater Element.', eveningTask: 'BFS using Queue on a grid.', checklist: ['Stack/Queue implemented', '3 problems', 'BFS on grid'] },
        { day: 'Day 4', topic: 'Binary Search', deadline: 'End of day', morningTask: 'Understand binary search template (left, right, mid).', afternoonTask: 'Solve: Search in Rotated Sorted Array, Find Peak Element.', eveningTask: 'Binary search on answer pattern: Koko Eating Bananas.', checklist: ['Template memorised', '2 search problems', 'Search on answer'] },
        { day: 'Day 5', topic: 'Trees — BFS & DFS', deadline: 'End of day', morningTask: 'Implement BST with insert, search, delete.', afternoonTask: 'Level Order Traversal (BFS), Max Depth, Diameter.', eveningTask: 'Validate BST, Lowest Common Ancestor.', checklist: ['BST implemented', 'BFS traversal', '2 tree problems'] },
        { day: 'Day 6', topic: 'Dynamic Programming', deadline: 'End of day', morningTask: 'Understand memoisation vs tabulation.', afternoonTask: 'Solve: Climbing Stairs, House Robber, Longest Common Subsequence.', eveningTask: 'Knapsack 0/1 from scratch.', checklist: ['Memoisation understood', '3 DP problems', 'Knapsack solved'] },
      ],
    },
    {
      phase: 3,
      title: 'CS Core Subjects',
      weeks: 'Week 8–9',
      goal: 'Be confident answering OS, DBMS, and CN questions in any interview.',
      hoursPerDay: 3,
      topics: ['Operating Systems', 'DBMS & SQL', 'Computer Networks', 'OOP Deep Dive'],
      keyConceptsPerSubject: [
        { subject: 'Operating Systems', mustKnow: ['Process vs Thread', 'CPU Scheduling (FCFS, SJF, Round Robin)', 'Deadlock — conditions & prevention', 'Virtual Memory & Paging', 'Semaphores & Mutex'] },
        { subject: 'DBMS', mustKnow: ['Normalisation (1NF → BCNF)', 'ACID properties', 'Joins (INNER, LEFT, RIGHT, FULL)', 'Indexing & B-Trees', 'SQL window functions'] },
        { subject: 'Computer Networks', mustKnow: ['OSI vs TCP/IP Model', 'TCP vs UDP', 'HTTP/HTTPS — handshake', 'DNS resolution flow', 'Subnetting basics'] },
      ],
      milestone: 'Answer 10 random CS core interview questions without looking up notes.',
      dailyPlan: [
        { day: 'Day 1', topic: 'OS — Processes & Scheduling', deadline: 'End of day', morningTask: 'Study process lifecycle and scheduling algorithms.', afternoonTask: 'Simulate FCFS and SJF on paper with sample processes.', eveningTask: 'Write 5 OS interview Q&As from memory.', checklist: ['Scheduling algos done', 'Simulation on paper', '5 Q&As written'] },
        { day: 'Day 2', topic: 'OS — Memory & Deadlocks', deadline: 'End of day', morningTask: 'Study virtual memory, paging, and page replacement.', afternoonTask: 'Deadlock: 4 conditions, Banker\'s algorithm walkthrough.', eveningTask: 'Draw a resource allocation graph.', checklist: ['Paging understood', 'Banker\'s done', 'Graph drawn'] },
        { day: 'Day 3', topic: 'DBMS — SQL + Normalisation', deadline: 'End of day', morningTask: 'Write 10 SQL queries: joins, group by, having, subquery.', afternoonTask: 'Normalise a sample table from 1NF to BCNF.', eveningTask: 'ACID properties — example for each.', checklist: ['10 SQL queries', 'Normalisation done', 'ACID examples'] },
        { day: 'Day 4', topic: 'CN — OSI + Protocols', deadline: 'End of day', morningTask: 'Map each OSI layer to real protocols.', afternoonTask: 'Explain the 3-way TCP handshake and TLS.', eveningTask: 'Trace a URL request from browser to server.', checklist: ['OSI mapped', 'TCP handshake', 'URL trace done'] },
        { day: 'Day 5', topic: 'OOP + System Design Basics', deadline: 'End of day', morningTask: 'SOLID principles with examples.', afternoonTask: 'Design patterns: Singleton, Factory, Observer.', eveningTask: 'High-level design: URL shortener or Parking Lot.', checklist: ['SOLID done', '3 patterns', '1 HLD done'] },
        { day: 'Day 6', topic: 'CS Core Revision + Mock Q&A', deadline: 'End of day', morningTask: 'Rapid fire revision: OS / DBMS / CN flashcards.', afternoonTask: 'Take the CS Core mock test on this platform.', eveningTask: 'Review wrong answers and make correction notes.', checklist: ['Flashcards revised', 'Mock test done', 'Corrections noted'] },
      ],
    },
    {
      phase: 4,
      title: 'Projects & Portfolio',
      weeks: 'Week 10',
      goal: 'Have 2–3 strong projects on GitHub that you can demo and explain deeply.',
      beginnerProjects: ['CLI To-Do App (file-based persistence)', 'Student Grade Manager', 'Number Guessing Game with score tracking'],
      intermediateProjects: ['URL Shortener (REST API + DB)', 'Expense Tracker (React + Node + MongoDB)', 'DSA Visualiser (animated BFS/DFS)'],
      advancedProjects: ['Distributed Key-Value Store', 'Real-time Chat App (WebSockets)', 'Mini E-Commerce with payment gateway'],
      milestone: 'Two projects live on GitHub with a proper README and deployed demo.',
    },
    {
      phase: 5,
      title: 'Resume Building',
      weeks: 'Week 11',
      goal: 'Build a single-page ATS-optimised resume that gets shortlisted.',
      atsOptimizationTips: ['Use the job description keywords verbatim in your skills/summary', 'Bullet every achievement as: "Action verb + What + Impact (X% improvement)"', 'Skills section must list specific technologies, not just "good at coding"', 'Keep to 1 page — recruiters scan for 6 seconds average', 'PDF format only; avoid tables, columns, and graphics (ATS can\'t parse them)'],
      resumeMistakesToAvoid: ['Listing responsibilities instead of achievements', 'Vague bullets: "worked on a team project" → too weak', 'Incorrect email formatting or missing GitHub/LinkedIn', 'Objective statement instead of a 2-line professional summary', 'Submitting the same resume to every company without tailoring'],
      milestone: 'Resume scores 75+ on the ATS Analyzer in this app.',
    },
    {
      phase: 6,
      title: 'Interview Preparation',
      weeks: 'Week 12',
      goal: 'Be confident, fluent, and calm in every round — technical, HR, and behavioral.',
      hrQuestionTopics: ['Tell me about yourself (2-min pitch)', 'Why this company specifically?', 'Where do you see yourself in 5 years?', 'Strengths & honest weaknesses', 'Salary expectations (research market rate)'],
      behavioralQuestionTopics: ['Conflict resolution (STAR format)', 'Leadership without authority', 'Handling tight deadlines', 'Biggest failure & what you learnt', 'Working with difficult teammates'],
      technicalRoundTips: ['Always verbalise your thinking — silence is the enemy', 'Clarify constraints before coding', 'Start with brute force, then optimise', 'Test your code with edge cases out loud', 'Know your project code deeply — they WILL ask about it'],
      mockInterviewPlan: ['Day 1–2: Timed DSA on LeetCode (2 mediums / 30 min each)', 'Day 3: Full mock test on this platform', 'Day 4: HR/Behavioral mock with a friend or record yourself', 'Day 5: System design whiteboard (any HLD in 45 min)', 'Day 6: Rest + light revision + confidence building'],
      milestone: 'Completed one full mock interview cycle without major gaps.',
    },
  ],
};

export default function Roadmap() {
  const { state, loadSection, forceReloadSection } = useApp();
  const s = state.sectionData['roadmap'];

  useEffect(() => { loadSection('roadmap'); }, []);

  // Always show something — use AI data if available, otherwise static
  const isLoading = !s || s.loading;
  const hasAIData = Boolean(s?.data?.phases?.length);
  const d = hasAIData ? s.data : STATIC_ROADMAP;
  const showingStatic = !hasAIData;

  const totalChecklist = (d.phases || []).reduce((sum, p) => sum + (p.dailyPlan || []).reduce((s2, day) => s2 + (day.checklist?.length || 0), 0), 0);
  const doneChecklist = (d.phases || []).reduce((sum, p) => sum + (p.dailyPlan || []).reduce((s2, day, di) =>
    s2 + (day.checklist || []).filter((_, ci) => state.tracker.completed.includes(`roadmap-${state.company}-p${p.phase}-d${di}-c${ci}`)).length, 0), 0);

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-pink"><Map size={24} /></div>
        <div>
          <h1 className="section-title">Preparation Roadmap</h1>
          <p className="section-subtitle">12-week structured plan to crack {state.company} — from basics to interview-ready</p>
        </div>
      </div>

      {/* Status banner */}
      {isLoading && (
        <div style={{ marginBottom: 20, padding: '11px 18px', background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: 14, height: 14, border: '2px solid rgba(79,142,247,0.3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          Personalising roadmap for <strong style={{ color: 'var(--accent)', marginLeft: 4 }}>{state.company}</strong>… Showing standard plan below.
        </div>
      )}
      {showingStatic && !isLoading && s?.error && (
        <div style={{ marginBottom: 20, padding: '11px 18px', background: 'rgba(244,132,95,0.06)', border: '1px solid rgba(244,132,95,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>⚠️ AI personalisation unavailable — showing standard plan.</span>
          <button onClick={() => forceReloadSection('roadmap')} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid rgba(244,132,95,0.3)', background: 'rgba(244,132,95,0.08)', color: 'var(--orange)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            Retry AI Plan
          </button>
        </div>
      )}
      {hasAIData && (
        <div style={{ marginBottom: 20, padding: '10px 18px', background: 'rgba(61,214,140,0.06)', border: '1px solid rgba(61,214,140,0.15)', borderRadius: 12, fontSize: '0.82rem', color: 'var(--teal)' }}>
          ✓ AI-personalised roadmap loaded for <strong>{state.company}</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { icon: '📅', label: 'Total Duration', value: `${d.totalWeeks || 12} Weeks` },
          { icon: '📋', label: 'Total Phases', value: `${d.phases?.length || 6} Phases` },
          { icon: '✅', label: 'Progress', value: totalChecklist ? `${doneChecklist}/${totalChecklist} done` : '—' },
          { icon: '🎯', label: 'Daily Sessions', value: '3–4 Hours' },
        ].map((s2, i) => (
          <div key={i} style={{ flex: '1 1 140px', padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s2.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent)', marginBottom: 2 }}>{s2.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s2.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        {d.phases?.map((phase, i) => (
          <PhaseCard key={i} phase={phase} index={i} company={state.company} />
        ))}
      </div>

      <div className="grid-2">
        {d.weeklySchedule && (
          <div className="card">
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="var(--accent)" /> Weekly Schedule
            </h3>
            {Object.entries(d.weeklySchedule).map(([day, focus]) => (
              <div key={day} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border-card)' }}>
                <div style={{ width: 90, fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', flexShrink: 0 }}>{day}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{focus}</div>
              </div>
            ))}
          </div>
        )}

        {d.examDayTips?.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>🎯 Interview Day Tips</h3>
            {d.examDayTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{i + 1}.</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
