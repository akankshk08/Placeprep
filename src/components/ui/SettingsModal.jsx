import React, { useState, useCallback } from 'react';
import {
  Settings, X, Key, Save, Eye, EyeOff, ExternalLink,
  CheckCircle, Trash2, AlertCircle, Zap, FlaskConical, Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { testApiKey } from '../../api/gemini';

/* ── helpers ─────────────────────────────────── */
const STORAGE_KEY = 'gemini_api_key';

const readStored = () => localStorage.getItem(STORAGE_KEY) || '';
const readEnv    = () => import.meta.env.VITE_GEMINI_API_KEY || '';
const readActive = () => readStored() || readEnv();

function maskKey(k = '') {
  if (k.length <= 10) return k;
  return k.slice(0, 6) + '•'.repeat(Math.min(k.length - 10, 32)) + k.slice(-4);
}

/* ── component ───────────────────────────────── */
export default function SettingsModal() {
  const { toggleSettings } = useApp();

  const [activeKey,  setActiveKey]  = useState(readActive);
  const [isStored,   setIsStored]   = useState(() => !!readStored());
  const [inputKey,   setInputKey]   = useState('');
  const [showRaw,    setShowRaw]    = useState(false);
  const [phase,      setPhase]      = useState('idle'); // idle | testing | tested_ok | tested_fail | saved | error
  const [testResult, setTestResult] = useState(null);   // { ok, model?, warning?, error? }
  const [errMsg,     setErrMsg]     = useState('');

  /* ── Test key ── */
  const handleTest = useCallback(async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    setPhase('testing');
    setTestResult(null);
    try {
      const result = await testApiKey(trimmed);
      setTestResult(result);
      setPhase(result.ok ? 'tested_ok' : 'tested_fail');
    } catch (e) {
      setTestResult({ ok: false, error: e.message });
      setPhase('tested_fail');
    }
  }, [inputKey]);

  /* ── Save ── */
  const handleSave = useCallback(() => {
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
      if (localStorage.getItem(STORAGE_KEY) !== trimmed) {
        throw new Error('localStorage write failed — check browser privacy settings.');
      }
      setActiveKey(trimmed);
      setIsStored(true);
      setInputKey('');
      setPhase('saved');
      setTestResult(null);
      setTimeout(() => setPhase('idle'), 4000);
    } catch (e) {
      setPhase('error');
      setErrMsg(e.message || 'Could not save key.');
    }
  }, [inputKey]);

  /* ── Clear ── */
  const handleClear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const fallback = readEnv();
    setActiveKey(fallback);
    setIsStored(false);
    setInputKey('');
    setPhase('idle');
    setTestResult(null);
  }, []);

  const canTest = inputKey.trim().length > 10 && phase !== 'testing';
  const canSave = inputKey.trim().length > 10 && phase !== 'saved' && phase !== 'testing';

  return (
    <div className="modal-overlay" onClick={toggleSettings}>
      <div className="modal" style={{ width: 520, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={16} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Settings</h3>
          </div>
          <button className="modal-close" onClick={toggleSettings}><X size={16} /></button>
        </div>

        <div className="modal-body">

          {/* ── Info box ── */}
          <div style={{ padding: '12px 16px', background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            🔑 <strong style={{ color: 'var(--accent)' }}>Gemini API Key</strong> — get yours free at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              aistudio.google.com <ExternalLink size={12} />
            </a>
          </div>

          {/* ── Active key card ── */}
          <div style={{ marginBottom: 22, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${activeKey ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}` }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
              Currently Active Key
            </div>
            {activeKey ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} color="#10b981" />
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                      {maskKey(activeKey)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      {isStored ? '📦 Saved in your browser' : '⚙️ From .env file (default)'}
                    </div>
                  </div>
                </div>
                {isStored && (
                  <button onClick={handleClear}
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '0.85rem' }}>
                <AlertCircle size={15} /> No API key set — paste one below
              </div>
            )}
          </div>

          {/* ── Success / Error banners ── */}
          {phase === 'saved' && (
            <div style={{ marginBottom: 14, padding: '12px 16px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: '#6ee7b7', fontSize: '0.87rem', fontWeight: 600 }}>
              <Zap size={16} color="#10b981" /> ✅ Key saved! Every new search will use this key.
            </div>
          )}
          {phase === 'error' && (
            <div style={{ marginBottom: 14, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: '#fca5a5', fontSize: '0.85rem' }}>
              <AlertCircle size={15} /> {errMsg}
            </div>
          )}

          {/* ── Test result banner ── */}
          {testResult && (
            <div style={{ marginBottom: 14, padding: '12px 16px', borderRadius: 10, border: `1px solid ${testResult.ok ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`, background: testResult.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {testResult.ok ? (
                <div style={{ color: '#6ee7b7' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>✅ Key is valid and working!</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>Model: <code>{testResult.model}</code>{testResult.warning && ` — ⚠️ ${testResult.warning}`}</div>
                </div>
              ) : (
                <div style={{ color: '#fca5a5' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>❌ Key test failed</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{testResult.error}</div>
                </div>
              )}
            </div>
          )}

          {/* ── Label ── */}
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            <Key size={11} style={{ display: 'inline', marginRight: 5 }} />
            {isStored ? 'Replace API Key' : 'Enter API Key'}
          </label>

          {/* ── Input ── */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              type={showRaw ? 'text' : 'password'}
              className="settings-input"
              value={inputKey}
              onChange={e => { setInputKey(e.target.value); setPhase('idle'); setTestResult(null); setErrMsg(''); }}
              placeholder="Paste your Gemini API key here…"
              onKeyDown={e => { if (e.key === 'Enter' && canSave) handleSave(); }}
              style={{ paddingRight: 44, fontFamily: 'monospace', fontSize: '0.87rem' }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <button onClick={() => setShowRaw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showRaw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* ── Buttons row ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            {/* Test Key */}
            <button
              onClick={handleTest}
              disabled={!canTest}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', cursor: canTest ? 'pointer' : 'not-allowed', fontSize: '0.87rem', fontWeight: 600, opacity: canTest ? 1 : 0.45, transition: 'all 0.2s' }}>
              {phase === 'testing'
                ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Testing…</>
                : <><FlaskConical size={15} /> Test Key</>}
            </button>

            {/* Save */}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!canSave}
              style={{ flex: 2, justifyContent: 'center', opacity: canSave ? 1 : 0.45, fontSize: '0.87rem', padding: '11px 16px', transition: 'opacity 0.2s' }}>
              <Save size={15} /> Save & Apply Key
            </button>
          </div>

          {/* ── Footer note ── */}
          <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            🔒 Stored only in your browser — never sent anywhere.<br />
            ⚡ Click <strong>Test Key</strong> first to verify it works, then <strong>Save & Apply</strong>.
          </div>

        </div>
      </div>
    </div>
  );
}
