import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { createCvPdf } from '../lib/cvPdf';
import AssignmentFile, { getAssignmentObjectPath } from './AssignmentFile';

// Namespaced clear of the Quarter 1 ids (1-5, 21-61, 101-105), the Work
// Readiness sessions (401-405) and the reflections (501-515).
export const CV_DRAFT_CHAPTER_ID = 520;
export const CV_UPLOAD_CHAPTER_ID = 521;

const DRAFT_KEY = 'work-readiness-cv-draft';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_MIMES = ['application/pdf', 'image/png', 'image/jpeg'];

const EMPTY = {
  fullName: '', jobTitle: '', email: '', phone: '', location: '', linkedin: '',
  summary: '',
  experience: [{ role: '', employer: '', dates: '', detail: '' }],
  education: [{ qualification: '', institution: '', dates: '' }],
  skills: '',
  references: '',
};

function loadDraft(userId) {
  try {
    const raw = localStorage.getItem(`${DRAFT_KEY}-${userId}`);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch { return null; }
}

function saveDraft(userId, data) {
  try { localStorage.setItem(`${DRAFT_KEY}-${userId}`, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

function splitList(value) {
  return String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function Labelled({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sea-teal focus:outline-none';

export default function CvBuilder({ user, profile, submission, onSubmitted }) {
  const [cv, setCv] = useState(EMPTY);
  const [saveState, setSaveState] = useState('idle');
  const [file, setFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | done | error
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!user) return;
    const draft = loadDraft(user.id);
    if (draft) { setCv(draft); return; }
    setCv((current) => ({
      ...current,
      fullName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      location: profile?.province || profile?.location || '',
      phone: profile?.phone || '',
    }));
  }, [user, profile]);

  const update = useCallback((patch) => {
    setCv((current) => {
      const next = { ...current, ...patch };
      if (user) saveDraft(user.id, next);
      return next;
    });
    setSaveState('idle');
  }, [user]);

  const updateRow = useCallback((field, index, patch) => {
    setCv((current) => {
      const rows = current[field].map((row, i) => (i === index ? { ...row, ...patch } : row));
      const next = { ...current, [field]: rows };
      if (user) saveDraft(user.id, next);
      return next;
    });
  }, [user]);

  const complete = useMemo(() => (
    Boolean(cv.fullName.trim() && (cv.email.trim() || cv.phone.trim()) && cv.summary.trim())
  ), [cv]);

  const saveToAccount = useCallback(async () => {
    if (!user) return;
    setSaveState('saving');
    const { error } = await supabase.from('assignment_submissions').upsert({
      user_id: user.id,
      chapter_id: CV_DRAFT_CHAPTER_ID,
      status: 'submitted',
      explanation: JSON.stringify({ course: 'work-readiness', type: 'cv-draft', cv }),
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,chapter_id' });
    setSaveState(error ? 'error' : 'saved');
    window.setTimeout(() => setSaveState('idle'), 2500);
  }, [user, cv]);

  const downloadCv = useCallback(async () => {
    const blob = await createCvPdf(cv, { photoUrl });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = `cv-${(cv.fullName || 'learner').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [cv, photoUrl]);

  const uploadCv = useCallback(async () => {
    if (!user || !file) return;
    setUploadError('');
    if (file.size > MAX_FILE_SIZE) { setUploadState('error'); setUploadError('That file is larger than 10 MB.'); return; }
    if (!ACCEPTED_MIMES.includes(file.type)) { setUploadState('error'); setUploadError('Please upload a PDF, PNG or JPG.'); return; }

    setUploadState('uploading');
    const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg';
    const path = `${user.id}/chapter-${CV_UPLOAD_CHAPTER_ID}/cv-${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('assignments').upload(path, file, { upsert: true });
    if (uploadErr) { setUploadState('error'); setUploadError(uploadErr.message); return; }

    const { error: submitErr } = await supabase.from('assignment_submissions').upsert({
      user_id: user.id,
      chapter_id: CV_UPLOAD_CHAPTER_ID,
      status: 'submitted',
      file_url: path,
      explanation: JSON.stringify({ course: 'work-readiness', type: 'cv-upload' }),
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,chapter_id' });
    if (submitErr) { setUploadState('error'); setUploadError(submitErr.message); return; }

    setUploadState('done');
    setFile(null);
    onSubmitted?.();
  }, [user, file, onSubmitted]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Builder */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Labelled label="Full name">
              <input className={inputClass} value={cv.fullName} onChange={(e) => update({ fullName: e.target.value })} />
            </Labelled>
            <Labelled label="Job title you are applying for">
              <input className={inputClass} value={cv.jobTitle} onChange={(e) => update({ jobTitle: e.target.value })} placeholder="e.g. General Assistant" />
            </Labelled>
            <Labelled label="Email">
              <input type="email" className={inputClass} value={cv.email} onChange={(e) => update({ email: e.target.value })} />
            </Labelled>
            <Labelled label="Phone">
              <input className={inputClass} value={cv.phone} onChange={(e) => update({ phone: e.target.value })} />
            </Labelled>
            <Labelled label="Town / city">
              <input className={inputClass} value={cv.location} onChange={(e) => update({ location: e.target.value })} />
            </Labelled>
            <Labelled label="LinkedIn (optional)">
              <input className={inputClass} value={cv.linkedin} onChange={(e) => update({ linkedin: e.target.value })} />
            </Labelled>
            <Labelled label="Photo (optional)">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="mt-1 w-full text-sm"
                onChange={(e) => {
                  const picked = e.target.files?.[0];
                  if (photoUrl) URL.revokeObjectURL(photoUrl);
                  setPhotoUrl(picked ? URL.createObjectURL(picked) : '');
                }}
              />
            </Labelled>
          </div>

          <Labelled label="Professional summary">
            <textarea
              rows={3}
              className={inputClass}
              value={cv.summary}
              onChange={(e) => update({ summary: e.target.value })}
              placeholder="Two or three sentences: who you are, what you can do, what you are looking for."
            />
          </Labelled>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Work experience</p>
            {cv.experience.map((row, index) => (
              <div key={index} className="mt-2 grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-3">
                <input className={inputClass} placeholder="Role" value={row.role} onChange={(e) => updateRow('experience', index, { role: e.target.value })} />
                <input className={inputClass} placeholder="Employer" value={row.employer} onChange={(e) => updateRow('experience', index, { employer: e.target.value })} />
                <input className={inputClass} placeholder="2023 - 2025" value={row.dates} onChange={(e) => updateRow('experience', index, { dates: e.target.value })} />
                <textarea
                  rows={2}
                  className={`${inputClass} sm:col-span-3`}
                  placeholder="What you did, one point per line"
                  value={row.detail}
                  onChange={(e) => updateRow('experience', index, { detail: e.target.value })}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => update({ experience: [...cv.experience, { role: '', employer: '', dates: '', detail: '' }] })}
              className="mt-2 text-sm font-semibold text-sea-teal hover:underline"
            >
              + Add another role
            </button>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Education</p>
            {cv.education.map((row, index) => (
              <div key={index} className="mt-2 grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-3">
                <input className={inputClass} placeholder="Qualification" value={row.qualification} onChange={(e) => updateRow('education', index, { qualification: e.target.value })} />
                <input className={inputClass} placeholder="School / college" value={row.institution} onChange={(e) => updateRow('education', index, { institution: e.target.value })} />
                <input className={inputClass} placeholder="Year" value={row.dates} onChange={(e) => updateRow('education', index, { dates: e.target.value })} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => update({ education: [...cv.education, { qualification: '', institution: '', dates: '' }] })}
              className="mt-2 text-sm font-semibold text-sea-teal hover:underline"
            >
              + Add another qualification
            </button>
          </div>

          <Labelled label="Skills (one per line, or comma separated)">
            <textarea rows={3} className={inputClass} value={cv.skills} onChange={(e) => update({ skills: e.target.value })} />
          </Labelled>

          <Labelled label="References (one per line)">
            <textarea rows={2} className={inputClass} value={cv.references} onChange={(e) => update({ references: e.target.value })} placeholder="Name, role, phone — or 'Available on request'" />
          </Labelled>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadCv}
              disabled={!complete}
              className="rounded-lg bg-sea-teal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              Download CV (PDF)
            </button>
            <button type="button" onClick={saveToAccount} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : saveState === 'error' ? 'Save failed' : 'Save to my account'}
            </button>
          </div>
          {!complete && (
            <p className="text-xs text-slate-500">Add your name, a contact detail and a summary to enable the download.</p>
          )}
        </div>

        {/* Live preview */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Preview</p>
          <div className="mt-2 max-h-[560px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
            {photoUrl && (
              <img src={photoUrl} alt="" className="mb-3 h-24 w-24 rounded border-4 border-emerald-400 object-cover" />
            )}
            <p className="text-lg font-black text-slate-900">{cv.fullName || 'Your name'}</p>
            {cv.jobTitle && <p className="text-slate-600">{cv.jobTitle}</p>}
            <p className="mt-1 text-xs text-slate-500">
              {[cv.email, cv.phone, cv.location, cv.linkedin].filter(Boolean).join('  |  ')}
            </p>
            {cv.summary && (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-sea-teal">Professional summary</p>
                <p className="mt-1 whitespace-pre-line text-slate-700">{cv.summary}</p>
              </>
            )}
            {cv.experience.some((r) => r.role || r.employer) && (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-sea-teal">Work experience</p>
                {cv.experience.filter((r) => r.role || r.employer).map((row, i) => (
                  <div key={i} className="mt-2">
                    <p className="font-semibold text-slate-800">{[row.role, row.employer].filter(Boolean).join(' — ')}</p>
                    {row.dates && <p className="text-xs text-slate-500">{row.dates}</p>}
                    <ul className="mt-1 list-disc pl-5 text-slate-700">
                      {splitList(row.detail).map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            )}
            {cv.education.some((r) => r.qualification || r.institution) && (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-sea-teal">Education</p>
                {cv.education.filter((r) => r.qualification || r.institution).map((row, i) => (
                  <p key={i} className="mt-1 text-slate-700">
                    {[row.qualification, row.institution].filter(Boolean).join(' — ')}
                    {row.dates ? ` (${row.dates})` : ''}
                  </p>
                ))}
              </>
            )}
            {splitList(cv.skills).length > 0 && (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-sea-teal">Skills</p>
                <ul className="mt-1 list-disc pl-5 text-slate-700">
                  {splitList(cv.skills).map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
              </>
            )}
            {cv.references.trim() && (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-sea-teal">References</p>
                {splitList(cv.references).map((item) => <p key={item} className="text-slate-700">{item}</p>)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Final activity: upload */}
      <div className="mt-8 rounded-2xl border-2 border-dashed border-sea-teal/50 bg-teal-50/50 p-5">
        <h3 className="font-bold text-slate-900">Final activity — upload your CV</h3>
        <p className="mt-1 text-sm text-slate-700">
          Download your CV, check it reads the way you want, then upload it here. Your Certificate of
          Completion unlocks once your CV is submitted.
        </p>

        {submission?.file_url ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-800">✓ CV submitted</p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </p>
            <div className="mt-2">
              <AssignmentFile
                value={submission.file_url}
                image={/\.(png|jpe?g)$/i.test(getAssignmentObjectPath(submission.file_url) || '')}
                label="View my submitted CV ↗"
                imageClassName="max-h-48 rounded-lg border"
              />
            </div>
            <p className="mt-3 text-xs text-emerald-700">Uploading again replaces this submission.</p>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setUploadState('idle'); setUploadError(''); }}
            className="text-sm"
          />
          <button
            type="button"
            onClick={uploadCv}
            disabled={!file || uploadState === 'uploading'}
            className="rounded-lg bg-sea-teal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {uploadState === 'uploading' ? 'Uploading…' : submission?.file_url ? 'Replace my CV' : 'Upload my CV'}
          </button>
        </div>
        {uploadState === 'error' && <p className="mt-2 text-sm text-red-600" role="alert">{uploadError}</p>}
        {uploadState === 'done' && <p className="mt-2 text-sm font-semibold text-emerald-700">CV uploaded — your certificate is unlocked below.</p>}
        <p className="mt-2 text-xs text-slate-500">PDF, PNG or JPG, up to 10 MB.</p>
      </div>
    </div>
  );
}
