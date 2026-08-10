import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';

const COUNTRIES = [
  'South Africa', 'Angola', 'Botswana', 'Cameroon', 'Democratic Republic of Congo',
  'Egypt', 'Eswatini', 'Ethiopia', 'Ghana', 'Kenya', 'Lesotho', 'Malawi',
  'Mozambique', 'Namibia', 'Nigeria', 'Rwanda', 'Senegal', 'Somalia',
  'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe', 'Other',
];

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
];

const ETHNICITIES = [
  'Black African', 'Coloured', 'Indian / Asian', 'White', 'Other', 'Prefer not to say',
];

const AGE_GROUPS = [
  'Under 18', '18–24', '25–34', '35–44', '45–54', '55+',
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];

const DISABILITY = ['Yes', 'No', 'Prefer not to say'];

const EMPLOYMENT = [
  'Unemployed', 'Employed', 'Self-employed', 'Student', 'Prefer not to say',
];

const REFERRAL_CHANNELS = [
  'Social media', 'Word of mouth', 'SEA website', 'Partner organisation',
  'Event / workshop', 'Google search', 'Other',
];

function toValue(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export default function SignUp() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshAuth } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    country: '', phone: '', province: '', ethnicity: '',
    age_range: '', gender: '', disability_status: '',
    employment_status: '', referral_channel: '', referral_other: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate('/uplift/session/1', { replace: true });
  }, [user, authLoading, navigate]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.first_name,
          last_name: form.last_name,
          country: form.country,
          phone: form.phone,
          province: form.province,
          ethnicity: form.ethnicity,
          age_range: toValue(form.age_range),
          gender: toValue(form.gender),
          disability_status: toValue(form.disability_status),
          employment_status: toValue(form.employment_status),
          referral_channel: toValue(form.referral_channel),
          referral_other: form.referral_channel === 'Other' ? form.referral_other : '',
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) {
        setLoading(false);
        setError(signInError.message);
        return;
      }
      await refreshAuth(signInData.user);
    } else {
      await refreshAuth(data.user);
    }
    setLoading(false);
    navigate('/uplift/session/1', { replace: true });
  };

  const selectField = (fieldName, options, placeholder) => (
    <select
      required
      value={form[fieldName]}
      onChange={update(fieldName)}
      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-sm"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );

  if (authLoading) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-sea-teal">SEA Learn</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">All fields marked * are required.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <fieldset className="space-y-4">
            <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Personal details</legend>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">First Name *</label>
                <input required placeholder="e.g. Lungisa" value={form.first_name}
                  onChange={update('first_name')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Last Name *</label>
                <input required placeholder="e.g. Sobhuwa" value={form.last_name}
                  onChange={update('last_name')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email Address *</label>
              <input required type="email" placeholder="you@example.com" value={form.email}
                onChange={update('email')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Country / Region *</label>
                {selectField('country', COUNTRIES, 'Select country / region')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Phone *</label>
                <input required type="tel" placeholder="e.g. 071 234 5678" value={form.phone}
                  onChange={update('phone')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Province *</label>
              {selectField('province', PROVINCES, 'Select province')}
            </div>
          </fieldset>

          <fieldset className="mt-6 space-y-4">
            <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Demographics</legend>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Ethnicity *</label>
                {selectField('ethnicity', ETHNICITIES, 'Select')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Age Group *</label>
                {selectField('age_range', AGE_GROUPS, 'Select')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Gender *</label>
                {selectField('gender', GENDERS, 'Select')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Disabled *</label>
                {selectField('disability_status', DISABILITY, 'Select')}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Employment Status *</label>
              {selectField('employment_status', EMPLOYMENT, 'Select')}
            </div>
          </fieldset>

          <fieldset className="mt-6 space-y-4">
            <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">How did you hear about us?</legend>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Referral Channel *</label>
              {selectField('referral_channel', REFERRAL_CHANNELS, 'Select')}
            </div>

            {form.referral_channel === 'Other' && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">If Other, please specify</label>
                <input required placeholder="Tell us how you found SEA Learn" value={form.referral_other}
                  onChange={update('referral_other')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
            )}
          </fieldset>

          <fieldset className="mt-6 space-y-4">
            <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Account</legend>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Password *</label>
              <input required type="password" placeholder="Min 6 characters" minLength={6} value={form.password}
                onChange={update('password')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
            </div>
          </fieldset>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button disabled={loading} type="submit"
            className="mt-6 w-full rounded-lg bg-sea-teal py-3 font-semibold text-white transition hover:bg-sea-teal/90 disabled:opacity-50">
            {loading ? 'Creating account…' : 'Sign up & start Uplift'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-sea-teal">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}
