import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { fetchSection, analyzeResume, getApiKey } from '../api/gemini';

const AppContext = createContext(null);

// Sections that manage their own data fetching (not via fetchSection) — kept here
// as the single source of truth so it doesn't drift between components.
export const NO_FETCH_SECTIONS = ['resume', 'practice', 'tracker', 'ailearn', 'resumeBuilder', 'bookmarks', 'videos'];

// Sections reachable without picking a company first (personal / global tools)
export const GLOBAL_SECTIONS = new Set(['ailearn', 'resumeBuilder', 'bookmarks']);

// Deterministic id for a bookmarked question, so toggling the same question twice
// (even across reloads) always resolves to the same bookmark rather than duplicating it.
export function makeBookmarkId(company, section, question) {
  const str = `${company || ''}::${section}::${question}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `bm_${hash}`;
}

// ── Session restore helpers ─────────────────────────────────
function loadCachedSections() {
  try {
    const raw = localStorage.getItem('pp_section_cache');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSectionCache(section, data) {
  try {
    const cache = loadCachedSections();
    cache[section] = { data, loading: false, error: null };
    localStorage.setItem('pp_section_cache', JSON.stringify(cache));
  } catch (_) {}
}

const _lastCompany = localStorage.getItem('pp_last_company') || null;

const initialState = {
  company: _lastCompany,
  activeSection: 'overview',
  sectionData: _lastCompany ? loadCachedSections() : {},
  atsResult: null,
  atsLoading: false,
  tracker: JSON.parse(localStorage.getItem('pp_tracker') || '{"completed":[],"notes":{},"streak":0,"lastActive":null}'),
  bookmarks: JSON.parse(localStorage.getItem('pp_bookmarks') || '[]'),
  settingsOpen: false,
  sidebarOpen: false,
  aiLearnPendingTopic: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_COMPANY':
      return { ...state, company: action.company, sectionData: {}, activeSection: 'overview' };
    case 'SET_SECTION':
      return { ...state, activeSection: action.section };
    case 'SECTION_LOADING':
      return {
        ...state,
        sectionData: {
          ...state.sectionData,
          [action.section]: { data: null, loading: true, error: null },
        },
      };
    case 'SECTION_SUCCESS':
      return {
        ...state,
        sectionData: {
          ...state.sectionData,
          [action.section]: { data: action.data, loading: false, error: null },
        },
      };
    case 'SECTION_ERROR':
      return {
        ...state,
        sectionData: {
          ...state.sectionData,
          [action.section]: { data: null, loading: false, error: action.error },
        },
      };
    case 'ATS_LOADING':
      return { ...state, atsLoading: true, atsResult: null };
    case 'ATS_SUCCESS':
      return { ...state, atsLoading: false, atsResult: action.result };
    case 'ATS_ERROR':
      return { ...state, atsLoading: false, atsResult: { error: action.error } };
    case 'TOGGLE_TRACKER': {
      const id = action.id;
      const completed = state.tracker.completed.includes(id)
        ? state.tracker.completed.filter((x) => x !== id)
        : [...state.tracker.completed, id];
      const tracker = { ...state.tracker, completed };
      localStorage.setItem('pp_tracker', JSON.stringify(tracker));
      return { ...state, tracker };
    }
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'TOGGLE_BOOKMARK': {
      const { item } = action;
      const exists = state.bookmarks.some(b => b.id === item.id);
      const bookmarks = exists
        ? state.bookmarks.filter(b => b.id !== item.id)
        : [{ ...item, note: '', createdAt: Date.now() }, ...state.bookmarks];
      localStorage.setItem('pp_bookmarks', JSON.stringify(bookmarks));
      return { ...state, bookmarks };
    }
    case 'UPDATE_BOOKMARK_NOTE': {
      const bookmarks = state.bookmarks.map(b => (b.id === action.id ? { ...b, note: action.note } : b));
      localStorage.setItem('pp_bookmarks', JSON.stringify(bookmarks));
      return { ...state, bookmarks };
    }
    case 'REMOVE_BOOKMARK': {
      const bookmarks = state.bookmarks.filter(b => b.id !== action.id);
      localStorage.setItem('pp_bookmarks', JSON.stringify(bookmarks));
      return { ...state, bookmarks };
    }
    case 'RESET':
      localStorage.removeItem('pp_last_company');
      localStorage.removeItem('pp_section_cache');
      return { ...initialState, company: null, sectionData: {}, tracker: state.tracker, bookmarks: state.bookmarks };
    case 'OPEN_AI_LEARN_TOPIC':
      return { ...state, activeSection: 'ailearn', aiLearnPendingTopic: action.topic };
    case 'CLEAR_AI_LEARN_TOPIC':
      return { ...state, aiLearnPendingTopic: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Auto-seed env key into localStorage so the app works out of the box
  useEffect(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && !localStorage.getItem('gemini_api_key')) {
      localStorage.setItem('gemini_api_key', envKey);
    }
  }, []);

  const setCompany = useCallback((company) => {
    // Check API key FIRST — open settings immediately if missing
    if (!getApiKey()) {
      dispatch({ type: 'TOGGLE_SETTINGS' });
      return;
    }
    if (company) localStorage.setItem('pp_last_company', company);
    dispatch({ type: 'SET_COMPANY', company });
  }, []);

  const setSection = useCallback((section) => {
    dispatch({ type: 'SET_SECTION', section });
  }, []);

  // Jump to AI Learning Hub with a topic pre-searched — used by "deep dive" links
  // elsewhere so those pages don't have to generate their own shallow AI content.
  const openAILearnTopic = useCallback((topic) => {
    dispatch({ type: 'OPEN_AI_LEARN_TOPIC', topic });
  }, []);
  const clearAILearnTopic = useCallback(() => {
    dispatch({ type: 'CLEAR_AI_LEARN_TOPIC' });
  }, []);

  // loadSection — pass company explicitly to avoid stale closure
  const loadSection = useCallback(async (section, companyOverride) => {
    const company = companyOverride || state.company;
    if (!company) return;

    // These sections manage their own data — skip API fetch
    if (NO_FETCH_SECTIONS.includes(section)) return;

    // Skip if already successfully loaded
    if (state.sectionData[section]?.data) return;

    // Check API key before making call
    if (!getApiKey()) {
      dispatch({ type: 'SECTION_ERROR', section, error: 'NO_API_KEY' });
      return;
    }

    dispatch({ type: 'SECTION_LOADING', section });
    try {
      const data = await fetchSection(company, section);
      dispatch({ type: 'SECTION_SUCCESS', section, data });
      // Persist to localStorage so next session doesn't wait
      saveSectionCache(section, data);
    } catch (err) {
      console.error('Section load error:', err);
      dispatch({ type: 'SECTION_ERROR', section, error: err.message });
    }
  }, [state.company, state.sectionData]);

  const runAts = useCallback(async (role, resumeText) => {
    if (!state.company) return;
    dispatch({ type: 'ATS_LOADING' });
    try {
      const result = await analyzeResume(state.company, role, resumeText);
      dispatch({ type: 'ATS_SUCCESS', result });
    } catch (err) {
      dispatch({ type: 'ATS_ERROR', error: err.message });
    }
  }, [state.company]);

  const toggleTracker = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TRACKER', id });
  }, []);

  const toggleSettings = useCallback(() => dispatch({ type: 'TOGGLE_SETTINGS' }), []);
  const toggleSidebar  = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const goHome         = useCallback(() => dispatch({ type: 'RESET' }), []);

  const toggleBookmark     = useCallback((item) => dispatch({ type: 'TOGGLE_BOOKMARK', item }), []);
  const updateBookmarkNote = useCallback((id, note) => dispatch({ type: 'UPDATE_BOOKMARK_NOTE', id, note }), []);
  const removeBookmark     = useCallback((id) => dispatch({ type: 'REMOVE_BOOKMARK', id }), []);

  const forceReloadSection = useCallback(async (section) => {
    const company = state.company;
    if (!company) return;

    if (!getApiKey()) {
      dispatch({ type: 'TOGGLE_SETTINGS' });
      return;
    }

    dispatch({ type: 'SECTION_LOADING', section });
    try {
      const data = await fetchSection(company, section);
      dispatch({ type: 'SECTION_SUCCESS', section, data });
    } catch (err) {
      dispatch({ type: 'SECTION_ERROR', section, error: err.message });
    }
  }, [state.company]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      setCompany,
      setSection,
      openAILearnTopic,
      clearAILearnTopic,
      loadSection,
      forceReloadSection,
      runAts,
      toggleTracker,
      toggleSettings,
      toggleSidebar,
      goHome,
      toggleBookmark,
      updateBookmarkNote,
      removeBookmark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
