import React, { useState, useRef } from 'react';
import { ScanLine, Upload, FileText, AlertTriangle, CheckCircle, X, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ── PDF Text Extractor (pdfjs-dist v4 compatible) ─────────────
async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // v4 uses ESM worker — use unpkg CDN with exact installed version
    const pdfjsLib = await import('pdfjs-dist');
    const version = pdfjsLib.version;

    // v4+ worker is .mjs, not .js
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ') + '\n';
    }
    if (!text.trim()) throw new Error('empty');
    return text;
  } catch (err) {
    if (err.message === 'empty') throw new Error('PDF appears empty or image-based. Please paste your resume text instead.');
    throw new Error(`PDF parse failed: ${err.message}. Try pasting your resume text instead.`);
  }
}

// ── Score Ring ────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const r = 50, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-card-hover)" strokeWidth={10} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: 'Space Grotesk, sans-serif' }}>{score}</div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SCORE</div>
      </div>
    </div>
  );
}

const verdictColor = {
  Strong: 'var(--green)', Good: 'var(--teal)', Average: 'var(--yellow)', 'Needs Improvement': 'var(--red)',
};
const priorityColor = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

export default function ATSAnalysis() {
  const { state, runAts } = useApp();
  const [mode, setMode] = useState('upload');
  const [role, setRole] = useState('Software Engineer');
  const [resumeText, setResumeText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setParseError('');
    setResumeText('');
    setFileName('');

    if (file.type === 'application/pdf') {
      setParsing(true);
      try {
        const text = await extractTextFromPDF(file);
        setResumeText(text);
        setFileName(file.name);
      } catch (err) {
        setParseError(err.message);
      } finally {
        setParsing(false);
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setResumeText(text);
      setFileName(file.name);
    } else {
      setParseError('Please upload a PDF or TXT file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    runAts(role, resumeText);
  };

  const r = state.atsResult;

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-orange"><ScanLine size={24} /></div>
        <div>
          <h1 className="section-title">ATS Resume Analyzer</h1>
          <p className="section-subtitle">See how your resume scores for {state.company}</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target Role</label>
            <input
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer, Data Analyst"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('upload')} style={{ padding: '10px 16px' }}>
              <Upload size={15} /> Upload PDF
            </button>
            <button className={`btn ${mode === 'paste' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('paste')} style={{ padding: '10px 16px' }}>
              <FileText size={15} /> Paste Text
            </button>
          </div>
        </div>

        {mode === 'upload' && (
          <div>
            <div
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                transition: 'var(--transition)',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
              {parsing ? (
                <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> Parsing PDF…
                </div>
              ) : fileName ? (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{fileName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {resumeText.length} characters extracted · Click to change
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={36} style={{ color: 'var(--accent)', marginBottom: 14 }} />
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>Drop your resume PDF here</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>or click to browse · PDF / TXT supported</div>
                </>
              )}
            </div>
            {parseError && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, color: 'var(--red)', fontSize: '0.82rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertTriangle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  {parseError}
                  <button style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => { setMode('paste'); setParseError(''); }}>
                    Switch to paste mode →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'paste' && (
          <textarea
            className="form-textarea"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here…&#10;&#10;Include all sections: Education, Experience, Projects, Skills, etc."
            style={{ minHeight: 220, fontSize: '0.85rem', lineHeight: 1.7 }}
          />
        )}

        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={!resumeText.trim() || state.atsLoading}
          style={{ marginTop: 16, width: '100%', justifyContent: 'center', opacity: !resumeText.trim() ? 0.5 : 1 }}
        >
          {state.atsLoading
            ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Resume…</>
            : <><ScanLine size={16} /> Analyze Resume for {state.company}</>}
        </button>

        {!resumeText.trim() && (
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Upload a PDF or paste your resume text to start analysis
          </div>
        )}
      </div>

      {/* Results */}
      {r && !r.error && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, textAlign: 'center' }}>
              <ScoreRing score={r.overallScore} color={verdictColor[r.verdict] || 'var(--accent)'} />
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: verdictColor[r.verdict], marginTop: 12 }}>{r.verdict}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 440, marginTop: 8, lineHeight: 1.7 }}>{r.summary}</div>
            </div>
            <div className="grid-4">
              {[
                { label: 'ATS Friendly', val: r.atsFriendliness, color: 'var(--accent)' },
                { label: 'Keyword Match', val: r.keywordMatch, color: 'var(--teal)' },
                { label: 'Format', val: r.formatScore, color: 'var(--orange)' },
                { label: 'Impact', val: r.impactScore, color: 'var(--pink)' },
              ].map((sc) => (
                <div key={sc.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: sc.color }}>{sc.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{sc.label}</div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${sc.val}%`, background: sc.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card">
              <h3 style={{ marginBottom: 14, color: 'var(--green)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckCircle size={16} /> Matched Keywords
              </h3>
              <div className="chip-grid">
                {r.matchedKeywords?.map((kw) => (
                  <span key={kw} style={{ padding: '4px 10px', background: 'var(--green-dim)', border: '1px solid rgba(6,214,160,0.25)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--green)' }}>{kw}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 14, color: 'var(--red)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <X size={16} /> Missing Keywords
              </h3>
              <div className="chip-grid">
                {r.missingKeywords?.map((kw) => (
                  <span key={kw} style={{ padding: '4px 10px', background: 'var(--red-dim)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--red)' }}>{kw}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>🔧 Improvement Suggestions</h3>
            {r.improvements?.map((imp, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < r.improvements.length - 1 ? '1px solid var(--border-card)' : 'none' }}>
                <span className={`badge ${priorityColor[imp.priority]}`} style={{ flexShrink: 0, marginTop: 2 }}>{imp.priority}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{imp.section}: {imp.issue}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>→ {imp.fix}</div>
                </div>
              </div>
            ))}
          </div>

          {r.finalTip && (
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, var(--accent-dim), var(--teal-dim))', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
              ⭐ <strong>Top Tip:</strong> {r.finalTip}
            </div>
          )}
        </div>
      )}

      {r?.error && (
        <div style={{ padding: '16px 20px', background: 'var(--red-dim)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontSize: '0.875rem' }}>
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: 8 }} />
          Analysis failed: {r.error}
        </div>
      )}
    </div>
  );
}
