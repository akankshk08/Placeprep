// ============================================================
// Video Resources — hand-curated, verified real playlists/videos.
// No AI generation here: an LLM cannot reliably know real YouTube
// video/playlist IDs, so previous versions asked it to invent
// "search queries" instead of real links, which meant every click
// opened a YouTube search rather than the actual video. Every URL
// below was opened and confirmed real before being added.
// ============================================================
import React, { useState } from 'react';
import { Youtube, Search, ExternalLink, ListVideo } from 'lucide-react';

const catColors = {
  'DSA':             { text: 'var(--accent)',  bg: 'var(--accent-dim)', emoji: '🧩' },
  'DBMS':            { text: 'var(--red)',     bg: 'var(--red-dim)',    emoji: '🗄️' },
  'OS':              { text: 'var(--yellow)',  bg: 'var(--yellow-dim)', emoji: '⚙️' },
  'CN':              { text: 'var(--orange)',  bg: 'var(--orange-dim)', emoji: '🌐' },
  'OOPS':            { text: 'var(--pink)',    bg: 'var(--pink-dim)',   emoji: '🧱' },
  'System Design':   { text: 'var(--teal)',    bg: 'var(--teal-dim)',   emoji: '🏗️' },
  'Aptitude':        { text: 'var(--green)',   bg: 'var(--green-dim)',  emoji: '🔢' },
  'Java':            { text: '#f89820',        bg: 'rgba(248,152,32,0.1)', emoji: '☕' },
  'Python':          { text: '#3776ab',        bg: 'rgba(55,118,171,0.12)', emoji: '🐍' },
  'C++':             { text: '#00599c',        bg: 'rgba(0,89,156,0.12)', emoji: '💻' },
  'JavaScript':      { text: '#f7df1e',        bg: 'rgba(247,223,30,0.1)', emoji: '⚡' },
  'React':           { text: '#61dafb',        bg: 'rgba(97,218,251,0.1)', emoji: '⚛️' },
  'DevOps':          { text: '#8b5cf6',        bg: 'rgba(139,92,246,0.1)', emoji: '🔧' },
  'AWS':             { text: '#ff9900',        bg: 'rgba(255,153,0,0.1)', emoji: '☁️' },
  'Interview Prep':  { text: '#e879f9',        bg: 'rgba(232,121,249,0.1)', emoji: '🎯' },
  'Resume':          { text: 'var(--text-accent)', bg: 'var(--accent-dim)', emoji: '📄' },
  'HR':              { text: 'var(--green)',   bg: 'var(--green-dim)', emoji: '🤝' },
  'Projects':        { text: 'var(--orange)',  bg: 'var(--orange-dim)', emoji: '🛠️' },
};

const getCat = (cat) => catColors[cat] || { text: 'var(--accent)', bg: 'var(--accent-dim)', emoji: '▶️' };

// Every entry below is a real, verified YouTube URL (playlist or video) —
// confirmed to exist and match its description before being added here.
export const CURATED_RESOURCES = [
  { category: 'DSA', title: "Striver's A2Z DSA Course", channel: 'takeUforward', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    description: 'The most widely-used structured DSA course for placements — 300+ lessons from arrays to advanced DP.' },
  { category: 'DBMS', title: 'DBMS (Database Management System) Complete Playlist', channel: 'Gate Smashers', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',
    description: 'Full DBMS theory — normalization, transactions, indexing, and SQL fundamentals for interviews.' },
  { category: 'OS', title: 'Operating System Complete Playlist', channel: 'Gate Smashers', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
    description: 'Processes, threads, deadlocks, memory management, and scheduling — the OS topics interviews test.' },
  { category: 'CN', title: 'Computer Networks Complete Playlist', channel: 'Gate Smashers', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_',
    description: 'OSI model, TCP/IP, routing, and network security explained from the ground up.' },
  { category: 'OOPS', title: 'Object Oriented Programming (C++)', channel: 'Neso Academy', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRhoD7JxXd_untFzygrlOCbT',
    description: 'Classes, objects, inheritance, and polymorphism — core OOP concepts every interview tests.' },
  { category: 'System Design', title: 'System Design Playlist', channel: 'Gaurav Sen', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX',
    description: 'Scalability, databases, caching, and real system design interview walkthroughs.' },
  { category: 'Aptitude', title: 'Aptitude Preparation for Campus Placement', channel: 'Code Step By Step', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PL8p2I9GklV454LdGfDOw0KkNazKuA-6B2',
    description: 'Quantitative aptitude and logical reasoning structured specifically for campus placement tests.' },
  { category: 'Java', title: 'Java + DSA + Interview Preparation Course', channel: 'Kunal Kushwaha', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
    description: 'Java fundamentals combined with DSA and interview-focused problem solving.' },
  { category: 'Python', title: 'Python for Beginners (Full Course)', channel: 'CodeWithHarry', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg',
    description: '100-lesson Python course from basics to advanced, beginner-friendly.' },
  { category: 'C++', title: 'C++ Tutorials', channel: 'CodeWithHarry', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL',
    description: 'Complete C++ course covering syntax, memory management, and OOP for DSA-ready coding.' },
  { category: 'JavaScript', title: 'Namaste JavaScript', channel: 'Akshay Saini', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP',
    description: 'The definitive deep-dive into how JavaScript actually works — closures, execution context, event loop.' },
  { category: 'React', title: 'React Tutorials', channel: 'freeCodeCamp.org', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLWKjhJtqVAbkArDMazoARtNz1aMwNWmvC',
    description: 'Full React course from beginner fundamentals through building real applications.' },
  { category: 'DevOps', title: 'DevOps Courses', channel: 'freeCodeCamp.org', type: 'playlist',
    url: 'https://www.youtube.com/playlist?list=PLWKjhJtqVAbkzvvpY12KkfiIGso9A_Ixs',
    description: 'Docker, CI/CD, and core DevOps practices for engineering interviews.' },
  { category: 'AWS', title: 'AWS Certified Cloud Practitioner Course (CLF-C02)', channel: 'freeCodeCamp.org', type: 'video',
    url: 'https://www.youtube.com/watch?v=7HKot-brXFE',
    description: 'Full certification-prep course covering AWS core services and cloud fundamentals.' },
  { category: 'Interview Prep', title: 'How to Crack Technical Interview of Any Company', channel: 'Placement Preparation', type: 'video',
    url: 'https://www.youtube.com/watch?v=qV8aVoYQ6Lk',
    description: 'Strategy and mindset for approaching technical interview rounds at any company.' },
  { category: 'Resume', title: 'How to Make Ultimate Resume — Step by Step Guide for Software Engineers', channel: 'Apna College', type: 'video',
    url: 'https://www.youtube.com/watch?v=y3R9e2L8I9E',
    description: 'Step-by-step guide to building a resume that actually gets shortlisted.' },
  { category: 'HR', title: '40 Most Asked HR Interview Questions and Answers', channel: 'upGrad', type: 'video',
    url: 'https://www.youtube.com/watch?v=zIm_k9j0C50',
    description: 'Common HR round questions with model answers for freshers.' },
  { category: 'Projects', title: 'Build 4 Full Stack Projects in 23 Hours', channel: 'freeCodeCamp.org', type: 'video',
    url: 'https://www.youtube.com/watch?v=MDZC8VDZnV8',
    description: 'Hands-on bootcamp building real, resume-worthy full stack projects.' },
];

function ResourceCard({ item }) {
  const cat = getCat(item.category);
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div className="video-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 110, background: `linear-gradient(135deg, ${cat.bg}, var(--bg-secondary))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '2.6rem' }}>{cat.emoji}</div>
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 8px', fontSize: '0.68rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
            {item.type === 'playlist' ? <ListVideo size={11} /> : <Youtube size={11} color="#FF0000" />}
            {item.type === 'playlist' ? 'Playlist' : 'Video'}
          </div>
        </div>
        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontWeight: 700, fontSize: '0.87rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>{item.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Youtube size={11} color="#FF0000" /> {item.channel}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 6 }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: cat.bg, color: cat.text, fontSize: '0.68rem', fontWeight: 700 }}>{item.category}</span>
          </div>
        </div>
        <div style={{ padding: '10px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opens directly on YouTube</span>
          <ExternalLink size={13} color="var(--text-muted)" />
        </div>
      </div>
    </a>
  );
}

export default function YouTubeVideos() {
  const [catFilter, setCat] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...CURATED_RESOURCES.map(v => v.category)];

  const filtered = CURATED_RESOURCES.filter(v => {
    const matchCat  = catFilter === 'All' || v.category === catFilter;
    const matchSrch = !search || v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.channel.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  return (
    <div>
      <div className="section-header">
        <div className="section-icon" style={{ background: 'rgba(255,0,0,0.12)' }}>
          <Youtube size={24} color="#FF0000" />
        </div>
        <div>
          <h1 className="section-title">Video Resources</h1>
          <p className="section-subtitle">
            {CURATED_RESOURCES.length} hand-picked, verified playlists and courses — every card opens the real video directly
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by topic, title, or channel…"
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div className="chip-grid" style={{ marginBottom: 24 }}>
        {categories.map(c => (
          <span key={c} className={`chip ${catFilter === c ? 'active' : ''}`}
            onClick={() => setCat(c)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {c !== 'All' && getCat(c).emoji} {c}
          </span>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((v, i) => <ResourceCard key={i} item={v} />)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <div className="empty-state-title">No videos match your search</div>
        </div>
      )}
    </div>
  );
}
