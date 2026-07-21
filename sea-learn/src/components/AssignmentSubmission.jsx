import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.pdf,.svg';
const ACCEPTED_MIMES = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'];

function isValidYouTubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/.test(url);
}

function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const DRAFT_KEY_PREFIX = 'uplift-assignment-draft';

function loadDraft(userId, chapterId) {
  try {
    const raw = localStorage.getItem(`${DRAFT_KEY_PREFIX}-${userId}-${chapterId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveDraft(userId, chapterId, data) {
  localStorage.setItem(`${DRAFT_KEY_PREFIX}-${userId}-${chapterId}`, JSON.stringify(data));
}

function clearDraft(userId, chapterId) {
  localStorage.removeItem(`${DRAFT_KEY_PREFIX}-${userId}-${chapterId}`);
}

export default function AssignmentSubmission({ chapterId, type, userId, existingSubmission, onSubmissionChange }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [explanation, setExplanation] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | saving | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Load draft or existing submission
  useEffect(() => {
    if (existingSubmission) {
      setYoutubeUrl(existingSubmission.youtube_url || '');
      setExplanation(existingSubmission.explanation || '');
      if (existingSubmission.file_url) setFilePreview(existingSubmission.file_url);
      return;
    }
    const draft = loadDraft(userId, chapterId);
    if (draft) {
      setYoutubeUrl(draft.youtubeUrl || '');
      setExplanation(draft.explanation || '');
      setDraftSaved(true);
    }
  }, [userId, chapterId, existingSubmission]);

  const handleFileChange = useCallback((e) => {
    const selected = e.target.files?.[0];
    setErrorMsg('');
    if (!selected) return;

    if (!ACCEPTED_MIMES.includes(selected.type)) {
      setErrorMsg('Please upload a PNG, JPG, JPEG, PDF or SVG file.');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setErrorMsg('File size must be under 10 MB.');
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  }, []);

  const handleSaveDraft = useCallback(() => {
    saveDraft(userId, chapterId, { youtubeUrl, explanation });
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }, [userId, chapterId, youtubeUrl, explanation]);

  const handleSubmit = useCallback(async () => {
    setErrorMsg('');
    setStatus('submitting');

    try {
      let fileUrl = existingSubmission?.file_url || null;

      // Upload file for logo assignments
      if (type === 'logo-upload' && file) {
        const ext = file.name.split('.').pop();
        const path = `assignments/${userId}/chapter-${chapterId}/logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('assignments')
          .upload(path, file, { upsert: true });

        if (uploadError) {
          setStatus('error');
          setErrorMsg(uploadError.message);
          return;
        }

        const { data: publicData } = supabase.storage.from('assignments').getPublicUrl(path);
        fileUrl = publicData.publicUrl;
      }

      // Validate YouTube link
      if (type === 'youtube-link') {
        if (!youtubeUrl.trim()) {
          setStatus('error');
          setErrorMsg('Please enter a YouTube video URL.');
          return;
        }
        if (!isValidYouTubeUrl(youtubeUrl.trim())) {
          setStatus('error');
          setErrorMsg('Please enter a valid YouTube video URL (e.g. https://youtu.be/... or https://youtube.com/watch?v=...).');
          return;
        }
      }

      if (type === 'logo-upload' && !file && !fileUrl) {
        setStatus('error');
        setErrorMsg('Please select a logo file to upload.');
        return;
      }

      if (type === 'text-explanation' && !explanation.trim()) {
        setStatus('error');
        setErrorMsg('Please write your findings before submitting.');
        return;
      }

      // Upsert submission
      const { error: submitError } = await supabase
        .from('assignment_submissions')
        .upsert({
          user_id: userId,
          chapter_id: chapterId,
          youtube_url: type === 'youtube-link' ? youtubeUrl.trim() : null,
          file_url: fileUrl,
          explanation: explanation.trim() || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        }, { onConflict: 'user_id,chapter_id' });

      if (submitError) {
        setStatus('error');
        setErrorMsg(submitError.message);
        return;
      }

      clearDraft(userId, chapterId);
      setStatus('success');
      onSubmissionChange?.();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  }, [type, file, youtubeUrl, explanation, userId, chapterId, existingSubmission, onSubmissionChange]);

  const isSubmitted = existingSubmission?.status === 'submitted' || status === 'success';

  if (isSubmitted) {
    return (
      <div className="rounded-xl bg-emerald-100 p-5">
        <div className="flex items-center gap-2 text-emerald-800">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold">Assignment Submitted</span>
        </div>
        {existingSubmission?.file_url && (
          <div className="mt-3">
            <p className="mb-1 text-sm font-semibold text-emerald-700">Your uploaded file:</p>
            {existingSubmission.file_url.match(/\.(png|jpe?g|svg)$/i) ? (
              <img src={existingSubmission.file_url} alt="Submitted logo" className="max-h-40 rounded-lg border" />
            ) : (
              <a href={existingSubmission.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-sea-teal underline">View file ↗</a>
            )}
          </div>
        )}
        {existingSubmission?.youtube_url && (
          <div className="mt-3">
            <p className="mb-1 text-sm font-semibold text-emerald-700">Your video:</p>
            <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-lg">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={getYouTubeEmbedUrl(existingSubmission.youtube_url)}
                title="Submitted video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
        {existingSubmission?.explanation && (
          <div className="mt-3">
            <p className="text-sm font-semibold text-emerald-700">Your explanation:</p>
            <p className="mt-1 text-sm text-emerald-800">{existingSubmission.explanation}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {type === 'logo-upload' && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Upload your logo (PNG, JPG, JPEG, PDF or SVG — max 10 MB)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileChange}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sea-teal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sea-teal/90"
          />
          {filePreview && typeof filePreview === 'string' && filePreview.startsWith('data:image') && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold text-gray-500">Preview:</p>
              <img src={filePreview} alt="Logo preview" className="max-h-40 rounded-lg border shadow-sm" />
            </div>
          )}
          {file && !filePreview && (
            <p className="mt-2 text-sm text-gray-600">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
          )}
        </div>
      )}

      {type === 'youtube-link' && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">YouTube Video URL</label>
          <input
            type="url"
            placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
          />
          {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold text-gray-500">Preview:</p>
              <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-lg">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={getYouTubeEmbedUrl(youtubeUrl)}
                  title="Video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
          {youtubeUrl && !isValidYouTubeUrl(youtubeUrl) && (
            <p className="mt-1 text-sm text-red-600">Please enter a valid YouTube URL.</p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          {type === 'text-explanation' ? 'Your Findings' : `Explanation ${type === 'youtube-link' ? '(optional)' : ''}`}
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={type === 'logo-upload'
            ? 'Explain your design choices — colours, fonts, symbols and how they represent your brand...'
            : type === 'text-explanation'
            ? 'Write your research findings here — what you searched for, whether interest is growing or declining, surprising related topics, and how this affects your business idea...'
            : 'Describe the advertisement you created and your targeting decisions...'}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
        />
      </div>

      {errorMsg && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMsg}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSaveDraft}
          disabled={status === 'submitting'}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-sea-teal hover:text-sea-teal disabled:opacity-50"
        >
          {draftSaved ? '✓ Draft Saved' : 'Save Draft'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={status === 'submitting'}
          className="rounded-lg bg-sea-teal px-5 py-2.5 text-sm font-bold text-white shadow transition hover:shadow-md disabled:opacity-50"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit Assignment'}
        </button>
      </div>

      {status === 'success' && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Assignment submitted successfully!</p>
      )}
    </div>
  );
}
