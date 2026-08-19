import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const POPULAR = [
  { name: 'Amazon', emoji: '📦', type: 'FAANG' },
  { name: 'Microsoft', emoji: '🪟', type: 'FAANG' },
  { name: 'Google', emoji: '🔍', type: 'FAANG' },
  { name: 'Meta', emoji: '👾', type: 'FAANG' },
  { name: 'Apple', emoji: '🍎', type: 'FAANG' },
  { name: 'Nvidia', emoji: '🎮', type: 'Semiconductor' },
  { name: 'Qualcomm', emoji: '📡', type: 'Semiconductor' },
  { name: 'TCS', emoji: '🏢', type: 'Indian IT' },
  { name: 'Infosys', emoji: '💻', type: 'Indian IT' },
  { name: 'Wipro', emoji: '🌐', type: 'Indian IT' },
  { name: 'HCL', emoji: '⚙️', type: 'Indian IT' },
  { name: 'Accenture', emoji: '🔷', type: 'MNC' },
  { name: 'IBM', emoji: '🔵', type: 'MNC' },
  { name: 'Deloitte', emoji: '📊', type: 'Consulting' },
  { name: 'Goldman Sachs', emoji: '💰', type: 'Finance' },
  { name: 'JPMorgan', emoji: '🏦', type: 'Finance' },
  { name: 'Flipkart', emoji: '🛒', type: 'Indian Product' },
  { name: 'Zomato', emoji: '🍕', type: 'Indian Startup' },
  { name: 'Swiggy', emoji: '🛵', type: 'Indian Startup' },
  { name: 'Paytm', emoji: '💳', type: 'Fintech' },
  { name: 'Adobe', emoji: '🎨', type: 'Product' },
  { name: 'Salesforce', emoji: '☁️', type: 'SaaS' },
  { name: 'Oracle', emoji: '🗄️', type: 'Enterprise' },
  { name: 'SAP', emoji: '🔧', type: 'Enterprise' },
  { name: 'Uber', emoji: '🚗', type: 'Product' },
  { name: 'Airbnb', emoji: '🏠', type: 'Product' },
  { name: 'Netflix', emoji: '🎬', type: 'Product' },
  { name: 'Atlassian', emoji: '🎯', type: 'SaaS' },
  { name: 'Razorpay', emoji: '⚡', type: 'Fintech' },
  { name: 'CRED', emoji: '💎', type: 'Fintech' },
  { name: 'PhonePe', emoji: '📱', type: 'Fintech' },
  { name: 'Ola', emoji: '🚕', type: 'Indian Startup' },
];

export default function CompanySearch({ isHome = false }) {
  const { setCompany } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const filtered = POPULAR.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (name) => {
    setCompany(name);
    setQuery(name);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setCompany(query.trim());
      setOpen(false);
    }
  };

  if (isHome) {
    return (
      <div ref={wrapRef} className="home-search-wrap">
        <form onSubmit={handleSubmit}>
          <Search className="home-search-icon" size={22} />
          <input
            className="home-search-input"
            placeholder="Enter any company name… Amazon, TCS, Startup XYZ…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary home-search-btn" style={{ padding: '8px 20px' }}>
            <Sparkles size={16} /> Prep Now
          </button>
        </form>
        {open && query.length > 0 && (
          <div className="search-dropdown">
            {filtered.length > 0 ? filtered.map((c) => (
              <div key={c.name} className="search-item" onClick={() => handleSelect(c.name)}>
                <div className="search-item-logo">{c.emoji}</div>
                <div className="search-item-info">
                  <div className="search-item-name">{c.name}</div>
                  <div className="search-item-type">{c.type}</div>
                </div>
              </div>
            )) : (
              <div className="search-item" onClick={() => handleSelect(query)}>
                <div className="search-item-logo" style={{ fontSize: '20px' }}>🔍</div>
                <div className="search-item-info">
                  <div className="search-item-name">Search "{query}"</div>
                  <div className="search-item-type">Generate AI content for this company</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="search-container">
      <form onSubmit={handleSubmit}>
        <Search className="search-icon" size={16} />
        <input
          className="search-input"
          placeholder="Search company…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
      </form>
      {open && query.length > 0 && (
        <div className="search-dropdown">
          {filtered.length > 0 ? filtered.map((c) => (
            <div key={c.name} className="search-item" onClick={() => handleSelect(c.name)}>
              <div className="search-item-logo">{c.emoji}</div>
              <div className="search-item-info">
                <div className="search-item-name">{c.name}</div>
                <div className="search-item-type">{c.type}</div>
              </div>
            </div>
          )) : (
            <div className="search-item" onClick={() => handleSelect(query)}>
              <div className="search-item-logo">🔍</div>
              <div className="search-item-info">
                <div className="search-item-name">Search "{query}"</div>
                <div className="search-item-type">AI-powered prep guide</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
