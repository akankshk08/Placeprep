import React from 'react';

// Catches render crashes so users see a recovery screen instead of a blank page.
export default class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info?.componentStack);
  }

  resetSavedData = () => {
    ['pp_tracker', 'pp_bookmarks', 'pp_last_company'].forEach((k) => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    const btn = { padding: '10px 18px', borderRadius: 8, border: '1px solid #555', background: '#222', color: '#fff', cursor: 'pointer', margin: 6 };
    return (
      <div role="alert" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif', background: '#0b0b0f', color: '#eee' }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ maxWidth: 420, opacity: 0.8 }}>Try reloading the page. If it keeps happening, reset your saved progress and bookmarks (your API key is kept).</p>
        <div>
          <button style={btn} onClick={() => window.location.reload()}>Reload</button>
          <button style={btn} onClick={this.resetSavedData}>Reset saved data</button>
        </div>
      </div>
    );
  }
}
