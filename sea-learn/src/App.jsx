import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/useAuth';

import Landing from './pages/Landing.jsx';
import { upliftWeek1 } from './data/courseWeeks.js';

const SignUp = lazy(() => import('./pages/SignUp.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const LearnerDashboard = lazy(() => import('./pages/LearnerDashboard.jsx'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer.jsx'));
const CourseWeekPage = lazy(() => import('./pages/CourseWeekPage.jsx'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview.jsx'));
const AdminLearners = lazy(() => import('./pages/admin/AdminLearners.jsx'));
const AdminLearnerDetail = lazy(() => import('./pages/admin/AdminLearnerDetail.jsx'));

function PageLoader() {
  return <div className="p-8">Loading...</div>;
}

function RequireAuth({ children }) {
  const location = useLocation();
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return <Navigate to="/login?admin=1" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/uplift/week-1"
            element={
              <RequireAuth>
                <CourseWeekPage course={upliftWeek1} />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <LearnerDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/course/:courseSlug"
            element={
              <RequireAuth>
                <CoursePlayer />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminOverview />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/learners"
            element={
              <RequireAdmin>
                <AdminLearners />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/learners/:userId"
            element={
              <RequireAdmin>
                <AdminLearnerDetail />
              </RequireAdmin>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
