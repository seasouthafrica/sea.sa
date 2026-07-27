import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/useAuth';

import Landing from './pages/Landing.jsx';

const SignUp = lazy(() => import('./pages/SignUp.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const LearnerDashboard = lazy(() => import('./pages/LearnerDashboard.jsx'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer.jsx'));
const UpliftCourse = lazy(() => import('./pages/UpliftCourse.jsx'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview.jsx'));
const AdminLearners = lazy(() => import('./pages/admin/AdminLearners.jsx'));
const AdminLearnerDetail = lazy(() => import('./pages/admin/AdminLearnerDetail.jsx'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses.jsx'));
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions.jsx'));

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
  const { isAdmin, loading, profileLoading } = useAuth();
  if (loading || profileLoading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return <Navigate to="/login?admin=1" replace state={{ from: location }} />;
  return children;
}

function LegacyChapterRedirect() {
  const { chapterId } = useParams();
  return <Navigate to={`/uplift/session/${chapterId}`} replace />;
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
            path="/uplift"
            element={
              <RequireAuth>
                <UpliftCourse />
              </RequireAuth>
            }
          />
          <Route
            path="/uplift/session/:chapterId"
            element={
              <RequireAuth>
                <UpliftCourse />
              </RequireAuth>
            }
          />
          <Route
            path="/uplift/final-task"
            element={
              <RequireAuth>
                <UpliftCourse />
              </RequireAuth>
            }
          />
          {/* Legacy route redirects */}
          <Route path="/uplift/chapter/:chapterId" element={<LegacyChapterRedirect />} />
          <Route path="/uplift/week-1" element={<Navigate to="/uplift/session/1" replace />} />

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
            path="/admin/courses"
            element={
              <RequireAdmin>
                <AdminCourses />
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
          <Route
            path="/admin/submissions"
            element={
              <RequireAdmin>
                <AdminSubmissions />
              </RequireAdmin>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
