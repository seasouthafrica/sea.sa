import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/useAuth';

import Landing from './pages/Landing.jsx';
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import LearnerDashboard from './pages/LearnerDashboard.jsx';
import CoursePlayer from './pages/CoursePlayer.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminLearners from './pages/admin/AdminLearners.jsx';
import AdminLearnerDetail from './pages/admin/AdminLearnerDetail.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

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
    </AuthProvider>
  );
}
