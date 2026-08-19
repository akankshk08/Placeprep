import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'pp_resume';

const EMPTY_EDUCATION = { school: '', degree: '', duration: '', score: '' };
const EMPTY_EXPERIENCE = { role: '', company: '', duration: '', description: '' };
const EMPTY_PROJECT = { title: '', tech: '', description: '', link: '' };

const EMPTY_RESUME = {
  fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '',
  summary: '',
  education: [EMPTY_EDUCATION],
  experience: [],
  projects: [EMPTY_PROJECT],
  skills: '',
  achievements: '',
};

function loadResume() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_RESUME;
    return { ...EMPTY_RESUME, ...JSON.parse(raw) };
  } catch (_) {
    return EMPTY_RESUME;
  }
}

export default function ResumeBuilder() {
  const [resume, setResume] = useState(loadResume);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  const update = (field, value) => setResume(r => ({ ...r, [field]: value }));

  const updateItem = (field, i, key, value) =>
    setResume(r => ({ ...r, [field]: r[field].map((item, idx) => (idx === i ? { ...item, [key]: value } : item)) }));

  const addItem = (field, empty) => setResume(r => ({ ...r, [field]: [...r[field], { ...empty }] }));

  const removeItem = (field, i) =>
    setResume(r => ({ ...r, [field]: r[field].filter((_, idx) => idx !== i) }));

  const clearAll = () => {
    if (confirm('Clear all resume data? This cannot be undone.')) setResume(EMPTY_RESUME);
  };

  const contactLine = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.portfolio]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <div>
      <div className="section-header">
        <div className="section-icon section-icon-teal"><FileText size={24} /></div>
        <div>
          <h1 className="section-title">Resume Builder</h1>
          <p className="section-subtitle">Fill in your details, then download a clean PDF — everything is saved automatically in this browser</p>
        </div>
      </div>

      <div className="resume-builder-grid">
        {/* ── Form column ── */}
        <div className="resume-form-col">
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14 }}>Contact Info</h3>
            <div className="grid-2">
              <input className="form-input" placeholder="Full Name" value={resume.fullName} onChange={e => update('fullName', e.target.value)} />
              <input className="form-input" placeholder="Email" value={resume.email} onChange={e => update('email', e.target.value)} />
              <input className="form-input" placeholder="Phone" value={resume.phone} onChange={e => update('phone', e.target.value)} />
              <input className="form-input" placeholder="Location (City, State)" value={resume.location} onChange={e => update('location', e.target.value)} />
              <input className="form-input" placeholder="LinkedIn URL" value={resume.linkedin} onChange={e => update('linkedin', e.target.value)} />
              <input className="form-input" placeholder="GitHub URL" value={resume.github} onChange={e => update('github', e.target.value)} />
            </div>
            <input className="form-input" placeholder="Portfolio URL (optional)" value={resume.portfolio} onChange={e => update('portfolio', e.target.value)} style={{ marginTop: 12 }} />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14 }}>Summary</h3>
            <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="2-3 sentence professional summary…" value={resume.summary} onChange={e => update('summary', e.target.value)} />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3>Education</h3>
              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => addItem('education', EMPTY_EDUCATION)}><Plus size={14} /> Add</button>
            </div>
            {resume.education.map((ed, i) => (
              <div key={i} className="resume-item-block">
                <div className="grid-2">
                  <input className="form-input" placeholder="School / College" value={ed.school} onChange={e => updateItem('education', i, 'school', e.target.value)} />
                  <input className="form-input" placeholder="Degree" value={ed.degree} onChange={e => updateItem('education', i, 'degree', e.target.value)} />
                  <input className="form-input" placeholder="Duration (e.g. 2021-2025)" value={ed.duration} onChange={e => updateItem('education', i, 'duration', e.target.value)} />
                  <input className="form-input" placeholder="CGPA / Score" value={ed.score} onChange={e => updateItem('education', i, 'score', e.target.value)} />
                </div>
                {resume.education.length > 1 && (
                  <button className="resume-remove-btn" onClick={() => removeItem('education', i)}><Trash2 size={13} /></button>
                )}
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3>Experience</h3>
              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => addItem('experience', EMPTY_EXPERIENCE)}><Plus size={14} /> Add</button>
            </div>
            {resume.experience.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No experience added — click Add if you've had an internship or job.</p>}
            {resume.experience.map((ex, i) => (
              <div key={i} className="resume-item-block">
                <div className="grid-2">
                  <input className="form-input" placeholder="Role / Title" value={ex.role} onChange={e => updateItem('experience', i, 'role', e.target.value)} />
                  <input className="form-input" placeholder="Company" value={ex.company} onChange={e => updateItem('experience', i, 'company', e.target.value)} />
                </div>
                <input className="form-input" placeholder="Duration (e.g. Jun 2024 - Aug 2024)" value={ex.duration} onChange={e => updateItem('experience', i, 'duration', e.target.value)} style={{ marginTop: 8 }} />
                <textarea className="form-textarea" style={{ minHeight: 60, marginTop: 8 }} placeholder="What you did — one bullet per line" value={ex.description} onChange={e => updateItem('experience', i, 'description', e.target.value)} />
                <button className="resume-remove-btn" onClick={() => removeItem('experience', i)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3>Projects</h3>
              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => addItem('projects', EMPTY_PROJECT)}><Plus size={14} /> Add</button>
            </div>
            {resume.projects.map((pr, i) => (
              <div key={i} className="resume-item-block">
                <div className="grid-2">
                  <input className="form-input" placeholder="Project Title" value={pr.title} onChange={e => updateItem('projects', i, 'title', e.target.value)} />
                  <input className="form-input" placeholder="Tech Stack" value={pr.tech} onChange={e => updateItem('projects', i, 'tech', e.target.value)} />
                </div>
                <input className="form-input" placeholder="Link (GitHub / live URL)" value={pr.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} style={{ marginTop: 8 }} />
                <textarea className="form-textarea" style={{ minHeight: 60, marginTop: 8 }} placeholder="What it does — one bullet per line" value={pr.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} />
                {resume.projects.length > 1 && (
                  <button className="resume-remove-btn" onClick={() => removeItem('projects', i)}><Trash2 size={13} /></button>
                )}
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14 }}>Skills</h3>
            <input className="form-input" placeholder="Comma-separated: Python, React, SQL, DSA…" value={resume.skills} onChange={e => update('skills', e.target.value)} />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14 }}>Achievements</h3>
            <textarea className="form-textarea" style={{ minHeight: 70 }} placeholder="One per line — competitions, certifications, awards…" value={resume.achievements} onChange={e => update('achievements', e.target.value)} />
          </div>

          <button className="btn btn-ghost" onClick={clearAll} style={{ fontSize: '0.8rem' }}><RotateCcw size={14} /> Clear All</button>
        </div>

        {/* ── Preview column ── */}
        <div className="resume-preview-col">
          <div className="resume-preview-toolbar">
            <button className="btn btn-primary" onClick={() => window.print()}><Download size={15} /> Download PDF</button>
          </div>
          <div className="resume-preview-frame">
            <div className="resume-doc" id="resume-print-target">
              <div className="resume-doc-name">{resume.fullName || 'Your Name'}</div>
              {contactLine && <div className="resume-doc-contact">{contactLine}</div>}

              {resume.summary && (
                <section className="resume-doc-section">
                  <h4>Summary</h4>
                  <p>{resume.summary}</p>
                </section>
              )}

              {resume.education.some(e => e.school) && (
                <section className="resume-doc-section">
                  <h4>Education</h4>
                  {resume.education.filter(e => e.school).map((ed, i) => (
                    <div key={i} className="resume-doc-entry">
                      <div className="resume-doc-entry-row">
                        <strong>{ed.school}</strong>
                        <span>{ed.duration}</span>
                      </div>
                      <div className="resume-doc-entry-sub">{ed.degree}{ed.score ? ` · ${ed.score}` : ''}</div>
                    </div>
                  ))}
                </section>
              )}

              {resume.experience.some(e => e.role) && (
                <section className="resume-doc-section">
                  <h4>Experience</h4>
                  {resume.experience.filter(e => e.role).map((ex, i) => (
                    <div key={i} className="resume-doc-entry">
                      <div className="resume-doc-entry-row">
                        <strong>{ex.role}{ex.company ? ` — ${ex.company}` : ''}</strong>
                        <span>{ex.duration}</span>
                      </div>
                      {ex.description && (
                        <ul className="resume-doc-bullets">
                          {ex.description.split('\n').filter(Boolean).map((line, li) => <li key={li}>{line}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {resume.projects.some(p => p.title) && (
                <section className="resume-doc-section">
                  <h4>Projects</h4>
                  {resume.projects.filter(p => p.title).map((pr, i) => (
                    <div key={i} className="resume-doc-entry">
                      <div className="resume-doc-entry-row">
                        <strong>{pr.title}</strong>
                        <span>{pr.tech}</span>
                      </div>
                      {pr.description && (
                        <ul className="resume-doc-bullets">
                          {pr.description.split('\n').filter(Boolean).map((line, li) => <li key={li}>{line}</li>)}
                        </ul>
                      )}
                      {pr.link && <div className="resume-doc-entry-sub">{pr.link}</div>}
                    </div>
                  ))}
                </section>
              )}

              {resume.skills && (
                <section className="resume-doc-section">
                  <h4>Skills</h4>
                  <p>{resume.skills}</p>
                </section>
              )}

              {resume.achievements && (
                <section className="resume-doc-section">
                  <h4>Achievements</h4>
                  <ul className="resume-doc-bullets">
                    {resume.achievements.split('\n').filter(Boolean).map((line, li) => <li key={li}>{line}</li>)}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
