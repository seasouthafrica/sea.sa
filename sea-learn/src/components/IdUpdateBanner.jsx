import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';

export default function IdUpdateBanner() {
  const { user, profile, refreshAuth } = useAuth();
  const [idNumber, setIdNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  if (!user || !profile || profile.id_number || dismissed) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idNumber.trim()) return;
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ id_number: idNumber.trim() })
      .eq('id', user.id);

    if (updateError) {
      setError('Could not save your ID number. Please try again.');
      setSaving(false);
      return;
    }

    await refreshAuth(user);
    setSaving(false);
  };

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 sm:px-6">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <span aria-hidden="true">⚠️</span>
          <span>Please update your profile with your SA ID / Passport number</span>
        </div>
        <input
          required
          type="text"
          placeholder="e.g. 9501015800085"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="ml-auto text-xs text-amber-600 underline hover:text-amber-800"
        >
          Later
        </button>
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
}
