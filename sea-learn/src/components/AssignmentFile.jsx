import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PUBLIC_OBJECT_MARKER = '/storage/v1/object/public/assignments/';

export function getAssignmentObjectPath(value) {
  if (!value) return null;
  const markerIndex = value.indexOf(PUBLIC_OBJECT_MARKER);
  if (markerIndex === -1) return value;

  try {
    return decodeURIComponent(value.slice(markerIndex + PUBLIC_OBJECT_MARKER.length));
  } catch {
    return value.slice(markerIndex + PUBLIC_OBJECT_MARKER.length);
  }
}

export default function AssignmentFile({ value, image = false, label = 'View file ↗', imageClassName = 'max-h-40 rounded-lg border' }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const path = getAssignmentObjectPath(value);
    if (!path) return undefined;

    supabase.storage
      .from('assignments')
      .createSignedUrl(path, 60 * 10)
      .then(({ data, error: signError }) => {
        if (!active) return;
        if (signError) {
          setError('File unavailable');
          return;
        }
        setUrl(data.signedUrl);
      });

    return () => { active = false; };
  }, [value]);

  if (error) return <span className="text-sm text-red-600">{error}</span>;
  if (!url) return <span className="text-sm text-slate-500">Loading file…</span>;
  if (image) return <img src={url} alt="Submission" className={imageClassName} />;

  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-sea-teal underline">{label}</a>;
}
