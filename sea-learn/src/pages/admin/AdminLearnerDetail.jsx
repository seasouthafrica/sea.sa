import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLearnerDetail() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, first_name, last_name, location, age_range, gender, education_level, employment_status, disability_status, created_at')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      });
    supabase
      .from('activity_events')
      .select('id, event_type, progress_value, occurred_at, lessons(title)')
      .eq('user_id', userId).order('occurred_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (!cancelled) setEvents(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!profile) return <div className="p-8">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-1">{profile.first_name} {profile.last_name}</h1>
      <p className="text-gray-500 mb-6">{profile.location}</p>

      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        <Field label="Age range" value={profile.age_range} />
        <Field label="Gender" value={profile.gender} />
        <Field label="Education level" value={profile.education_level} />
        <Field label="Employment status" value={profile.employment_status} />
        <Field label="Disability status" value={profile.disability_status} />
        <Field label="Registered" value={new Date(profile.created_at).toLocaleDateString()} />
      </div>

      <h2 className="font-semibold mb-3">Activity timeline</h2>
      <div className="border rounded-xl divide-y">
        {events.map((e) => (
          <div key={e.id} className="p-3 text-sm flex justify-between">
            <span>{e.lessons?.title} — {e.event_type} {e.progress_value != null && `(${e.progress_value})`}</span>
            <span className="text-gray-400">{new Date(e.occurred_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
