import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AGE_RANGES = ['under_18', '18_24', '25_34', '35_44', '45_54', '55_plus', 'prefer_not_to_say'];
const EDUCATION_LEVELS = [
  'no_schooling', 'some_primary', 'primary', 'some_secondary',
  'matric', 'certificate_diploma', 'degree_plus', 'prefer_not_to_say',
];
const EMPLOYMENT = ['unemployed', 'employed', 'self_employed', 'student', 'prefer_not_to_say'];
const DISABILITY = ['yes', 'no', 'prefer_not_to_say'];
const GENDER = ['female', 'male', 'non_binary', 'other', 'prefer_not_to_say'];

const label = (v) => v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', age_range: '', location: '',
    education_level: '', employment_status: '', disability_status: '',
    gender: '', email: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          age_range: form.age_range,
          location: form.location,
          education_level: form.education_level,
          employment_status: form.employment_status,
          disability_status: form.disability_status,
          gender: form.gender,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Email is treated as a username — no confirmation step. If signup didn't
    // return a session (project-level setting), sign in immediately so the
    // learner lands straight in their dashboard.
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) {
        setLoading(false);
        setError(signInError.message);
        return;
      }
    }

    setLoading(false);
    navigate('/dashboard');
  };

  const selectField = (fieldName, options, placeholder) => (
    <select
      required
      value={form[fieldName]}
      onChange={update(fieldName)}
      className="w-full border rounded-lg px-3 py-2"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{label(opt)}</option>
      ))}
    </select>
  );

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Create your SEA Learn account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="First name" value={form.first_name}
            onChange={update('first_name')} className="border rounded-lg px-3 py-2" />
          <input required placeholder="Surname" value={form.last_name}
            onChange={update('last_name')} className="border rounded-lg px-3 py-2" />
        </div>

        {selectField('age_range', AGE_RANGES, 'Age range')}

        <input required placeholder="Location (e.g. Philippi, Cape Town)"
          value={form.location} onChange={update('location')}
          className="w-full border rounded-lg px-3 py-2" />

        {selectField('education_level', EDUCATION_LEVELS, 'Highest education level')}
        {selectField('employment_status', EMPLOYMENT, 'Employment status')}
        {selectField('disability_status', DISABILITY, 'Do you live with a disability?')}
        {selectField('gender', GENDER, 'Gender')}

        <input required type="email" placeholder="Email" value={form.email}
          onChange={update('email')} className="w-full border rounded-lg px-3 py-2" />
        <input required type="password" placeholder="Password" value={form.password}
          onChange={update('password')} className="w-full border rounded-lg px-3 py-2" />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button disabled={loading} type="submit"
          className="w-full bg-sea-teal text-white py-3 rounded-lg font-semibold disabled:opacity-50">
          {loading ? 'Creating account…' : 'Sign up & start Uplift'}
        </button>
      </form>
    </div>
  );
}
