import { getAssignmentObjectPath } from '../components/AssignmentFile';
import { supabase } from './supabaseClient';
import { createPdf, loadPortfolioImage } from './pdf';

const SESSION_NAMES = {
  1: 'Introduction to Entrepreneurship', 2: 'Market Research', 3: 'Branding & Identity',
  4: 'Digital Advertising', 5: 'Web Development with AI',
};
const SIMULATOR_NAMES = {
  21: 'Prompt Engineering', 31: 'Logo Maker', 41: 'Facebook Ad Simulator',
  51: 'Code Playground', 52: 'Website Prompt Generator',
  61: 'Meta Ads Simulator',
};

// Quarter 2 writes sessionId + 400, Quarter 3 writes sessionId + 600.
const WORK_READINESS_NAMES = {
  401: 'Career Resilience & Professional Conduct',
  402: 'Time Management & Professional Grooming on a Budget',
  403: 'Professional Communication & Digital Etiquette',
  404: 'Modern CVs & Beating the ATS with AI',
  405: 'Interview Preparation & Execution',
};
const ECOMMERCE_NAMES = {
  601: 'What Is E-commerce?',
  602: 'Market Research Before You Sell',
  603: 'Build Your Store with WordPress, WooCommerce and AI',
  604: 'Driving Traffic and Making the Sale',
};

const COURSES = [
  { rank: 1, label: 'Quarter 1 - Uplift Digital Accelerator' },
  { rank: 2, label: 'Quarter 2 - Work Readiness & Professional Skills' },
  { rank: 3, label: 'Quarter 3 - Uplift: E-commerce Basics' },
];

// Sessions follow the +400 / +600 offsets, but simulators were numbered
// separately (21-52 in Quarter 1, 61 in Quarter 3), so they are mapped by hand.
function courseOf(id) {
  if (id === 61 || id >= 600) return COURSES[2];
  if (id >= 400) return COURSES[1];
  return COURSES[0];
}

function parseJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

export async function downloadLearnerPortfolio({ profile, submissions, events = [] }) {
  const completed = submissions
    .filter((row) => row.status === 'submitted')
    .slice()
    .sort((a, b) => (
      courseOf(a.chapter_id).rank - courseOf(b.chapter_id).rank
      || a.chapter_id - b.chapter_id
    ));
  let currentCourse = null;
  const entries = await Promise.all(completed.map(async (row) => {
    const name = SESSION_NAMES[row.chapter_id] || SIMULATOR_NAMES[row.chapter_id]
      || WORK_READINESS_NAMES[row.chapter_id] || ECOMMERCE_NAMES[row.chapter_id]
      || `Activity ${row.chapter_id}`;
    const course = courseOf(row.chapter_id).label;
    const courseHeading = course === currentCourse ? [] : [{ text: course, heading: true }];
    currentCourse = course;
    const payload = parseJson(row.explanation);
    let fileLink = '';
    let image = null;
    if (row.file_url) {
      const path = getAssignmentObjectPath(row.file_url);
      if (/^https?:\/\//i.test(path)) fileLink = path;
      else {
        const { data } = await supabase.storage.from('assignments').createSignedUrl(path, 60 * 60 * 24 * 7, { download: true });
        if (data?.signedUrl) fileLink = data.signedUrl;
      }
      image = await loadPortfolioImage(fileLink);
    }
    const details = payload?.type === 'quiz'
      ? [`Knowledge check: ${payload.quizKey} - score ${payload.score}/${payload.total} (${payload.pct}%).`]
      : payload?.type === 'simulator'
        ? JSON.stringify(payload.data ?? payload, null, 2).split('\n')
        : row.explanation ? [row.explanation] : [];
    return [
      ...courseHeading,
      { text: name, heading: true },
      { text: `Submitted: ${row.submitted_at ? new Date(row.submitted_at).toLocaleDateString('en-ZA') : 'Date not recorded'}` },
      ...details.map((text) => ({ text })),
      ...(row.youtube_url ? [{ text: `Open submitted video: ${row.youtube_url}`, link: row.youtube_url }] : []),
      ...(fileLink ? [{ text: `Open submitted file (link valid 7 days): ${fileLink}`, link: fileLink }] : []),
      ...(image ? [{ image }] : []),
      { text: '', gap: true },
    ];
  }));
  const completedLessons = events.filter((event) => event.event_type === 'completed');
  const learnerName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Learner';
  const lines = [
    { text: 'SOCIAL ENTERPRISE ACADEMY | AFRICA FORWARD', heading: true },
    { text: `${learnerName} - Learning Portfolio`, heading: true },
    { text: `SEA Learn | Generated ${new Date().toLocaleDateString('en-ZA')}` },
    { text: `Completed activities: ${completed.length} | Lessons completed: ${completedLessons.length}` },
    { text: '', gap: true },
    ...(entries.flat()),
  ];
  const blob = createPdf(lines);
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = `sea-learn-portfolio-${learnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
