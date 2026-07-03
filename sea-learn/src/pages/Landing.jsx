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
          Start Uplift
        </Link>
      </main>
    </div>
  );
}
