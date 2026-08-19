import React from 'react';
import { AlertTriangle, RefreshCw, Key, Home, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ErrorSection({ error, section, onRetry }) {
  const { dispatch, toggleSettings, loadSection, goHome } = useApp();

  const isApiKeyError = error === 'NO_API_KEY'
    || error?.includes('API_KEY')
    || error?.includes('401')
    || error?.includes('403');

  const isQuotaError = error?.includes('429')
    || error?.includes('quota')
    || error?.includes('RESOURCE_EXHAUSTED')
    || error?.includes('exceeded your current quota');

  const handleRetry = () => {
    if (onRetry) { onRetry(); return; }
    if (section) {
      loadSection(section);
    } else {
      window.location.reload();
    }
  };

  const handleHome = () => {
    goHome();
  };

  const getIcon = () => {
    if (isApiKeyError) return '🔑';
    if (isQuotaError) return '⚡';
    return '⚠️';
  };

  const getTitle = () => {
    if (isApiKeyError) return 'API Key Required';
    if (isQuotaError) return 'API Quota Exceeded';
    return 'Failed to Load Content';
  };

  const getDesc = () => {
    if (isApiKeyError) {
      return 'Add your Gemini API key to generate AI-powered content. Get one free at aistudio.google.com';
    }
    if (isQuotaError) {
      return 'Your API key has hit its rate limit. Please wait a minute and retry, or go to Settings to enter a new API key.';
    }
    return `Could not generate content. ${error?.slice(0, 180) || ''}`;
  };

  const titleColor = isApiKeyError ? 'var(--yellow)' : isQuotaError ? 'var(--orange)' : 'var(--red)';

  return (
    <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: '0 16px' }}>

      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: isQuotaError ? 'rgba(255,180,0,0.1)' : 'rgba(255,107,107,0.1)',
        border: `2px solid ${isQuotaError ? 'rgba(255,180,0,0.25)' : 'rgba(255,107,107,0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', margin: '0 auto 20px',
      }}>
        {getIcon()}
      </div>

      {/* Title */}
      <div style={{ color: titleColor, fontWeight: 700, fontSize: '1.25rem', marginBottom: 12 }}>
        {getTitle()}
      </div>

      {/* Description */}
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.75, marginBottom: 28 }}>
        {getDesc()}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>

        {/* Home button — always show */}
        <button className="btn btn-ghost" onClick={handleHome}
          style={{ border: '1px solid var(--border-card)', padding: '10px 18px' }}>
          <Home size={15} /> Back to Home
        </button>

        {/* API Key / Settings button */}
        {(isApiKeyError || isQuotaError) && (
          <button className="btn btn-primary" onClick={toggleSettings}>
            <Key size={15} /> {isApiKeyError ? 'Add API Key' : 'Change API Key'}
          </button>
        )}

        {/* Retry */}
        {!isApiKeyError && (
          <button className="btn btn-secondary" onClick={handleRetry}>
            <RefreshCw size={15} /> Retry
          </button>
        )}
      </div>

      {/* Quota tip */}
      {isQuotaError && (
        <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,180,0,0.06)', border: '1px solid rgba(255,180,0,0.15)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          💡 <strong style={{ color: 'var(--yellow)' }}>Tip:</strong> Free-tier keys reset every minute.
          Wait 60s then retry — or get a new key at{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--teal)' }}>
            aistudio.google.com
          </a>
        </div>
      )}
    </div>
  );
}
