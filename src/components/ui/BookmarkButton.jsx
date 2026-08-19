import React from 'react';
import { Bookmark } from 'lucide-react';
import { useApp, makeBookmarkId } from '../../context/AppContext';

// Drop-in bookmark toggle for a question card. `section`/`sectionLabel` identify where
// the question came from (e.g. 'interviewQs' / 'Interview Questions') so the Bookmarks
// page can group and link back to it; `question`+`company` make the id deterministic,
// so bookmarking the same question twice always toggles the same entry.
export default function BookmarkButton({ section, sectionLabel, question, answer, size = 15 }) {
  const { state, toggleBookmark } = useApp();
  const id = makeBookmarkId(state.company, section, question);
  const saved = state.bookmarks.some(b => b.id === id);

  return (
    <button
      type="button"
      className={`bookmark-btn ${saved ? 'saved' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleBookmark({ id, company: state.company, section, sectionLabel, question, answer });
      }}
      title={saved ? 'Remove bookmark' : 'Bookmark this question'}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark this question'}
    >
      <Bookmark size={size} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
