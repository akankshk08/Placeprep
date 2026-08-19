import React from 'react';
import { Sparkles } from 'lucide-react';

// Shown on every AI-generated content section. Content here (company facts, interview
// questions, salary figures, etc.) is a language-model completion with no retrieval or
// verification step — it can be wrong, outdated, or entirely fabricated. This exists so
// that's never ambiguous to the person reading it.
export default function AIDisclosure() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', marginBottom: 20,
      borderRadius: 'var(--radius-md)',
      background: 'var(--yellow-dim)',
      border: '1px solid rgba(245,200,66,0.25)',
      fontSize: '0.78rem', color: 'var(--yellow)',
    }}>
      <Sparkles size={13} style={{ flexShrink: 0 }} />
      <span>
        <strong>AI-generated content.</strong> This is produced by a language model with no live data access —
        treat facts, figures, and questions here as a study starting point, not verified truth. Cross-check anything important.
      </span>
    </div>
  );
}
