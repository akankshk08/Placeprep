import React, { useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SECTION_FILTERS = ['All', 'Interview Questions', 'Coding Questions', 'Aptitude Practice'];

export default function Bookmarks() {
  const { state, updateBookmarkNote, removeBookmark } = useApp();
  const [filter, setFilter] = useState('All');

  const bookmarks = filter === 'All' ? state.bookmarks : state.bookmarks.filter(b => b.sectionLabel === filter);

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-orange"><Bookmark size={24} /></div>
        <div>
          <h1 className="section-title">Bookmarks</h1>
          <p className="section-subtitle">
            {state.bookmarks.length} saved question{state.bookmarks.length !== 1 ? 's' : ''} with your notes
          </p>
        </div>
      </div>

      {state.bookmarks.length > 0 && (
        <div className="tab-bar">
          {SECTION_FILTERS.map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔖</div>
          <div className="empty-state-title">{state.bookmarks.length === 0 ? 'No bookmarks yet' : `No bookmarks in "${filter}"`}</div>
          <div className="empty-state-desc">
            Tap the bookmark icon on any interview, coding, or aptitude question to save it here with your own notes.
          </div>
        </div>
      ) : (
        bookmarks.map(b => (
          <div key={b.id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-accent">{b.sectionLabel}</span>
                {b.company && <span className="badge badge-teal">{b.company}</span>}
              </div>
              <button
                onClick={() => removeBookmark(b.id)}
                title="Remove bookmark"
                style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-xs)', background: 'transparent', border: '1px solid var(--border-card)', color: 'var(--text-muted)', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.borderColor = 'transparent'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-card)'; }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8, lineHeight: 1.6 }}>{b.question}</p>
            {b.answer && <div className="answer-text" style={{ marginBottom: 12 }}>{b.answer}</div>}

            <textarea
              className="form-textarea"
              style={{ minHeight: 60 }}
              placeholder="Add your notes…"
              value={b.note}
              onChange={e => updateBookmarkNote(b.id, e.target.value)}
            />
          </div>
        ))
      )}
    </div>
  );
}
