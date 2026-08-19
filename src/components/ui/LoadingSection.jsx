import React from 'react';

export default function LoadingSection({ title, subtitle }) {
  return (
    <div>
      <div className="skeleton" style={{ height: 80, marginBottom: 24, borderRadius: 'var(--radius-xl)' }} />
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[1,2,3,4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 100 }} />
        ))}
      </div>
      <div className="grid-2">
        {[1,2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 220 }} />
        ))}
      </div>
      <div className="spinner-wrap" style={{ marginTop: 24 }}>
        <div className="spinner" />
        <div style={{ fontSize: '0.875rem' }}>Generating {title} content with AI…</div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</div>}
      </div>
    </div>
  );
}
