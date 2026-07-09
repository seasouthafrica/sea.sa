import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-sea-teal">SEA Learn</h1>
        <div className="space-x-3">
          <Link to="/login" className="text-sea-teal font-medium">Log in</Link>
          <Link to="/signup" className="bg-sea-teal text-white px-4 py-2 rounded-lg font-medium">
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Uplift</h2>
        <p className="text-gray-600 mb-8">
          The first course on SEA Learn — free video lessons, readings, and
          slides to help you grow. Sign up in a couple of minutes to start
          tracking your progress and earn a certificate on completion.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-sea-magenta text-white px-6 py-3 rounded-lg font-semibold"
        >
          Start Week 1
        </Link>
      </main>

      <footer className="border-t mt-16 py-8 text-center">
        <p className="text-sm text-gray-400 mb-3">
          © {new Date().getFullYear()} Social Enterprise Academy South Africa
        </p>
        <Link
          to="/login?admin=1"
          title="Admin access"
          aria-label="Admin login"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-sea-teal"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Admin
        </Link>
      </footer>
    </div>
  );
}
