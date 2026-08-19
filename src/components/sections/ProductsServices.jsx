import React, { useEffect } from 'react';
import { Package, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LoadingSection from '../ui/LoadingSection';
import ErrorSection from '../ui/ErrorSection';

export default function ProductsServices() {
  const { state, loadSection } = useApp();
  const s = state.sectionData['products'];

  useEffect(() => { loadSection('products'); }, []);

  if (!s || s.loading) return <LoadingSection title="Products & Services" />;
  if (s.error) return <ErrorSection error={s.error} section="products" />;
  const d = s.data;

  const catColors = {
    Cloud: 'accent', AI: 'teal', Consumer: 'orange', Enterprise: 'pink',
    Hardware: 'yellow', Gaming: 'purple', Finance: 'green',
  };
  const getColor = (cat) => catColors[cat] || 'accent';

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-teal"><Package size={24} /></div>
        <div>
          <h1 className="section-title">Products & Services</h1>
          <p className="section-subtitle">What {state.company} builds and sells</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {d.products?.map((p, i) => (
          <div key={i} className="card" style={{ transition: 'var(--transition)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.name}</h3>
              <span className={`badge badge-${getColor(p.category)}`}>{p.category}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{p.description}</p>
            {p.marketPosition && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>📊 {p.marketPosition}</p>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {p.techBehind?.map((t) => (
                <span key={t} className="chip" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Revenue Sources */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="var(--teal)" /> Key Revenue Sources
          </h3>
          {d.keyRevenueSources?.map((src, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < d.keyRevenueSources.length - 1 ? '1px solid var(--border-card)' : 'none'
            }}>
              <span style={{ color: 'var(--teal)', fontWeight: 800, fontSize: '0.9rem', width: 24 }}>
                {i + 1}.
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{src}</span>
            </div>
          ))}
        </div>

        {/* Competitors + Innovation */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--orange)" /> Key Competitors
            </h3>
            <div className="chip-grid">
              {d.competitors?.map((c) => (
                <div key={c.name} className="chip" title={c.segment}>{c.name}</div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🚀 Innovation Areas</h3>
            {d.innovationAreas?.map((area, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: 'var(--accent)' }}>→</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
